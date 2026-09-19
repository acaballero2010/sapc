import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.models.user import UserRole
from app.services.ahp_engine import (
    AHPEngine,
    compute_ahp_weights,
    calculate_student_risk,
    recommend_interventions,
    STANDARD_WEIGHTS,
    DEFAULT_COMPARISON_MATRIX
)
from app.models.risk import RiskTier

client = TestClient(app)

def test_ahp_weights_sum_to_one():
    total = sum(STANDARD_WEIGHTS.values())
    assert abs(total - 1.0) < 0.001
    assert STANDARD_WEIGHTS["academic"] == 0.4017
    assert STANDARD_WEIGHTS["mental_health"] == 0.2442
    assert STANDARD_WEIGHTS["financial"] == 0.1373
    assert STANDARD_WEIGHTS["family"] == 0.1373
    assert STANDARD_WEIGHTS["health"] == 0.0794

def test_compute_ahp_weights_consistency_ratio():
    weights, lambda_max, cr, is_consistent = compute_ahp_weights(DEFAULT_COMPARISON_MATRIX)
    assert len(weights) == 5
    assert lambda_max >= 5.0
    assert cr <= 0.10
    assert is_consistent is True

def test_calculate_student_risk_formula():
    # Test case: Academic 80, Mental 70, Financial 50, Family 40, Health 30
    # Expected: (0.4017*80) + (0.2442*70) + (0.1373*50) + (0.1373*40) + (0.0794*30)
    # = 32.136 + 17.094 + 6.865 + 5.492 + 2.382 = 63.969 -> 63.97 (MEDIUM RISK)
    res = calculate_student_risk({
        "academic": 80.0,
        "mental_health": 70.0,
        "financial": 50.0,
        "family": 40.0,
        "health": 30.0
    })
    assert res["composite_risk_score"] == 63.97
    assert res["risk_tier"] == RiskTier.MEDIUM
    assert res["dominant_domain"] == "academic"

def test_calculate_student_risk_tier_boundaries():
    # Low Risk (< 40.0)
    res_low = calculate_student_risk([30.0, 20.0, 20.0, 20.0, 20.0])
    assert res_low["composite_risk_score"] < 40.0
    assert res_low["risk_tier"] == RiskTier.LOW

    # Medium Risk (40.0 <= Score < 70.0)
    res_med = calculate_student_risk([55.0, 50.0, 45.0, 40.0, 30.0])
    assert 40.0 <= res_med["composite_risk_score"] < 70.0
    assert res_med["risk_tier"] == RiskTier.MEDIUM

    # High Risk (Score >= 70.0)
    res_high = calculate_student_risk([85.0, 80.0, 75.0, 70.0, 60.0])
    assert res_high["composite_risk_score"] >= 70.0
    assert res_high["risk_tier"] == RiskTier.HIGH

def test_recommend_interventions_all_domains():
    # 1. Academic dominant
    rec_acad = recommend_interventions({"academic": 90, "mental_health": 20, "financial": 10, "family": 10, "health": 10})
    assert rec_acad["dominant_domain"] == "academic"
    assert "Peer Tutoring & Remedial Sessions" in rec_acad["primary_recommendation"]["title"]

    # 2. Mental Health dominant
    rec_mh = recommend_interventions({"academic": 20, "mental_health": 95, "financial": 10, "family": 10, "health": 10})
    assert rec_mh["dominant_domain"] == "mental_health"
    assert "One-on-One Guidance Counseling Intake" in rec_mh["primary_recommendation"]["title"]

    # 3. Financial dominant
    rec_fin = recommend_interventions({"academic": 20, "mental_health": 20, "financial": 85, "family": 10, "health": 10})
    assert rec_fin["dominant_domain"] == "financial"
    assert "Scholarship & Flexible Payment Referral" in rec_fin["primary_recommendation"]["title"]

    # 4. Family dominant
    rec_fam = recommend_interventions({"academic": 20, "mental_health": 20, "financial": 10, "family": 85, "health": 10})
    assert rec_fam["dominant_domain"] == "family"
    assert "Parent-Teacher-Counselor Case Conference" in rec_fam["primary_recommendation"]["title"]

    # 5. Health dominant
    rec_hlth = recommend_interventions({"academic": 20, "mental_health": 20, "financial": 10, "family": 10, "health": 85})
    assert rec_hlth["dominant_domain"] == "health"
    assert "School Clinic Assessment & Medical Leave Clearance" in rec_hlth["primary_recommendation"]["title"]

def test_student_risk_breakdown_endpoint():
    token = create_access_token(subject=2, role=UserRole.GUIDANCE_COUNSELOR.value, email="counselor@sapc.edu.ph")
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/v1/analytics/student/1/risk-breakdown", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["student_id"] == 1
    assert "composite_risk_score" in data
    assert "risk_tier" in data
    assert "consistency_ratio" in data
    assert data["consistency_ratio"] <= 0.10
    assert data["is_matrix_consistent"] is True
    assert len(data["domain_breakdown"]) == 5
    assert "primary_recommendation" in data
    assert "title" in data["primary_recommendation"]
