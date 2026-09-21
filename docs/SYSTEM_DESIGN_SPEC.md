# SAPC IntellySys: System Design Specification & Technical Architecture

**Institution**: San Antonio de Padua College (SAPC)  
**Project**: SAPC IntellySys — Early Warning & Multi-Criteria Decision Support System (DSS) for Student Retention and Holistic Wellness  
**Version**: 2.5.0  
**Compliance**: Republic Act No. 10173 (Data Privacy Act of 2012), DepEd Order No. 40, s. 2012 (Child Protection Policy)

---

## 1. Executive Summary & Problem Statement

San Antonio de Padua College operates with a mission of academic excellence and values-driven education. However, traditional academic tracking suffers from siloed data: grades are recorded separately from clinic attendance, behavioral referrals, mental health concerns, and financial challenges. 

**SAPC IntellySys** is an AI-enhanced Decision Support System (DSS) that consolidates academic, familial, physical, psychological, and financial indicators into a unified multi-criteria risk index. Utilizing **Saaty's Analytic Hierarchy Process (AHP)**, psychometrician-validated weights, and **Google Gemini 2.5 AI**, the system proactively identifies students at risk of drop-out or severe distress and triggers targeted, tiered interventions before academic failure occurs.

---

## 2. High-Level System Architecture

```
                                  +-------------------------------------------------------+
                                  |                     CLIENT LAYER                      |
                                  |  Next.js 14 App Router + TypeScript + Tailwind CSS    |
                                  +-------------------------------------------------------+
                                           |                         |
                               (Firebase Auth Token)        (REST / WebSocket APIs)
                                           v                         v
+---------------------------------------------------+       +---------------------------------------------+
|               AUTHENTICATION & ACCESS             |       |            FASTAPI BACKEND SERVICE          |
|  - Firebase Authentication (Email/Password & OTP) |       |  - Pydantic v2 Validation                   |
|  - Role-Based Access Control (RBAC)               |       |  - Multi-Criteria Decision Engine (AHP)     |
|  - 5 Distinct Portals (Admin, Counselor, Teacher, |       |  - SASS / DepEd CSV Ingestion Wizard        |
|    Student, Parent)                               |       |  - Automated Intervention Recommender       |
+---------------------------------------------------+       +---------------------------------------------+
                                                                     |              |              |
                    +------------------------------------------------+              |              +-------------------+
                    |                                                               |                                  |
                    v                                                               v                                  v
+------------------------------------+                             +----------------------------------+   +----------------------------+
|        DATABASE & STORAGE          |                             |        AI & NLP SERVICES         |   |    EXTERNAL INTEGRATIONS   |
| - PostgreSQL (Relational DB)       |                             | - Google Gemini 2.5 Flash API    |   | - DepEd SASS Formats       |
| - Cloud Firestore (Realtime Sync)  |                             | - VADER Sentiment Fallback Engine|   | - SMS/Email Alerts (Twilio)|
| - SQLAlchemy 2.0 ORM Engine        |                             | - Emotion & Distress Classifier  |   | - SASS CSV Exporters       |
+------------------------------------+                             +----------------------------------+   +----------------------------+
```

---

## 3. Technology Stack Breakdown

### 3.1 Frontend Web Application
* **Framework**: Next.js 14 (App Router architecture with Server and Client Components)
* **Language**: TypeScript 5.x (Strict type safety, complete schema typing)
* **Styling**: Tailwind CSS & CSS Modules (Custom SAPC palette: `#8B0014` Primary Red, `#D97706` Amber, Glassmorphism cards)
* **Data Visualization**: Recharts (5-Domain Radar charts, Longitudinal Grade Trends, Risk Area Charts)
* **Iconography & UI**: Lucide React, Headless UI
* **State & Auth**: React Context API (`AuthContext`), Firebase Web SDK v10

### 3.2 Backend REST API Service
* **Framework**: FastAPI (High-performance asynchronous Python web framework)
* **Runtime**: Python 3.11+
* **Validation & Serialization**: Pydantic v2 (Strict request/response schema modeling)
* **Mathematical & Statistical Core**: NumPy (Matrix multiplication, eigenvector calculations, eigenvalue estimation)
* **Data Processing**: Pandas (DepEd School Assessment System CSV parsing, bulk record validation)
* **HTTP Client**: HTTPX (Asynchronous non-blocking client for Gemini 2.5 Flash API calls)

### 3.3 Database & Persistence
* **Primary Relational Store**: PostgreSQL (ACID-compliant storage for users, courses, grades, AHP scores, interventions, audit logs)
* **ORM**: SQLAlchemy 2.0 with Alembic database migration management
* **Realtime Profile & Messaging Store**: Google Cloud Firestore (Live notification streams, multi-turn chat persistence)

### 3.4 Artificial Intelligence & Decision Support
* **Large Language Model**: Google Gemini 2.5 Flash (`gemini-2.5-flash`) via Google AI Studio API
  * System-instructed with psychometric and guidance counselor empathy protocols.
  * Multi-turn conversational memory with contextual distress triage.
  * Tagalog/Taglish-fluent empathetic guidance companion.
* **NLP Fallback**: VADER (Valence Aware Dictionary and sEntiment Reasoner) sentiment classifier.
* **DSS Algorithm**: Analytic Hierarchy Process (AHP) with column normalization and geometric eigenvalue approximation.

---

## 4. Multi-Criteria Risk Assessment Engine (AHP)

### 4.1 The 5 Risk Domains & Psychometrician Weights
Each student's composite risk score ($R_{composite} \in [0, 100]$) is computed as a weighted linear combination of five validated sub-scores:

| Domain | Key | Validated Weight ($w_i$) | Primary Source Attributes |
|---|---|:---:|---|
| **Academic** | `academic` | **30% (0.30)** | Quarter GPA, failing subjects count, days absent, incomplete tasks |
| **Family Context** | `family` | **20% (0.20)** | 17-field family structure screener, home conflict index, guardian stability |
| **Physical Health** | `health` | **20% (0.20)** | Clinic visits, chronic conditions, sleep deprivation, nutritional index |
| **Mental Health** | `mental_health` | **15% (0.15)** | PHQ-9 & GAD-7 standardized screeners, AI chatbot distress markers |
| **Financial Support** | `financial` | **15% (0.15)** | Tuition balance, 4Ps beneficiary status, daily allowance adequacy |

$$\text{Composite Risk Score} = 0.30 \cdot S_{AC} + 0.20 \cdot S_{FA} + 0.20 \cdot S_{HE} + 0.15 \cdot S_{MH} + 0.15 \cdot S_{FI}$$

### 4.2 Academic Sub-Score ($S_{AC}$) Computation
The academic domain score ($S_{AC} \in [0, 100]$) is computed deterministically from quarterly DepEd SASS records:

$$S_{AC} = \min\left(100, P_{\text{failed}} + P_{\text{gpa}} + P_{\text{absent}} + P_{\text{incom}}\right)$$

Where:
1. **Failing Subjects Penalty ($P_{\text{failed}}$)**:
   $$P_{\text{failed}} = \min(50.0, \text{failing\_subjects\_count} \times 25.0)$$
2. **GPA Threshold Penalty ($P_{\text{gpa}}$)**:
   $$P_{\text{gpa}} = \begin{cases} 30.0 & \text{if } \text{GPA} < 75.0 \\ 15.0 & \text{if } 75.0 \le \text{GPA} < 80.0 \\ 0.0 & \text{if } \text{GPA} \ge 80.0 \end{cases}$$
3. **Attendance Penalty ($P_{\text{absent}}$)**:
   $$P_{\text{absent}} = \begin{cases} 15.0 & \text{if } \text{days\_absent} > 5 \\ 8.0 & \text{if } 3 \le \text{days\_absent} \le 5 \\ 0.0 & \text{if } \text{days\_absent} < 3 \end{cases}$$
4. **Incomplete Requirements Penalty ($P_{\text{incom}}$)**:
   $$P_{\text{incom}} = \min(10.0, \text{incomplete\_requirements\_count} \times 5.0)$$

### 4.3 Pairwise Comparison Matrix & Mathematical Consistency
The pairwise comparison matrix $A = [a_{ij}]$ is defined as follows:

$$\begin{pmatrix}
1.0 & 1.5 & 1.5 & 2.0 & 2.0 \\
1/1.5 & 1.0 & 1.0 & 4/3 & 4/3 \\
1/1.5 & 1.0 & 1.0 & 4/3 & 4/3 \\
0.5 & 3/4 & 3/4 & 1.0 & 1.0 \\
0.5 & 3/4 & 3/4 & 1.0 & 1.0
\end{pmatrix}$$

* **Principal Eigenvalue ($\lambda_{max}$)**: $\approx 5.073$
* **Consistency Index ($CI$)**: $CI = \frac{\lambda_{max} - n}{n - 1} = \frac{5.073 - 5}{4} = 0.01825$
* **Random Index ($RI$ for $n=5$)**: $1.12$
* **Consistency Ratio ($CR$)**: $CR = \frac{CI}{RI} = \frac{0.01825}{1.12} = 0.0163 \ll 0.10$

Since $CR = 1.63\% \le 10\%$, the matrix exhibits strong mathematical consistency according to Saaty's axiomatic criteria.

### 4.4 Risk Tiers and Decision Protocol
* **Low Risk ($R < 40.0$)**: Normal monitoring, routine advisories.
* **Medium Risk ($40.0 \le R < 70.0$)**: Early intervention triggered (advisory consultation, peer tutoring, check-in).
* **High Risk ($R \ge 70.0$)**: Immediate multi-stakeholder case conference, parent summons, guidance intake.

---

## 5. Role-Based Access Control (RBAC) Matrix

| Feature / Resource | Admin | Guidance Counselor | Teacher / Adviser | Student | Parent / Guardian |
|---|:---:|:---:|:---:|:---:|:---:|
| System Configuration & AHP Weights | Read/Write | Read | None | None | None |
| DepEd SASS CSV Ingestion & Rollback | Read/Write | None | Read/Write (Section) | None | None |
| Master Student Directory | Full | Full | Section Only | Self Only | Child Only |
| Crisis Alerts & Distress Triage | Full | Full (Primary) | Class Alerts | None | Urgent Child Alerts |
| Clinical Screeners (PHQ-9 / GAD-7) | View Stats | Full Clinical | Aggregated Only | Self Screener | Consented Summary |
| Intervention Care Plans | Audit/Approve | Manage/Assign | Execute/Milestone | View/Acknowledge | Acknowledge/PTC |
| AI Guidance Counselor Companion | View Telemetry | Audit Flags | None | Direct Chat | None |
| Data Privacy Consents (RA 10173) | System Audit | Center Audit | None | Manage Consent | Manage Consent |

---

## 6. Security, Compliance, and Data Privacy

1. **Republic Act No. 10173 (Philippine Data Privacy Act)**:
   * Explicit opt-in consent collected during student onboarding.
   * Granular consent toggles for mental health screening logs and AI chat telemetry.
   * AES-256 encrypted at rest and TLS 1.3 in transit.
2. **Audit Trails & Rollback Engine**:
   * Every CSV upload creates an immutable `ImportBatch` with SHA-256 checksums and automated rollback capability.
   * Every intervention status modification is logged with actor timestamp and rationale.
3. **Counselor-Client Privilege**:
   * Detailed PHQ-9/GAD-7 item responses are restricted strictly to licensed Guidance Counselors. Teachers and parents view categorized support recommendations rather than raw psychiatric survey answers.
