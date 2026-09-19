from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class AcademicRecordBase(BaseModel):
    school_year: str
    semester: Optional[str] = "1st"
    quarter: Optional[str] = "Q1"
    gpa: float
    failed_subjects_count: int = 0
    incomplete_subjects_count: int = 0
    attendance_rate: float = 100.0
    absences_count: int = 0
    tardiness_count: int = 0

class AcademicRecordCreate(AcademicRecordBase):
    student_id: int
    raw_details: Optional[str] = None
    batch_import_id: Optional[str] = None

class AcademicRecordOut(AcademicRecordBase):
    id: int
    student_id: int
    normalized_academic_risk: float
    raw_details: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LineValidationError(BaseModel):
    line: int
    field: str
    error: str

class SASSUploadDetail(BaseModel):
    student_id: str
    student_name: str
    academic_risk_score: float
    composite_risk_score: float
    risk_tier: str

class SASSUploadResponse(BaseModel):
    success: bool
    batch_id: str
    total_rows: int
    successful_imports: int
    errors_count: int
    errors: List[LineValidationError] = []
    details: List[SASSUploadDetail] = []
