from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student, Section, Parent
from app.models.risk import RiskScore
from app.schemas.student import StudentOut, StudentCreate, StudentUpdate, SectionOut
from app.api.deps import get_current_user, require_counselor_or_admin
from app.services.audit_service import AuditService

router = APIRouter()

@router.get("", response_model=List[StudentOut])
def list_students(
    section_id: Optional[int] = None,
    search: Optional[str] = None,
    risk_tier: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Student).filter(Student.is_active == True)

    # RBAC Data Filtering based on Role (RA 10173 principle of need-to-know)
    if current_user.role == UserRole.TEACHER:
        # Teachers only view students in their assigned sections
        teacher_sections = db.query(Section.id).filter(Section.adviser_id == current_user.id).all()
        section_ids = [s[0] for s in teacher_sections]
        query = query.filter(Student.section_id.in_(section_ids))
    elif current_user.role == UserRole.PARENT:
        parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
        if not parent:
            return []
        query = query.filter(Student.parent_id == parent.id)
    elif current_user.role == UserRole.STUDENT:
        query = query.filter(Student.user_id == current_user.id)

    if section_id:
        query = query.filter(Student.section_id == section_id)
    if search:
        query = query.filter(
            (Student.first_name.ilike(f"%{search}%")) |
            (Student.last_name.ilike(f"%{search}%")) |
            (Student.lrn.ilike(f"%{search}%"))
        )

    students = query.all()
    results = []
    for s in students:
        s_out = StudentOut(
            id=s.id,
            lrn=s.lrn,
            first_name=s.first_name,
            last_name=s.last_name,
            middle_name=s.middle_name,
            gender=s.gender,
            email=s.email,
            section_id=s.section_id,
            parent_id=s.parent_id,
            is_active=s.is_active,
            section_name=s.section.name if s.section else "Unassigned",
            adviser_name=s.section.adviser.full_name if s.section and s.section.adviser else None,
            created_at=s.created_at
        )
        
        # Attach latest risk score preview
        latest_risk = db.query(RiskScore).filter(RiskScore.student_id == s.id).first()
        if latest_risk:
            s_out.latest_risk_score = latest_risk.composite_risk_score
            s_out.latest_risk_tier = latest_risk.risk_tier.value
            s_out.primary_risk_driver = latest_risk.primary_risk_driver
            
        if risk_tier and s_out.latest_risk_tier != risk_tier.lower():
            continue
            
        results.append(s_out)

    return results

@router.get("/{student_id}", response_model=StudentOut)
def get_student_by_id(
    student_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Authorization verification
    if current_user.role == UserRole.STUDENT and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to student record")
    if current_user.role == UserRole.PARENT:
        parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
        if not parent or student.parent_id != parent.id:
            raise HTTPException(status_code=403, detail="Unauthorized access to student record")

    # Log RA 10173 student data access
    AuditService.log_event(
        db=db,
        actor=current_user,
        action="VIEW_STUDENT_PROFILE",
        target_resource=f"student_id:{student_id}",
        details=f"Viewed profile for student LRN {student.lrn}",
        request=request
    )

    s_out = StudentOut(
        id=student.id,
        lrn=student.lrn,
        first_name=student.first_name,
        last_name=student.last_name,
        middle_name=student.middle_name,
        gender=student.gender,
        email=student.email,
        section_id=student.section_id,
        parent_id=student.parent_id,
        is_active=student.is_active,
        section_name=student.section.name if student.section else "Unassigned",
        adviser_name=student.section.adviser.full_name if student.section and student.section.adviser else None,
        created_at=student.created_at
    )
    latest_risk = db.query(RiskScore).filter(RiskScore.student_id == student.id).first()
    if latest_risk:
        s_out.latest_risk_score = latest_risk.composite_risk_score
        s_out.latest_risk_tier = latest_risk.risk_tier.value
        s_out.primary_risk_driver = latest_risk.primary_risk_driver

    return s_out

@router.get("/sections/list", response_model=List[SectionOut])
def list_sections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sections = db.query(Section).all()
    results = []
    for sec in sections:
        results.append(SectionOut(
            id=sec.id,
            name=sec.name,
            grade_level=sec.grade_level,
            adviser_id=sec.adviser_id,
            adviser_name=sec.adviser.full_name if sec.adviser else None,
            created_at=sec.created_at
        ))
    return results
