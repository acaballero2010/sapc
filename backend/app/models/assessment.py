import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class DomainType(str, enum.Enum):
    MENTAL_HEALTH = "mental_health"
    FINANCIAL = "financial"
    FAMILY = "family"
    HEALTH = "health"

class NonAcademicAssessment(Base):
    __tablename__ = "non_academic_assessments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    domain = Column(Enum(DomainType), nullable=False)
    
    # Normalized risk sub-score (0 - 100, where 100 = extreme risk/distress)
    risk_score = Column(Float, nullable=False, default=0.0)
    
    source = Column(String(100), default="survey") # "survey", "counselor_evaluation", "nlp_inferred", "clinic_record"
    indicator_summary = Column(String(255), nullable=True) # e.g. "Frequent migraine leaves", "Tuition balance overdue"
    notes = Column(Text, nullable=True) # Encrypted or protected based on domain
    
    # Specific Domain Sub-factors (stored as structured metrics)
    metrics_json = Column(Text, nullable=True) # JSON of specific survey item responses
    
    assessment_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", back_populates="non_academic_assessments")

class CounselorNote(Base):
    """
    Restricted strictly to Guidance Counselor role under Philippine Data Privacy Act (RA 10173).
    """
    __tablename__ = "counselor_notes"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    counselor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_date = Column(DateTime(timezone=True), server_default=func.now())
    is_confidential = Column(Integer, default=1) # 1 = SPI / Highly Confidential
    
    observation_summary = Column(Text, nullable=False)
    mental_health_indicators = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", back_populates="counselor_notes")
    counselor = relationship("User", back_populates="counselor_notes")

class DailyMoodCheckin(Base):
    __tablename__ = "daily_mood_checkins"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    mood_score = Column(Integer, nullable=False) # 1=Distressed, 2=Stressed, 3=Okay, 4=Good, 5=Great
    mood_emoji = Column(String(10), nullable=False, default="😊")
    energy_level = Column(Integer, default=3) # 1-5
    primary_stressor = Column(String(100), nullable=True) # "Academics", "Family", "Finances", "Health", "None"
    reflection_note = Column(Text, nullable=True)
    sentiment_polarity = Column(Float, default=0.0) # -1.0 to 1.0
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", back_populates="mood_checkins")

