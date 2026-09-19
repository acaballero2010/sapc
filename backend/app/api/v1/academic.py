from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, status, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student, Section
from app.models.academic import AcademicRecord
from app.schemas.academic import AcademicRecordOut, SASSUploadResponse
from app.api.deps import get_current_user, RoleChecker
from app.services.sass_parser import SASSParserService
from app.services.audit_service import AuditService

router = APIRouter()

# Restricted strictly to TEACHER and ADMIN roles
require_teacher_or_admin = RoleChecker([UserRole.TEACHER, UserRole.ADMIN])

@router.post("/upload-sass", response_model=SASSUploadResponse)
async def upload_sass_csv(
    request: Request,
    file: UploadFile = File(...),
    academic_year: str = Form("2025-2026"),
    quarter: str = Form("Q1"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin)
):
    """
    Phase 2: Ingests SASS Academic CSV data for a given academic year and quarter.
    - Restricted to TEACHER and ADMIN roles.
    - Expected CSV columns: student_id, student_name, grade_level, section, quarter_gpa,
      failing_subjects_count, days_absent, incomplete_requirements_count.
    - Computes deterministic Academic Risk Score (S_AC).
    - Returns 200 with summary on success, or 400 with line-by-line validation errors on failure.
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a valid CSV file (.csv)"
        )

    content = await file.read()
    result = SASSParserService.parse_and_ingest_sass_csv(
        db=db,
        file_content=content,
        academic_year=academic_year.strip(),
        quarter=quarter.strip()
    )

    # Log RA 10173 Audit Record
    AuditService.log_event(
        db=db,
        actor=current_user,
        action="UPLOAD_SASS_CSV",
        target_resource=f"batch_id:{result['batch_id']}",
        details=f"Academic Year: {academic_year}, Quarter: {quarter}, Total Rows: {result['total_rows']}, Success: {result['successful_imports']}, Errors: {result['errors_count']}",
        request=request
    )

    if not result["success"]:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=result
        )

    return result

@router.get("/student/{student_id}", response_model=List[AcademicRecordOut])
def get_student_academic_records(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # RBAC Access control
    if current_user.role == UserRole.STUDENT and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    if current_user.role == UserRole.TEACHER and student.section and student.section.adviser_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized - student not in your advisory class")

    records = db.query(AcademicRecord).filter(
        AcademicRecord.student_id == student_id
    ).order_by(AcademicRecord.id.desc()).all()

    return records
