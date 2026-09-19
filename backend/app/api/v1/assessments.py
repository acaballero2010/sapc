from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.assessment import NonAcademicAssessment, CounselorNote, DomainType
from app.schemas.assessment import (
    NonAcademicAssessmentCreate, 
    NonAcademicAssessmentOut, 
    CounselorNoteCreate, 
    CounselorNoteOut
)
from app.api.deps import get_current_user, require_guidance_counselor, require_faculty
from app.services.sass_parser import SASSParserService
from app.services.audit_service import AuditService

router = APIRouter()

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
