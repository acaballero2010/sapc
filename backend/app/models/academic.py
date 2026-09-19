from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class AcademicRecord(Base):
    __tablename__ = "academic_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    school_year = Column(String(20), nullable=False) # e.g. "2025-2026"
    semester = Column(String(20), nullable=False)    # e.g. "1st", "2nd"
    quarter = Column(String(20), nullable=True)      # e.g. "Q1", "Q2", "Final"
    
    # SASS Key Ingested Fields
    gpa = Column(Float, nullable=False)              # General Point Average / Final Grade
    failed_subjects_count = Column(Integer, default=0)
    incomplete_subjects_count = Column(Integer, default=0)
    attendance_rate = Column(Float, default=100.0)   # Percentage (0-100)
    absences_count = Column(Integer, default=0)
    tardiness_count = Column(Integer, default=0)
    
    # Normalized Sub-score calculated for AHP (0-100, where 100 = maximum risk)
    normalized_academic_risk = Column(Float, default=0.0)
    
    raw_details = Column(Text, nullable=True)        # JSON string of individual subjects & grades
    batch_import_id = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", back_populates="academic_records")
