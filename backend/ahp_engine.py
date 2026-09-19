"""
Analytic Hierarchy Process (AHP) Decision Engine
Top-level module wrapper for standalone execution and imports.
"""

from app.services.ahp_engine import (
    compute_ahp_weights,
    calculate_student_risk,
    recommend_interventions,
    AHPEngine,
    DEFAULT_COMPARISON_MATRIX,
    STANDARD_WEIGHTS,
    INTERVENTION_MATRIX,
    CRITERIA_KEYS,
    RI_TABLE
)

__all__ = [
    "compute_ahp_weights",
    "calculate_student_risk",
    "recommend_interventions",
    "AHPEngine",
    "DEFAULT_COMPARISON_MATRIX",
    "STANDARD_WEIGHTS",
    "INTERVENTION_MATRIX",
    "CRITERIA_KEYS",
    "RI_TABLE"
]

if __name__ == "__main__":
    weights, lambda_max, cr, is_consistent = compute_ahp_weights()
    print("=== SAPC AHP Decision Engine ===")
    print(f"Priority Weights: {weights}")
    print(f"Lambda Max: {lambda_max:.4f}")
    print(f"Consistency Ratio (CR): {cr:.4f} (Valid: {is_consistent})")
    
    sample_scores = {"academic": 80, "mental_health": 70, "financial": 50, "family": 40, "health": 30}
    risk_result = calculate_student_risk(sample_scores)
    print("\nSample Student Risk Computation:")
    print(f"Composite Score: {risk_result['composite_risk_score']} ({risk_result['risk_tier'].value})")
    
    recs = recommend_interventions(sample_scores)
    print(f"\nTargeted Recommendation: {recs['primary_recommendation']['title']}")
