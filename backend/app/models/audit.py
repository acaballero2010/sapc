from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class AuditLog(Base):
    """
    RA 10173 Compliance Audit Trail:
    Logs all access to sensitive personal data (mental health records, NLP logs, grades).
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    actor_role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False) # e.g. "VIEW_SENSITIVE_NLP_LOGS", "GENERATE_AHP_SCORE", "EXPORT_SASS_DATA"
    target_resource = Column(String(100), nullable=False) # e.g. "student_id:14", "assessment_id:9"
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    details = Column(Text, nullable=True)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    actor = relationship("User", back_populates="audit_logs")
