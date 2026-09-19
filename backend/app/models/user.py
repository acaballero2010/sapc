import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    TEACHER = "teacher"  # Adviser
    GUIDANCE_COUNSELOR = "guidance_counselor"
    PARENT = "parent"
    STUDENT = "student"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    student_profile = relationship("Student", back_populates="user", uselist=False, foreign_keys="[Student.user_id]")
    parent_profile = relationship("Parent", back_populates="user", uselist=False)
    counselor_notes = relationship("CounselorNote", back_populates="counselor")
    interventions = relationship("InterventionPlan", back_populates="counselor")
    audit_logs = relationship("AuditLog", back_populates="actor")
