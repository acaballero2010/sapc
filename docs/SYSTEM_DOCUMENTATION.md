# SAPC IntellySys: Comprehensive System & Roles Documentation

**System Title**: Multi-Factor Student Failure Decision Support System (SAPC IntellySys)  
**Institution**: San Antonio de Padua College (SAPC) — Junior High School Department  
**Compliance Standard**: Republic Act No. 10173 (Philippine Data Privacy Act of 2012) & DepEd Order No. 40, s. 2012  
**Framework**: 5-Domain Analytic Hierarchy Process (AHP) Psychometrician-Validated Composite Scoring

---

## 1. Executive Summary & Purpose

SAPC IntellySys is an advanced clinical and academic **Decision Support System (DSS)** designed to identify, assess, and mitigate multi-factor causes of academic failure among Junior High School students at San Antonio de Padua College.

Traditional student tracking platforms rely solely on lagging academic indicators (such as failing quarterly grades). SAPC IntellySys integrates both **quantitative academic tracking** and **qualitative non-academic domains** (Mental Health, Family Environment, Physical Health, and Financial Stability) into a unified risk assessment framework powered by the **Analytic Hierarchy Process (AHP)**.

---

## 2. AHP Multi-Criteria Mathematical Model & Risk Tiers

### 2.1 Domain Weights (Psychometrician-Validated)

$$\text{Composite Risk Score} = \sum_{i=1}^{5} (W_i \times S_i)$$

Where:
- $W_i$ is the criteria weight assigned to domain $i$
- $S_i$ is the normalized domain risk score ($0.0 - 100.0$)

| Domain Criterion | Weight ($W_i$) | Description & Key Indicators | Ingestion Source |
| :--- | :---: | :--- | :--- |
| **Academic Performance** | **`0.3000` (30%)** | Quarterly grade averages, failing marks (<75), unexcused absences, missing LMS submissions | SASS CSV / DepEd Form 137 |
| **Family Environment** | **`0.2000` (20%)** | OFW parents, domestic conflict, absence of parental academic guidance, broken home dynamics | Intake Survey / Interview Notes |
| **Physical Health** | **`0.2000` (20%)** | Chronic illness, malnutrition, recurring clinic consultations, fatigue, physical disability | Clinic Records / Self-Assessment |
| **Mental Health** | **`0.1500` (15%)** | Clinical anxiety, depression indicators, burnout, Padua Assist NLP crisis keyword triggers | Daily Mood Tracker / NLP Chatbot |
| **Financial Capacity** | **`0.1500` (15%)** | Tuition delinquency, daily allowance shortages, lack of learning device or internet access | Guidance Intake / Financial Form |

### 2.2 Risk Tiers & Action Thresholds

- **🟢 Low Risk (`0.00` – `39.99`)**: Student demonstrates academic and psychosocial stability. Standard universal guidance and regular classroom advisory monitoring.
- **🟡 Medium Risk (`40.00` – `69.99`)**: Student exhibits early warning signs in one or more criteria (e.g. failing 1-2 competencies, attendance irregularity). Triggers teacher observation and advisory check-in.
- **🔴 High Risk (`70.00` – `100.00`)**: Critical multi-factor vulnerability. Automatically initiates immediate clinical case triage, counseling conference, DepEd case management documentation, and parent outreach.

---

## 3. Comprehensive Analysis of the 5 User Roles & RBAC Matrix

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                               ROLE CAPABILITIES & BOUNDARIES                          │
├─────────────────────┬───────────┬───────────┬───────────┬──────────────┬──────────────┤
│ Capability / Module │ Admin     │ Counselor │ Teacher   │ Student      │ Parent       │
├─────────────────────┼───────────┼───────────┼───────────┼──────────────┼──────────────┤
│ System Config & Roster│ ✅ Full   │ ❌ None   │ ❌ None   │ ❌ None      │ ❌ None      │
│ Ingestion Audit Trail│ ✅ Read   │ ❌ None   │ ❌ None   │ ❌ None      │ ❌ None      │
│ Model Sensitivity Sim│ ✅ Modify │ ✅ View   │ ❌ None   │ ❌ None      │ ❌ None      │
│ Clinical Mental Health│ ❌ Masked │ ✅ Full   │ ❌ Masked │ ❌ Own Only  │ ❌ Summary   │
│ NLP Chatbot Crisis Log│ ❌ Masked │ ✅ Full   │ ❌ None   │ ❌ Own Only  │ ❌ None      │
│ Formal Intervention  │ ❌ View   │ ✅ Create │ ✅ Refer  │ ❌ View Own  │ ❌ View Own  │
│ Advisory Class Grades│ ❌ Masked │ ✅ Full   │ ✅ Section│ ❌ Own Only  │ ❌ Child Only│
│ Subject Failure Pred │ ❌ View   │ ✅ Full   │ ✅ Section│ ❌ Own Only  │ ❌ Child Only│
│ Daily Mood Check-In  │ ❌ None   │ ✅ Triage │ ❌ None   │ ✅ Submit    │ ❌ None      │
│ DepEd Form Generation│ ❌ Export │ ✅ Full   │ ❌ None   │ ❌ None      │ ❌ None      │
└─────────────────────┴───────────┴───────────┴───────────┴──────────────┴──────────────┘
```

### 3.1 🛡️ Institutional Administrator (`admin`)
- **Primary Objective**: System configuration, roster lifecycle management, data ingestion pipelines, and compliance governance.
- **Key Capabilities**:
  - Provision, search, filter, and edit credentials for Faculty, Guidance Personnel, and Staff.
  - Multi-Domain Ingestion Hub: Ingest SASS CSV exports, financial records, clinic logs, and family background surveys with automated column mapping.
  - Full System Audit Log Viewer: Inspect timestamped logs of every dataset modification and roster update with granular before/after diffs.
  - AHP Model Sensitivity Engine: Simulate domain weight variations and evaluate impact across the entire student population.
  - Institutional Customizer: Configure institutional logos, branding, theme colors, and academic school terms.
  - Email/SMS Gateway Settings: Manage notification routing credentials.
- **Privacy & Security Boundaries**:
  - **Strictly prohibited** from accessing individual student mental health counseling transcripts and psychological notes.
  - **Cannot manually alter or override student academic grades** to preserve academic integrity.

### 3.2 🧠 Registered Guidance Counselor (`guidance_counselor`)
- **Primary Objective**: Clinical assessment, case triage, intervention design, DepEd compliance, and psychosocial retention casework.
- **Key Capabilities**:
  - Unrestricted access to 5-Domain Multi-Factor Risk Profiles across all 500+ JHS students.
  - Real-time Crisis Triage Stream: Live alerts on chatbot distress triggers (e.g. self-harm, grief, severe anxiety).
  - Clinical Intervention Kanban: Track intervention cases across `Identified`, `In Progress`, `Under Review`, and `Resolved`.
  - Batch Intervention Engine: Trigger group interventions for students with similar risk profiles (e.g. Math remedial, peer counseling).
  - Student 360 Profile Dossier: View longitudinal grade trajectories, radar charts, family context, and counselor case notes.
  - DepEd Standard Form Generator: Export SF9/SF10-aligned intervention reports for academic retention audits.
  - Academic Recovery Simulator: Forecast post-intervention recovery pathways.
  - Parent Consultation Scheduler: Coordinate conferences, log meeting outcomes, and dispatch urgent alerts.
  - Counselor Knowledge Hub: Access diagnostic reference frameworks and coping strategies.

### 3.3 👨‍🏫 Subject Teacher / Class Adviser (`teacher`)
- **Primary Objective**: Classroom academic monitoring, competency tracking, and structured guidance referrals.
- **Key Capabilities**:
  - Section Risk Heatmap: Matrix mapping advisory students against specific subject competencies.
  - Subject Failure Predictor: Compute failure probabilities per subject and learning competency.
  - Teacher Referral Workflow: Submit formal student referrals to the Guidance Office with classroom behavioral notes.
  - Attendance & Absenteeism Radar: Monitor unexcused absences and early patterns of disengagement.
  - Grade Progression Sparklines: Interactive quarterly trend lines across Q1 to Q4.
- **Privacy & Security Boundaries**:
  - Restricted to viewing students within their designated advisory sections or enrolled classes.
  - Cannot access confidential family financial disclosures or private psychological therapy notes.

### 3.4 🎓 Student (`student`)
- **Primary Objective**: Academic self-awareness, daily wellness check-ins, and confidential guidance support.
- **Key Capabilities**:
  - Academic Dashboard: View enrolled subjects, quarterly grades, and General Weighted Average (GWA).
  - Domain Balance Radar: Visual radar chart showing academic and non-academic wellness balance.
  - Padua Assist NLP Chatbot: 24/7 conversational companion for emotional support, study strategies, and crisis routing.
  - Daily Mood Check-In: Log daily emotional state with uplifting customized suggestions.
  - Action Plan Tracker: View active academic recovery tasks and guidance counselor milestones.
  - Confidential Consultation Request: One-click private appointment booking with the Guidance Office.
- **Privacy & Security Boundaries**:
  - Strict isolation: Students can only view their own individual academic records and personal mood check-ins.

### 3.5 👨‍👩‍👧 Parent / Legal Guardian (`parent`)
- **Primary Objective**: Transparent monitoring of child's academic progress, attendance tracking, and consultation collaboration.
- **Key Capabilities**:
  - Student Academic Overview: View linked child's quarterly marks, GWA, and subject stability status.
  - Real-Time Attendance Monitor: Track presence, tardiness, and verified/unverified absences.
  - Guidance Notices & Alerts: Receive automated notifications on academic risks or parent-teacher conference schedules.
  - Consultation Scheduler: Book appointments with class advisers and guidance counselors.
  - Home Study Resource Library: Access guides on creating effective home study routines and supporting adolescent well-being.
- **Privacy & Security Boundaries**:
  - Restricted exclusively to the records of their legally linked child/dependent.

---

## 4. Comprehensive Page & Module Directory

### 4.1 Authentication & Global System Shell
- **`/login`**: Multi-provider authentication supporting Firebase Email/Password, Google OAuth SSO, and Quick Role Switcher.
- **`/register`**: Self-service registration portal with automated role validation and LRN binding.
- **Global Header**: Features Command Palette (`Ctrl + K`), Cloud Sync Indicator, Real-Time Notification Drawer, and User Menu Popover.
- **`/dashboard/profile`**: Comprehensive profile management, avatar customization, 2FA security, and RA 10173 consent settings.
- **`/dashboard/docs`**: Integrated in-app documentation browser.

### 4.2 Administrator Workspace (`/dashboard/admin`)
- **KPI Summary Grid**: Total enrollment, at-risk count, faculty count, and cloud storage health.
- **Multi-Domain Ingestion Hub**: Upload and validate Academic, Health, Family, and Financial datasets.
- **System Audit Log Viewer**: Complete tabular audit trail with before/after diff modals.
- **Faculty & Staff Provisioning**: Manage teacher credentials, advisory assignments, and contact data.
- **AHP Sensitivity Simulator**: Live weight recalculation and risk redistribution simulator.
- **Institutional Branding & Settings**: Customize school logos, term configurations, and communication gateways.

### 4.3 Guidance Counselor Workspace (`/dashboard/guidance`)
- **Real-Time Crisis Triage Bar**: Urgent alert badges for high-risk flags and chatbot distress signals.
- **5-Domain Cohort Risk Grid**: Full 500-student roster with domain breakdown filters and search.
- **Intervention Kanban & Batch Manager**: Multi-stage case management for individual and group interventions.
- **Student 360 Dossier**: Deep-dive clinical view with historical grades, radars, and private case notes.
- **DepEd Form & Recovery Simulator**: Official form export and trajectory forecasting.
- **Parent Consultation Hub**: Meeting coordination, conference logging, and SMS/Email notices.

### 4.4 Subject Teacher Workspace (`/dashboard/teacher`)
- **Advisory Class Summary**: Section-level academic KPI cards and risk distribution.
- **Section Risk Heatmap**: Color-coded matrix identifying students at risk per learning competency.
- **Subject Failure Predictor**: Predictive failure risk calculator per subject area.
- **Guidance Referral Workflow**: Structured student referral submission form.
- **Attendance & Grade Sparklines**: Attendance matrix and longitudinal quarterly grade trends.

### 4.5 Student Workspace (`/dashboard/student`)
- **Academic Progress Card**: Enrolled subject grades and quarterly GWA.
- **Padua Assist NLP Chatbot**: Conversational AI guidance assistant.
- **Daily Mood Check-in**: 5-point emotional logger and personalized wellness tips.
- **Action Plan Checklist**: Assigned academic recovery tasks and guidance milestones.
- **Counselor Appointment Requester**: Private consultation booking.

### 4.6 Parent Workspace (`/dashboard/parent`)
- **Child's Academic Dossier**: Subject grades and stability metrics.
- **Attendance Calendar**: Daily attendance log and absence notifications.
- **Parent Consultation Hub**: Direct meeting scheduler with teachers and counselors.
- **Resource Hub**: Adolescent guidance and home study guides.

---

## 5. Security, Auditability, and Data Privacy (RA 10173)

1. **Principle of Transparency & Consent**: All student and parent users are informed of data processing purposes during initial onboarding.
2. **Access Isolation**: Mental health logs and psychological transcripts are encrypted and inaccessible to administrative and teaching staff.
3. **Immutable Audit Trails**: Every ingestion, modification, and user provision is recorded with timestamp and operator metadata.
4. **Data Minimization**: Only academic and psychosocial indicators directly relevant to dropout prevention and educational intervention are processed.
