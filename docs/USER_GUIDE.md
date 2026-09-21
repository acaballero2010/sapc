# SAPC IntellySys: Comprehensive User Guide & Role Operations Manual

Welcome to the **SAPC IntellySys User Operations Manual**. This guide provides step-by-step instructions for each stakeholder role in the San Antonio de Padua College Decision Support System.

---

## Quick Navigation
1. [Guidance Counselor Portal](#1-guidance-counselor-portal)
2. [Teacher & Class Adviser Portal](#2-teacher--class-adviser-portal)
3. [School Administrator Portal](#3-school-administrator-portal)
4. [Student Portal](#4-student-portal)
5. [Parent & Guardian Portal](#5-parent--guardian-portal)
6. [Emergency Protocols & Crisis Escalation](#6-emergency-protocols--crisis-escalation)

---

## 1. Guidance Counselor Portal

The Guidance Counselor Portal is the primary crisis response, psychological evaluation, and intervention management workspace.

### Key Workflows:
1. **Command Center & Triage**:
   * View live institution-wide risk distribution across Low, Medium, and High tiers.
   * Review urgent notifications and distress flags from the AI companion.
2. **Crisis Alerts Queue (`?tab=crisis_alerts`)**:
   * Filter students flagged for immediate mental health, family crisis, or compound risk.
   * Click **Case Deep-Dive** to open longitudinal timeline logs and trigger emergency outreach.
3. **Standardized Screenings (`?tab=assessments`)**:
   * Review PHQ-9 (Depression) and GAD-7 (Anxiety) screening scores.
   * Evaluate screener answers against the 5-domain risk profile.
4. **Master Care Plans (`?tab=interventions`)**:
   * Assign evidence-based interventions (Peer Tutoring, Guidance Intake, Financial Aid, PTC Case Conference, Medical Review).
   * Update intervention milestones and log case notes.
5. **AI Companion Auditing (`?tab=chat_history`)**:
   * Access consented chat session logs flagged with high distress sentiment for proactive intervention.

---

## 2. Teacher & Class Adviser Portal

The Teacher Portal equips educators with tools to monitor classroom dynamics, ingest academic records, and track students requiring academic accommodations.

### Key Workflows:
1. **Advisory Class Roster (`?tab=students`)**:
   * Inspect all enrolled students in your advisory section with their composite risk badges.
   * Identify students with failing grades or excessive absences at a glance.
2. **DepEd SASS CSV Ingestion Wizard (`?tab=import_wizard`)**:
   * **Step 1: Upload**: Drag and drop your quarterly DepEd School Assessment System CSV file.
   * **Step 2: Column Mapping & Validation**: Confirm column headers (`student_id`, `student_name`, `grade_level`, `section`, `quarter_gpa`, `failing_subjects_count`, `days_absent`, `incomplete_requirements_count`).
   * **Step 3: Ingestion & Live Re-calculation**: Confirm import to immediately update all AHP academic risk scores ($S_{AC}$).
3. **In-Browser CSV Editor & Revert Engine (`?tab=csv_editor` & `?tab=revert_import`)**:
   * Fix typo entries directly before saving.
   * Roll back any accidental batch import with a single click.
4. **Interventions & Milestones (`?tab=log_progress`)**:
   * Record remedial tutoring attendance and academic progress notes for students in your class.

---

## 3. School Administrator Portal

The Administrator Portal oversees institutional configuration, account management, and system-wide compliance.

### Key Workflows:
1. **AHP 5-Domain Configuration (`?tab=risk_config`)**:
   * Review psychometrician-validated weights (Academic: 30%, Family: 20%, Health: 20%, Mental Health: 15%, Financial: 15%).
   * Perform sensitivity analysis and consistency ratio validation ($CR \le 0.10$).
2. **Campus Accounts & Security (`?tab=create_user` & `?tab=teachers`)**:
   * Create faculty, counselor, and student credentials.
   * Export initial credentials for distribution.
3. **Master Import Ingestion & Rollback (`?tab=import_wizard` & `?tab=import_history`)**:
   * Perform school-wide quarterly grade and enrollment sync.
   * Inspect audit logs with cryptographic batch identifiers.
4. **DepEd & CHED Reporting (`?tab=reports`)**:
   * Generate institutional retention metrics, cohort longitudinal trends, and accreditation reports.

---

## 4. Student Portal

The Student Portal empowers learners to monitor their holistic well-being, seek confidential guidance, and build academic resilience.

### Key Workflows:
1. **Holistic Wellness Radar (`?tab=progress`)**:
   * View your 5-domain wellness polygon showing balance across Academic, Physical, Mental, Family, and Financial wellness.
2. **AI Guidance Companion (Floating Sparkles Button)**:
   * Chat confidentially in Tagalog, English, or Taglish with the AI Guidance Counselor.
   * Receive practical study tips, stress reduction exercises, and campus resource recommendations.
3. **Daily Mood & Screeners (`?tab=mental_assessment` & `?tab=health_assessment`)**:
   * Log daily mood check-ins and complete periodic wellness screeners.
4. **Academic Simulator (`?tab=forecast`)**:
   * Simulate upcoming exam scores and attendance to see how your GPA and academic standing improve.
5. **Data Privacy & Consents (`?tab=privacy`)**:
   * Control your data sharing preferences in compliance with RA 10173.

---

## 5. Parent & Guardian Portal

The Parent Portal bridges the home-school partnership, keeping families informed and engaged in their child's holistic growth.

### Key Workflows:
1. **Child's Wellness Journey (`?tab=child_progress`)**:
   * View consolidated progress updates and wellness status indicators.
2. **Report Card & Attendance (`?tab=academic_reports` & `?tab=attendance`)**:
   * Access official DepEd Form 138 quarterly grades and attendance logs.
3. **Home Support Acknowledgments (`?tab=acknowledge_intervention`)**:
   * Review and acknowledge joint home-school action plans designed by the counselor and teacher.
4. **Request PTC Meeting (`?tab=schedule_meeting`)**:
   * Request parent-teacher-counselor conferences directly through the portal calendar.

---

## 6. Emergency Protocols & Crisis Escalation

If a student expresses acute distress or self-harm ideation:
1. **AI Automated Triage**: The AI companion detects high-distress sentiment, outputs emergency hotline numbers immediately (National Center for Mental Health: 1553), and generates an urgent Counselor Crisis Alert.
2. **Counselor Protocol**:
   * The Guidance Counselor is alerted via the live Command Center.
   * The counselor conducts an immediate walk-in intake or outreach to the student's designated emergency contact.
   * A formal multi-disciplinary case conference is convened within 24 hours.
