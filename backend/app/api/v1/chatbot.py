import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.chatbot import ChatbotSession, ChatMessage, SentimentCategory
from app.models.assessment import NonAcademicAssessment, DomainType
from app.schemas.chatbot import (
    ChatMessageInput, 
    ChatMessageOut, 
    ChatbotSessionOut, 
    ChatbotReplyResponse
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

    # Generate supportive reply
    bot_reply_text, resources = nlp_service.generate_supportive_response(nlp_res, payload.message)

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
        details=f"NLP Sentiment: {nlp_res['sentiment_category'].value}, Flagged: {nlp_res['counselor_flag']}",
        request=request
    )

    return ChatbotReplyResponse(
        reply=bot_reply_text,
        session_token=session.session_token,
        sentiment=nlp_res["sentiment_category"],
        distress_score=nlp_res["distress_score"],
        counselor_flagged=nlp_res["counselor_flag"],
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
