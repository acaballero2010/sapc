import numpy as np
from typing import Dict, Any, Tuple, Optional
from app.models.risk import RiskTier
from app.core.config import settings

class AHPEngine:
    """
    Analytic Hierarchy Process (AHP) Decision Engine for SAPC IntellySys.
    
    Validated Domain Weights:
    - Academic (0.4017)
    - Mental Health (0.2442)
    - Financial (0.1373)
    - Family (0.1373)
    - Health (0.0794)
    Total = 1.0000 (100%)
    """
    
    DOMAIN_WEIGHTS = {
        "academic": settings.AHP_WEIGHT_ACADEMIC,       # 0.4017
        "mental_health": settings.AHP_WEIGHT_MENTAL_HEALTH, # 0.2442
        "financial": settings.AHP_WEIGHT_FINANCIAL,     # 0.1373
        "family": settings.AHP_WEIGHT_FAMILY,           # 0.1373
        "health": settings.AHP_WEIGHT_HEALTH            # 0.0794
    }

    # Random Inconsistency Index (RI) for n=1 to 10
    RI_TABLE = {1: 0.0, 2: 0.0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49}

    @classmethod
    def calculate_ahp_weights_from_matrix(cls, matrix: np.ndarray) -> Tuple[np.ndarray, float, float]:
        """
        Computes priority vector (eigenvector approximation via geometric mean),
        lambda_max, and Consistency Ratio (CR) for a pairwise comparison matrix.
        """
        n = matrix.shape[0]
        # Column normalization method
        col_sum = matrix.sum(axis=0)
        norm_matrix = matrix / col_sum
        weights = norm_matrix.mean(axis=1)
        
        # Calculate lambda_max
        weighted_sum = matrix.dot(weights)
        lambda_max = float(np.mean(weighted_sum / weights))
        
        # Consistency Index (CI) and Consistency Ratio (CR)
        ci = (lambda_max - n) / (n - 1) if n > 1 else 0.0
        ri = cls.RI_TABLE.get(n, 1.12)
        cr = ci / ri if ri > 0 else 0.0
        
        return weights, lambda_max, cr

    @staticmethod
    def normalize_academic_risk(
        gpa: float,
        failed_count: int,
        incomplete_count: int,
        attendance_rate: float,
        absences: int
    ) -> float:
        """
        Converts raw academic indicators into a normalized risk score (0 - 100).
        Higher score = Higher risk of academic failure.
        
        Philippine Grade Scale (Standard DepEd/CHED 0-100 or 75 passing):
        - Grade < 75: Extreme Risk (100%)
        - Grade 75-79: High Risk (70-90%)
        - Grade 80-84: Moderate Risk (40-60%)
        - Grade 85-89: Low Risk (15-35%)
        - Grade 90+: Minimal Risk (0-15%)
        """
        # 1. Grade sub-risk
        if gpa < 75.0:
            grade_risk = 100.0
        elif gpa < 80.0:
            # 75.0 -> 90.0 risk, 79.9 -> 70.0 risk
            grade_risk = 90.0 - ((gpa - 75.0) / 5.0) * 20.0
        elif gpa < 85.0:
            # 80.0 -> 60.0 risk, 84.9 -> 35.0 risk
            grade_risk = 60.0 - ((gpa - 80.0) / 5.0) * 25.0
        elif gpa < 90.0:
            # 85.0 -> 35.0 risk, 89.9 -> 10.0 risk
            grade_risk = 35.0 - ((gpa - 85.0) / 5.0) * 25.0
        else:
            grade_risk = max(0.0, 10.0 - ((gpa - 90.0) / 10.0) * 10.0)

        # 2. Failed / Incomplete subjects impact
        subject_risk = min(100.0, (failed_count * 35.0) + (incomplete_count * 20.0))

        # 3. Attendance / Absences risk
        # 10 or more absences is near failure limit (20% of semester)
        absence_risk = min(100.0, max(0.0, (100.0 - attendance_rate) * 2.5 + (absences * 6.0)))

        # Sub-criteria weights inside Academic Domain:
        # Grade (50%), Failed/Incomplete (30%), Attendance (20%)
        academic_composite = (0.50 * grade_risk) + (0.30 * subject_risk) + (0.20 * absence_risk)
        return float(np.clip(round(academic_composite, 2), 0.0, 100.0))

    @classmethod
    def compute_composite_risk(
        cls,
        academic_score: float,
        mental_health_score: float,
        financial_score: float,
        family_score: float,
        health_score: float
    ) -> Dict[str, Any]:
        """
        Computes the weighted composite risk score using AHP weights.
        Returns composite score, risk tier, domain contributions, and primary driver.
        """
        # Ensure scores are clamped between 0 and 100
        acad = float(np.clip(academic_score, 0.0, 100.0))
        mental = float(np.clip(mental_health_score, 0.0, 100.0))
        fin = float(np.clip(financial_score, 0.0, 100.0))
        fam = float(np.clip(family_score, 0.0, 100.0))
        health = float(np.clip(health_score, 0.0, 100.0))

        # AHP Multi-Criteria Summation
        composite_score = (
            (acad * cls.DOMAIN_WEIGHTS["academic"]) +
            (mental * cls.DOMAIN_WEIGHTS["mental_health"]) +
            (fin * cls.DOMAIN_WEIGHTS["financial"]) +
            (fam * cls.DOMAIN_WEIGHTS["family"]) +
            (health * cls.DOMAIN_WEIGHTS["health"])
        )
        composite_score = round(float(np.clip(composite_score, 0.0, 100.0)), 2)

        # Determine Risk Tier
        if composite_score <= settings.RISK_LOW_MAX:
            tier = RiskTier.LOW
        elif composite_score <= settings.RISK_MEDIUM_MAX:
            tier = RiskTier.MEDIUM
        else:
            tier = RiskTier.HIGH

        # Calculate weighted contributions
        contributions = {
            "Academic": round(acad * cls.DOMAIN_WEIGHTS["academic"], 2),
            "Mental Health": round(mental * cls.DOMAIN_WEIGHTS["mental_health"], 2),
            "Financial": round(fin * cls.DOMAIN_WEIGHTS["financial"], 2),
            "Family": round(fam * cls.DOMAIN_WEIGHTS["family"], 2),
            "Health": round(health * cls.DOMAIN_WEIGHTS["health"], 2)
        }

        # Identify Primary Risk Driver (highest weighted contribution)
        primary_driver = max(contributions.items(), key=lambda x: x[1])[0]

        summary = (
            f"Composite Risk Score is {composite_score}/100 ({tier.value.upper()} RISK). "
            f"Primary risk driver is {primary_driver} contributing {contributions[primary_driver]} points to overall score."
        )

        return {
            "composite_risk_score": composite_score,
            "risk_tier": tier,
            "primary_risk_driver": primary_driver,
            "calculation_summary": summary,
            "sub_scores": {
                "academic": acad,
                "mental_health": mental,
                "financial": fin,
                "family": fam,
                "health": health
            },
            "weights": cls.DOMAIN_WEIGHTS,
            "contributions": contributions
        }
