import pytest
import numpy as np
from app.services.ahp_engine import AHPEngine
from app.models.risk import RiskTier

def test_ahp_weights_sum_to_one():
    weights = AHPEngine.DOMAIN_WEIGHTS
    total = sum(weights.values())
    assert abs(total - 1.0) < 0.001
    assert weights["academic"] == 0.4017
    assert weights["mental_health"] == 0.2442
    assert weights["financial"] == 0.1373
    assert weights["family"] == 0.1373
    assert weights["health"] == 0.0794

def test_academic_normalization():
    # Failing grade with multiple failed subjects and absences -> High/Extreme Risk
    risk_high = AHPEngine.normalize_academic_risk(
        gpa=72.0, failed_count=3, incomplete_count=1, attendance_rate=75.0, absences=12
    )
    assert risk_high >= 70.0

    # High honors student -> Minimal Risk
    risk_low = AHPEngine.normalize_academic_risk(
        gpa=95.0, failed_count=0, incomplete_count=0, attendance_rate=100.0, absences=0
    )
    assert risk_low < 15.0

def test_composite_risk_computation():
    # Test High Risk student case
    res = AHPEngine.compute_composite_risk(
        academic_score=85.0,
        mental_health_score=80.0,
        financial_score=60.0,
        family_score=70.0,
        health_score=40.0
    )
    assert res["risk_tier"] == RiskTier.HIGH
    assert res["composite_risk_score"] >= 70.0
    assert "Academic" in res["primary_risk_driver"] or "Mental Health" in res["primary_risk_driver"]

    # Test Low Risk student case
    res_low = AHPEngine.compute_composite_risk(
        academic_score=10.0,
        mental_health_score=15.0,
        financial_score=10.0,
        family_score=10.0,
        health_score=10.0
    )
    assert res_low["risk_tier"] == RiskTier.LOW
    assert res_low["composite_risk_score"] < 40.0

def test_ahp_matrix_consistency_ratio():
    # 5x5 pairwise comparison matrix
    matrix = np.array([
        [1.0, 2.0, 3.0, 3.0, 5.0],
        [1/2, 1.0, 2.0, 2.0, 3.0],
        [1/3, 1/2, 1.0, 1.0, 2.0],
        [1/3, 1/2, 1.0, 1.0, 2.0],
        [1/5, 1/3, 1/2, 1/2, 1.0]
    ])
    weights, lambda_max, cr = AHPEngine.calculate_ahp_weights_from_matrix(matrix)
    assert cr < 0.10  # AHP requirement for consistent judgment
    assert len(weights) == 5
