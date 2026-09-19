import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.models.user import UserRole

client = TestClient(app)

def test_public_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "SAPC" in response.json()["institution"]

def test_login_success():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "counselor@sapc.edu.ph", "password": "counselor123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "guidance_counselor"

def test_counselor_can_access_confidential_notes():
    # Login as Guidance Counselor
    token = create_access_token(subject=2, role=UserRole.GUIDANCE_COUNSELOR.value, email="counselor@sapc.edu.ph")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/assessments/counselor-notes/student/1", headers=headers)
    assert response.status_code == 200

def test_teacher_denied_confidential_counselor_notes_ra10173():
    # Login as Teacher
    token = create_access_token(subject=3, role=UserRole.TEACHER.value, email="teacher@sapc.edu.ph")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/assessments/counselor-notes/student/1", headers=headers)
    # RA 10173 strict privilege enforcement
    assert response.status_code == 403
