from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student, Section
from app.models.academic import AcademicRecord
from app.schemas.academic import AcademicRecordOut, SASSImportSummary
from app.api.deps import get_current_user, require_faculty, require_admin
from app.services.sass_parser import SASSParserService
from app.services.audit_service import AuditService

router = APIRouter()

@router.post("/sass-import", response_model=SASSImportSummary)
async def import_sass_csv(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    """
    Ingests SASS Academic CSV data, computes normalized academic sub-scores,
    and updates AHP composite failure risks.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a valid CSV file (.csv)"
        )

    content = await file.read()
    result = SASSParserService.parse_and_ingest_csv(db, content)

    # Log RA 10173 Audit Record for Bulk Academic Ingestion
    AuditService.log_event(
        db=db,
        actor=current_user,
        action="INGEST_SASS_CSV",
        target_resource=f"batch_id:{result['batch_id']}",
        details=f"Processed {result['total_processed']} rows ({result['successful_imports']} successful)",
        request=request
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
