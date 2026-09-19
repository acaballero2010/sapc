import numpy as np
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.student import Student
from app.models.risk import RiskScore, RiskTier
from app.schemas.risk import CohortRiskAnalytics, DomainScoreBreakdown
from app.api.deps import get_current_user, require_faculty

router = APIRouter()

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
