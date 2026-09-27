# SAPC IntellySys: Multi-Factor Student Failure Decision Support System

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-FFA611?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Data Privacy](https://img.shields.io/badge/RA%2010173-Compliant-green?style=flat-square)](https://privacy.gov.ph/)

A web-based clinical and academic **Decision Support System (DSS)** designed for **San Antonio de Padua College (SAPC)** Junior High School. SAPC IntellySys synthesizes quantitative academic records with qualitative multi-domain risk factors (Mental Health, Family, Health, Financial) using a psychometrician-validated **Analytic Hierarchy Process (AHP)** mathematical engine.

---

## Table of Contents
1. [Core Architectural Overview](#core-architectural-overview)
2. [AHP Multi-Factor Decision Engine & Risk Tiers](#ahp-multi-factor-decision-engine--risk-tiers)
3. [The 5 User Roles & RBAC Matrix](#the-5-user-roles--rbac-matrix)
4. [Comprehensive Page-by-Page & Dashboard Guide](#comprehensive-page-by-page--dashboard-guide)
   - [Authentication & Global Navigation](#1-authentication--global-navigation)
   - [Institutional Administrator Dashboard](#2-institutional-administrator-dashboard)
   - [Registered Guidance Counselor Dashboard](#3-registered-guidance-counselor-dashboard)
   - [Subject Teacher / Class Adviser Dashboard](#4-subject-teacher--class-adviser-dashboard)
   - [Student Dashboard & Padua Assist NLP Chatbot](#5-student-dashboard--padua-assist-nlp-chatbot)
   - [Parent / Guardian Dashboard](#6-parent--guardian-dashboard)
   - [Profile & Account Settings](#7-profile--account-settings)
   - [In-App Documentation Hub](#8-in-app-documentation-hub)
5. [Data Privacy (RA 10173) & Security Architecture](#data-privacy-ra-10173--security-architecture)
6. [Tech Stack & Local Deployment](#tech-stack--local-deployment)

---

## Core Architectural Overview

SAPC IntellySys bridges the gap between raw student academic tracking and holistic psychosocial intervention:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA INGESTION CHANNELS                          │
├───────────────────┬───────────────────┬─────────────────────────────────┤
│ SASS CSV Exports  │ Diagnostic Survey │ Student NLP Chatbot & Daily     │
│ (Grades, Absences)│ Ingestion (Forms) │ Mood / Crisis Keyword Stream    │
└─────────┬─────────┴─────────┬─────────┴────────────────┬────────────────┘
          │                   │                          │
          ▼                   ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              AHP MULTI-CRITERIA DECISION SUPPORT ENGINE                 │
│                                                                         │
│  Composite Risk = (0.30 × Acad) + (0.20 × Fam) + (0.20 × Hlt)           │
│                   + (0.15 × Mnt) + (0.15 × Fin)                         │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         ROLE-BASED PRESENTATION                         │
├─────────────────┬──────────────────┬──────────────────┬─────────────────┤
│ Admin Console   │ Counselor Center │ Teacher Radar    │ Student/Parent  │
│ (Rosters/Audit) │ (Clinical Plans) │ (Advisory Roster)│ (Transparency)  │
└─────────────────┴──────────────────┴──────────────────┴─────────────────┘
```

---

## AHP Multi-Factor Decision Engine & Risk Tiers

The Decision Support Engine utilizes the **Analytic Hierarchy Process (AHP)** with psychometrician-validated weights derived from pairwise comparison matrices:

| Domain | Weight | Description & Indicators | Data Source |
| :--- | :---: | :--- | :--- |
| **Academic Performance** | **`0.3000` (30%)** | Quarterly grade averages, failing marks (<75), unexcused absences, missing LMS tasks | SASS CSV / DepEd Form 137 |
| **Family Environment** | **`0.2000` (20%)** | Single-parent / OFW households, domestic instability, parental supervision availability | Intake survey / Intake interview |
| **Physical Health** | **`0.2000` (20%)** | Chronic illness, malnutrition, recurring clinical clinic visits, physical fatigue | Clinic records / Self-assessment |
| **Mental Health** | **`0.1500` (15%)** | Anxiety, depressive symptoms, academic burnout, NLP chatbot sentiment flags | Padua Assist Chatbot / Daily Mood |
| **Financial Capacity** | **`0.1500` (15%)** | Tuition delinquency, daily allowance shortages, transportation constraints | Guidance financial survey |

### Risk Tier Thresholds
- **🟢 Low Risk (`0.0` – `39.9`)**: Student demonstrates academic stability and healthy psychosocial indicators. Standard universal guidance monitoring.
- **🟡 Medium Risk (`40.0` – `69.9`)**: Student exhibits early warning signs in one or more domains (e.g. failing 1-2 subjects or attendance dip). Trigger for teacher referral and advisory check-in.
- **🔴 High Risk (`70.0` – `100.0`)**: Critical multi-factor vulnerability (e.g. severe academic decline combined with mental health or family crisis). Mandates immediate clinical case management, parent conference, and formal DepEd intervention plan.

---

## The 5 User Roles & RBAC Matrix

SAPC IntellySys implements strict **Role-Based Access Control (RBAC)** aligned with the **Philippine Data Privacy Act of 2012 (RA 10173)**:

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                               ROLE CAPABILITIES & BOUNDARIES                          │
├─────────────────────┬───────────┬───────────┬───────────┬──────────────┬──────────────┤
│ Capability / View   │ Admin     │ Counselor │ Teacher   │ Student      │ Parent       │
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

### 1. 🛡️ Institutional Administrator (`admin`)
- **Core Mission**: Infrastructure governance, user provisioning, system security, and RA 10173 compliance.
- **Capabilities**:
  - Bulk import of Faculty, Student, and Parent rosters with automated schema validation.
  - Multi-Domain Ingestion Hub (upload SASS CSV grades, health logs, financial records, and family data).
  - Review comprehensive **System Audit Logs** with granular diffs (records added, updated, or modified).
  - Configure institutional branding, custom logos, academic terms, and Email/SMS gateway alerts.
  - Fine-tune and simulate AHP domain weights in the **Sensitivity Analysis Engine**.
  - Create and restore dataset snapshot archives.
- **Privacy Boundary**: **Prohibited from accessing confidential student mental health counseling transcripts and cannot manually override student academic grades.**

### 2. 🧠 Registered Guidance Counselor (`guidance_counselor`)
- **Core Mission**: Psychosocial assessment, crisis intervention, clinical case triage, and institutional retention planning.
- **Capabilities**:
  - Full access to 5-Domain Multi-Factor Risk Dossiers across all 500+ JHS students.
  - Real-time NLP sentiment and crisis keyword alert monitor (e.g. self-harm, severe distress triggers).
  - Create, manage, and progress clinical **Intervention Plans** via an interactive Kanban board.
  - Launch **Batch Interventions** for cohorts sharing common risk profiles (e.g. Math remedial or financial aid referrals).
  - Access the **Student 360 Profile Dossier** with historical grade trends and psychosocial radars.
  - Schedule and document **Parent Consultations** and dispatch urgent parental notices.
  - Generate official **DepEd Case Management Forms** (SF9/SF10-aligned intervention reports).
  - Simulate academic trajectory outcomes via the **Academic Recovery Simulator**.
  - Access the **Counselor Knowledge Hub** for diagnostic frameworks and coping strategies.

### 3. 👨‍🏫 Subject Teacher / Class Adviser (`teacher`)
- **Core Mission**: Classroom academic monitoring, early risk identification, and structured guidance referrals.
- **Capabilities**:
  - View advisory class cohort analytics and the **Section Risk Heatmap**.
  - Monitor individual student subject performance, quarterly grades, and attendance rates.
  - Run the **Subject Failure Predictor** to forecast at-risk learners per learning competency.
  - Submit **Teacher Guidance Referrals** directly to the Guidance Department with classroom observations.
  - Track student attendance patterns and receive early alerts on consecutive unexcused absences.
- **Privacy Boundary**: Cannot view confidential family financial disclosures or private psychological therapy notes.

### 4. 🎓 Student (`student`)
- **Core Mission**: Self-directed academic tracking, emotional wellness check-ins, and confidential guidance support.
- **Capabilities**:
  - View personal Academic Performance Radar and quarterly grade progression sparklines.
  - Converse 24/7 with **Padua Assist**, an NLP-powered empathetic guidance assistant.
  - Complete the **Daily Mood & Wellness Check-in** with personalized coping recommendations.
  - View active personalized academic intervention milestones and study plans.
  - Request confidential appointments with school guidance counselors.
- **Privacy Boundary**: Completely isolated to their own individual records and self-reported wellness logs.

### 5. 👨‍👩‍👧 Parent / Legal Guardian (`parent`)
- **Core Mission**: Transparent monitoring of child's academic health, attendance stability, and consultation coordination.
- **Capabilities**:
  - View child's academic grade summary, quarterly performance, and subject stability indices.
  - Monitor daily attendance records, tardiness, and unexcused absences.
  - Receive automated school alerts and guidance department notices.
  - Request and manage **Guidance Consultation Appointments** with registered counselors.
  - Access school resource guides for home-based academic support.
- **Privacy Boundary**: Strictly limited to their legally linked child's non-sensitive academic overview.

---

## Comprehensive Page-by-Page & Dashboard Guide

### 1. Authentication & Global Navigation
- **`/login` (Universal Login Portal)**:
  - Supports Firebase Email/Password, Institutional Single Sign-On (Google OAuth), and Quick Role Switcher for instant demo access.
  - Role-aware redirect routing dynamically navigates users directly to their designated dashboard workspace.
- **`/register` (Account Registration)**:
  - Self-service registration for Students, Parents, and Faculty with automatic role assignment and LRN linking.
- **Global Navigation & Utility Controls**:
  - **Command Palette (`Ctrl + K`)**: Instant search and rapid keyboard navigation across all students, sections, and modules.
  - **Cloud Sync Status**: Live indicator reflecting Firestore synchronization and offline readiness.
  - **Real-Time Notification Drawer**: Displays urgent crisis flags, grade drops, and referral updates.
  - **User Account Menu (`UserMenuPopover`)**: Profile avatar management, role switching, and secure signout.

---

### 2. Institutional Administrator Dashboard
**Route**: `/dashboard/admin`

| Section / Component | Key Functionality |
| :--- | :--- |
| **System Health & KPI Header** | High-level metrics displaying total active students, at-risk population, faculty count, and cloud storage status. |
| **Multi-Domain Ingestion Hub** | Centralized uploader for Academic (SASS CSV), Health, Family, and Financial dataset files with live column mapping. |
| **System Audit Log Viewer** | Interactive tabular log of all dataset modifications, roster imports, and user updates with full before/after diffs. |
| **Faculty & Roster Manager** | Search, filter, edit, and provision credentials for Junior High School teachers and staff members. |
| **AHP Sensitivity Simulator** | Dynamic sliders to adjust domain criteria weights (`Academic`, `Family`, `Health`, `Mental`, `Financial`) and assess cohort risk distribution impact in real-time. |
| **Institutional Branding Suite** | Upload and preview custom school logos, institutional mottos, and theme accents. |
| **Dataset Snapshot Archive** | Create timestamped backup archives of the student dataset with one-click restore capabilities. |

---

### 3. Registered Guidance Counselor Dashboard
**Route**: `/dashboard/guidance`

| Section / Component | Key Functionality |
| :--- | :--- |
| **Crisis Triage Stream** | Real-time feed highlighting high-risk students triggered by chatbot distress keywords, grade plunges, or teacher referrals. |
| **5-Domain Cohort Risk Grid** | Sortable and filterable student roster with multi-criteria risk badges, domain breakdowns, and search filters. |
| **Intervention Kanban Board** | Drag-and-drop workflow tracking interventions across `Identified`, `In Progress`, `Under Review`, and `Resolved`. |
| **Batch Intervention Modal** | Multi-select at-risk students to trigger bulk interventions (e.g., Peer Tutoring, Financial Counseling). |
| **Student 360 Profile Dossier** | Comprehensive modal containing Academic Radar Charts, Historical Quarterly Grades, Family Background, and Clinical Notes. |
| **DepEd Form Generator** | Export standardized DepEd-compliant intervention summaries and retention tracking forms. |
| **Parent Consultation Hub** | Coordinate schedules, record consultation meeting notes, and dispatch automated SMS/Email reminders. |
| **Counselor Knowledge Hub** | Clinical library of intervention protocols, motivational interviewing guides, and DepEd mental health guidelines. |

---

### 4. Subject Teacher / Class Adviser Dashboard
**Route**: `/dashboard/teacher`

| Section / Component | Key Functionality |
| :--- | :--- |
| **Advisory Section Overview** | Class-level risk summary displaying average GPA, attendance percentage, and at-risk student distribution. |
| **Section Risk Heatmap** | Visual color-coded matrix mapping students against subject competencies to identify struggling clusters. |
| **Subject Failure Predictor** | Machine learning and heuristics-based failure probability calculator per student and subject area. |
| **Teacher Referral Workflow** | Direct form to refer a student to the Guidance Office with structured categories (Academic, Behavioral, Attendance). |
| **Quarterly Grade Sparklines** | Interactive mini-charts showing individual student grade trajectories across Q1 to Q4. |
| **Attendance Tracking Matrix** | Log and inspect daily attendance records, tracking patterns of chronic absenteeism. |

---

### 5. Student Dashboard & Padua Assist NLP Chatbot
**Route**: `/dashboard/student`

| Section / Component | Key Functionality |
| :--- | :--- |
| **Academic Performance Card** | Summary of enrolled subjects, latest quarterly marks, and general weighted average (GWA). |
| **Domain Risk Radar** | Student-friendly visual balance wheel illustrating personal wellness and academic balance. |
| **Padua Assist NLP Chatbot** | 24/7 conversational companion offering empathetic listening, study strategies, and immediate crisis helpline routing. |
| **Daily Mood & Wellness Check-in**| 5-point emotional status logger with optional stress factor tags and uplifting personalized advice. |
| **Action Plan Milestones** | Interactive checklist of assigned academic recovery tasks and guidance counselor recommendations. |
| **Appointment Request Modal** | Confidential one-click form to request a private face-to-face consultation with a guidance counselor. |

---

### 6. Parent / Guardian Dashboard
**Route**: `/dashboard/parent`

| Section / Component | Key Functionality |
| :--- | :--- |
| **Student Academic Dossier** | Clear, jargon-free summary of child's subject grades, general average, and academic standing. |
| **Attendance & Punctuality Monitor**| Real-time calendar displaying presence, tardiness, and verified/unverified absences. |
| **Guidance Advisory Alerts** | Direct notices from teachers and counselors regarding academic milestones or support needs. |
| **Consultation Booking Hub** | Select preferred time slots to schedule conferences with the student's class adviser or guidance counselor. |
| **Parenting & Study Resources** | Curated articles on creating effective home study environments and supporting adolescent mental health. |

---

### 7. Profile & Account Settings
**Route**: `/dashboard/profile`
- **Personal Details**: Update full name, contact information, profile biography, and institutional ID number.
- **Permanent Avatar Customizer**: Upload personal profile photos or select from themed SAPC avatar presets (persisted across sessions and cloud storage).
- **Security & Password Management**: Change account password, view active session details, and toggle Two-Factor Authentication (2FA).
- **Privacy & Compliance**: Download account data archive and review RA 10173 data privacy consent status.

---

### 8. In-App Documentation Hub
**Route**: `/dashboard/docs`
- Interactive documentation viewer rendering technical manuals, AHP mathematical specifications, chatbot architecture guides, and user manuals directly within the application layout.

---

## Data Privacy (RA 10173) & Security Architecture

SAPC IntellySys strictly adheres to the **Philippine Republic Act No. 10173 (Data Privacy Act of 2012)**:

1. **Principle of Proportionality & Purpose Specification**:
   - Data collection is strictly confined to attributes necessary for identifying academic risk and providing early intervention.
2. **Access Isolation & Confidentiality**:
   - Mental health evaluations, psychological survey responses, and NLP crisis chatbot logs are strictly restricted to Registered Guidance Counselors.
   - Administrators and Teachers receive anonymized or categorized risk indicators without raw mental health details.
3. **Immutable Audit Logging**:
   - Every dataset upload, record edit, role change, and profile update is timestamped and recorded in the immutable audit log with user email and action details.
4. **Data Encryption & Storage Security**:
   - Sensitive records are secured via Firebase Authentication tokenization, Firestore Security Rules, and browser-level scoped caching.

---

## Tech Stack & Local Deployment

### Technology Stack
- **Frontend Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) + [Lucide React Icons](https://lucide.dev/)
- **Authentication & Realtime Cloud**: [Firebase Auth](https://firebase.google.com/docs/auth) & [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Optional Local API**: [FastAPI (Python 3.11+)](https://fastapi.tiangolo.com/) + SQLite / JSON Datasets
- **Charts & Visualization**: Canvas-based Radars, SVG Sparklines, and Custom Heatmap Matrix components

### Getting Started Locally

```bash
# 1. Clone the repository
git clone https://github.com/acaballero2010/sapc.git
cd sapc

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Start the Next.js development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:3000
```

### Running Backend Services (Optional)
```bash
# In a new terminal, navigate to backend directory
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## Authors & Institutional Attribution
- **San Antonio de Padua College (SAPC)** — Junior High School Guidance & Academic Affairs
- **System**: SAPC IntellySys Multi-Factor Student Failure Decision Support System
- **Compliance**: Philippine Data Privacy Act of 2012 (RA 10173) | DepEd Order No. 40, s. 2012 (Child Protection Policy)
