import uuid
import json
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.chatbot import ChatbotSession, ChatMessage, ChatMessageFeedback, SentimentCategory
from app.models.assessment import NonAcademicAssessment, DomainType
from app.schemas.chatbot import (
    ChatMessageInput, 
    ChatMessageOut, 
    ChatbotSessionOut, 
    ChatbotReplyResponse,
    ChatMessageFeedbackCreate,
    ChatMessageFeedbackOut
)
from app.api.deps import get_current_user, require_guidance_counselor
from app.services.nlp_service import nlp_service
from app.services.sass_parser import SASSParserService
from app.services.audit_service import AuditService

router = APIRouter()

@router.post("/message", response_model=ChatbotReplyResponse)
def send_chat_message(
    payload: ChatMessageInput,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Handles student interactive message:
    - Analyzes NLP sentiment & distress
    - Flags high-distress messages for Guidance Counselor
    - Updates non-academic mental health domain sub-score if distress detected
    - Generates supportive DSS guidance response
    """
    # Verify or obtain student record
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        # Fallback for testing: pick first active student if user is student role
        if current_user.role == UserRole.STUDENT:
            student = db.query(Student).first()
        else:
            student = db.query(Student).first()
            if not student:
                raise HTTPException(status_code=400, detail="No student record associated with user")

    # Session management
    session = None
    if payload.session_token:
        session = db.query(ChatbotSession).filter(
            ChatbotSession.session_token == payload.session_token,
            ChatbotSession.student_id == student.id
        ).first()

    if not session:
        session = ChatbotSession(
            student_id=student.id,
            session_token=str(uuid.uuid4())
        )
        db.add(session)
        db.flush()

    # Retrieve recent conversation history for multi-turn Gemini reasoning
    recent_messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session.id
    ).order_by(ChatMessage.created_at.asc()).all()

    conversation_history = [
        {"sender": m.sender, "text": m.message_text}
        for m in recent_messages
    ]

    # NLP Analysis
    nlp_res = nlp_service.analyze_message(payload.message)

    # Store Student Message
    student_msg = ChatMessage(
        session_id=session.id,
        sender="student",
        message_text=payload.message,
        sentiment=nlp_res["sentiment_category"],
        sentiment_score=nlp_res["sentiment_score"],
        distress_keywords_detected=", ".join(nlp_res["detected_keywords"]) if nlp_res["detected_keywords"] else None,
        inferred_domain=nlp_res["inferred_domain"]
    )
    db.add(student_msg)

    # Update session aggregate distress
    if nlp_res["counselor_flag"]:
        session.flagged_for_counselor = True
        session.flag_reason = nlp_res["flag_reason"]
        session.aggregate_distress_score = max(session.aggregate_distress_score, nlp_res["distress_score"])

        # Create or update Mental Health assessment based on NLP distress signals
        mh_assessment = NonAcademicAssessment(
            student_id=student.id,
            domain=DomainType.MENTAL_HEALTH,
            risk_score=nlp_res["distress_score"],
            source="nlp_chatbot_inferred",
            indicator_summary=f"Automated distress flag: {nlp_res['flag_reason']}",
            notes="Confidential NLP marker generated during interactive guidance chat session."
        )
        db.add(mh_assessment)
        db.flush()
        # Recalculate AHP Risk
        SASSParserService.recalculate_student_risk(db, student.id)

    # Build student profile context
    student_name = f"{student.first_name} {student.last_name}" if student and hasattr(student, "first_name") and student.first_name else current_user.full_name or "Student"
    grade_or_section = student.section.name if (student and getattr(student, "section", None)) else ""
    student_context = {
        "name": student_name,
        "year_level": grade_or_section,
        "strand": ""
    }

    # Generate supportive reply (Gemini AI with fallback to rule-based scaffolded system)
    bot_reply_text, resources, is_gemini_powered, model_used = nlp_service.generate_supportive_response(
        analysis=nlp_res,
        message=payload.message,
        conversation_history=conversation_history,
        student_context=student_context,
        knowledge_context=payload.knowledge_context
    )

    bot_msg = ChatMessage(
        session_id=session.id,
        sender="bot",
        message_text=bot_reply_text,
        sentiment=SentimentCategory.POSITIVE,
        sentiment_score=0.5,
        inferred_domain=nlp_res["inferred_domain"]
    )
    db.add(bot_msg)
    db.commit()

    # Log RA 10173 Audit for Student Chat Interaction
    AuditService.log_event(
        db=db,
        actor=current_user,
        action="CHATBOT_STUDENT_INTERACTION",
        target_resource=f"session_token:{session.session_token}",
        details=f"NLP Sentiment: {nlp_res['sentiment_category'].value}, Flagged: {nlp_res['counselor_flag']}, Gemini: {is_gemini_powered}",
        request=request
    )

    return ChatbotReplyResponse(
        reply=bot_reply_text,
        session_token=session.session_token,
        sentiment=nlp_res["sentiment_category"],
        distress_score=nlp_res["distress_score"],
        counselor_flagged=nlp_res["counselor_flag"],
        detected_emotion=nlp_res.get("detected_emotion", "neutral"),
        emotion_confidence=nlp_res.get("emotion_confidence", 0.85),
        intent=nlp_res.get("intent", "reflection"),
        crisis_triggered=nlp_res.get("crisis_flag", False),
        is_gemini_powered=is_gemini_powered,
        model_used=model_used,
        suggested_resources=resources
    )

# COUNSELOR ACCESS TO FLAGGED SESSIONS (RA 10173 SPI Protection)
@router.get("/flagged-alerts", response_model=List[ChatbotSessionOut])
def get_flagged_sessions(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_guidance_counselor)
):
    sessions = db.query(ChatbotSession).filter(
        ChatbotSession.flagged_for_counselor == True
    ).order_by(ChatbotSession.started_at.desc()).all()

    AuditService.log_event(
        db=db,
        actor=current_user,
        action="VIEW_CONFIDENTIAL_NLP_ALERTS",
        target_resource="chatbot_sessions:flagged",
        details="Guidance counselor reviewed distress alert queue",
        request=request
    )

    results = []
    for s in sessions:
        results.append(ChatbotSessionOut(
            id=s.id,
            student_id=s.student_id,
            student_name=f"{s.student.first_name} {s.student.last_name}" if s.student else "Unknown",
            session_token=s.session_token,
            aggregate_distress_score=s.aggregate_distress_score,
            flagged_for_counselor=s.flagged_for_counselor,
            flag_reason=s.flag_reason,
            started_at=s.started_at,
            ended_at=s.ended_at,
            messages=[ChatMessageOut.from_orm(m) for m in s.messages]
        ))
    return results

# RLHF & COUNSELOR CRITIQUE & TRAINING ENDPOINTS
@router.post("/critique", response_model=ChatMessageFeedbackOut)
def submit_chat_critique(
    payload: ChatMessageFeedbackCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits user or counselor rating & critique on chatbot answers.
    Saves feedback record and appends counselor gold-standard answers to fine-tuning dataset.
    """
    critique_tags_str = json.dumps(payload.critique_tags) if payload.critique_tags else None
    
    feedback = ChatMessageFeedback(
        session_token=payload.session_token,
        student_prompt=payload.student_prompt,
        bot_response=payload.bot_response,
        rating=payload.rating,
        critique_tags=critique_tags_str,
        critique_notes=payload.critique_notes,
        counselor_suggested_answer=payload.counselor_suggested_answer,
        reviewer_role=current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role),
        applied_to_kb=False
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    # If counselor provided a gold-standard suggested answer, append to institutional training jsonl
    if payload.counselor_suggested_answer and payload.counselor_suggested_answer.strip():
        try:
            data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
            os.makedirs(data_dir, exist_ok=True)
            training_path = os.path.join(data_dir, "sapc_chatbot_guidance_training.jsonl")
            
            training_sample = {
                "system": "You are the official AI Guidance Counselor Companion for San Antonio de Padua College (SAPC), modeled after a compassionate Registered Guidance Counselor.",
                "student": payload.student_prompt.strip(),
                "ideal_counselor_response": payload.counselor_suggested_answer.strip(),
                "tags": payload.critique_tags or ["counselor_critique_correction"],
                "source": f"counselor_feedback_id_{feedback.id}"
            }
            with open(training_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(training_sample, ensure_ascii=False) + "\n")
        except Exception as e:
            print(f"[Training Data Append Notice]: {e}")

    # Audit logging
    AuditService.log_event(
        db=db,
        actor=current_user,
        action="SUBMIT_CHATBOT_CRITIQUE",
        target_resource=f"feedback:{feedback.id}",
        details=f"Rating: {payload.rating}, Tags: {payload.critique_tags}, Has Correction: {bool(payload.counselor_suggested_answer)}",
        request=request
    )

    return feedback

@router.get("/critiques", response_model=List[ChatMessageFeedbackOut])
def list_chat_critiques(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_guidance_counselor)
):
    """
    Retrieves all submitted ratings, critiques, and suggested corrections for Counselor review.
    """
    return db.query(ChatMessageFeedback).order_by(ChatMessageFeedback.created_at.desc()).limit(100).all()

@router.post("/critiques/{critique_id}/approve")
def approve_critique_as_kb(
    critique_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_guidance_counselor)
):
    """
    Marks a critique as approved and applied to active institutional knowledge base.
    """
    fb = db.query(ChatMessageFeedback).filter(ChatMessageFeedback.id == critique_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Critique record not found")
    
    fb.applied_to_kb = True
    db.commit()

    AuditService.log_event(
        db=db,
        actor=current_user,
        action="APPROVE_CRITIQUE_TO_KB",
        target_resource=f"feedback:{fb.id}",
        details="Counselor approved critique correction into knowledge base",
        request=request
    )
    return {"status": "success", "message": "Critique approved and indexed into training pool"}
