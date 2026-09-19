import numpy as np
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.risk import RiskScore, RiskTier
from app.models.academic import AcademicRecord
from app.models.assessment import NonAcademicAssessment, DomainType
from app.schemas.risk import CohortRiskAnalytics, DomainScoreBreakdown
from app.api.deps import get_current_user, require_faculty
from app.services.ahp_engine import calculate_student_risk, recommend_interventions, compute_ahp_weights
from app.services.sass_parser import SASSParserService
from app.services.audit_service import AuditService

router = APIRouter()

class DomainContribution(BaseModel):
    domain: str
    raw_score: float
    weight: float
    weighted_contribution: float

class RecommendedActionDetail(BaseModel):
    domain: str
    title: str
    description: str
    action_items: Optional[List[str]] = None

class SecondaryRecommendation(BaseModel):
    domain: str
    score: float
    title: str
    description: str

class StudentRiskBreakdownResponse(BaseModel):
    student_id: int
    lrn: str
    student_name: str
    section_name: Optional[str] = None
    composite_risk_score: float
    risk_tier: str
    dominant_domain: str
    consistency_ratio: float
    is_matrix_consistent: bool
    domain_breakdown: List[DomainContribution]
    primary_recommendation: RecommendedActionDetail
    secondary_recommendations: List[SecondaryRecommendation] = []
    ranked_domain_hierarchy: List[Dict[str, Any]]

@router.get("/student/{student_id}/risk-breakdown", response_model=StudentRiskBreakdownResponse)
def get_student_risk_breakdown(
    student_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Phase 3: Computes complete AHP Multi-Criteria risk breakdown,
    matrix consistency validation, and targeted intervention recommendations.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # RBAC Access control under RA 10173
    if current_user.role == UserRole.STUDENT and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    if current_user.role == UserRole.TEACHER and student.section and student.section.adviser_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # 1. Fetch latest academic record S_AC
    latest_acad = db.query(AcademicRecord).filter(
        AcademicRecord.student_id == student.id
    ).order_by(AcademicRecord.id.desc()).first()
    academic_score = latest_acad.normalized_academic_risk if latest_acad else 20.0

    # 2. Fetch non-academic domain scores
    assessments = db.query(NonAcademicAssessment).filter(
        NonAcademicAssessment.student_id == student.id
    ).all()

    domain_scores = {
        "academic": academic_score,
        "mental_health": 15.0,
        "financial": 15.0,
        "family": 15.0,
        "health": 10.0
    }

    for ass in assessments:
        if ass.domain == DomainType.MENTAL_HEALTH:
            domain_scores["mental_health"] = ass.risk_score
        elif ass.domain == DomainType.FINANCIAL:
            domain_scores["financial"] = ass.risk_score
        elif ass.domain == DomainType.FAMILY:
            domain_scores["family"] = ass.risk_score
        elif ass.domain == DomainType.HEALTH:
            domain_scores["health"] = ass.risk_score

    # 3. Compute AHP Calculations & Interventions
    ahp_risk = calculate_student_risk(domain_scores)
    interventions = recommend_interventions(domain_scores)
    _, _, cr, is_consistent = compute_ahp_weights()

    # 4. Format domain contributions
    breakdown_list = []
    for d, s in ahp_risk["sub_scores"].items():
        w = ahp_risk["weights"][d]
        contrib = ahp_risk["contributions"][d]
        breakdown_list.append(DomainContribution(
            domain=d.replace("_", " ").title(),
            raw_score=round(s, 2),
            weight=w,
            weighted_contribution=contrib
        ))

    # Log RA 10173 Audit
    AuditService.log_event(
        db=db,
        actor=current_user,
        action="GET_AHP_RISK_BREAKDOWN",
        target_resource=f"student_id:{student.id}",
        details=f"AHP Composite: {ahp_risk['composite_risk_score']} ({ahp_risk['risk_tier'].value}), Dominant: {ahp_risk['dominant_domain']}",
        request=request
    )

    return StudentRiskBreakdownResponse(
        student_id=student.id,
        lrn=student.lrn,
        student_name=f"{student.first_name} {student.last_name}",
        section_name=student.section.name if student.section else "Unassigned",
        composite_risk_score=ahp_risk["composite_risk_score"],
        risk_tier=ahp_risk["risk_tier"].value,
        dominant_domain=ahp_risk["dominant_domain"],
        consistency_ratio=round(cr, 4),
        is_matrix_consistent=is_consistent,
        domain_breakdown=breakdown_list,
        primary_recommendation=RecommendedActionDetail(
            domain=interventions["primary_recommendation"]["domain"],
            title=interventions["primary_recommendation"]["title"],
            description=interventions["primary_recommendation"]["description"],
            action_items=interventions["primary_recommendation"]["action_items"]
        ),
        secondary_recommendations=[
            SecondaryRecommendation(
                domain=sec["domain"],
                score=sec["score"],
                title=sec["title"],
                description=sec["description"]
            )
            for sec in interventions["secondary_recommendations"]
        ],
        ranked_domain_hierarchy=interventions["ranked_domain_hierarchy"]
    )

@router.get("/cohort-summary", response_model=CohortRiskAnalytics)
def get_cohort_summary(
    section_id: int = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_faculty)
):
    query = db.query(Student).filter(Student.is_active == True)
    if section_id:
        query = query.filter(Student.section_id == section_id)
        
    students = query.all()
    total_students = len(students)
    
    if total_students == 0:
        return CohortRiskAnalytics(
            total_students=0,
            low_risk_count=0,
            medium_risk_count=0,
            high_risk_count=0,
            average_composite_score=0.0,
            domain_averages=DomainScoreBreakdown(
                academic=0.0,
                mental_health=0.0,
                financial=0.0,
                family=0.0,
                health=0.0
            ),
            high_risk_students=[]
        )

    student_ids = [s.id for s in students]
    risk_records = db.query(RiskScore).filter(RiskScore.student_id.in_(student_ids)).all()
    risk_map = {r.student_id: r for r in risk_records}

    low_count = 0
    med_count = 0
    high_count = 0
    composite_scores = []
    acad_scores = []
    mental_scores = []
    fin_scores = []
    fam_scores = []
    health_scores = []
    high_risk_list = []

    for s in students:
        r = risk_map.get(s.id)
        if r:
            composite_scores.append(r.composite_risk_score)
            acad_scores.append(r.academic_score)
            mental_scores.append(r.mental_health_score)
            fin_scores.append(r.financial_score)
            fam_scores.append(r.family_score)
            health_scores.append(r.health_score)

            if r.risk_tier == RiskTier.HIGH:
                high_count += 1
                high_risk_list.append({
                    "id": s.id,
                    "lrn": s.lrn,
                    "name": f"{s.first_name} {s.last_name}",
                    "composite_score": r.composite_risk_score,
                    "primary_driver": r.primary_risk_driver,
                    "section": s.section.name if s.section else "Unassigned"
                })
            elif r.risk_tier == RiskTier.MEDIUM:
                med_count += 1
            else:
                low_count += 1
        else:
            low_count += 1
            composite_scores.append(20.0)

    avg_composite = float(np.mean(composite_scores)) if composite_scores else 0.0
    avg_acad = float(np.mean(acad_scores)) if acad_scores else 0.0
    avg_mental = float(np.mean(mental_scores)) if mental_scores else 0.0
    avg_fin = float(np.mean(fin_scores)) if fin_scores else 0.0
    avg_fam = float(np.mean(fam_scores)) if fam_scores else 0.0
    avg_health = float(np.mean(health_scores)) if health_scores else 0.0

    return CohortRiskAnalytics(
        total_students=total_students,
        low_risk_count=low_count,
        medium_risk_count=med_count,
        high_risk_count=high_count,
        average_composite_score=round(avg_composite, 2),
        domain_averages=DomainScoreBreakdown(
            academic=round(avg_acad, 2),
            mental_health=round(avg_mental, 2),
            financial=round(avg_fin, 2),
            family=round(avg_fam, 2),
            health=round(avg_health, 2)
        ),
        high_risk_students=high_risk_list
    )
