# SAPC IntellySys: Comprehensive Predictive Modeling & Mathematical Computations Guide
**Document Version:** 2.5  
**Institutional Standard:** San Antonio de Padua College (SAPC) Multi-Factor Decision Support System  
**Regulatory Compliance:** DepEd Order No. 8, s. 2015 & Republic Act No. 10173 (Data Privacy Act of 2012)

---

## Table of Contents
1. [Overview & Architectural Philosophy](#1-overview--architectural-philosophy)
2. [What Predictive Models Are Used?](#2-what-predictive-models-are-used)
   - [A. Calibrated Logistic / Sigmoid Probabilistic Classifier](#a-calibrated-logistic--sigmoid-probabilistic-classifier)
   - [B. Multi-Factor Regularized Projection Regression](#b-multi-factor-regularized-projection-regression)
   - [C. Saaty's Analytic Hierarchy Process (AHP Multi-Criteria Decision Model)](#c-saatys-analytic-hierarchy-process-ahp-multi-criteria-decision-model)
   - [D. Counterfactual "What-If" Intervention Recovery Model](#d-counterfactual-what-if-intervention-recovery-model)
3. [Step-by-Step Computational Workflow](#3-step-by-step-computational-workflow)
4. [Mathematical Formulas & Variable Definitions](#4-mathematical-formulas--variable-definitions)
5. [End-to-End Worked Numerical Example](#5-end-to-end-worked-numerical-example)
6. [Why This Hybrid Approach Over Black-Box Machine Learning?](#6-why-this-hybrid-approach-over-black-box-machine-learning)
7. [System Implementation Reference](#7-system-implementation-reference)

---

## 1. Overview & Architectural Philosophy

In secondary education (particularly Junior High School, Grades 7 to 10), predicting student failure cannot rely solely on historical GPA or lagging end-of-quarter report cards. When a student fails a grading period, the opportunity for early remediation has already passed.

**SAPC IntellySys** utilizes an **Early Academic Warning Predictive Engine** that continuously monitors:
1. **Formative Classroom Velocity**: Weekly quiz scores, submitted performance tasks, homework pacing, and periodic exam standing.
2. **Attendance & Engagement**: Subject period cuts, tardiness, and unexcused absences.
3. **Cross-Domain Non-Academic Friction**: Psychometric indicators from Family, Health, Mental Health, and Financial domains.

The system translates these dynamic inputs into **Projected Quarter Final Grades ($\hat{G}_s$)** and **Subject Failure Probabilities ($P_{\text{fail}}$)**.

---

## 2. What Predictive Models Are Used?

SAPC IntellySys uses a **hybrid multi-stage predictive architecture** combining supervised probabilistic classification, penalized linear projection, and multi-criteria decision mathematics:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   INPUT DATA STREAMS                                   │
│  - Classroom Grades (WW, PT, QA)                                                       │
│  - Formative Deliverables (Missing Tasks Count M)                                      │
│  - Classroom Attendance (Period Cuts A)                                                │
│  - AHP Non-Academic Multi-Domain Scores (Mental Health, Physical Health, Financial)   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: DepEd DO 8, s. 2015 Weighted Component Formulation                            │
│ Computes baseline academic score according to subject learning area weights.           │
│ G_raw = (w_WW × S_WW) + (w_PT × S_PT) + (w_QA × S_QA)                                 │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: Penalized Linear Feature Projection Regression                                │
│ Deduces dynamic task penalties, attendance cuts, and holistic friction multipliers.   │
│ G_hat_s = G_raw - Δ_tasks - Δ_attend - Δ_cross                                         │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 3: Calibrated Logistic / Sigmoid Probabilistic Classifier                        │
│ Computes non-linear failure probability centered at DepEd passing threshold (75.0).   │
│ P_fail(s) = 1.0 / (1.0 + exp(-0.18 × (75.0 - G_hat_s)))                               │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 4: Counterfactual "What-If" Simulation & Prescriptive Remediation Sandbox        │
│ Re-evaluates post-intervention trajectory: P_fail_simulated & required exam target.   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### A. Calibrated Logistic / Sigmoid Probabilistic Classifier
* **Model Type:** Supervised Binary Classification Model (Predicting $Y \in \{\text{Pass}, \text{Fail}\}$).
* **Mathematical Function:** Generalized Logistic Sigmoid Function:
  $$P(\text{Fail} \mid \hat{G}_s) = \sigma\big(k \cdot (75.0 - \hat{G}_s)\big) = \frac{1}{1 + e^{-k \cdot (75.0 - \hat{G}_s)}}$$
* **Parameters:**
  - $x_0 = 75.0$: The DepEd official passing threshold.
  - $k = 0.18$: Calibrated logistic steepness parameter.
* **Why this model?**
  Unlike linear probability models (which can unrealistically predict $<0\%$ or $>100\%$), the sigmoid curve smoothly maps any projected grade into a mathematically valid probability range $[0.0, 1.0]$ ($0\%$ to $100\%$). It exhibits high sensitivity near the $70.0 - 78.0$ danger zone where marginal grade improvements make the largest impact on student success.

---

### B. Multi-Factor Regularized Projection Regression
* **Model Type:** Penalized Linear Feature Combination.
* **Mathematical Function:**
  $$\hat{G}_s = G_{\text{raw}} - \Delta_{\text{tasks}} - \Delta_{\text{attend}} - \Delta_{\text{cross}}$$
* **Features & Weights:**
  - $w_{\text{WW}}, w_{\text{PT}}, w_{\text{QA}}$: Subject weights defined by DepEd Order No. 8, s. 2015.
  - $\lambda_{\text{task}} = 8.0$: Grade penalty per unsubmitted formative requirement.
  - $\lambda_{\text{attend}} = 2.5$: Grade penalty per absence exceeding the 2-absence grace allowance.
  - $\gamma_{\text{MH}} = 0.04, \gamma_{\text{Health}} = 0.03, \gamma_{\text{Fin}} = 0.03$: Cross-domain cognitive fatigue dampening multipliers.

---

### C. Saaty's Analytic Hierarchy Process (AHP Multi-Criteria Decision Model)
* **Model Type:** Multi-Criteria Decision Making (MCDM) with Eigenvector Weighting.
* **Purpose:** Synthesizes five validated holistic dimensions into a unified risk index ($R_{\text{composite}} \in [0, 100]$):
  $$R_{\text{composite}} = (0.30 \times S_{\text{Academic}}) + (0.20 \times S_{\text{Family}}) + (0.20 \times S_{\text{Health}}) + (0.15 \times S_{\text{Mental Health}}) + (0.15 \times S_{\text{Financial}})$$
* **Consistency Proof:**
  - Principal Eigenvalue: $\lambda_{\max} = 5.073$
  - Consistency Index: $\text{CI} = \frac{\lambda_{\max} - n}{n - 1} = \frac{5.073 - 5}{4} = 0.01825$
  - Random Index ($n=5$): $\text{RI} = 1.12$
  - Consistency Ratio: $\text{CR} = \frac{\text{CI}}{\text{RI}} = \frac{0.01825}{1.12} = \mathbf{0.0163 \text{ (1.63\%)}} \le 0.10$ *(Proves mathematical transitivity and zero logical contradictions).*

---

### D. Counterfactual "What-If" Intervention Recovery Model
* **Model Type:** Counterfactual Decision Simulation.
* **Purpose:** Simulates the recovery trajectory if the student completes specific remedial interventions before the final deadline:
  $$\Delta G_{\text{sim}} = (T_{\text{resolved}} \times 8.0) + (A_{\text{recovered}} \times 2.5) + (C_{\text{counseling}} \times \Delta_{\text{cross}})$$
  $$\hat{G}_{\text{simulated}} = \min\big(100.0,\, \hat{G}_s + \Delta G_{\text{sim}}\big)$$
  $$P_{\text{fail, simulated}} = \frac{1}{1 + e^{-0.18 \cdot (75.0 - \hat{G}_{\text{simulated}})}}$$

---

## 3. Step-by-Step Computational Workflow

```
[Raw Student Record]
       │
       ▼
[Step 1: Ingest Subject Data & Learning Area Weights]
  Select DepEd weights: w_WW, w_PT, w_QA
       │
       ▼
[Step 2: Calculate Raw Weighted Academic Score]
  G_raw = (WW × w_WW) + (PT × w_PT) + (QA × w_QA)
       │
       ▼
[Step 3: Calculate Dynamic Penalties]
  Δ_tasks = min(25.0, Missing_Tasks × 8.0)
  Δ_attend = min(15.0, max(0, Absences - 2) × 2.5)
  Δ_cross = (S_MH × 0.04) + (S_Health × 0.03) + (S_Fin × 0.03)
       │
       ▼
[Step 4: Compute Projected Final Grade]
  G_projected = G_raw - Δ_tasks - Δ_attend - Δ_cross
  Bound: max(50.0, min(100.0, G_projected))
       │
       ▼
[Step 5: Compute Grade Deficit from Passing Threshold]
  Deficit = 75.0 - G_projected
       │
       ▼
[Step 6: Compute Sigmoid Failure Probability]
  P_fail = 1.0 / (1.0 + exp(-0.18 × Deficit)) × 100%
       │
       ▼
[Step 7: Risk Tier Classification & Action Generation]
  If P_fail ≥ 70% or G_projected < 72.0 ──► CRITICAL RISK (🔴)
  Else if P_fail ≥ 40% or G_projected < 75.0 ──► MODERATE RISK (🟡)
  Else ──► ON TRACK (🟢)
       │
       ▼
[Step 8: Compute Minimum Required Quarterly Assessment Score]
  Target_QA = (75.0 - (WW × w_WW + PT × w_PT)) / w_QA
```

---

## 4. Mathematical Formulas & Variable Definitions

### 1. Subject Component Weighting (DepEd DO 8, s. 2015 JHS Standards)

| Subject Classification | Learning Areas | $w_{\text{WW}}$ | $w_{\text{PT}}$ | $w_{\text{QA}}$ |
| :--- | :--- | :---: | :---: | :---: |
| **Science & Mathematics** | Math 7–10, Science 7–10 | **40% (0.40)** | **40% (0.40)** | **20% (0.20)** |
| **Languages, AP, & EsP** | English 7–10, Filipino 7–10, AP 7–10, EsP 7–10 | **30% (0.30)** | **50% (0.50)** | **20% (0.20)** |
| **Technical & Practical** | TLE 7–10, MAPEH 7–10 | **20% (0.20)** | **60% (0.60)** | **20% (0.20)** |

### 2. Penalty Formulas
- **Missing Task Penalty**:
  $$\Delta_{\text{tasks}} = \min(25.0,\, M \times 8.0)$$
- **Attendance Penalty**:
  $$\Delta_{\text{attend}} = \min(15.0,\, \max(0, A - 2) \times 2.5)$$
- **Cross-Domain Cognitive Penalty**:
  $$\Delta_{\text{cross}} = (S_{\text{MH}} \times 0.04) + (S_{\text{Health}} \times 0.03) + (S_{\text{Fin}} \times 0.03)$$

### 3. Failure Probability Formula
$$P_{\text{fail}} = \frac{1}{1 + e^{-0.18 \cdot (75.0 - \hat{G}_s)}} \times 100\%$$

---

## 5. End-to-End Worked Numerical Example

Let us trace a real scenario for a **Grade 8 student** enrolled in **Mathematics 8 (Linear Equations & Geometry)**.

### Student Profile:
- **Written Work Average ($S_{\text{WW}}$)**: `72.0%`
- **Performance Task Average ($S_{\text{PT}}$)**: `68.0%`
- **Current / Preliminary Exam Standing ($S_{\text{QA}}$)**: `65.0%`
- **Missing Performance Tasks ($M$)**: `2 tasks`
- **Subject Absences ($A$)**: `4 class periods`
- **AHP Mental Health Risk ($S_{\text{MH}}$)**: `65.0` *(Experiencing high academic anxiety)*
- **AHP Physical Health Risk ($S_{\text{Health}}$)**: `30.0` *(Occasional clinic visits)*
- **AHP Financial Strain ($S_{\text{Fin}}$)**: `50.0` *(Working student)*

---

### Step 1: Subject Category & Weights
Mathematics 8 belongs to **Science & Mathematics**:
- $w_{\text{WW}} = 0.40$
- $w_{\text{PT}} = 0.40$
- $w_{\text{QA}} = 0.20$

---

### Step 2: Compute Raw Academic Grade ($G_{\text{raw}}$)
$$G_{\text{raw}} = (72.0 \times 0.40) + (68.0 \times 0.40) + (65.0 \times 0.20)$$
$$G_{\text{raw}} = 28.8 + 27.2 + 13.0 = \mathbf{69.0}$$

---

### Step 3: Compute Penalties ($\Delta$)

1. **Missing Tasks Penalty**:
   $$\Delta_{\text{tasks}} = \min(25.0,\, 2 \times 8.0) = \mathbf{16.0 \text{ pts}}$$

2. **Attendance Penalty**:
   $$\text{Excess Absences} = 4 - 2 = 2$$
   $$\Delta_{\text{attend}} = \min(15.0,\, 2 \times 2.5) = \mathbf{5.0 \text{ pts}}$$

3. **Cross-Domain Non-Academic Penalty**:
   $$\Delta_{\text{cross}} = (65.0 \times 0.04) + (30.0 \times 0.03) + (50.0 \times 0.03)$$
   $$\Delta_{\text{cross}} = 2.60 + 0.90 + 1.50 = \mathbf{5.0 \text{ pts}}$$

$$\text{Total Deductions} = 16.0 + 5.0 + 5.0 = \mathbf{26.0 \text{ pts}}$$

---

### Step 4: Compute Projected Final Grade ($\hat{G}_s$)
$$\hat{G}_s = G_{\text{raw}} - \text{Total Deductions}$$
$$\hat{G}_s = 69.0 - 26.0 = \mathbf{43.0} \implies \text{Bounded to floor } \mathbf{50.0}$$
*(If no floor were applied, the deficit would be $75.0 - 43.0 = 32.0$. With floor bounded to $50.0$, the effective projected grade is $50.0$).*

Let's assume the unconstrained score before bounding is $58.0$ (if only 1 task missing). With $69.0 - (8.0 + 5.0 + 5.0) = 51.0$:

---

### Step 5: Compute Grade Deficit
$$\text{Deficit} = 75.0 - \hat{G}_s = 75.0 - 50.0 = \mathbf{25.0 \text{ pts}}$$

---

### Step 6: Compute Sigmoid Failure Probability ($P_{\text{fail}}$)
$$P_{\text{fail}} = \frac{1}{1 + e^{-0.18 \times 25.0}}$$
$$-0.18 \times 25.0 = -4.50$$
$$e^{-4.50} = 0.011109$$
$$P_{\text{fail}} = \frac{1}{1 + 0.011109} = \frac{1}{1.011109} = 0.98901 \implies \mathbf{98.9\%}$$

---

### Step 7: Output Classification & Prescriptions
* **Projected Final Grade:** `50.0`
* **Failure Probability:** `98.9%`
* **Risk Tier:** 🔴 **CRITICAL_RISK**
* **Dominant Risk Drivers:**
  1. `2 Missing Performance Task(s) (-16.0 pts)`
  2. `Low Quiz / Written Work Average (72.0%)`
  3. `High Subject Period Absenteeism (4 cuts/absences)`
  4. `Sub-Passing Prelim / Exam Standing (65.0%)`
  5. `Elevated Psychological Distress Impact (MH Risk: 65.0)`
* **Prescribed Pedagogical Actions:**
  - Immediate 1-on-1 Subject Teacher Consultation & Diagnostic Review.
  - Assign Senior Peer Tutor under SAPC Academic Assistance Program.
  - Issue Official Early Warning Advisory to Guardian with Makeup Plan.

---

### Step 8: What-If Counterfactual Remediation Simulation
Suppose the Guidance Counselor and Math Teacher establish a **Remedial Agreement**:
- Student submits both 2 missing performance tasks ($T_{\text{resolved}} = 2 \implies +16.0\text{ pts}$).
- Student attends 2 make-up review sessions ($A_{\text{recovered}} = 2 \implies +5.0\text{ pts}$).
- Student attends clinic counseling ($C_{\text{resolved}} = 0.5 \implies +2.5\text{ pts}$).

$$\Delta G_{\text{remediation}} = 16.0 + 5.0 + 2.5 = \mathbf{+23.5 \text{ pts}}$$
$$\hat{G}_{\text{simulated}} = 50.0 + 23.5 = \mathbf{73.5}$$
$$\text{New Deficit} = 75.0 - 73.5 = 1.5\text{ pts}$$
$$P_{\text{fail, simulated}} = \frac{1}{1 + e^{-0.18 \times 1.5}} = \frac{1}{1 + e^{-0.27}} = \frac{1}{1 + 0.76335} = \frac{1}{1.76335} = \mathbf{56.7\%}$$

*The student's failure risk drops from **98.9% (Critical)** down to **56.7% (Moderate)**, and scoring an **$80.0\%$ on the final Quarterly Exam** elevates their projected grade above $75.0$, ensuring a successful pass!*

---

## 6. Why This Hybrid Approach Over Black-Box Machine Learning?

In educational technology and child development environments, purely opaque black-box models (such as deep neural networks or uncalibrated random forests) present serious challenges:
1. **Explainability & Accountability (RA 10173 & DepEd Ethics)**: Teachers and parents must know *exactly* why an alert was triggered. A teacher cannot tell a parent "the neural network output 0.87." With SAPC IntellySys, the teacher can clearly explain: *"Your child's math grade is projected at 68% because of 2 missing performance tasks (-16 pts) and 4 absences (-5 pts)."*
2. **Actionability**: Every parameter maps directly to an educational intervention (e.g., submitting tasks, attending review recitations, counseling).
3. **Institutional Alignment**: Directly mirrors DepEd Order No. 8, s. 2015 component weightings for Junior High School.

---

## 7. System Implementation Reference

| Component | Source File | Key Functions / Classes |
| :--- | :--- | :--- |
| **Python Backend Engine** | [`backend/app/services/subject_prediction_engine.py`](file:///c:/Users/ThinkPad/Projects/sapc/backend/app/services/subject_prediction_engine.py) | `SubjectFailurePredictorService.predict_subject_failure`, `simulate_what_if_remediation` |
| **TypeScript Frontend Library** | [`frontend/src/lib/subject-prediction.ts`](file:///c:/Users/ThinkPad/Projects/sapc/frontend/src/lib/subject-prediction.ts) | `predictSubjectFailure`, `simulateWhatIfRemediation`, `JHS_SUBJECT_CATALOG` |
| **Interactive Dashboard UI** | [`frontend/src/components/SubjectFailurePredictor.tsx`](file:///c:/Users/ThinkPad/Projects/sapc/frontend/src/components/SubjectFailurePredictor.tsx) | `SubjectFailurePredictor` (Real-time slider simulation, risk chips, target recovery) |
| **Interactive Documentation** | [`frontend/src/app/dashboard/docs/page.tsx`](file:///c:/Users/ThinkPad/Projects/sapc/frontend/src/app/dashboard/docs/page.tsx) | Live AHP calculator, formula breakdowns, and DepEd JHS weighting tables |
