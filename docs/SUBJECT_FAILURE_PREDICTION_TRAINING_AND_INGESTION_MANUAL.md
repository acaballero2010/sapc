# SAPC IntellySys: Comprehensive Guide to Training Data Ingestion, Dataset Standards, & Predictive Modeling
**Document Version:** 2.5  
**Target Systems:** San Antonio de Padua College (SAPC) Multi-Factor Decision Support System  
**Regulatory Standards:** DepEd Order No. 8, s. 2015 & Republic Act No. 10173 (Data Privacy Act of 2012)

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [How the Training Data is Ingested (Step-by-Step)](#2-how-the-training-data-is-ingested-step-by-step)
3. [What Constitutes an Ideal Dataset?](#3-what-constitutes-an-ideal-dataset)
4. [How the Training and Prediction Models Work (Mathematical Pipeline)](#4-how-the-training-and-prediction-models-work-mathematical-pipeline)
5. [Where to Find the Predictions (UI, API, and Codebase Reference)](#5-where-to-find-the-predictions-ui-api-and-codebase-reference)
6. [Automated Training & Evaluation Python Script](#6-automated-training--evaluation-python-script)

---

## 1. Executive Summary

In Junior and Senior High School education, relying on end-of-term quarterly grades means interventions come too late. **SAPC IntellySys** solves this by uniting:
1. **Formative Classroom Velocity** (Weekly written quizzes, performance tasks, and midterm standings).
2. **Classroom Attendance & Engagement** (Subject cuts and unexcused absences).
3. **5-Domain Psychosocial Friction** (AHP-weighted family, health, mental health, and financial distress indicators).

This manual explains how raw student records are ingested, the dataset specifications required for high-accuracy training, the underlying mathematical architecture of the prediction models, and where faculty and counselors can access these predictions.

---

## 2. How the Training Data is Ingested (Step-by-Step)

The system supports a **tri-channel ingestion pipeline**:

```
[Channel A: DepEd SASS Class Record CSV]  [Channel B: Guidance Psychometrics]  [Channel C: REST API Batch]
                   │                                     │                                  │
                   └──────────────────┬──────────────────┴──────────────────────────────────┘
                                      │
                                      ▼
                   ┌────────────────────────────────────────────────────────┐
                   │ STAGE 1: Schema Validation & RA 10173 Sanitization    │
                   │ • Header matching & type verification (Float/Int)      │
                   │ • PII masking & student LRN mapping                   │
                   └──────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
                   ┌────────────────────────────────────────────────────────┐
                   │ STAGE 2: Database Ingestion & Feature Engineering      │
                   │ • SQLite / PostgreSQL table updates (academic_records) │
                   │ • Computation of task & attendance penalties (Δ)       │
                   └──────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
                   ┌────────────────────────────────────────────────────────┐
                   │ STAGE 3: Model Training & Real-Time Inference          │
                   │ • Model retraining / weight calibration                │
                   │ • Automatic early warning alert generation             │
                   └────────────────────────────────────────────────────────┘
```

### Ingestion Methods:

#### Method 1: Web UI Batch Upload (Teacher & Admin Portals)
1. Navigate to **Teacher Dashboard** $\rightarrow$ **"SASS Class Record Ingestion"** or **"Import Wizard"**.
2. Drag and drop the standard DepEd CSV class record (e.g. `Grade11_STEM_Q1_FinalGrades.csv`).
3. The in-browser parser validates:
   - Written Work (WW), Performance Tasks (PT), and Quarterly Assessment (QA) bounds ($0 - 100$).
   - Student LRN 12-digit format.
4. Click **"Commit & Ingest"** $\rightarrow$ Triggers automated recalculation of projected grades and failure probabilities for all students.

#### Method 2: Programmatic Backend API Ingestion
```bash
# Upload a new SASS record via curl
curl -X POST "http://localhost:8000/api/v1/academic/upload-sass" \
  -H "Authorization: Bearer <FACULTY_TOKEN>" \
  -F "file=@sample_500_students_5domains.csv" \
  -F "academic_year=2025-2026" \
  -F "quarter=Q2"
```

#### Method 3: Direct Python Ingestion Pipeline
```python
import pandas as pd
from app.services.subject_prediction_engine import SubjectFailurePredictorService

df = pd.read_csv("backend/samples/sapc_subject_failure_training_dataset.csv")

# Run batch prediction across all records
predictions = [
    SubjectFailurePredictorService.predict_subject_failure(
        written_work_avg=row["written_work_avg"],
        performance_task_avg=row["performance_task_avg"],
        quarterly_assessment_score=row["quarterly_assessment_score"],
        missing_tasks_count=int(row["missing_tasks_count"]),
        subject_absences_count=int(row["subject_absences_count"]),
        subject_code=row["subject_code"],
        family_stress_risk=row["domain_family_risk"],
        mental_health_risk=row["domain_mental_health_risk"],
        physical_fatigue_risk=row["domain_health_risk"],
        financial_strain_risk=row["domain_financial_risk"]
    )
    for _, row in df.iterrows()
]
```

---

## 3. What Constitutes an Ideal Dataset?

An ideal dataset for early failure prediction must be **balanced**, **multidimensional**, and **grounded in DepEd grading standards**.

### A. Recommended Class Distribution (For 1,000 Samples)
* **50% On-Track / Passing ($P_{\text{fail}} < 40\%$, $\hat{G}_s \ge 80.0$):** Baseline high and satisfactory performers.
* **30% Moderate Risk / Borderline ($40\% \le P_{\text{fail}} < 70\%$, $72.0 \le \hat{G}_s < 78.0$):** Students needing minor tutoring or 1–2 task submissions to pass.
* **20% Critical Risk / Failing ($P_{\text{fail}} \ge 70\%$, $\hat{G}_s < 72.0$):** Students with multiple missing tasks, excessive absences, and high cross-domain stress.

### B. Required Column Schema

| Column Name | Type | Value Range | DepEd Role / Purpose |
| :--- | :---: | :---: | :--- |
| `lrn` | String | 12-digit string | Unique learner identifier |
| `student_name` | String | Full Name | Student display label |
| `grade_level` | Categorical | `Grade 7` to `Grade 12` | Academic level |
| `subject_code` | Categorical | `JHS-MATH7`, `STEM-CALC`, etc. | Curriculum taxonomy code |
| `weight_ww`, `weight_pt`, `weight_qa` | Float | Sum = $1.0$ | DepEd DO 8, s. 2015 subject component weights |
| `written_work_avg` | Float | $0.0 - 100.0$ | Formative quizzes & unit tests ($S_{\text{WW}}$) |
| `performance_task_avg` | Float | $0.0 - 100.0$ | Practical exercises & projects ($S_{\text{PT}}$) |
| `quarterly_assessment_score` | Float | $0.0 - 100.0$ | Periodic examination standing ($S_{\text{QA}}$) |
| `missing_tasks_count` | Integer | $0 - 10$ | Unsubmitted formative requirements ($M$) |
| `subject_absences_count` | Integer | $0 - 20$ | Class period cuts / absences ($A$) |
| `domain_academic_risk` | Float | $0.0 - 100.0$ | AHP Domain 1 (Academic velocity risk) |
| `domain_family_risk` | Float | $0.0 - 100.0$ | AHP Domain 2 (Domestic friction & OFW stress) |
| `domain_health_risk` | Float | $0.0 - 100.0$ | AHP Domain 3 (Clinic visits & physical fatigue) |
| `domain_mental_health_risk` | Float | $0.0 - 100.0$ | AHP Domain 4 (Psychological distress & anxiety) |
| `domain_financial_risk` | Float | $0.0 - 100.0$ | AHP Domain 5 (Working student & economic strain) |
| **`projected_final_grade`** | Float | $50.0 - 100.0$ | **Regression Target ($\hat{G}_s$)** |
| **`failure_probability_pct`** | Float | $0.0\% - 100.0\%$ | **Probabilistic Target ($P_{\text{fail}}$)** |
| **`risk_tier`** | Categorical | `CRITICAL_RISK`, `MODERATE_RISK`, `ON_TRACK` | **Multi-Class Classification Target** |
| **`ground_truth_outcome`** | Categorical | `FAILED`, `REMEDIATION_REQUIRED`, `PASSED` | **Discrete Evaluation Outcome** |

---

## 4. How the Training and Prediction Models Work (Mathematical Pipeline)

The prediction engine operates via a **4-stage mathematical pipeline**:

```
[Formative Inputs] ──► [Stage 1: DepEd DO 8 Weighted Baseline] ──► G_raw
                                  │
                                  ▼
                       [Stage 2: Penalized Linear Projection]   ──► G_hat (Projected Grade)
                                  │
                                  ▼
                       [Stage 3: Calibrated Sigmoid Classifier] ──► P_fail (Failure Probability)
                                  │
                                  ▼
                       [Stage 4: Multi-Domain Risk Diagnostics] ──► Prescriptions & What-If Recovery
```

### Stage 1: DepEd DO 8, s. 2015 Weighted Baseline
Calculates the unpenalized academic score according to subject learning area weights:
$$G_{\text{raw}} = (w_{\text{WW}} \times S_{\text{WW}}) + (w_{\text{PT}} \times S_{\text{PT}}) + (w_{\text{QA}} \times S_{\text{QA}})$$
* *Science & Math:* $w_{\text{WW}} = 0.40, w_{\text{PT}} = 0.40, w_{\text{QA}} = 0.20$
* *Languages & AP:* $w_{\text{WW}} = 0.30, w_{\text{PT}} = 0.50, w_{\text{QA}} = 0.20$
* *TLE & MAPEH:* $w_{\text{WW}} = 0.20, w_{\text{PT}} = 0.60, w_{\text{QA}} = 0.20$

### Stage 2: Penalized Linear Feature Projection
Deducts penalties for behavioral deliverables and cross-domain cognitive friction:
$$\hat{G}_s = G_{\text{raw}} - \Delta_{\text{tasks}} - \Delta_{\text{attend}} - \Delta_{\text{cross}}$$
Where:
- $\Delta_{\text{tasks}} = \min(25.0,\, M \times 8.0)$ (8.0 pts per missing requirement)
- $\Delta_{\text{attend}} = \min(15.0,\, \max(0, A - 2) \times 2.5)$ (2.5 pts per absence past 2-absence grace allowance)
- $\Delta_{\text{cross}} = (S_{\text{Family}} \times 0.03) + (S_{\text{MH}} \times 0.03) + (S_{\text{Health}} \times 0.02) + (S_{\text{Fin}} \times 0.02)$

### Stage 3: Calibrated Logistic / Sigmoid Probabilistic Classifier
Converts the projected grade deficit from the DepEd passing threshold ($75.0$) into a continuous probability:
$$P(\text{Fail}) = \frac{1}{1 + e^{-0.18 \cdot (75.0 - \hat{G}_s)}} \times 100\%$$
- High sensitivity near the critical $70.0 - 78.0$ margin.
- If $P_{\text{fail}} \ge 70.0\%$ or $\hat{G}_s < 72.0 \implies$ 🔴 **CRITICAL_RISK**
- If $P_{\text{fail}} \ge 40.0\%$ or $\hat{G}_s < 75.0 \implies$ 🟡 **MODERATE_RISK**
- Otherwise $\implies$ 🟢 **ON_TRACK**

### Stage 4: Counterfactual "What-If" Remediation Recovery
When a student completes missing tasks ($T_{\text{resolved}}$) or attends tutoring ($H_{\text{tutor}}$), the engine dynamically recalculates their recovery trajectory:
$$\hat{G}_{\text{simulated}} = \hat{G}_s + (T_{\text{resolved}} \times 8.0) + (H_{\text{tutor}} \times 2.5)$$
$$P_{\text{fail, simulated}} = \frac{1}{1 + e^{-0.18 \cdot (75.0 - \hat{G}_{\text{simulated}})}}$$

---

## 5. Where to Find the Predictions (UI, API, and Codebase Reference)

### 1. In the Running Web Application (UI)
* **Teacher Prediction Dashboard:**  
  Navigate to **Teacher Portal** (`/dashboard/teacher`) $\rightarrow$ Scroll down to the table titled **"Early Academic Warning: Subject-Level Failure Prediction Sandbox"**.  
  *Features:* Grade/Subject selector, Critical/Moderate/On-Track chips, risk driver diagnosis, "Simulate Remediation" button, and CSV export.
* **Student & Counselor "What-If" Simulator:**  
  Navigate to **Student Portal** (`/dashboard/student`) or click any student in the **Guidance Counselor Portal** $\rightarrow$ Click **"Academic Recovery Simulator"**.
* **Interactive Documentation & Live Calculator:**  
  Navigate to **Documentation Hub** (`/dashboard/docs`).

### 2. In the Codebase & API Endpoints
* **Backend Python Engine:** [`backend/app/services/subject_prediction_engine.py`](file:///c:/Users/ThinkPad/Projects/sapc/backend/app/services/subject_prediction_engine.py)
* **Backend Endpoints:**
  - `POST /api/v1/academic/predict-subject-failure` in [`backend/app/api/v1/academic.py`](file:///c:/Users/ThinkPad/Projects/sapc/backend/app/api/v1/academic.py)
  - `POST /api/v1/academic/simulate-subject-remediation`
* **Frontend TypeScript Library:** [`frontend/src/lib/subject-prediction.ts`](file:///c:/Users/ThinkPad/Projects/sapc/frontend/src/lib/subject-prediction.ts)
* **Frontend UI Component:** [`frontend/src/components/SubjectFailurePredictor.tsx`](file:///c:/Users/ThinkPad/Projects/sapc/frontend/src/components/SubjectFailurePredictor.tsx)

### 3. In the Sample Datasets
* **Training CSV Dataset:** [`backend/samples/sapc_subject_failure_training_dataset.csv`](file:///c:/Users/ThinkPad/Projects/sapc/backend/samples/sapc_subject_failure_training_dataset.csv)
* **500-Student Cohort Academic SASS:** [`backend/samples/sample_500_students_5domains.csv`](file:///c:/Users/ThinkPad/Projects/sapc/backend/samples/sample_500_students_5domains.csv)

---

## 6. Automated Training & Evaluation Python Script

```python
# evaluate_subject_failure_model.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.metrics import classification_report, mean_squared_error, r2_score

# 1. Load the Dataset
df = pd.read_csv("backend/samples/sapc_subject_failure_training_dataset.csv")

# 2. Define Features & Targets
features = [
    "written_work_avg", "performance_task_avg", "quarterly_assessment_score",
    "missing_tasks_count", "subject_absences_count",
    "domain_family_risk", "domain_health_risk", "domain_mental_health_risk", "domain_financial_risk"
]

X = df[features]
y_class = df["risk_tier"]
y_reg = df["projected_final_grade"]

# 3. Split Train & Test Sets
X_train, X_test, y_train_c, y_test_c = train_test_split(X, y_class, test_size=0.20, random_state=42, stratify=y_class)
_, _, y_train_r, y_test_r = train_test_split(X, y_reg, test_size=0.20, random_state=42)

# 4. Train Random Forest Classifier for Risk Tier
clf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
clf.fit(X_train, y_train_c)
y_pred_c = clf.predict(X_test)

print("=== Risk Tier Classification Performance ===")
print(classification_report(y_test_c, y_pred_c))

# 5. Train Gradient Boosting Regressor for Projected Grade
reg = GradientBoostingRegressor(n_estimators=100, learning_rate=0.05, random_state=42)
reg.fit(X_train, y_train_r)
y_pred_r = reg.predict(X_test)

print("=== Grade Projection Regression Performance ===")
print(f"R² Score: {r2_score(y_test_r, y_pred_r):.4f}")
print(f"RMSE: {np.sqrt(mean_squared_error(y_test_r, y_pred_r)):.4f} grade points")
```
