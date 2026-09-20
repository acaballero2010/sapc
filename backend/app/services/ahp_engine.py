import numpy as np
from typing import Dict, Any, Tuple, Union, List, Optional
from app.models.risk import RiskTier
from app.core.config import settings

# Criteria order: [Academic, Family, Health, Mental Health, Financial]
CRITERIA_KEYS = ["academic", "family", "health", "mental_health", "financial"]

# Validated Psychometrician Comparison Matrix (A) for SAPC Decision Support
DEFAULT_COMPARISON_MATRIX = np.array([
    [1.0,     1.5,     1.5,     2.0,     2.0],     # Academic (30%)
    [1/1.5,   1.0,     1.0,     4/3.0,   4/3.0],   # Family (20%)
    [1/1.5,   1.0,     1.0,     4/3.0,   4/3.0],   # Health (20%)
    [1/2.0,   3/4.0,   3/4.0,   1.0,     1.0],     # Mental Health (15%)
    [1/2.0,   3/4.0,   3/4.0,   1.0,     1.0]      # Financial (15%)
])

# Random Inconsistency Index (RI) table for n=1 to 10
RI_TABLE = {1: 0.0, 2: 0.0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49}

# Validated IntellySys weights (Psychometrician Validated Model)
STANDARD_WEIGHTS = {
    "academic": 0.30,
    "family": 0.20,
    "health": 0.20,
    "mental_health": 0.15,
    "financial": 0.15
}

INTERVENTION_MATRIX = {
    "academic": {
        "title": "Peer Tutoring & Remedial Sessions",
        "description": "Structured peer tutoring, study consultations with subject faculty, and paced homework remediation.",
        "action_items": [
            "Enroll in SAPC Peer Tutoring Program",
            "Schedule weekly academic consultation with Subject Teacher",
            "Establish study progress pacing agreement"
        ]
    },
    "mental_health": {
        "title": "One-on-One Guidance Counseling Intake",
        "description": "Confidential psychiatric/psychological evaluation, stress regulation strategies, and weekly wellness consultations.",
        "action_items": [
            "Conduct comprehensive Guidance Intake interview",
            "Design personal stress management protocol",
            "Bi-weekly wellness check-ins at Guidance Center (Room 204)"
        ]
    },
    "financial": {
        "title": "Scholarship & Flexible Payment Referral",
        "description": "Student Affairs scholarship evaluation, flexible installment coordination, and work-study options.",
        "action_items": [
            "Refer to Student Assistance & Scholarship Office",
            "Coordinate promissory note and staggered installment plan with Accounting",
            "Evaluate eligibility for Institutional Financial Aid"
        ]
    },
    "family": {
        "title": "Parent-Teacher-Counselor Case Conference",
        "description": "Joint dialogue with parents/guardians to address family strain, home study environment, and supportive boundaries.",
        "action_items": [
            "Convene formal Parent-Teacher-Counselor Case Conference",
            "Establish collaborative home-school monitoring agreement",
            "Follow-up consultation on home study space & routine"
        ]
    },
    "health": {
        "title": "School Clinic Assessment & Medical Leave Clearance",
        "description": "Comprehensive school clinic physical assessment, medical certification review, and health accommodation protocol.",
        "action_items": [
            "Comprehensive physical assessment by School Physician",
            "Validate medical excuses and issue classroom accommodations",
            "Coordinate physical wellness follow-up schedule"
        ]
    }
}

def compute_ahp_weights(matrix: Optional[np.ndarray] = None) -> Tuple[np.ndarray, float, float, bool]:
    """
    Computes priority weights, lambda_max, Consistency Index (CI), and Consistency Ratio (CR)
    from a pairwise comparison matrix using column normalization and geometric eigenvalue approximation.
    
    Returns: (weights, lambda_max, cr, is_consistent)
    """
    if matrix is None:
        matrix = DEFAULT_COMPARISON_MATRIX

    matrix = np.array(matrix, dtype=float)
    n = matrix.shape[0]

    # Column normalization method
    col_sum = matrix.sum(axis=0)
    norm_matrix = matrix / col_sum
    weights = norm_matrix.mean(axis=1)

    # Compute lambda_max (principal eigenvalue estimate)
    weighted_sum = matrix.dot(weights)
    lambda_max = float(np.mean(weighted_sum / weights))

    # Consistency Index & Consistency Ratio
    ci = (lambda_max - n) / (n - 1) if n > 1 else 0.0
    ri = RI_TABLE.get(n, 1.12)
    cr = float(ci / ri) if ri > 0 else 0.0

    is_consistent = cr <= 0.10
    return weights, lambda_max, cr, is_consistent

def calculate_student_risk(domain_scores: Union[Dict[str, float], List[float]]) -> Dict[str, Any]:
    """
    Calculates composite multi-criteria risk score:
    Total Risk Score = (0.30 * S_AC) + (0.20 * S_FA) + (0.20 * S_HE) + (0.15 * S_MH) + (0.15 * S_FI)
    
    Risk Classification:
    - Low Risk: Score < 40.0
    - Medium Risk: 40.0 <= Score < 70.0
    - High Risk: Score >= 70.0
    """
    # Parse domain scores dict or list
    if isinstance(domain_scores, list):
        s_ac = domain_scores[0] if len(domain_scores) > 0 else 0.0
        s_mh = domain_scores[1] if len(domain_scores) > 1 else 0.0
        s_fi = domain_scores[2] if len(domain_scores) > 2 else 0.0
        s_fa = domain_scores[3] if len(domain_scores) > 3 else 0.0
        s_he = domain_scores[4] if len(domain_scores) > 4 else 0.0
    else:
        s_ac = domain_scores.get("academic", domain_scores.get("Academic", 0.0))
        s_mh = domain_scores.get("mental_health", domain_scores.get("Mental Health", 0.0))
        s_fi = domain_scores.get("financial", domain_scores.get("Financial", 0.0))
        s_fa = domain_scores.get("family", domain_scores.get("Family", 0.0))
        s_he = domain_scores.get("health", domain_scores.get("Health", 0.0))

    # Clamp scores between 0 and 100
    s_ac = float(np.clip(s_ac, 0.0, 100.0))
    s_mh = float(np.clip(s_mh, 0.0, 100.0))
    s_fi = float(np.clip(s_fi, 0.0, 100.0))
    s_fa = float(np.clip(s_fa, 0.0, 100.0))
    s_he = float(np.clip(s_he, 0.0, 100.0))

    w_ac = STANDARD_WEIGHTS["academic"]
    w_mh = STANDARD_WEIGHTS["mental_health"]
    w_fi = STANDARD_WEIGHTS["financial"]
    w_fa = STANDARD_WEIGHTS["family"]
    w_he = STANDARD_WEIGHTS["health"]

    # Composite score computation
    composite = (w_ac * s_ac) + (w_mh * s_mh) + (w_fi * s_fi) + (w_fa * s_fa) + (w_he * s_he)
    total_score = round(float(np.clip(composite, 0.0, 100.0)), 2)

    # Risk Tier Classification
    if total_score < 40.0:
        tier = RiskTier.LOW
    elif total_score < 70.0:
        tier = RiskTier.MEDIUM
    else:
        tier = RiskTier.HIGH

    # Weighted contributions
    contributions = {
        "academic": round(w_ac * s_ac, 2),
        "mental_health": round(w_mh * s_mh, 2),
        "financial": round(w_fi * s_fi, 2),
        "family": round(w_fa * s_fa, 2),
        "health": round(w_he * s_he, 2)
    }

    # Identify dominant normalized risk domain
    raw_sub_scores = {
        "academic": s_ac,
        "mental_health": s_mh,
        "financial": s_fi,
        "family": s_fa,
        "health": s_he
    }
    dominant_domain = max(raw_sub_scores.items(), key=lambda x: x[1])[0]

    return {
        "composite_risk_score": total_score,
        "risk_tier": tier,
        "dominant_domain": dominant_domain,
        "sub_scores": raw_sub_scores,
        "contributions": contributions,
        "weights": STANDARD_WEIGHTS,
        "summary": f"Composite Score: {total_score}/100 ({tier.value.upper()} RISK). Dominant Domain: {dominant_domain.replace('_', ' ').title()}."
    }

def recommend_interventions(domain_scores: Union[Dict[str, float], List[float]]) -> Dict[str, Any]:
    """
    AHP Alternative Ranking & Targeted Intervention Recommender:
    Evaluates domain risk hierarchy and ranks recommended intervention actions.
    """
    risk_summary = calculate_student_risk(domain_scores)
    sub_scores = risk_summary["sub_scores"]

    # Sort domains by descending severity score
    ranked_domains = sorted(sub_scores.items(), key=lambda x: x[1], reverse=True)
    primary_domain = ranked_domains[0][0]
    primary_score = ranked_domains[0][1]

    primary_rec = INTERVENTION_MATRIX.get(primary_domain, INTERVENTION_MATRIX["academic"])

    # Secondary recommendations for any other domain with elevated risk (>= 40.0)
    secondary_recs = []
    for domain, score in ranked_domains[1:]:
        if score >= 40.0:
            rec = INTERVENTION_MATRIX.get(domain)
            if rec:
                secondary_recs.append({
                    "domain": domain,
                    "score": score,
                    "title": rec["title"],
                    "description": rec["description"]
                })

    return {
        "student_risk_tier": risk_summary["risk_tier"].value,
        "composite_score": risk_summary["composite_risk_score"],
        "dominant_domain": primary_domain,
        "dominant_domain_score": primary_score,
        "primary_recommendation": {
            "domain": primary_domain,
            "title": primary_rec["title"],
            "description": primary_rec["description"],
            "action_items": primary_rec["action_items"]
        },
        "secondary_recommendations": secondary_recs,
        "ranked_domain_hierarchy": [
            {"domain": d, "score": s, "weight": STANDARD_WEIGHTS[d], "weighted_score": round(s * STANDARD_WEIGHTS[d], 2)}
            for d, s in ranked_domains
        ]
    }

class AHPEngine:
    """
    Static wrapper interface preserving backwards-compatibility and OOP access.
    """
    DOMAIN_WEIGHTS = STANDARD_WEIGHTS
    RI_TABLE = RI_TABLE

    @classmethod
    def calculate_ahp_weights_from_matrix(cls, matrix: Optional[np.ndarray] = None):
        return compute_ahp_weights(matrix)

    @classmethod
    def compute_composite_risk(cls, academic_score: float, mental_health_score: float, financial_score: float, family_score: float, health_score: float):
        scores = {
            "academic": academic_score,
            "mental_health": mental_health_score,
            "financial": financial_score,
            "family": family_score,
            "health": health_score
        }
        res = calculate_student_risk(scores)
        primary_driver = max(res["contributions"].items(), key=lambda x: x[1])[0]
        return {
            "composite_risk_score": res["composite_risk_score"],
            "risk_tier": res["risk_tier"],
            "primary_risk_driver": primary_driver.replace("_", " ").title(),
            "calculation_summary": res["summary"],
            "sub_scores": res["sub_scores"],
            "weights": res["weights"],
            "contributions": res["contributions"]
        }

    @staticmethod
    def calculate_academic_risk_score(quarter_gpa: float, failing_subjects_count: int, days_absent: int, incomplete_requirements_count: int) -> float:
        failing_penalty = min(50.0, max(0, failing_subjects_count) * 25.0)
        if quarter_gpa < 75.0:
            gpa_penalty = 30.0
        elif quarter_gpa < 80.0:
            gpa_penalty = 15.0
        else:
            gpa_penalty = 0.0

        if days_absent > 5:
            attendance_penalty = 15.0
        elif days_absent >= 3:
            attendance_penalty = 8.0
        else:
            attendance_penalty = 0.0

        incomplete_penalty = min(10.0, max(0, incomplete_requirements_count) * 5.0)
        total_risk = failing_penalty + gpa_penalty + attendance_penalty + incomplete_penalty
        return float(np.clip(round(total_risk, 2), 0.0, 100.0))

    @classmethod
    def normalize_academic_risk(cls, gpa: float, failed_count: int, incomplete_count: int, attendance_rate: float = 100.0, absences: int = 0) -> float:
        return cls.calculate_academic_risk_score(gpa, failed_count, absences, incomplete_count)
