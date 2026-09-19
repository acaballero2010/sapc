from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.risk import RiskScore, InterventionPlan, RiskTier, InterventionStatus
from app.schemas.risk import (
    RiskScoreOut, 
    InterventionPlanCreate, 
    InterventionPlanUpdate, 
    InterventionPlanOut,
    CohortRiskAnalytics
)
from app.api.deps import get_current_user, require_faculty, require_guidance_counselor
from app.services.sass_parser import SASSParserService
from app.services.audit_service import AuditService

router = APIRouter()

@router.get("/student/{student_id}", response_model=RiskScoreOut)
def get_student_risk_score(
    student_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    risk_record = db.query(RiskScore).filter(RiskScore.student_id == student_id).first()
    if not risk_record:
        # Calculate now if not existing
        risk_record = SASSParserService.recalculate_student_risk(db, student_id)

    # RA 10173 Audit
    AuditService.log_event(
        db=db,
        actor=current_user,
        action="VIEW_AHP_RISK_SCORE",
        target_resource=f"student_id:{student_id}",
        details=f"Viewed risk score {risk_record.composite_risk_score} ({risk_record.risk_tier.value})",
        request=request
    )

    return risk_record

@router.post("/recalculate/{student_id}", response_model=RiskScoreOut)
def trigger_recalculate(
    student_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    risk_record = SASSParserService.recalculate_student_risk(db, student_id)

    AuditService.log_event(
        db=db,
        actor=current_user,
        action="RECALCULATE_AHP_SCORE",
        target_resource=f"student_id:{student_id}",
        details=f"Triggered AHP re-evaluation: result {risk_record.composite_risk_score}",
        request=request
    )
    return risk_record

# INTERVENTIONS
@router.post("/interventions", response_model=InterventionPlanOut)
def create_intervention_plan(
    data: InterventionPlanCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_guidance_counselor)
):
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    plan = InterventionPlan(
        student_id=data.student_id,
        counselor_id=current_user.id,
        title=data.title,
        target_domain=data.target_domain,
        risk_level_at_creation=data.risk_level_at_creation,
        description=data.description,
        action_items=data.action_items,
        scheduled_followup=data.scheduled_followup,
        status=InterventionStatus.PENDING
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    AuditService.log_event(
        db=db,
        actor=current_user,
        action="CREATE_INTERVENTION_PLAN",
        target_resource=f"intervention_id:{plan.id},student_id:{student.id}",
        details=f"Created intervention: {plan.title}",
        request=request
    )

    return InterventionPlanOut(
        id=plan.id,
        student_id=plan.student_id,
        student_name=f"{student.first_name} {student.last_name}",
        counselor_id=plan.counselor_id,
        counselor_name=current_user.full_name,
        title=plan.title,
        target_domain=plan.target_domain,
        risk_level_at_creation=plan.risk_level_at_creation,
        description=plan.description,
        action_items=plan.action_items,
        status=plan.status,
        scheduled_followup=plan.scheduled_followup,
        resolution_notes=plan.resolution_notes,
        created_at=plan.created_at,
        updated_at=plan.updated_at
    )

@router.get("/interventions", response_model=List[InterventionPlanOut])
def list_interventions(
    student_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(InterventionPlan)
    if student_id:
        query = query.filter(InterventionPlan.student_id == student_id)
    if status_filter:
        query = query.filter(InterventionPlan.status == status_filter)

    plans = query.order_by(InterventionPlan.id.desc()).all()
    results = []
    for p in plans:
        results.append(InterventionPlanOut(
            id=p.id,
            student_id=p.student_id,
            student_name=f"{p.student.first_name} {p.student.last_name}" if p.student else None,
            counselor_id=p.counselor_id,
            counselor_name=p.counselor.full_name if p.counselor else None,
            title=p.title,
            target_domain=p.target_domain,
            risk_level_at_creation=p.risk_level_at_creation,
            description=p.description,
            action_items=p.action_items,
            status=p.status,
            scheduled_followup=p.scheduled_followup,
            resolution_notes=p.resolution_notes,
            created_at=p.created_at,
            updated_at=p.updated_at
        ))
    return results

@router.patch("/interventions/{plan_id}", response_model=InterventionPlanOut)
def update_intervention(
    plan_id: int,
    data: InterventionPlanUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_guidance_counselor)
):
    plan = db.query(InterventionPlan).filter(InterventionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Intervention plan not found")

    if data.title is not None:
        plan.title = data.title
    if data.description is not None:
        plan.description = data.description
    if data.action_items is not None:
        plan.action_items = data.action_items
    if data.status is not None:
        plan.status = data.status
    if data.scheduled_followup is not None:
        plan.scheduled_followup = data.scheduled_followup
    if data.resolution_notes is not None:
        plan.resolution_notes = data.resolution_notes

    db.commit()
    db.refresh(plan)

    AuditService.log_event(
        db=db,
        actor=current_user,
        action="UPDATE_INTERVENTION_PLAN",
        target_resource=f"intervention_id:{plan.id}",
        details=f"Updated status to {plan.status.value}",
        request=request
    )

    return InterventionPlanOut(
        id=plan.id,
        student_id=plan.student_id,
        student_name=f"{plan.student.first_name} {plan.student.last_name}" if plan.student else None,
        counselor_id=plan.counselor_id,
        counselor_name=plan.counselor.full_name if plan.counselor else None,
        title=plan.title,
        target_domain=plan.target_domain,
        risk_level_at_creation=plan.risk_level_at_creation,
        description=plan.description,
        action_items=plan.action_items,
        status=plan.status,
        scheduled_followup=plan.scheduled_followup,
        resolution_notes=plan.resolution_notes,
        created_at=plan.created_at,
        updated_at=plan.updated_at
    )
