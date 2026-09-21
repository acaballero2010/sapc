import pytest
from app.services.subject_prediction_engine import SubjectFailurePredictorService, SUBJECT_CATALOG

def test_subject_catalog_structure():
    """Verify that all curriculum strands have valid weights summing to 1.0"""
    for strand, subjects in SUBJECT_CATALOG.items():
        assert len(subjects) > 0
        for subj in subjects:
            total_weight = subj["weight_ww"] + subj["weight_pt"] + subj["weight_qa"]
            assert abs(total_weight - 1.0) < 0.001
            assert subj["baseline_difficulty"] >= 1.0

def test_critical_failure_prediction():
    """Test high risk student prediction in Pre-Calculus"""
    result = SubjectFailurePredictorService.predict_subject_failure(
        written_work_avg=60.0,
        performance_task_avg=62.0,
        quarterly_assessment_score=55.0,
        missing_tasks_count=3,
        subject_absences_count=4,
        strand="STEM",
        subject_code="STEM-CALC",
        mental_health_risk=70.0,
        physical_fatigue_risk=30.0,
        financial_strain_risk=40.0
    )
    assert result["risk_tier"] == "CRITICAL_RISK"
    assert result["failure_probability_pct"] >= 70.0
    assert result["projected_final_grade"] < 72.0
    assert len(result["risk_drivers"]) > 0
    assert len(result["recommended_actions"]) > 0

def test_on_track_student_prediction():
    """Test high achieving student in General Mathematics"""
    result = SubjectFailurePredictorService.predict_subject_failure(
        written_work_avg=92.0,
        performance_task_avg=95.0,
        quarterly_assessment_score=90.0,
        missing_tasks_count=0,
        subject_absences_count=0,
        strand="STEM",
        subject_code="CORE-GMATH",
        mental_health_risk=15.0,
        physical_fatigue_risk=10.0,
        financial_strain_risk=10.0
    )
    assert result["risk_tier"] == "ON_TRACK"
    assert result["failure_probability_pct"] < 40.0
    assert result["projected_final_grade"] >= 85.0

def test_remediation_simulation_gain():
    """Test that submitting missing tasks and attending tutoring strictly improves projected grade"""
    current_state = {
        "written_work_avg": 65.0,
        "performance_task_avg": 68.0,
        "quarterly_assessment_score": 60.0,
        "missing_tasks_count": 2,
        "subject_absences_count": 3,
        "strand": "STEM",
        "subject_code": "STEM-CALC",
        "mental_health_risk": 60.0
    }
    before = SubjectFailurePredictorService.predict_subject_failure(
        written_work_avg=current_state["written_work_avg"],
        performance_task_avg=current_state["performance_task_avg"],
        quarterly_assessment_score=current_state["quarterly_assessment_score"],
        missing_tasks_count=current_state["missing_tasks_count"],
        subject_absences_count=current_state["subject_absences_count"],
        strand=current_state["strand"],
        subject_code=current_state["subject_code"],
        mental_health_risk=current_state["mental_health_risk"]
    )
    sim = SubjectFailurePredictorService.simulate_remediation(
        current_state=current_state,
        tasks_to_submit=2,
        remedial_tutoring_hours=4.0,
        exam_target_improvement=6.0
    )
    after = sim["simulated_outcome"]

    assert after["projected_final_grade"] > before["projected_final_grade"]
    assert after["failure_probability_pct"] < before["failure_probability_pct"]
    assert sim["remediation_inputs"]["tasks_submitted"] == 2
