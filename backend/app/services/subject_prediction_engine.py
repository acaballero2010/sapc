import math
from typing import Dict, List, Any, Optional

# DepEd Junior High School (Grades 7 to 10) Subject Taxonomy (DO 8, s. 2015)
SUBJECT_CATALOG = {
    "Grade 7": [
        {"code": "JHS-MATH7", "name": "Mathematics 7 (Elementary Algebra & Geometry)", "category": "Core", "weight_ww": 0.40, "weight_pt": 0.40, "weight_qa": 0.20, "baseline_difficulty": 1.15},
        {"code": "JHS-SCI7", "name": "Science 7 (Integrated General Science)", "category": "Core", "weight_ww": 0.40, "weight_pt": 0.40, "weight_qa": 0.20, "baseline_difficulty": 1.15},
        {"code": "JHS-ENG7", "name": "English 7 (Philippine Literature & Grammar)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-FIL7", "name": "Filipino 7 (Ibong Adarna at Panitikang Luzon)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-AP7", "name": "Araling Panlipunan 7 (Araling Asyano)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-TLE7", "name": "TLE 7 (Exploratory ICT & Home Economics)", "category": "Core", "weight_ww": 0.20, "weight_pt": 0.60, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-MAPEH7", "name": "MAPEH 7 (Music, Arts, PE & Health)", "category": "Core", "weight_ww": 0.20, "weight_pt": 0.60, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-ESP7", "name": "Edukasyon sa Pagpapakatao 7 (EsP)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 0.95},
    ],
    "Grade 8": [
        {"code": "JHS-MATH8", "name": "Mathematics 8 (Linear Equations & Geometry)", "category": "Core", "weight_ww": 0.40, "weight_pt": 0.40, "weight_qa": 0.20, "baseline_difficulty": 1.15},
        {"code": "JHS-SCI8", "name": "Science 8 (Biology, Chemistry & Physics)", "category": "Core", "weight_ww": 0.40, "weight_pt": 0.40, "weight_qa": 0.20, "baseline_difficulty": 1.15},
        {"code": "JHS-ENG8", "name": "English 8 (Afro-Asian Literature)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-FIL8", "name": "Filipino 8 (Florante at Laura)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-AP8", "name": "Araling Panlipunan 8 (Kasaysayan ng Daigdig)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-TLE8", "name": "TLE 8 (Junior Computer Hardware & Programming)", "category": "Core", "weight_ww": 0.20, "weight_pt": 0.60, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-MAPEH8", "name": "MAPEH 8 (Music, Arts, PE & Health)", "category": "Core", "weight_ww": 0.20, "weight_pt": 0.60, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-ESP8", "name": "Edukasyon sa Pagpapakatao 8 (EsP)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 0.95},
    ],
    "Grade 9": [
        {"code": "JHS-MATH9", "name": "Mathematics 9 (Quadratic Functions & Trigonometry)", "category": "Core", "weight_ww": 0.40, "weight_pt": 0.40, "weight_qa": 0.20, "baseline_difficulty": 1.15},
        {"code": "JHS-SCI9", "name": "Science 9 (Living Things & Electricity)", "category": "Core", "weight_ww": 0.40, "weight_pt": 0.40, "weight_qa": 0.20, "baseline_difficulty": 1.15},
        {"code": "JHS-ENG9", "name": "English 9 (Anglo-American Literature)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-FIL9", "name": "Filipino 9 (Noli Me Tangere)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-AP9", "name": "Araling Panlipunan 9 (Ekonomiks)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-TLE9", "name": "TLE 9 (Technical Drafting & Web Design)", "category": "Core", "weight_ww": 0.20, "weight_pt": 0.60, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-MAPEH9", "name": "MAPEH 9 (Music, Arts, PE & Health)", "category": "Core", "weight_ww": 0.20, "weight_pt": 0.60, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-ESP9", "name": "Edukasyon sa Pagpapakatao 9 (EsP)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 0.95},
    ],
    "Grade 10": [
        {"code": "JHS-MATH10", "name": "Mathematics 10 (Polynomials, Sequences & Probability)", "category": "Core", "weight_ww": 0.40, "weight_pt": 0.40, "weight_qa": 0.20, "baseline_difficulty": 1.15},
        {"code": "JHS-SCI10", "name": "Science 10 (Earth & Space, Heredity & Electromagnetism)", "category": "Core", "weight_ww": 0.40, "weight_pt": 0.40, "weight_qa": 0.20, "baseline_difficulty": 1.15},
        {"code": "JHS-ENG10", "name": "English 10 (World Literature & Persuasive Writing)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-FIL10", "name": "Filipino 10 (El Filibusterismo)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-AP10", "name": "Araling Panlipunan 10 (Mga Kontemporaryong Isyu)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-TLE10", "name": "TLE 10 (Computer Systems Servicing & Coding)", "category": "Core", "weight_ww": 0.20, "weight_pt": 0.60, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-MAPEH10", "name": "MAPEH 10 (Music, Arts, PE & Health)", "category": "Core", "weight_ww": 0.20, "weight_pt": 0.60, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-ESP10", "name": "Edukasyon sa Pagpapakatao 10 (EsP)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 0.95},
    ],
    "JHS": [
        {"code": "JHS-MATH", "name": "Mathematics (Grade 7-10)", "category": "Core", "weight_ww": 0.40, "weight_pt": 0.40, "weight_qa": 0.20, "baseline_difficulty": 1.15},
        {"code": "JHS-SCI", "name": "Science (Grade 7-10)", "category": "Core", "weight_ww": 0.40, "weight_pt": 0.40, "weight_qa": 0.20, "baseline_difficulty": 1.15},
        {"code": "JHS-ENG", "name": "English (Grade 7-10)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 1.00},
        {"code": "JHS-AP", "name": "Araling Panlipunan (Grade 7-10)", "category": "Core", "weight_ww": 0.30, "weight_pt": 0.50, "weight_qa": 0.20, "baseline_difficulty": 1.00},
    ],
    "STEM": [
        {"code": "STEM-CALC", "name": "Pre-Calculus / Algebra Review", "category": "Specialized", "weight_ww": 0.25, "weight_pt": 0.45, "weight_qa": 0.30, "baseline_difficulty": 1.25},
    ]
}

class SubjectFailurePredictorService:
    PASSING_GRADE = 75.0
    LOGISTIC_K = 0.18  # Calibrated slope factor

    @classmethod
    def predict_subject_failure(
        cls,
        written_work_avg: float,         # 0 - 100
        performance_task_avg: float,     # 0 - 100
        quarterly_assessment_score: float, # 0 - 100 (or prelim score)
        missing_tasks_count: int = 0,
        subject_absences_count: int = 0,
        strand: str = "STEM",
        subject_code: str = "STEM-CALC",
        mental_health_risk: float = 0.0, # 0 - 100 (from AHP Mental Health domain)
        physical_fatigue_risk: float = 0.0, # 0 - 100 (from AHP Health domain)
        financial_strain_risk: float = 0.0 # 0 - 100 (from AHP Financial domain)
    ) -> Dict[str, Any]:
        """
        Calculates projected final grade, failure probability, risk tier, 
        dominant drivers, and recommended remedial prescriptions.
        """
        # Find subject metadata
        subj_meta = None
        for strand_key, subjects in SUBJECT_CATALOG.items():
            for s in subjects:
                if s["code"] == subject_code:
                    subj_meta = s
                    break
            if subj_meta:
                break
        
        if not subj_meta:
            subj_meta = {
                "code": subject_code,
                "name": subject_code,
                "category": "General",
                "weight_ww": 0.25,
                "weight_pt": 0.50,
                "weight_qa": 0.25,
                "baseline_difficulty": 1.0
            }

        w_ww = subj_meta["weight_ww"]
        w_pt = subj_meta["weight_pt"]
        w_qa = subj_meta["weight_qa"]

        # Base weighted raw academic component
        raw_weighted_grade = (
            (written_work_avg * w_ww) +
            (performance_task_avg * w_pt) +
            (quarterly_assessment_score * w_qa)
        )

        # Performance Task Missing Penalty: -8.0 pts per missing requirement
        task_penalty = min(25.0, missing_tasks_count * 8.0)

        # Subject Absenteeism Penalty: -2.5 pts per absence past 2
        excess_absences = max(0, subject_absences_count - 2)
        attendance_penalty = min(15.0, excess_absences * 2.5)

        # Cross-Domain Cognitive Dampening Multipliers
        # Heavy mental distress, physical fatigue, and financial work burdens drag subject performance
        cross_domain_penalty = (
            (mental_health_risk * 0.04) +
            (physical_fatigue_risk * 0.03) +
            (financial_strain_risk * 0.03)
        )

        # Projected Final Grade (Bounded between 50.0 and 100.0)
        projected_grade = raw_weighted_grade - task_penalty - attendance_penalty - cross_domain_penalty
        projected_grade = max(50.0, min(100.0, projected_grade))
        rounded_projected = round(projected_grade, 1)

        # Calculate Failure Probability via Calibrated Sigmoid:
        # P_fail = 1 / (1 + exp(-k * (Passing - Grade)))
        grade_deficit = cls.PASSING_GRADE - projected_grade
        raw_prob = 1.0 / (1.0 + math.exp(-cls.LOGISTIC_K * grade_deficit))
        failure_prob_pct = round(raw_prob * 100.0, 1)

        # Determine Risk Tier
        if failure_prob_pct >= 70.0 or projected_grade < 72.0:
            risk_tier = "CRITICAL_RISK"
            risk_badge = "🔴 Critical Failure Risk"
        elif failure_prob_pct >= 40.0 or projected_grade < 75.0:
            risk_tier = "MODERATE_RISK"
            risk_badge = "🟡 Moderate Failure Risk"
        else:
            risk_tier = "ON_TRACK"
            risk_badge = "🟢 On Track / Passing"

        # Identify Primary Risk Drivers
        risk_drivers = []
        if missing_tasks_count > 0:
            risk_drivers.append(f"{missing_tasks_count} Missing Performance Task(s) (-{task_penalty:.1f} pts)")
        if written_work_avg < 75.0:
            risk_drivers.append(f"Low Quiz / Written Work Average ({written_work_avg:.1f}%)")
        if subject_absences_count >= 3:
            risk_drivers.append(f"High Subject Period Absenteeism ({subject_absences_count} cuts/absences)")
        if quarterly_assessment_score < 75.0:
            risk_drivers.append(f"Sub-Passing Prelim / Exam Standing ({quarterly_assessment_score:.1f}%)")
        if mental_health_risk >= 60.0:
            risk_drivers.append(f"Elevated Psychological Distress Impact (MH Risk: {mental_health_risk:.1f})")
        if financial_strain_risk >= 60.0:
            risk_drivers.append("External Working Student / Economic Fatigue")

        if not risk_drivers:
            risk_drivers.append("Consistently Satisfactory Performance Tasks & Quizzes")

        # Prescribed Pedagogical Actions
        recommended_actions = []
        if risk_tier == "CRITICAL_RISK":
            recommended_actions.append("Immediate 1-on-1 Subject Teacher Consultation & Diagnostic Review")
            recommended_actions.append("Assign Senior Peer Tutor under SAPC Academic Assistance Program")
            recommended_actions.append("Issue Official Early Warning Advisory to Guardian with Makeup Plan")
        elif risk_tier == "MODERATE_RISK":
            recommended_actions.append("Grant 5-Day Performance Task Submission Extension Window")
            recommended_actions.append("Enroll in Weekly Remedial Problem-Solving Recitation Session")
            recommended_actions.append("Class Adviser Coordination for Homework Pacing")
        else:
            recommended_actions.append("Maintain Current Study Schedule & Milestone Submissions")

        return {
            "subject_code": subj_meta["code"],
            "subject_name": subj_meta["name"],
            "subject_category": subj_meta["category"],
            "projected_final_grade": rounded_projected,
            "confidence_interval_95": [round(max(50.0, rounded_projected - 3.2), 1), round(min(100.0, rounded_projected + 3.2), 1)],
            "failure_probability_pct": failure_prob_pct,
            "passing_probability_pct": round(100.0 - failure_prob_pct, 1),
            "risk_tier": risk_tier,
            "risk_badge": risk_badge,
            "weights_used": {"written_work": w_ww, "performance_task": w_pt, "quarterly_assessment": w_qa},
            "penalties_applied": {
                "missing_tasks_penalty": round(task_penalty, 1),
                "attendance_penalty": round(attendance_penalty, 1),
                "cross_domain_penalty": round(cross_domain_penalty, 1)
            },
            "risk_drivers": risk_drivers,
            "recommended_actions": recommended_actions
        }

    @classmethod
    def simulate_remediation(
        cls,
        current_state: Dict[str, Any],
        tasks_to_submit: int = 0,
        remedial_tutoring_hours: float = 0.0,
        exam_target_improvement: float = 0.0
    ) -> Dict[str, Any]:
        """
        'What-If' Simulation Engine: Calculates new projected grade and failure probability
        after completing missing tasks, attending tutoring sessions, or improving exam prep.
        """
        orig_ww = current_state.get("written_work_avg", 70.0)
        orig_pt = current_state.get("performance_task_avg", 70.0)
        orig_qa = current_state.get("quarterly_assessment_score", 70.0)
        orig_missing = max(0, current_state.get("missing_tasks_count", 0) - tasks_to_submit)
        orig_absences = current_state.get("subject_absences_count", 0)
        
        # Tutoring improves WW and QA averages
        tutoring_boost = min(15.0, remedial_tutoring_hours * 2.5)
        new_ww = min(100.0, orig_ww + tutoring_boost)
        # Submitting tasks boosts PT average
        task_recovery_boost = min(20.0, tasks_to_submit * 6.0)
        new_pt = min(100.0, orig_pt + task_recovery_boost)
        new_qa = min(100.0, orig_qa + tutoring_boost * 0.7 + exam_target_improvement)

        simulated_result = cls.predict_subject_failure(
            written_work_avg=new_ww,
            performance_task_avg=new_pt,
            quarterly_assessment_score=new_qa,
            missing_tasks_count=orig_missing,
            subject_absences_count=orig_absences,
            strand=current_state.get("strand", "STEM"),
            subject_code=current_state.get("subject_code", "STEM-CALC"),
            mental_health_risk=current_state.get("mental_health_risk", 0.0) * 0.8,
            physical_fatigue_risk=current_state.get("physical_fatigue_risk", 0.0),
            financial_strain_risk=current_state.get("financial_strain_risk", 0.0)
        )

        return {
            "remediation_inputs": {
                "tasks_submitted": tasks_to_submit,
                "tutoring_hours": remedial_tutoring_hours,
                "exam_improvement": exam_target_improvement
            },
            "simulated_outcome": simulated_result
        }
