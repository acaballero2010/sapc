# SAPC IntellySys: Release Notes & Version Changelog

All notable changes, enhancements, algorithms, and compliance updates for the SAPC IntellySys platform are documented in this file.

---

## [Version 2.5.0] — September 2026 (Current Production)

### 🌟 Major Highlights
* **Google Gemini 2.5 Flash AI Guidance Companion**:
  * Integrated multi-turn conversational AI companion with dedicated guidance counselor empathetic system instructions.
  * Native fluency in Filipino / Tagalog / Taglish for natural student rapport.
  * Automated crisis triage: detects acute distress triggers and provides immediate hotline routing (NCMH 1553).
* **Interactive System Documentation Hub (`/dashboard/docs`)**:
  * In-app interactive documentation portal with live AHP sandbox calculator, system architecture specs, tech stack breakdown, and FAQs.
* **Streamlined Student Chat UI**:
  * Replaced intimidating technical sentiment telemetry strips with a warm, student-friendly &quot;AI Powered&quot; Sparkles interface.

### 🛡️ Decision Support & Analytics
* **Saaty AHP 5-Domain Mathematical Engine**:
  * Psychometrician-validated comparison matrix ($n=5$, $\lambda_{\max} = 5.073$, $CR = 0.0163 \le 0.10$).
  * Dynamic dominant risk driver isolation and targeted care recommendation matrices.
* **Deterministic Academic Risk ($S_{AC}$)**:
  * Penalties for failing subjects (up to +50 pts), GPA bands (up to +30 pts), absenteeism (up to +15 pts), and incompletes (up to +10 pts).

### 🔒 Security & Data Privacy
* **RA 10173 Granular Consent Controls**:
  * Explicit student/parent telemetry and screening consent controls.
  * Encrypted clinical screening logs under counselor privilege.

---

## [Version 2.4.0] — August 2026

### ✨ New Features
* **3-Step DepEd SASS CSV Ingestion Wizard**:
  * Ingest quarterly academic spreadsheets with live column mapping and type sanitization.
* **In-Browser CSV Table Editor**:
  * Edit student marks and attendance directly in the web UI.
* **Rollback & Revert Engine**:
  * Cryptographic SHA-256 batch logs enabling 1-click batch revert for flawed imports.
* **Sensitivity Simulator**:
  * Interactive what-if simulation sliders for all 5 domains on the sidebar.

---

## [Version 2.0.0] — June 2026

### 🚀 Core Architecture Overhaul
* Migration to **Next.js 14 App Router** with TypeScript and Tailwind CSS.
* **FastAPI Async REST Engine** with Pydantic v2 schemas.
* **5 Dedicated Role Portals**: Admin, Guidance Counselor, Teacher, Student, Parent.
* Integration of **PHQ-9 (Depression)** and **GAD-7 (Anxiety)** standardized clinical assessment tools.

---

## [Version 1.0.0] — January 2026

### 📦 Initial Prototype
* Basic GPA and attendance threshold tracking.
* SQLite prototype database.
* Initial stakeholder interviews and psychometrician weight calibration.
