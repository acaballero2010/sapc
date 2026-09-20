from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from app.models.risk import RiskTier, InterventionStatus

class DomainScoreBreakdown(BaseModel):
    academic: float
    mental_health: float
    financial: float
    family: float
    health: float

class DomainWeightBreakdown(BaseModel):
    academic: float = 0.30
    family: float = 0.20
    health: float = 0.20
    mental_health: float = 0.15
    financial: float = 0.15

class RiskScoreOut(BaseModel):
    id: int
    student_id: int
    academic_score: float
    mental_health_score: float
    financial_score: float
    family_score: float
    health_score: float
    
    academic_weight: float
    mental_health_weight: float
    financial_weight: float
    family_weight: float
    health_weight: float
    
    composite_risk_score: float
    risk_tier: RiskTier
    primary_risk_driver: Optional[str] = None
    calculation_summary: Optional[str] = None
    calculated_at: datetime

    class Config:
        from_attributes = True

class InterventionPlanCreate(BaseModel):
    student_id: int
    title: str
    target_domain: str
    risk_level_at_creation: RiskTier
    description: str
    action_items: Optional[str] = None
    status: Optional[InterventionStatus] = InterventionStatus.IN_PROGRESS
    scheduled_followup: Optional[datetime] = None

class InterventionPlanUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    action_items: Optional[str] = None
    status: Optional[InterventionStatus] = None
    scheduled_followup: Optional[datetime] = None
    resolution_notes: Optional[str] = None

class InterventionPlanOut(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    counselor_id: int
    counselor_name: Optional[str] = None
    title: str
    target_domain: str
    risk_level_at_creation: RiskTier
    description: str
    action_items: Optional[str] = None
    status: InterventionStatus
    scheduled_followup: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CohortRiskAnalytics(BaseModel):
    total_students: int
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    average_composite_score: float
    domain_averages: DomainScoreBreakdown
    high_risk_students: List[Dict[str, Any]]

class RecoverySimulationRequest(BaseModel):
    student_id: Optional[int] = None
    target_gpa: float = 85.0
    target_absences: int = 1
    target_failing_count: int = 0
    target_incomplete_count: int = 0
    simulated_mental_health: Optional[float] = None
    simulated_financial: Optional[float] = None
    simulated_family: Optional[float] = None
    simulated_health: Optional[float] = None

class RecoverySimulationResponse(BaseModel):
    current_composite_score: float
    current_risk_tier: str
    current_academic_score: float
    simulated_academic_score: float
    simulated_composite_score: float
    simulated_risk_tier: str
    risk_reduction_points: float
    risk_reduction_pct: float
    domain_breakdown: Dict[str, float]
    required_milestones: List[str]
    target_achieved: bool
    optimal_target_recommendation: Dict[str, Any]

