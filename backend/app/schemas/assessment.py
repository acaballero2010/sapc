from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import datetime
from app.models.assessment import DomainType

class NonAcademicAssessmentCreate(BaseModel):
    student_id: int
    domain: DomainType
    risk_score: float # 0 - 100
    source: Optional[str] = "survey"
    indicator_summary: Optional[str] = None
    notes: Optional[str] = None
    metrics_json: Optional[str] = None

class NonAcademicAssessmentOut(BaseModel):
    id: int
    student_id: int
    domain: DomainType
    risk_score: float
    source: str
    indicator_summary: Optional[str] = None
    notes: Optional[str] = None
    assessment_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CounselorNoteCreate(BaseModel):
    student_id: int
    observation_summary: str
    mental_health_indicators: Optional[str] = None
    recommended_action: Optional[str] = None

class CounselorNoteOut(BaseModel):
    id: int
    student_id: int
    counselor_id: int
    counselor_name: Optional[str] = None
    session_date: datetime
    observation_summary: str
    mental_health_indicators: Optional[str] = None
    recommended_action: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
