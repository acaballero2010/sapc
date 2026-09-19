import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class RiskTier(str, enum.Enum):
    LOW = "low"         # 0 - 39.9
    MEDIUM = "medium"   # 40 - 69.9
    HIGH = "high"       # 70 - 100

class InterventionStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    ESCALATED = "escalated"

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    
    # 5 AHP Domain Sub-Scores (0-100 scale)
    academic_score = Column(Float, nullable=False, default=0.0)
    mental_health_score = Column(Float, nullable=False, default=0.0)
    financial_score = Column(Float, nullable=False, default=0.0)
    family_score = Column(Float, nullable=False, default=0.0)
    health_score = Column(Float, nullable=False, default=0.0)
    
    # Weights used in computation (for auditability)
    academic_weight = Column(Float, nullable=False, default=0.4017)
    mental_health_weight = Column(Float, nullable=False, default=0.2442)
    financial_weight = Column(Float, nullable=False, default=0.1373)
    family_weight = Column(Float, nullable=False, default=0.1373)
    health_weight = Column(Float, nullable=False, default=0.0794)
    
    # Weighted Composite Risk Score (0-100 scale)
    composite_risk_score = Column(Float, nullable=False)
    risk_tier = Column(Enum(RiskTier), nullable=False)
    
    # Primary driver / highest weighted contributor
    primary_risk_driver = Column(String(50), nullable=True)
    calculation_summary = Column(Text, nullable=True) # Explanation for DSS
    
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", back_populates="risk_scores")

class InterventionPlan(Base):
    __tablename__ = "intervention_plans"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    counselor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String(200), nullable=False)
    target_domain = Column(String(50), nullable=False) # "Academic", "Mental Health", etc.
    risk_level_at_creation = Column(Enum(RiskTier), nullable=False)
    description = Column(Text, nullable=False)
    action_items = Column(Text, nullable=True) # JSON list or markdown of tasks
    
    status = Column(Enum(InterventionStatus), default=InterventionStatus.PENDING)
    scheduled_followup = Column(DateTime(timezone=True), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    student = relationship("Student", back_populates="interventions")
    counselor = relationship("User", back_populates="interventions")

class NotificationChannel(str, enum.Enum):
    SMS = "sms"
    EMAIL = "email"
    BOTH = "both"

class NotificationStatus(str, enum.Enum):
    SENT = "sent"
    DELIVERED = "delivered"
    ACKNOWLEDGED = "acknowledged"
    RESCHEDULED = "rescheduled"

class ParentNotification(Base):
    __tablename__ = "parent_notifications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    parent_contact = Column(String(100), nullable=False) # e.g. "+63 917 555 0192" or "parent@gmail.com"
    channel = Column(Enum(NotificationChannel), default=NotificationChannel.BOTH)
    notification_type = Column(String(50), default="case_conference")
    subject = Column(String(200), nullable=False)
    message_body = Column(Text, nullable=False)
    
    meeting_date = Column(DateTime(timezone=True), nullable=True)
    meeting_location = Column(String(150), default="Room 204 Guidance Center, SAPC")
    status = Column(Enum(NotificationStatus), default=NotificationStatus.SENT)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    student = relationship("Student", back_populates="parent_notifications")
    sender = relationship("User", foreign_keys=[sender_id])

