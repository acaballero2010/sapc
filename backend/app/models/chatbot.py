import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class SentimentCategory(str, enum.Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"
    DISTRESSED = "distressed"

class ChatbotSession(Base):
    __tablename__ = "chatbot_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    session_token = Column(String(100), unique=True, index=True, nullable=False)
    
    # Aggregated sentiment/distress score across conversation (0-100)
    aggregate_distress_score = Column(Float, default=0.0)
    flagged_for_counselor = Column(Boolean, default=False)
    flag_reason = Column(String(255), nullable=True)
    
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    student = relationship("Student", back_populates="chatbot_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    """
    RA 10173 Sensitive Personal Information:
    Raw content is accessible ONLY by Guidance Counselor role.
    """
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chatbot_sessions.id"), nullable=False)
    sender = Column(String(20), nullable=False) # "student" or "bot"
    
    message_text = Column(Text, nullable=False)
    
    # NLP extraction properties
    sentiment = Column(Enum(SentimentCategory), default=SentimentCategory.NEUTRAL)
    sentiment_score = Column(Float, default=0.0) # compound score (-1.0 to 1.0)
    distress_keywords_detected = Column(Text, nullable=True) # comma separated or JSON
    inferred_domain = Column(String(50), nullable=True) # "mental_health", "academic", "family", "financial"
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session = relationship("ChatbotSession", back_populates="messages")
