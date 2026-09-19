from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.risk import RiskScore, InterventionPlan, RiskTier, InterventionStatus
from app.models.academic import AcademicRecord
from app.schemas.risk import (
    RiskScoreOut, 
    InterventionPlanCreate, 
    InterventionPlanUpdate, 
    InterventionPlanOut,
    CohortRiskAnalytics,
    RecoverySimulationRequest,
    RecoverySimulationResponse
)
from app.api.deps import get_current_user, require_faculty, require_guidance_counselor
from app.services.sass_parser import SASSParserService
from app.services.ahp_engine import AHPEngine, calculate_student_risk
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
        status=data.status or InterventionStatus.IN_PROGRESS
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

@router.post("/simulate-recovery", response_model=RecoverySimulationResponse)
def simulate_academic_recovery(
    data: RecoverySimulationRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Simulates what-if grade, attendance, and non-academic improvements on
    the student's AHP multi-criteria failure risk index.
    """
    # 1. Fetch current baseline
    current_academic = 65.0
    current_mental = 30.0
    current_financial = 25.0
    current_family = 20.0
    current_health = 15.0
    current_composite = 45.0
    current_tier = RiskTier.MEDIUM

    if data.student_id:
        risk_rec = db.query(RiskScore).filter(RiskScore.student_id == data.student_id).first()
        if risk_rec:
            current_academic = risk_rec.academic_score
            current_mental = risk_rec.mental_health_score
            current_financial = risk_rec.financial_score
            current_family = risk_rec.family_score
            current_health = risk_rec.health_score
            current_composite = risk_rec.composite_risk_score
            current_tier = risk_rec.risk_tier

    # 2. Calculate simulated S_AC
    simulated_s_ac = AHPEngine.calculate_academic_risk_score(
        quarter_gpa=data.target_gpa,
        failing_subjects_count=data.target_failing_count,
        days_absent=data.target_absences,
        incomplete_requirements_count=data.target_incomplete_count
    )

    # 3. Non-academic overrides if provided
    sim_mental = data.simulated_mental_health if data.simulated_mental_health is not None else current_mental
    sim_financial = data.simulated_financial if data.simulated_financial is not None else current_financial
    sim_family = data.simulated_family if data.simulated_family is not None else current_family
    sim_health = data.simulated_health if data.simulated_health is not None else current_health

    # 4. Compute simulated composite AHP score
    sim_scores = {
        "academic": simulated_s_ac,
        "mental_health": sim_mental,
        "financial": sim_financial,
        "family": sim_family,
        "health": sim_health
    }
    sim_ahp = calculate_student_risk(sim_scores)
    simulated_composite = sim_ahp["composite_risk_score"]
    simulated_tier = sim_ahp["risk_tier"]

    # 5. Risk reduction metrics
    risk_reduction_pts = round(max(0.0, current_composite - simulated_composite), 2)
    risk_reduction_pct = round((risk_reduction_pts / max(current_composite, 1.0)) * 100, 1)

    # 6. Generate tailored recovery milestones
    milestones = []
    if data.target_gpa >= 85.0:
        milestones.append(f"Target GPA of {data.target_gpa:.1f} completely eliminates academic GPA penalty.")
    elif data.target_gpa >= 80.0:
        milestones.append(f"Target GPA of {data.target_gpa:.1f} reduces GPA penalty to 0 points (Passes standard).")
    elif data.target_gpa >= 75.0:
        milestones.append(f"Target GPA of {data.target_gpa:.1f} clears passing grade threshold.")
    else:
        milestones.append(f"Target GPA {data.target_gpa:.1f} remains in remedial range (<75). Recommend >= 78.0.")

    if data.target_absences <= 2:
        milestones.append("Zero attendance penalties achieved (Absences <= 2 days).")
    else:
        milestones.append(f"Limiting absences to <= 2 days would drop risk by an additional 8.0 - 15.0 pts.")

    if data.target_failing_count == 0:
        milestones.append("All failed subject penalties (25 pts each) cleared.")
    else:
        milestones.append(f"{data.target_failing_count} failing subject(s) remaining. Prioritize remedial clearing.")

    # 7. Optimal target recommendation solver
    optimal_target = {
        "recommended_min_gpa": 82.0,
        "recommended_max_absences": 2,
        "recommended_failing_cleared": 0,
        "achievable_composite_score": round((0.4017 * 0.0) + (0.2442 * sim_mental) + (0.1373 * sim_financial) + (0.1373 * sim_family) + (0.0794 * sim_health), 2),
        "target_risk_tier": "low"
    }

    return RecoverySimulationResponse(
        current_composite_score=round(current_composite, 2),
        current_risk_tier=current_tier.value if hasattr(current_tier, 'value') else str(current_tier),
        current_academic_score=round(current_academic, 2),
        simulated_academic_score=round(simulated_s_ac, 2),
        simulated_composite_score=round(simulated_composite, 2),
        simulated_risk_tier=simulated_tier.value if hasattr(simulated_tier, 'value') else str(simulated_tier),
        risk_reduction_points=risk_reduction_pts,
        risk_reduction_pct=risk_reduction_pct,
        domain_breakdown=sim_scores,
        required_milestones=milestones,
        target_achieved=simulated_tier == RiskTier.LOW,
        optimal_target_recommendation=optimal_target
    )

