import io
import uuid
import json
import pandas as pd
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.student import Student
from app.models.academic import AcademicRecord
from app.models.risk import RiskScore
from app.models.assessment import NonAcademicAssessment, DomainType
from app.services.ahp_engine import AHPEngine

REQUIRED_CSV_COLUMNS = [
    "lrn", "school_year", "semester", "gpa", "failed_subjects", 
    "incomplete_subjects", "attendance_rate", "absences"
]

class SASSParserService:
    @staticmethod
    def parse_and_ingest_csv(db: Session, file_content: bytes) -> Dict[str, Any]:
        """
        Parses SASS CSV file, validates rows, saves AcademicRecord, and re-computes AHP risk scores.
        """
        batch_id = str(uuid.uuid4())[:8]
        try:
            df = pd.read_csv(io.BytesIO(file_content))
        except Exception as e:
            return {
                "total_processed": 0,
                "successful_imports": 0,
                "errors_count": 1,
                "batch_id": batch_id,
                "details": [f"Invalid CSV formatting or encoding: {str(e)}"]
            }

        # Normalize column headers
        df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]
        
        missing_cols = [col for col in REQUIRED_CSV_COLUMNS if col not in df.columns]
        if missing_cols:
            return {
                "total_processed": 0,
                "successful_imports": 0,
                "errors_count": 1,
                "batch_id": batch_id,
                "details": [f"Missing required CSV columns: {', '.join(missing_cols)}"]
            }

        total_processed = 0
        successful = 0
        errors = []

        for idx, row in df.iterrows():
            total_processed += 1
            row_num = idx + 2  # 1-based header offset
            lrn = str(row["lrn"]).strip()
            
            # Find student by LRN
            student = db.query(Student).filter(Student.lrn == lrn).first()
            if not student:
                # Optionally create student if first name and last name exist in CSV
                first_name = str(row.get("first_name", "Student")).strip()
                last_name = str(row.get("last_name", lrn)).strip()
                student = Student(
                    lrn=lrn,
                    first_name=first_name,
                    last_name=last_name,
                    gender=str(row.get("gender", "Unspecified")).strip()
                )
                db.add(student)
                db.flush()

            try:
                gpa = float(row["gpa"])
                failed = int(row.get("failed_subjects", 0))
                incomplete = int(row.get("incomplete_subjects", 0))
                attendance = float(row.get("attendance_rate", 100.0))
                absences = int(row.get("absences", 0))
                tardiness = int(row.get("tardiness", 0)) if "tardiness" in df.columns else 0
                school_year = str(row["school_year"]).strip()
                semester = str(row["semester"]).strip()
                quarter = str(row.get("quarter", "Final")).strip()

                # Calculate normalized academic risk sub-score (0-100)
                norm_risk = AHPEngine.normalize_academic_risk(
                    gpa=gpa,
                    failed_count=failed,
                    incomplete_count=incomplete,
                    attendance_rate=attendance,
                    absences=absences
                )

                # Store or update Academic Record
                acad_rec = db.query(AcademicRecord).filter(
                    AcademicRecord.student_id == student.id,
                    AcademicRecord.school_year == school_year,
                    AcademicRecord.semester == semester,
                    AcademicRecord.quarter == quarter
                ).first()

                if not acad_rec:
                    acad_rec = AcademicRecord(
                        student_id=student.id,
                        school_year=school_year,
                        semester=semester,
                        quarter=quarter
                    )
                    db.add(acad_rec)

                acad_rec.gpa = gpa
                acad_rec.failed_subjects_count = failed
                acad_rec.incomplete_subjects_count = incomplete
                acad_rec.attendance_rate = attendance
                acad_rec.absences_count = absences
                acad_rec.tardiness_count = tardiness
                acad_rec.normalized_academic_risk = norm_risk
                acad_rec.batch_import_id = batch_id
                acad_rec.raw_details = json.dumps(row.to_dict())

                db.flush()

                # Recalculate Composite AHP Risk for this student
                SASSParserService.recalculate_student_risk(db, student.id)
                successful += 1

            except Exception as e:
                errors.append(f"Row {row_num} (LRN: {lrn}): {str(e)}")

        db.commit()

        return {
            "total_processed": total_processed,
            "successful_imports": successful,
            "errors_count": len(errors),
            "batch_id": batch_id,
            "details": errors if errors else ["All academic records successfully processed and AHP risk scores updated."]
        }

    @staticmethod
    def recalculate_student_risk(db: Session, student_id: int) -> RiskScore:
        """
        Gathers latest Academic and Non-Academic domain assessments and runs AHP Decision Engine.
        """
        # 1. Latest Academic Risk
        latest_acad = db.query(AcademicRecord).filter(
            AcademicRecord.student_id == student_id
        ).order_by(AcademicRecord.id.desc()).first()
        academic_score = latest_acad.normalized_academic_risk if latest_acad else 20.0

        # 2. Latest Non-Academic Domains
        assessments = db.query(NonAcademicAssessment).filter(
            NonAcademicAssessment.student_id == student_id
        ).all()

        domain_scores = {
            DomainType.MENTAL_HEALTH: 15.0, # Baseline normal
            DomainType.FINANCIAL: 15.0,
            DomainType.FAMILY: 15.0,
            DomainType.HEALTH: 10.0
        }

        for ass in assessments:
            if ass.domain in domain_scores:
                domain_scores[ass.domain] = ass.risk_score

        # 3. Compute AHP Composite
        ahp_result = AHPEngine.compute_composite_risk(
            academic_score=academic_score,
            mental_health_score=domain_scores[DomainType.MENTAL_HEALTH],
            financial_score=domain_scores[DomainType.FINANCIAL],
            family_score=domain_scores[DomainType.FAMILY],
            health_score=domain_scores[DomainType.HEALTH]
        )

        # 4. Save or update RiskScore
        risk_record = db.query(RiskScore).filter(RiskScore.student_id == student_id).first()
        if not risk_record:
            risk_record = RiskScore(student_id=student_id)
            db.add(risk_record)

        risk_record.academic_score = ahp_result["sub_scores"]["academic"]
        risk_record.mental_health_score = ahp_result["sub_scores"]["mental_health"]
        risk_record.financial_score = ahp_result["sub_scores"]["financial"]
        risk_record.family_score = ahp_result["sub_scores"]["family"]
        risk_record.health_score = ahp_result["sub_scores"]["health"]
        
        risk_record.composite_risk_score = ahp_result["composite_risk_score"]
        risk_record.risk_tier = ahp_result["risk_tier"]
        risk_record.primary_risk_driver = ahp_result["primary_risk_driver"]
        risk_record.calculation_summary = ahp_result["calculation_summary"]

        db.flush()
        return risk_record
