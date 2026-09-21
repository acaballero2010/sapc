from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from app.models.chatbot import SentimentCategory

class ChatMessageInput(BaseModel):
    message: str
    session_token: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = None
    knowledge_context: Optional[List[Dict[str, Any]]] = None

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
    detected_emotion: Optional[str] = "neutral"
    emotion_confidence: Optional[float] = 0.85
    intent: Optional[str] = "reflection"
    conversation_stage: Optional[str] = "context_gathering"
    crisis_triggered: Optional[bool] = False
    is_gemini_powered: Optional[bool] = False
    model_used: Optional[str] = None
    suggested_resources: List[str] = []
