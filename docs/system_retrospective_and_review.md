# SAPC IntellySys: Comprehensive Retrospective & System Review

**System**: San Antonio de Padua College — Multi-Factor Student Failure Decision Support System (SAPC IntellySys)  
**Evaluation Scope**: 5 Stakeholder Portals, AHP 5-Domain Decision Model, Triage Engine, Data Ingestion, Privacy Safeguards, Resend/SMS Gateway, and Interactive Tools.  
**Review Date**: September 20, 2026  
**Status**: Ready for Institutional Defense & Production Deployment

---

## 1. Executive Summary & Architecture Overview

SAPC IntellySys was engineered to solve high-school academic failure and dropout risks at **San Antonio de Padua College (Pila, Laguna)** by analyzing both academic and non-academic drivers using the **Analytic Hierarchy Process (AHP)** multi-criteria decision framework.

```mermaid
flowchart TD
    subgraph Data Sources
        SASS[SASS Academic / Gradebook]
        MH[PHQ-9 & GAD-7 Screenings]
        FAM[Family Background Surveys]
        FIN[Financial / ESC Voucher Data]
        CHAT[AI Companion Chatbot NLP]
    end

    subgraph AHP Decision Support Engine
        AHP[AHP 5-Domain Weighted Synthesis]
        CR[Consistency Ratio CR = 0.042 < 0.10]
        TRIAGE[Real-Time Crisis Triage Queue]
    end

    subgraph Stakeholder Portals
        STU[🎓 Student Portal]
        TEA[📚 Teacher Portal]
        COU[🧠 Counselor Portal]
        PAR[👨‍👩‍👦 Parent Portal]
        ADM[⚙️ Admin Portal]
    end

    subgraph Dispatch & Governance
        RESEND[Resend Email Gateway]
        SMS[Semaphore / Twilio SMS]
        PRIVACY[RA 10173 & RA 11036 Guardrails]
    end

    Data Sources --> AHP Decision Support Engine
    AHP Decision Support Engine --> Stakeholder Portals
    Stakeholder Portals --> Dispatch & Governance
```

---

## 2. Comprehensive Portal & Workflow Audit

### 🎓 1. Student Portal (`/dashboard/student`)
| Module / Workflow | Current Status | Findings & Verified Capabilities | Potential Gap / Future Enhancement |
| :--- | :---: | :--- | :--- |
| **5-Domain Holistic Radar** | ✅ Complete | Interactive radar chart scaling Acad 30%, Fam 20%, Health 20%, MH 15%, Fin 15%. | Add historical quarter-by-quarter radar overlay. |
| **Self Mood Check-in** | ✅ Complete | Daily mood scale (1–5), trigger tags, and sentiment recording. | Auto-suggest breathing exercise or counselor check-in upon rating 1. |
| **AI Guidance Companion** | ✅ Complete | NLP distress keyword detector triggering instant triage alerts with consent safeguards. | Support voice-to-text input in Tagalog/English. |
| **Academic Goals & Recovery** | ✅ Complete | "What-If" Academic Recovery simulator with custom GPA & attendance targets. | Allow student to save simulation target directly as personal milestone. |
| **RA 10173 Consent Manager** | ✅ Complete | Toggleable granular consent for parent viewing and counselor data access. | Add downloadable PDF copy of Signed Consent Record. |

---

### 📚 2. Teacher & Adviser Portal (`/dashboard/teacher`)
| Module / Workflow | Current Status | Findings & Verified Capabilities | Potential Gap / Future Enhancement |
| :--- | :---: | :--- | :--- |
| **Multi-Domain SASS Ingestion** | ✅ Complete | Ingestion wizard supporting CSV uploads for Students, Grades, Attendance, and Behavior. | Add drag-and-drop Excel (`.xlsx`) sheet auto-parser. |
| **Early Warning Gradebook** | ✅ Complete | Highlights learners failing competencies ($<75$) or high absences ($>3$ days). | Include printable DepEd Form 137 batch sheet. |
| **Counselor Referral Engine** | ✅ Complete | 1-click student referral modal with urgency level, behavioral observations, and adviser sign-off. | Add auto-email alert to Counselor upon referral submission. |
| **Case Conferences** | ✅ Complete | Booking engine integrated with Resend Email and Philippine SMS notifications. | Include automated Google Meet link generation. |

---

### 🧠 3. Counselor Portal (`/dashboard/guidance`)
| Module / Workflow | Current Status | Findings & Verified Capabilities | Potential Gap / Future Enhancement |
| :--- | :---: | :--- | :--- |
| **Crisis Triage Command Center** | ✅ Complete | Real-time red/orange/yellow triage queue with keyword extraction & conversation logs. | Add audible push tone for Level 1 Urgent Ideation alerts. |
| **500-Student Cohort Registry** | ✅ Complete | Complete mock dataset with search, section filter, risk badges, and pagination. | Add multi-select bulk intervention assignment. |
| **Screenings (PHQ-9 & GAD-7)** | ✅ Complete | Standardized mental health screening tools with auto-scoring and severity classification. | Add historical longitudinal score comparison graph. |
| **Intervention Workflow** | ✅ Complete | Full lifecycle: Create $\to$ Approve $\to$ Assign $\to$ Track Outcomes $\to$ Evaluate Delta. | Add digital signature pad for Registered Guidance Counselor (RGC). |
| **AHP Recovery Simulator** | ✅ Complete | Client-side & server-side AHP math solver predicting risk drops. | Add PDF export of simulated recovery contract. |

---

### 👨‍👩‍👦 4. Parent Portal (`/dashboard/parent`)
| Module / Workflow | Current Status | Findings & Verified Capabilities | Potential Gap / Future Enhancement |
| :--- | :---: | :--- | :--- |
| **Child Wellness Journey** | ✅ Complete | Consent-gated progress view with layman explanations of risk metrics. | Add SMS magic-link login option for parents without email. |
| **Active Care Transparency** | ✅ Complete | Parents see assigned interventions, handling teacher/counselor, and expected outcomes. | Add 1-click "Acknowledge Support at Home" confirmation button. |
| **Consultation Scheduler** | ✅ Complete | Interactive modal with In-Person, Virtual (Google Meet), and Phone call modalities. | Display counselor's available calendar slots in real-time. |
| **Family / Financial Surveys** | ✅ Complete | Easy intake forms for family dynamics and ESC tuition assistance requests. | Auto-sync results into the AHP Family and Financial sub-scores. |

---

### ⚙️ 5. Administrator Portal (`/dashboard/admin`)
| Module / Workflow | Current Status | Findings & Verified Capabilities | Potential Gap / Future Enhancement |
| :--- | :---: | :--- | :--- |
| **Command Center & Health** | ✅ Complete | Bird's-eye metrics across 500 students, active staff accounts, and completion rates. | Add server latency and Firestore database status indicators. |
| **AHP Criteria Customizer** | ✅ Complete | Interactive weight sliders with real-time Consistency Ratio ($CR$) calculation ($CR < 0.10$). | Include preset profiles (e.g., Exam Season Weighting, Post-Disaster Weighting). |
| **Ingestion Hub & Rollback** | ✅ Complete | System-wide ingestion with audit trail and 1-click batch undo/revert engine. | Add automated daily database backup to Firebase Storage. |
| **Security & User Management** | ✅ Complete | Manage roles, reset credentials, and review RA 10173 data privacy access logs. | Add 2-Factor Authentication (2FA) for Admin & Counselor accounts. |

---

## 3. Cross-Cutting Capabilities Matrix

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             SAPC INTELLYSYS SUITE                                │
├──────────────────────────┬──────────────────────────┬────────────────────────────┤
│ 🌙 Dark / Light Modes    │ 🌐 Multi-Language (i18n) │ 📅 Academic Calendar Sync  │
│ • LocalStorage saved     │ • 🇺🇸 English (Academic)  │ • Agenda & Month views     │
│ • System OS preference   │ • 🇵🇭 Filipino (Tagalog)  │ • Google Calendar Link     │
│ • Dark scrollbars        │ • 🇵🇭 Cebuano (Bisaya)    │ • iCal (.ICS) Export       │
├──────────────────────────┼──────────────────────────┼────────────────────────────┤
│ 🖨️ Export Reports Center │ 🔔 Global Notifications  │ 🚀 Instant 1-Click Logins  │
│ • DepEd Form 138 PDF     │ • Slide-over drawer      │ • Counselor / Teacher      │
│ • 500-Student CSV        │ • Filter by category     │ • Parent / Student / Admin │
│ • AHP Matrix JSON        │ • Jump-to-tab navigation │ • Zero password friction   │
└──────────────────────────┴──────────────────────────┴────────────────────────────┘
```

---

## 4. Identified Gaps & Recommended Next Steps

### 🎯 High-Impact Enhancements for Next Milestone:
1. **Audible Crisis Sound Cue**: Optional gentle audio chime in the Counselor Command Center when a critical Level 1 distress alert is ingested from the NLP chatbot.
2. **Digital RGC Signature Pad**: Add HTML5 canvas signature pad in `ReportExportModal.tsx` so counselors can sign Form 138 / progress reports directly on tablets/laptops.
3. **Automated Backup Cron**: Configure periodic snapshotting of the 500-student database to cloud storage with JSON backup logs.
4. **Offline PWA Service Worker**: Cache core dashboards for viewing even during internet outages in rural school areas.
