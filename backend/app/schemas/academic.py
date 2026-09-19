from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class AcademicRecordBase(BaseModel):
    school_year: str
    semester: str
    quarter: Optional[str] = "Final"
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

class SASSImportSummary(BaseModel):
    total_processed: int
    successful_imports: int
    errors_count: int
    batch_id: str
    details: List[str]
