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


@router.get("/predict-subject-failure")
def predict_subject_failure(
    written_work_avg: float = 72.0,
    performance_task_avg: float = 70.0,
    quarterly_assessment_score: float = 68.0,
    missing_tasks_count: int = 2,
    subject_absences_count: int = 3,
    strand: str = "STEM",
    subject_code: str = "STEM-CALC",
    mental_health_risk: float = 45.0,
    physical_fatigue_risk: float = 30.0,
    financial_strain_risk: float = 40.0,
    current_user: User = Depends(get_current_user)
):
    """
    Computes subject failure prediction, projected final grade, and confidence interval.
    """
    from app.services.subject_prediction_engine import SubjectFailurePredictorService
    return SubjectFailurePredictorService.predict_subject_failure(
        written_work_avg=written_work_avg,
        performance_task_avg=performance_task_avg,
        quarterly_assessment_score=quarterly_assessment_score,
        missing_tasks_count=missing_tasks_count,
        subject_absences_count=subject_absences_count,
        strand=strand,
        subject_code=subject_code,
        mental_health_risk=mental_health_risk,
        physical_fatigue_risk=physical_fatigue_risk,
        financial_strain_risk=financial_strain_risk
    )


@router.post("/simulate-remediation")
def simulate_remediation(
    payload: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Simulates grade improvement and failure probability reduction after completing tasks or tutoring.
    """
    from app.services.subject_prediction_engine import SubjectFailurePredictorService
    current_state = payload.get("current_state", {})
    tasks_to_submit = payload.get("tasks_to_submit", 0)
    tutoring_hours = payload.get("tutoring_hours", 0.0)
    exam_improvement = payload.get("exam_improvement", 0.0)

    return SubjectFailurePredictorService.simulate_remediation(
        current_state=current_state,
        tasks_to_submit=tasks_to_submit,
        remedial_tutoring_hours=tutoring_hours,
        exam_target_improvement=exam_improvement
    )

