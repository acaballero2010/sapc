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

class DailyMoodCheckinCreate(BaseModel):
    student_id: Optional[int] = None
    mood_score: int # 1 to 5
    mood_emoji: Optional[str] = "😊"
    energy_level: Optional[int] = 3
    primary_stressor: Optional[str] = "None"
    reflection_note: Optional[str] = None

class DailyMoodCheckinOut(BaseModel):
    id: int
    student_id: int
    mood_score: int
    mood_emoji: str
    energy_level: int
    primary_stressor: Optional[str] = None
    reflection_note: Optional[str] = None
    sentiment_polarity: float
    created_at: datetime

    class Config:
        from_attributes = True

class MoodHistorySummary(BaseModel):
    total_checkins: int
    streak_days: int
    average_mood: float
    average_energy: float
    recent_checkins: List[DailyMoodCheckinOut]
    mental_health_risk_impact: float

class ClinicalSummaryRequest(BaseModel):
    raw_transcript: str

class ClinicalSummaryResponse(BaseModel):
    observation_summary: str
    mental_health_indicators: str
    recommended_action: str
    inferred_domains: List[str]
    sentiment_polarity: float


