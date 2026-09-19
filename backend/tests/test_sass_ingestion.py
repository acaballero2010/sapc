import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.models.user import UserRole
from app.services.ahp_engine import AHPEngine

client = TestClient(app)

def test_academic_risk_formula_deterministic():
    # 1. Perfect Student
    score_perfect = AHPEngine.calculate_academic_risk_score(
        quarter_gpa=95.0,
        failing_subjects_count=0,
        days_absent=0,
        incomplete_requirements_count=0
    )
    assert score_perfect == 0.0

    # 2. Extreme Failure Student (straight 70s, 2 fails, 6 absences, 2 incompletes)
    # Calculation: failing=50 (max), gpa<75=30, absent>5=15, incomplete=10 (max) -> 105 clamped to 100.0
    score_extreme = AHPEngine.calculate_academic_risk_score(
        quarter_gpa=70.0,
        failing_subjects_count=2,
        days_absent=6,
        incomplete_requirements_count=2
    )
    assert score_extreme == 100.0

    # 3. Moderate Student (GPA 78.0 -> 15pts, 0 fails -> 0pts, 4 absences -> 8pts, 1 incomplete -> 5pts) -> 28.0 pts
    score_moderate = AHPEngine.calculate_academic_risk_score(
        quarter_gpa=78.0,
        failing_subjects_count=0,
        days_absent=4,
        incomplete_requirements_count=1
    )
    assert score_moderate == 28.0

    # 4. Student with 1 failing subject and GPA 80 (GPA >= 80 -> 0pts, 1 fail -> 25pts, 0 absences, 0 incompletes) -> 25.0 pts
    score_borderline = AHPEngine.calculate_academic_risk_score(
        quarter_gpa=80.0,
        failing_subjects_count=1,
        days_absent=1,
        incomplete_requirements_count=0
    )
    assert score_borderline == 25.0

def test_upload_sass_endpoint_teacher_success():
    teacher_token = create_access_token(
        subject=3,
        role=UserRole.TEACHER.value,
        email="teacher@sapc.edu.ph"
    )
    headers = {"Authorization": f"Bearer {teacher_token}"}

    csv_data = (
        "student_id,student_name,grade_level,section,quarter_gpa,failing_subjects_count,days_absent,incomplete_requirements_count\n"
        "109238475612,Joshua Dimaculangan,Grade 11,Grade 11 - St. Augustine (STEM),71.5,2,7,1\n"
        "109238475614,Mark Anthony Reyes,Grade 12,Grade 12 - St. Thomas (ABM),94.5,0,0,0\n"
    )

    files = {
        "file": ("sass_grades_q1.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")
    }
    data = {
        "academic_year": "2025-2026",
        "quarter": "Q1"
    }

    response = client.post("/api/v1/academic/upload-sass", headers=headers, files=files, data=data)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert res_json["successful_imports"] == 2
    assert len(res_json["details"]) == 2
    # Verify calculated S_AC for Joshua (GPA 71.5=30, 2 fails=50, 7 absent=15, 1 inc=5 -> 100.0)
    assert res_json["details"][0]["academic_risk_score"] == 100.0
    # Verify calculated S_AC for Mark (GPA 94.5=0, 0 fails=0, 0 absent=0, 0 inc=0 -> 0.0)
    assert res_json["details"][1]["academic_risk_score"] == 0.0

def test_upload_sass_endpoint_admin_success():
    admin_token = create_access_token(
        subject=1,
        role=UserRole.ADMIN.value,
        email="admin@sapc.edu.ph"
    )
    headers = {"Authorization": f"Bearer {admin_token}"}

    csv_data = (
        "student_id,student_name,grade_level,section,quarter_gpa,failing_subjects_count,days_absent,incomplete_requirements_count\n"
        "109238475613,Angelica Dela Cruz,Grade 11,Grade 11 - St. Augustine (STEM),78.0,0,4,1\n"
    )
    files = {
        "file": ("sass_grades_admin.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")
    }
    data = {
        "academic_year": "2025-2026",
        "quarter": "Q1"
    }

    response = client.post("/api/v1/academic/upload-sass", headers=headers, files=files, data=data)
    assert response.status_code == 200
    assert response.json()["success"] is True

def test_upload_sass_endpoint_forbidden_for_student_and_parent():
    student_token = create_access_token(
        subject=5,
        role=UserRole.STUDENT.value,
        email="student@sapc.edu.ph"
    )
    headers = {"Authorization": f"Bearer {student_token}"}

    csv_data = "student_id,student_name\n123,Test\n"
    files = {"file": ("test.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}

    response = client.post("/api/v1/academic/upload-sass", headers=headers, files=files, data={"academic_year": "2025-2026", "quarter": "Q1"})
    assert response.status_code == 403

def test_upload_sass_missing_columns():
    teacher_token = create_access_token(subject=3, role=UserRole.TEACHER.value, email="teacher@sapc.edu.ph")
    headers = {"Authorization": f"Bearer {teacher_token}"}

    # Missing days_absent and incomplete_requirements_count
    csv_data = (
        "student_id,student_name,grade_level,section,quarter_gpa,failing_subjects_count\n"
        "109238475612,Joshua,Grade 11,Sec A,75.0,0\n"
    )
    files = {"file": ("invalid_cols.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}

    response = client.post("/api/v1/academic/upload-sass", headers=headers, files=files, data={"academic_year": "2025-2026", "quarter": "Q1"})
    assert response.status_code == 400
    res_json = response.json()
    assert res_json["success"] is False
    assert any("days_absent" in err["error"] for err in res_json["errors"])

def test_upload_sass_line_by_line_validation_errors():
    teacher_token = create_access_token(subject=3, role=UserRole.TEACHER.value, email="teacher@sapc.edu.ph")
    headers = {"Authorization": f"Bearer {teacher_token}"}

    # Line 2 has invalid GPA "ninety", Line 3 has negative absences "-5"
    csv_data = (
        "student_id,student_name,grade_level,section,quarter_gpa,failing_subjects_count,days_absent,incomplete_requirements_count\n"
        "109238475612,Joshua Dimaculangan,Grade 11,Sec A,invalid_gpa,0,2,0\n"
        "109238475614,Mark Reyes,Grade 12,Sec B,90.0,0,-5,0\n"
    )
    files = {"file": ("corrupted_lines.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}

    response = client.post("/api/v1/academic/upload-sass", headers=headers, files=files, data={"academic_year": "2025-2026", "quarter": "Q1"})
    assert response.status_code == 400
    res_json = response.json()
    assert res_json["success"] is False
    assert res_json["errors_count"] >= 2
    # Check that specific lines are reported
    line_numbers = [err["line"] for err in res_json["errors"]]
    assert 2 in line_numbers
    assert 3 in line_numbers
