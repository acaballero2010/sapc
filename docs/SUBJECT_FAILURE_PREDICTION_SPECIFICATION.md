# SAPC IntellySys: Subject-Level Student Failure Predictive Modeling Specification
**Document Version**: 2.4.0 • **Effective Academic Year**: 2025–2026  
**Regulatory Compliance**: DepEd Order No. 8, s. 2015 • RA 10173 (Data Privacy Act)

---

## 1. Executive Summary & Objective

The **Subject-Level Student Failure Prediction Engine** is a deterministic, explainable, and multi-factor Early Warning Model within SAPC IntellySys. Unlike generic grade averages that obscure micro-deficits, this model operates at the **individual curriculum subject level** (e.g., *Mathematics 7–10, Science 7–10, English 7–10, Filipino 7–10, Araling Panlipunan, TLE, MAPEH, EsP*).

### Core Problem Addressed
In junior high school, students rarely fail across all subjects simultaneously; failure cascades typically originate in **1 or 2 bottleneck subjects** due to unsubmitted performance tasks, periodic absenteeism, or cognitive overload compounded by non-academic distress (mental health anxiety, financial worries, family caretaking). 

By predicting failure risk **4 to 6 weeks before end-of-quarter grade finalization**, faculty and guidance counselors can prescribe targeted remediation (peer tutoring, task makeup windows, counselor check-ins) before a failing grade ($< 75.0$) becomes mathematically irreversible.

---

## 2. Mathematical Model Architecture

The predictive engine computes three synchronized outputs for each student in a given subject:
1. **Projected Final Grade** ($\hat{G}_s \in [50.0, 100.0]$)
2. **Failure Probability** ($P_{\text{fail}} \in [0.0\%, 100.0\%]$)
3. **Risk Tier & Prescriptive Triage Actions** (`CRITICAL_RISK`, `MODERATE_RISK`, `ON_TRACK`)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 INPUT PARAMETERS                                       │
│  • Written Work Avg (WW)       • Missing Tasks Count (M)    • AHP Mental Health Risk   │
│  • Performance Task Avg (PT)   • Subject Absences (A)       • AHP Health Risk          │
│  • Periodic Exam Score (QA)    • Curriculum Strand/Subject  • AHP Financial Risk       │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. FORMATIVE WEIGHTED BASELINE (DepEd DO 8, s. 2015)                                    │
│    G_base = (WW · W_ww) + (PT · W_pt) + (QA · W_qa)                                     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. PENALTIES & CROSS-DOMAIN IMPACT MODIFIERS                                            │
│    Δ_tasks  = min(25.0, M · 8.0)                                                       │
│    Δ_attend = min(15.0, max(0, A - 2) · 2.5)                                           │
│    Δ_cross  = (S_MH · 0.04) + (S_Health · 0.03) + (S_Fin · 0.02)                      │
│    G_raw    = G_base - Δ_tasks - Δ_attend - Δ_cross                                    │
│    G_proj   = max(50.0, min(100.0, G_raw · Diff_baseline))                             │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. CALIBRATED SIGMOID PROBABILITY CURVE                                                │
│    P_fail = 1 / (1 + e^( -0.18 · (75.0 - G_proj) ))                                    │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 4. RISK TIER CLASSIFICATION & ACTION DISPATCH                                          │
│    • P_fail ≥ 70.0%  ──► CRITICAL RISK (1-on-1 Consultation & Peer Tutoring)           │
│    • P_fail 40-69.9% ──► MODERATE RISK (Task Makeup Plan & Study Pod)                  │
│    • P_fail < 40.0%  ──► ON TRACK (Positive Reinforcement)                             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Mathematical Formulation

### Step 1: Formative Weighted Baseline ($\hat{G}_{\text{base}}$)
Based on DepEd DO 8, s. 2015 component weights ($W_{\text{ww}}, W_{\text{pt}}, W_{\text{qa}}$):

$$\hat{G}_{\text{base}} = \left( \text{WW} \cdot W_{\text{ww}} \right) + \left( \text{PT} \cdot W_{\text{pt}} \right) + \left( \text{QA} \cdot W_{\text{qa}} \right)$$

### DepEd DO 8, s. 2015 Junior High School (Grade 7–10) Weight Matrix:
| Subject Category | Written Work ($W_{\text{ww}}$) | Performance Tasks ($W_{\text{pt}}$) | Quarterly Assessment ($W_{\text{qa}}$) | Baseline Difficulty ($D_s$) |
| :--- | :---: | :---: | :---: | :---: |
| **Mathematics 7–10** | **40%** | **40%** | **20%** | 1.15 |
| **Science 7–10** | **40%** | **40%** | **20%** | 1.15 |
| **English 7–10** | **30%** | **50%** | **20%** | 1.00 |
| **Filipino 7–10** | **30%** | **50%** | **20%** | 1.00 |
| **Araling Panlipunan 7–10** | **30%** | **50%** | **20%** | 1.00 |
| **TLE / ICT 7–10** | **20%** | **60%** | **20%** | 1.00 |
| **MAPEH 7–10** | **20%** | **60%** | **20%** | 1.00 |
| **EsP 7–10 (Values Education)** | **30%** | **50%** | **20%** | 0.95 |

---

### Step 2: Formative Penalties & Cross-Domain Degradation

$$\hat{G}_{\text{raw}} = \hat{G}_{\text{base}} - \Delta_{\text{tasks}} - \Delta_{\text{attend}} - \Delta_{\text{cross}}$$

Where:
1. **Missing Performance Tasks Penalty ($\Delta_{\text{tasks}}$)**:
   $$\Delta_{\text{tasks}} = \min(25.0, \, M \times 8.0\text{ pts})$$
   *Each missing formative task directly deducts 8.0 points from projected standing (capped at 25.0 points).*

2. **Period Absenteeism / Cut Classes Penalty ($\Delta_{\text{attend}}$)**:
   $$\Delta_{\text{attend}} = \min\left(15.0, \, \max(0, \, A - 2) \times 2.5\text{ pts}\right)$$
   *A buffer of 2 excused absences is allowed; each subsequent unexcused absence/cut deducts 2.5 points.*

3. **Cross-Domain AHP Non-Academic Multiplier ($\Delta_{\text{cross}}$)**:
   $$\Delta_{\text{cross}} = \left(S_{\text{MH}} \times 0.04\right) + \left(S_{\text{Health}} \times 0.03\right) + \left(S_{\text{Financial}} \times 0.02\right)$$
   *High mental health distress ($S_{\text{MH}} = 80$) introduces a $3.2\text{ pt}$ cognitive friction drag.*

4. **Difficulty Calibrated Projected Grade ($\hat{G}_s$)**:
   $$\hat{G}_s = \max\left(50.0, \, \min\left(100.0, \, 75.0 + \frac{\hat{G}_{\text{raw}} - 75.0}{D_s}\right)\right)$$

---

### Step 3: Calibrated Sigmoid Failure Probability ($P_{\text{fail}}$)

To map the projected grade smoothly to a probability bounded strictly between $0.0\%$ and $100.0\%$, the system applies a **calibrated logistic sigmoid function** centered on the DepEd passing threshold ($T = 75.0$):

$$P(\text{Fail}) = \frac{1}{1 + e^{-k \cdot (T - \hat{G}_s)}}$$

* Where:
  * $T = 75.0$ (DepEd passing standard grade)
  * $k = 0.18$ (Empirically calibrated steepness factor)
  * When $\hat{G}_s = 75.0$, $P_{\text{fail}} = 50.0\%$
  * When $\hat{G}_s = 65.0$, $P_{\text{fail}} = 85.8\%$ (High critical failure certainty)
  * When $\hat{G}_s = 85.0$, $P_{\text{fail}} = 14.2\%$ (Safe passing margin)

---

## 4. Risk Tier Classification Matrix

| Risk Tier | Probability Range ($P_{\text{fail}}$) | Projected Grade ($\hat{G}_s$) | Operational Meaning | Mandatory Campus Protocol |
| :--- | :---: | :---: | :--- | :--- |
| 🔴 **CRITICAL RISK** | $\mathbf{\ge 70.0\%}$ | $< 70.5$ | Impending subject failure within quarter. | **1.** Immediate 1-on-1 Teacher Diagnostic<br>**2.** Assign Senior Peer Tutor (Room 104)<br>**3.** Early Warning Advisory to Guardian |
| 🟡 **MODERATE RISK** | $\mathbf{40.0\% - 69.9\%}$ | $70.5 - 76.5$ | Borderline standing; single missed task causes failure. | **1.** 5-Day Task Makeup Grace Window<br>**2.** Weekly Homework & Study Pod Check-in |
| 🟢 **ON TRACK** | $\mathbf{< 40.0\%}$ | $\ge 76.6$ | Satisfactory to superior mastery. | **1.** Commendation & Active Peer Tutor Enrollment |

---

## 5. "What-If" Remediation Sandbox Model

The prediction engine includes a real-time interactive remediation simulator allowing teachers and counselors to model the exact outcome of proposed interventions:

### Simulation Gains Formula:
$$\hat{G}_{\text{simulated}} = \hat{G}_s + \Delta_{\text{makeup}} + \Delta_{\text{tutoring}} + \Delta_{\text{exam}}$$

Where:
* **Task Submission Recovery ($\Delta_{\text{makeup}}$)**:
  $$\Delta_{\text{makeup}} = \min(\Delta_{\text{tasks}}, \, \text{tasks\_submitted} \times 7.0\text{ pts})$$
* **Remedial Tutoring Recovery ($\Delta_{\text{tutoring}}$)**:
  $$\Delta_{\text{tutoring}} = \min(8.0, \, \text{tutoring\_hours} \times 1.5\text{ pts})$$
* **Target Periodic Exam Improvement ($\Delta_{\text{exam}}$)**:
  $$\Delta_{\text{exam}} = \text{target\_score\_gain} \times W_{\text{qa}}$$

### Recalculated Outcome:
$$P(\text{Fail})_{\text{simulated}} = \frac{1}{1 + e^{-0.18 \cdot (75.0 - \hat{G}_{\text{simulated}})}}$$

---

## 6. API Specifications

### 1. `GET /api/v1/academic/predict-subject-failure`
Computes failure risk standing for a student in a specific subject.

**Query Parameters**:
```http
GET /api/v1/academic/predict-subject-failure?written_work_avg=62.0&performance_task_avg=65.0&quarterly_assessment_score=58.0&missing_tasks_count=3&subject_absences_count=5&strand=Grade%208&subject_code=JHS-MATH8&mental_health_risk=75.0
```

**Response Payload (`200 OK`)**:
```json
{
  "subject_code": "JHS-MATH8",
  "subject_name": "Mathematics 8 (Linear Equations & Geometry)",
  "projected_final_grade": 54.2,
  "confidence_interval_95": [51.5, 56.9],
  "failure_probability_pct": 97.7,
  "passing_probability_pct": 2.3,
  "risk_tier": "CRITICAL_RISK",
  "risk_drivers": [
    "3 Missing Performance Task(s) (-24.0 pts)",
    "Low Quiz / Written Work Average (62.0%)",
    "High Subject Period Absenteeism (5 cuts/absences)",
    "Sub-Passing Prelim / Exam Standing (58.0%)",
    "Elevated Psychological Distress Impact (MH Risk: 75.0)"
  ],
  "recommended_actions": [
    "Immediate 1-on-1 Subject Teacher Consultation & Diagnostic Review",
    "Assign Senior Peer Tutor under SAPC Academic Assistance Program (Room 104)",
    "Issue Official Early Warning Advisory to Guardian with Makeup Plan"
  ]
}
```

---

### 2. `POST /api/v1/academic/simulate-remediation`
Simulates the projected grade and risk reduction following remediation actions.

**Request Body**:
```json
{
  "current_state": {
    "written_work_avg": 62.0,
    "performance_task_avg": 65.0,
    "quarterly_assessment_score": 58.0,
    "missing_tasks_count": 3,
    "subject_absences_count": 5,
    "strand": "Grade 8",
    "subject_code": "JHS-MATH8",
    "mental_health_risk": 75.0
  },
  "tasks_to_submit": 3,
  "remedial_tutoring_hours": 4.0,
  "exam_target_improvement": 10.0
}
```

**Response Payload (`200 OK`)**:
```json
{
  "baseline_outcome": {
    "projected_final_grade": 54.2,
    "failure_probability_pct": 97.7,
    "risk_tier": "CRITICAL_RISK"
  },
  "simulated_outcome": {
    "projected_final_grade": 78.4,
    "failure_probability_pct": 35.2,
    "risk_tier": "ON_TRACK"
  },
  "grade_gain": 24.2,
  "risk_reduction_pct": 62.5,
  "remediation_verdict": "RECOVERY ACHIEVED: Student transitions from CRITICAL_RISK to ON_TRACK with complete task submission and 4 hours of peer tutoring."
}
```

---

## 7. Institutional Integration & Ethics (RA 10173 Compliance)

1. **Non-Punitive Design**: The prediction model serves strictly as an **affirmative decision-support tool** to allocate resources (tutoring, deadline extensions, counselor consultations), never to penalize or stigmatize students.
2. **Explainability**: Every risk prediction displays its exact mathematical contributors (e.g. missing tasks, exam score, absence penalty) so teachers and students understand precisely what must be resolved.
3. **Data Protection**: All formative telemetry is encrypted under AES-256 GCM in compliance with the Philippine Data Privacy Act of 2012.
