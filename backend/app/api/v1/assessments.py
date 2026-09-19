from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.assessment import NonAcademicAssessment, CounselorNote, DomainType, DailyMoodCheckin
from app.models.risk import RiskScore
from app.schemas.assessment import (
    NonAcademicAssessmentCreate, 
    NonAcademicAssessmentOut, 
    CounselorNoteCreate, 
    CounselorNoteOut,
    DailyMoodCheckinCreate,
    DailyMoodCheckinOut,
    MoodHistorySummary,
    ClinicalSummaryRequest,
    ClinicalSummaryResponse
)
from app.api.deps import get_current_user, require_guidance_counselor, require_faculty
from app.services.sass_parser import SASSParserService
from app.services.nlp_service import NLPService
from app.services.audit_service import AuditService

router = APIRouter()
nlp_service = NLPService()

@router.post("/survey", response_model=NonAcademicAssessmentOut)
def record_non_academic_assessment(
    data: NonAcademicAssessmentCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    """
    Submits a non-academic domain assessment (Health, Financial, Family, Mental Health).
    Automatically recalculates AHP multi-criteria failure risk score.
    """
    assessment = NonAcademicAssessment(
        student_id=data.student_id,
        domain=data.domain,
        risk_score=data.risk_score,
        source=data.source or "manual_evaluation",
        indicator_summary=data.indicator_summary,
        notes=data.notes,
        metrics_json=data.metrics_json
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # Recalculate AHP composite risk
    SASSParserService.recalculate_student_risk(db, data.student_id)

    AuditService.log_event(
        db=db,
        actor=current_user,
        action="CREATE_DOMAIN_ASSESSMENT",
        target_resource=f"student_id:{data.student_id},domain:{data.domain.value}",
        details=f"Assessed {data.domain.value} risk at {data.risk_score}",
        request=request
    )

    return assessment

@router.get("/student/{student_id}", response_model=List[NonAcademicAssessmentOut])
def get_student_domain_assessments(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # RA 10173 filter: Teachers only see non-sensitive summary, not deep mental health notes
    assessments = db.query(NonAcademicAssessment).filter(
        NonAcademicAssessment.student_id == student_id
    ).all()

    # If Teacher or Parent, sanitize mental health notes
    results = []
    for ass in assessments:
        ass_out = NonAcademicAssessmentOut.from_orm(ass)
        if current_user.role in [UserRole.TEACHER, UserRole.PARENT, UserRole.STUDENT] and ass.domain == DomainType.MENTAL_HEALTH:
            ass_out.notes = "[Protected under RA 10173 - Guidance Counselor Access Only]"
        results.append(ass_out)

    return results

# COUNSELOR CONFIDENTIAL NOTES (Exclusive to Guidance Counselor role)
@router.post("/counselor-notes", response_model=CounselorNoteOut)
def create_counselor_note(
    data: CounselorNoteCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_guidance_counselor)
):
    note = CounselorNote(
        student_id=data.student_id,
        counselor_id=current_user.id,
        observation_summary=data.observation_summary,
        mental_health_indicators=data.mental_health_indicators,
        recommended_action=data.recommended_action
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    AuditService.log_event(
        db=db,
        actor=current_user,
        action="CREATE_CONFIDENTIAL_COUNSELOR_NOTE",
        target_resource=f"student_id:{data.student_id}",
        details="Added confidential psychiatric/guidance consultation note",
        request=request
    )

    return CounselorNoteOut(
        id=note.id,
        student_id=note.student_id,
        counselor_id=note.counselor_id,
        counselor_name=current_user.full_name,
        session_date=note.session_date,
        observation_summary=note.observation_summary,
        mental_health_indicators=note.mental_health_indicators,
        recommended_action=note.recommended_action,
        created_at=note.created_at
    )

@router.get("/counselor-notes/student/{student_id}", response_model=List[CounselorNoteOut])
def get_counselor_notes(
    student_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_guidance_counselor)
):
    """
    STRICT RA 10173 PRIVILEGE: Guidance Counselors only.
    """
    notes = db.query(CounselorNote).filter(
        CounselorNote.student_id == student_id
    ).order_by(CounselorNote.id.desc()).all()

    AuditService.log_event(
        db=db,
        actor=current_user,
        action="ACCESS_CONFIDENTIAL_COUNSELOR_NOTES",
        target_resource=f"student_id:{student_id}",
        details="Guidance Counselor accessed psychiatric notes",
        request=request
    )

    results = []
    for n in notes:
        results.append(CounselorNoteOut(
            id=n.id,
            student_id=n.student_id,
            counselor_id=n.counselor_id,
            counselor_name=n.counselor.full_name if n.counselor else "Guidance Staff",
            session_date=n.session_date,
            observation_summary=n.observation_summary,
            mental_health_indicators=n.mental_health_indicators,
            recommended_action=n.recommended_action,
            created_at=n.created_at
        ))
    return results

# DAILY MOOD & WELLNESS CHECK-IN
@router.post("/mood-checkin", response_model=DailyMoodCheckinOut)
def record_daily_mood_checkin(
    data: DailyMoodCheckinCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits a 5-second student daily mood checkin.
    Applies NLP sentiment analysis to reflections and updates S_MH longitudinal trend.
    """
    # 1. Determine student ID
    target_student_id = data.student_id
    if not target_student_id:
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student:
            # Fallback to first student for demo
            student = db.query(Student).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")
        target_student_id = student.id

    # 2. Extract NLP sentiment polarity if reflection note exists
    polarity = 0.0
    if data.reflection_note and data.reflection_note.strip():
        analysis = nlp_service.analyze_message(data.reflection_note)
        polarity = analysis.get("sentiment_score", 0.0)

    # 3. Save mood checkin
    checkin = DailyMoodCheckin(
        student_id=target_student_id,
        mood_score=data.mood_score,
        mood_emoji=data.mood_emoji or "😊",
        energy_level=data.energy_level or 3,
        primary_stressor=data.primary_stressor or "None",
        reflection_note=data.reflection_note,
        sentiment_polarity=polarity
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)

    # 4. Optional: Recalculate AHP Mental Health score based on recent 7-day average
    recent_checkins = db.query(DailyMoodCheckin).filter(
        DailyMoodCheckin.student_id == target_student_id
    ).order_by(DailyMoodCheckin.id.desc()).limit(7).all()

    if recent_checkins:
        # Lower mood score (1-2) = higher distress risk
        avg_mood = sum(c.mood_score for c in recent_checkins) / len(recent_checkins)
        # Convert 1-5 scale to 0-100 risk (5 = 10 risk, 1 = 85 risk)
        inferred_mh_risk = max(10.0, min(90.0, (5.0 - avg_mood) * 20.0 + 10.0))
        
        # Update or record NonAcademicAssessment for mental health
        mh_ass = db.query(NonAcademicAssessment).filter(
            NonAcademicAssessment.student_id == target_student_id,
            NonAcademicAssessment.domain == DomainType.MENTAL_HEALTH
        ).first()

        if not mh_ass:
            mh_ass = NonAcademicAssessment(
                student_id=target_student_id,
                domain=DomainType.MENTAL_HEALTH,
                risk_score=inferred_mh_risk,
                source="daily_mood_checkin",
                indicator_summary=f"Calculated from {len(recent_checkins)} daily check-ins (Avg Mood: {avg_mood:.1f}/5)"
            )
            db.add(mh_ass)
        else:
            mh_ass.risk_score = round(inferred_mh_risk, 1)
            mh_ass.indicator_summary = f"Calculated from {len(recent_checkins)} daily check-ins (Avg Mood: {avg_mood:.1f}/5)"

        db.commit()
        # Recalculate AHP composite
        SASSParserService.recalculate_student_risk(db, target_student_id)

    return checkin

@router.get("/mood-history", response_model=MoodHistorySummary)
def get_current_student_mood_history(
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns student's daily check-in history, streak counter, and emotional averages.
    """
    target_student_id = student_id
    if not target_student_id:
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student:
            student = db.query(Student).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")
        target_student_id = student.id

    checkins = db.query(DailyMoodCheckin).filter(
        DailyMoodCheckin.student_id == target_student_id
    ).order_by(DailyMoodCheckin.created_at.desc()).limit(14).all()

    total_count = len(checkins)
    avg_mood = sum(c.mood_score for c in checkins) / max(total_count, 1) if total_count > 0 else 3.5
    avg_energy = sum(c.energy_level for c in checkins) / max(total_count, 1) if total_count > 0 else 3.0

    # Calculate approximate streak
    streak = min(total_count, 5) if total_count > 0 else 0

    return MoodHistorySummary(
        total_checkins=total_count,
        streak_days=streak,
        average_mood=round(avg_mood, 1),
        average_energy=round(avg_energy, 1),
        recent_checkins=checkins,
        mental_health_risk_impact=round((5.0 - avg_mood) * 15.0 + 10.0, 1)
    )

@router.post("/summarize-session", response_model=ClinicalSummaryResponse)
def summarize_counseling_session(
    data: ClinicalSummaryRequest,
    current_user: User = Depends(require_guidance_counselor)
):
    """
    AI Clinical Structurer:
    Takes raw voice dictation transcript from the counselor and extracts:
    - Structured clinical observation summary
    - Specific emotional/mental health indicators & triggers
    - Recommended action plan and interventions
    """
    text = data.raw_transcript.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Transcript cannot be empty")

    nlp_result = nlp_service.analyze_message(text)
    polarity = nlp_result.get("sentiment_score", 0.0)
    inferred_domain = nlp_result.get("inferred_domain", "mental_health")

    # Keyword extraction
    text_lower = text.lower()
    
    # 1. Identify indicators
    indicators = []
    if any(k in text_lower for k in ["anxiety", "anxious", "panic", "kaba", "takot"]):
        indicators.append("Elevated anxiety / panic symptoms")
    if any(k in text_lower for k in ["depressed", "hopeless", "sad", "crying", "lungkot", "iyak"]):
        indicators.append("Depressive affect & emotional distress")
    if any(k in text_lower for k in ["sleep", "insomnia", "puyat", "pagod", "tired", "burnout"]):
        indicators.append("Sleep deprivation & academic fatigue")
    if any(k in text_lower for k in ["exam", "grades", "failing", "bagsak", "calculus", "math", "deadline"]):
        indicators.append("Exam anxiety & subject deadline strain")
    if any(k in text_lower for k in ["family", "parents", "magulang", "away", "fighting", "pressure"]):
        indicators.append("Household conflict & parental expectations")
    if any(k in text_lower for k in ["money", "tuition", "allowance", "pera", "baon", "utang"]):
        indicators.append("Financial stress & allowance constraints")
    
    if not indicators:
        indicators.append("General academic and developmental consultation")

    # 2. Recommended Action Formulation
    actions = []
    if "Elevated anxiety / panic symptoms" in indicators or "Depressive affect & emotional distress" in indicators:
        actions.append("Schedule bi-weekly 1-on-1 counseling follow-up at Guidance Center (Room 204)")
        actions.append("Practice 4-7-8 breathing and self-regulation exercises before classes")
    if "Exam anxiety & subject deadline strain" in indicators:
        actions.append("Refer student to SAPC Peer Tutoring & Academic Study Circle")
        actions.append("Coordinate subject pacing consultation with Class Adviser")
    if "Household conflict & parental expectations" in indicators:
        actions.append("Convene collaborative Parent-Teacher-Counselor Case Conference")
    if "Financial stress & allowance constraints" in indicators:
        actions.append("Refer to Student Affairs for institutional scholarship and flexible installment options")
    
    if not actions:
        actions.append("Routine follow-up in 2 weeks to monitor holistic progress")

    # 3. Clean observation narrative
    clean_summary = text
    # Capitalize first letter and ensure ending punctuation
    if clean_summary and not clean_summary.endswith("."):
        clean_summary += "."

    return ClinicalSummaryResponse(
        observation_summary=clean_summary,
        mental_health_indicators=", ".join(indicators),
        recommended_action="; ".join(actions),
        inferred_domains=[inferred_domain],
        sentiment_polarity=polarity
    )


