import io
import uuid
import json
import pandas as pd
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.student import Student, Section
from app.models.academic import AcademicRecord
from app.models.risk import RiskScore
from app.models.assessment import NonAcademicAssessment, DomainType
from app.services.ahp_engine import AHPEngine

EXPECTED_SASS_COLUMNS = [
    "student_id",
    "student_name",
    "grade_level",
    "section",
    "quarter_gpa",
    "failing_subjects_count",
    "days_absent",
    "incomplete_requirements_count"
]

class SASSParserService:
    @staticmethod
    def sanitize_headers(columns: List[str]) -> List[str]:
        """
        Sanitizes headers by trimming spaces, lowercasing, and replacing spaces/hyphens with underscores.
        """
        return [
            str(c).strip().lower().replace(" ", "_").replace("-", "_")
            for c in columns
        ]

    @classmethod
    def validate_csv_structure(cls, df: pd.DataFrame) -> List[str]:
        """
        Validates the presence of expected SASS columns.
        """
        sanitized = cls.sanitize_headers(df.columns.tolist())
        df.columns = sanitized

        missing = [col for col in EXPECTED_SASS_COLUMNS if col not in sanitized]
        return missing

    @classmethod
    def parse_and_ingest_sass_csv(
        cls,
        db: Session,
        file_content: bytes,
        academic_year: str,
        quarter: str
    ) -> Dict[str, Any]:
        """
        Phase 2 SASS CSV Ingestion:
        - Validates CSV headers and rows with line-by-line error collection.
        - Calculates deterministic S_AC Academic Risk Score.
        - Updates AcademicRecord and updates AHP baseline RiskScore.
        """
        batch_id = str(uuid.uuid4())[:8]

        # 1. Parse CSV bytes
        try:
            # Try utf-8, fallback to latin-1
            try:
                df = pd.read_csv(io.BytesIO(file_content), dtype=str)
            except UnicodeDecodeError:
                df = pd.read_csv(io.BytesIO(file_content), encoding="latin-1", dtype=str)
        except Exception as e:
            return {
                "success": False,
                "batch_id": batch_id,
                "total_rows": 0,
                "successful_imports": 0,
                "errors_count": 1,
                "errors": [{"line": 1, "field": "file", "error": f"Corrupted or invalid CSV file: {str(e)}"}],
                "details": []
            }

        if df.empty:
            return {
                "success": False,
                "batch_id": batch_id,
                "total_rows": 0,
                "successful_imports": 0,
                "errors_count": 1,
                "errors": [{"line": 1, "field": "file", "error": "CSV file is empty"}],
                "details": []
            }

        # 2. Sanitize and validate headers
        df.columns = cls.sanitize_headers(df.columns.tolist())
        missing_cols = [col for col in EXPECTED_SASS_COLUMNS if col not in df.columns]
        if missing_cols:
            return {
                "success": False,
                "batch_id": batch_id,
                "total_rows": len(df),
                "successful_imports": 0,
                "errors_count": len(missing_cols),
                "errors": [
                    {"line": 1, "field": col, "error": f"Missing required column '{col}'"}
                    for col in missing_cols
                ],
                "details": []
            }

        # 3. Line-by-Line Row Validation
        validation_errors = []
        valid_rows = []

        for idx, row in df.iterrows():
            line_num = idx + 2  # CSV line number (1-based header offset)
            student_id_val = str(row.get("student_id", "")).strip()
            student_name_val = str(row.get("student_name", "")).strip()
            grade_level_val = str(row.get("grade_level", "")).strip()
            section_val = str(row.get("section", "")).strip()
            gpa_raw = str(row.get("quarter_gpa", "")).strip()
            failing_raw = str(row.get("failing_subjects_count", "")).strip()
            absent_raw = str(row.get("days_absent", "")).strip()
            incomplete_raw = str(row.get("incomplete_requirements_count", "")).strip()

            row_has_error = False

            # Validate Student ID
            if not student_id_val:
                validation_errors.append({"line": line_num, "field": "student_id", "error": "Student ID cannot be empty"})
                row_has_error = True

            # Validate Student Name
            if not student_name_val:
                validation_errors.append({"line": line_num, "field": "student_name", "error": "Student Name cannot be empty"})
                row_has_error = True

            # Validate GPA
            try:
                quarter_gpa = float(gpa_raw)
                if quarter_gpa < 0.0 or quarter_gpa > 100.0:
                    validation_errors.append({"line": line_num, "field": "quarter_gpa", "error": f"GPA {quarter_gpa} is out of valid range (0-100)"})
                    row_has_error = True
            except ValueError:
                validation_errors.append({"line": line_num, "field": "quarter_gpa", "error": f"Invalid numeric GPA '{gpa_raw}'"})
                row_has_error = True
                quarter_gpa = 0.0

            # Validate Failing Subjects Count
            try:
                failing_count = int(float(failing_raw))
                if failing_count < 0:
                    validation_errors.append({"line": line_num, "field": "failing_subjects_count", "error": "Failing count cannot be negative"})
                    row_has_error = True
            except ValueError:
                validation_errors.append({"line": line_num, "field": "failing_subjects_count", "error": f"Invalid integer '{failing_raw}'"})
                row_has_error = True
                failing_count = 0

            # Validate Days Absent
            try:
                days_absent = int(float(absent_raw))
                if days_absent < 0:
                    validation_errors.append({"line": line_num, "field": "days_absent", "error": "Days absent cannot be negative"})
                    row_has_error = True
            except ValueError:
                validation_errors.append({"line": line_num, "field": "days_absent", "error": f"Invalid integer '{absent_raw}'"})
                row_has_error = True
                days_absent = 0

            # Validate Incompletes
            try:
                incomplete_count = int(float(incomplete_raw))
                if incomplete_count < 0:
                    validation_errors.append({"line": line_num, "field": "incomplete_requirements_count", "error": "Incomplete count cannot be negative"})
                    row_has_error = True
            except ValueError:
                validation_errors.append({"line": line_num, "field": "incomplete_requirements_count", "error": f"Invalid integer '{incomplete_raw}'"})
                row_has_error = True
                incomplete_count = 0

            if not row_has_error:
                valid_rows.append({
                    "line": line_num,
                    "student_id": student_id_val,
                    "student_name": student_name_val,
                    "grade_level": grade_level_val,
                    "section": section_val,
                    "quarter_gpa": quarter_gpa,
                    "failing_subjects_count": failing_count,
                    "days_absent": days_absent,
                    "incomplete_requirements_count": incomplete_count,
                    "raw_dict": row.to_dict()
                })

        # If any validation errors exist, reject import and return full line-by-line feedback
        if validation_errors:
            return {
                "success": False,
                "batch_id": batch_id,
                "total_rows": len(df),
                "successful_imports": 0,
                "errors_count": len(validation_errors),
                "errors": validation_errors,
                "details": []
            }

        # 4. Ingest and Persist Valid Records
        successful_records = []
        for item in valid_rows:
            # Lookup Section or create
            section_obj = None
            if item["section"]:
                section_obj = db.query(Section).filter(Section.name == item["section"]).first()
                if not section_obj:
                    section_obj = Section(
                        name=item["section"],
                        grade_level=item["grade_level"] or "Unassigned"
                    )
                    db.add(section_obj)
                    db.flush()

            # Lookup Student by LRN / Student ID
            student = db.query(Student).filter(Student.lrn == item["student_id"]).first()
            if not student:
                # Parse Name parts
                name_parts = item["student_name"].split(" ", 1)
                first_name = name_parts[0]
                last_name = name_parts[1] if len(name_parts) > 1 else "Student"

                student = Student(
                    lrn=item["student_id"],
                    first_name=first_name,
                    last_name=last_name,
                    section_id=section_obj.id if section_obj else None
                )
                db.add(student)
                db.flush()
            else:
                if section_obj and not student.section_id:
                    student.section_id = section_obj.id

            # Compute S_AC Academic Risk Score
            s_ac = AHPEngine.calculate_academic_risk_score(
                quarter_gpa=item["quarter_gpa"],
                failing_subjects_count=item["failing_subjects_count"],
                days_absent=item["days_absent"],
                incomplete_requirements_count=item["incomplete_requirements_count"]
            )

            # Ingest / Update AcademicRecord
            acad_rec = db.query(AcademicRecord).filter(
                AcademicRecord.student_id == student.id,
                AcademicRecord.school_year == academic_year,
                AcademicRecord.quarter == quarter
            ).first()

            if not acad_rec:
                acad_rec = AcademicRecord(
                    student_id=student.id,
                    school_year=academic_year,
                    semester="1st", # default
                    quarter=quarter
                )
                db.add(acad_rec)

            acad_rec.gpa = item["quarter_gpa"]
            acad_rec.failed_subjects_count = item["failing_subjects_count"]
            acad_rec.incomplete_subjects_count = item["incomplete_requirements_count"]
            acad_rec.absences_count = item["days_absent"]
            # Approximate attendance rate: assuming 50 school days per quarter
            acad_rec.attendance_rate = max(0.0, round((50.0 - item["days_absent"]) / 50.0 * 100.0, 1))
            acad_rec.normalized_academic_risk = s_ac
            acad_rec.batch_import_id = batch_id
            acad_rec.raw_details = json.dumps(item["raw_dict"])

            db.flush()

            # Update student AHP composite risk score draft
            risk_record = cls.recalculate_student_risk(db, student.id)

            successful_records.append({
                "student_id": item["student_id"],
                "student_name": item["student_name"],
                "academic_risk_score": s_ac,
                "composite_risk_score": risk_record.composite_risk_score,
                "risk_tier": risk_record.risk_tier.value
            })

        db.commit()

        return {
            "success": True,
            "batch_id": batch_id,
            "total_rows": len(df),
            "successful_imports": len(successful_records),
            "errors_count": 0,
            "errors": [],
            "details": successful_records
        }

    @staticmethod
    def recalculate_student_risk(db: Session, student_id: int) -> RiskScore:
        """
        Gathers latest Academic (S_AC) and Non-Academic domain assessments and runs AHP Decision Engine.
        """
        # 1. Latest Academic Risk (S_AC)
        latest_acad = db.query(AcademicRecord).filter(
            AcademicRecord.student_id == student_id
        ).order_by(AcademicRecord.id.desc()).first()
        academic_score = latest_acad.normalized_academic_risk if latest_acad else 20.0

        # 2. Latest Non-Academic Domains
        assessments = db.query(NonAcademicAssessment).filter(
            NonAcademicAssessment.student_id == student_id
        ).all()

        domain_scores = {
            DomainType.MENTAL_HEALTH: 15.0,
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
