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
    def calculate_academic_risk_score(
        quarter_gpa: float,
        failing_subjects_count: int,
        days_absent: int,
        incomplete_requirements_count: int
    ) -> float:
        """
        Computes deterministic Academic Risk Score (S_AC in [0.0, 100.0]):
        - Failing subjects penalty: 25 points per failing grade (max 50)
        - GPA penalty: If GPA < 75 -> 30 pts; if 75 <= GPA < 80 -> 15 pts; if GPA >= 80 -> 0 pts
        - Attendance penalty: >5 unexcused absences -> 15 pts; 3-5 absences -> 8 pts; <3 absences -> 0 pts
        - Incompletes: 5 points per incomplete mark (max 10)
        - Total clamped between 0.0 and 100.0.
        """
        # 1. Failing subjects penalty (max 50)
        failing_penalty = min(50.0, max(0, failing_subjects_count) * 25.0)

        # 2. GPA penalty
        if quarter_gpa < 75.0:
            gpa_penalty = 30.0
        elif quarter_gpa < 80.0:
            gpa_penalty = 15.0
        else:
            gpa_penalty = 0.0

        # 3. Attendance penalty
        if days_absent > 5:
            attendance_penalty = 15.0
        elif days_absent >= 3:
            attendance_penalty = 8.0
        else:
            attendance_penalty = 0.0

        # 4. Incompletes penalty (max 10)
        incomplete_penalty = min(10.0, max(0, incomplete_requirements_count) * 5.0)

        total_risk = failing_penalty + gpa_penalty + attendance_penalty + incomplete_penalty
        return float(np.clip(round(total_risk, 2), 0.0, 100.0))

    @classmethod
    def normalize_academic_risk(
        cls,
        gpa: float,
        failed_count: int,
        incomplete_count: int,
        attendance_rate: float = 100.0,
        absences: int = 0
    ) -> float:
        """
        Standard normalizer delegating to deterministic S_AC calculation.
        """
        return cls.calculate_academic_risk_score(
            quarter_gpa=gpa,
            failing_subjects_count=failed_count,
            days_absent=absences,
            incomplete_requirements_count=incomplete_count
        )

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
