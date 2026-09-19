from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.models.chatbot import SentimentCategory

class ChatMessageInput(BaseModel):
    message: str
    session_token: Optional[str] = None

class ChatMessageOut(BaseModel):
    id: int
    sender: str
    message_text: str
    sentiment: Optional[SentimentCategory] = None
    sentiment_score: Optional[float] = None
    distress_keywords_detected: Optional[str] = None
    inferred_domain: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChatbotSessionOut(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    session_token: str
    aggregate_distress_score: float
    flagged_for_counselor: bool
    flag_reason: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    messages: List[ChatMessageOut] = []

    class Config:
        from_attributes = True

class ChatbotReplyResponse(BaseModel):
    reply: str
    session_token: str
    sentiment: SentimentCategory
    distress_score: float
    counselor_flagged: bool
    suggested_resources: List[str] = []
