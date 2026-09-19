from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # e.g., "Grade 11 - St. Augustine"
    grade_level = Column(String(50), nullable=False) # e.g., "11", "12", "1st Year College"
    adviser_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    adviser = relationship("User", foreign_keys=[adviser_id])
    students = relationship("Student", back_populates="section")

class Parent(Base):
    __tablename__ = "parents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    contact_number = Column(String(50), nullable=True)
    relationship_type = Column(String(50), default="Parent") # Father, Mother, Guardian

    # Relationships
    user = relationship("User", back_populates="parent_profile")
    students = relationship("Student", back_populates="parent")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    lrn = Column(String(50), unique=True, index=True, nullable=False) # Learner Reference Number / Student No
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    middle_name = Column(String(100), nullable=True)
    gender = Column(String(20), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True)
    parent_id = Column(Integer, ForeignKey("parents.id"), nullable=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="student_profile", foreign_keys=[user_id])
    parent = relationship("Parent", back_populates="students")
    section = relationship("Section", back_populates="students")
    
    academic_records = relationship("AcademicRecord", back_populates="student", cascade="all, delete-orphan")
    non_academic_assessments = relationship("NonAcademicAssessment", back_populates="student", cascade="all, delete-orphan")
    counselor_notes = relationship("CounselorNote", back_populates="student", cascade="all, delete-orphan")
    risk_scores = relationship("RiskScore", back_populates="student", cascade="all, delete-orphan")
    chatbot_sessions = relationship("ChatbotSession", back_populates="student", cascade="all, delete-orphan")
    interventions = relationship("InterventionPlan", back_populates="student", cascade="all, delete-orphan")
    mood_checkins = relationship("DailyMoodCheckin", back_populates="student", cascade="all, delete-orphan")
    parent_notifications = relationship("ParentNotification", back_populates="student", cascade="all, delete-orphan")


