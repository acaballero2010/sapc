from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class SectionBase(BaseModel):
    name: str
    grade_level: str
    adviser_id: Optional[int] = None

class SectionOut(SectionBase):
    id: int
    adviser_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StudentBase(BaseModel):
    lrn: str
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    section_id: Optional[int] = None
    parent_id: Optional[int] = None

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    section_id: Optional[int] = None
    parent_id: Optional[int] = None
    is_active: Optional[bool] = None

class StudentOut(StudentBase):
    id: int
    is_active: bool
    section_name: Optional[str] = None
    adviser_name: Optional[str] = None
    created_at: Optional[datetime] = None
    
    # Latest Risk Tier preview
    latest_risk_score: Optional[float] = None
    latest_risk_tier: Optional[str] = None
    primary_risk_driver: Optional[str] = None

    class Config:
        from_attributes = True
