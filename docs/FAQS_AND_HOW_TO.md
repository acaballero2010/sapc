# SAPC IntellySys: Frequently Asked Questions (FAQs) & Step-by-Step How-To Guides

**Institution**: San Antonio de Padua College  
**System**: SAPC IntellySys Multi-Criteria Decision Support System  
**Version**: 2.5.0  

---

## Table of Contents
1. [General System FAQs](#1-general-system-faqs)
2. [AHP Risk Assessment FAQs](#2-ahp-risk-assessment-faqs)
3. [Teacher & Adviser How-To Guides](#3-teacher--adviser-how-to-guides)
   - How to Ingest DepEd SASS CSV Files
   - How to Edit Records In-Browser
   - How to Roll Back a Flawed CSV Upload
   - How to Log Remedial Progress
4. [Guidance Counselor How-To Guides](#4-guidance-counselor-how-to-guides)
   - How to Triage an Urgent Crisis Flag
   - How to Administer PHQ-9 & GAD-7 Screeners
   - How to Create a Master Care Plan
   - How to Audit Consented AI Chat Logs
5. [Administrator How-To Guides](#5-administrator-how-to-guides)
   - How to Audit AHP Weights and Consistency
   - How to Provision Campus Accounts
   - How to Export DepEd/CHED Compliance Reports
6. [Student & Parent How-To Guides](#6-student--parent-how-to-guides)
   - How to Use the AI Guidance Counselor Companion
   - How to Run the Academic Simulator
   - How to Acknowledge Home Support (Parents)
   - How to Request a PTC Conference

---

## 1. General System FAQs

### Q1: What is SAPC IntellySys?
**A**: SAPC IntellySys is an AI-powered early warning and Decision Support System (DSS) developed for San Antonio de Padua College. It synthesizes academic metrics (GPA, failing subjects, absences) with non-academic indicators (family stability, physical health, mental wellness, financial status) using the Analytic Hierarchy Process (AHP) to prevent student dropouts and coordinate timely interventions.

### Q2: Is the AI Guidance Counselor replacing human counselors?
**A**: **No.** The AI Guidance Companion (powered by Google Gemini 2.5 Flash) is a confidential 24/7 listening and support tool. All formal assessments, crisis triage, psychiatric referrals, and disciplinary decisions are exclusively performed by registered Guidance Counselors and faculty.

### Q3: Is my data safe under Philippine privacy laws?
**A**: **Yes.** SAPC IntellySys strictly adheres to Republic Act No. 10173 (Data Privacy Act of 2012) and DepEd Order No. 40, s. 2012. Data is encrypted using AES-256 at rest and TLS 1.3 in transit. Sensitive mental health responses are protected under counselor-client privilege.

---

## 2. AHP Risk Assessment FAQs

### Q4: Why is a student flagged as "Medium Risk" when their GPA is 88?
**A**: Academic performance accounts for $30\%$ of the composite risk score. If a student experiences severe non-academic distress (e.g., high mental health distress score of $90$ or acute family instability score of $85$), their composite score may exceed $40.0$, classifying them as Medium Risk to ensure they receive holistic emotional or financial support before grades decline.

### Q5: What is the Consistency Ratio (CR) and why does it matter?
**A**: In Saaty's Analytic Hierarchy Process, the Consistency Ratio measures whether pairwise comparisons among criteria are logically transitive. Our matrix has a $CR = 0.0163$ ($1.63\%$), which is far below the $0.10$ ($10\%$) threshold required for mathematical consistency.

---

## 3. Teacher & Adviser How-To Guides

### How to Ingest DepEd SASS CSV Files
1. Navigate to **DepEd SASS Hub** &rarr; **3-Step Import Wizard** (`/dashboard/teacher?tab=import_wizard`).
2. **Step 1**: Drag and drop your quarterly DepEd CSV file or click to browse.
3. **Step 2**: Inspect the column preview. Ensure columns match: `student_id`, `student_name`, `grade_level`, `section`, `quarter_gpa`, `failing_subjects_count`, `days_absent`, `incomplete_requirements_count`.
4. **Step 3**: Click **Confirm & Process Ingestion**. The system will calculate academic risk penalties and immediately update student dashboards.

### How to Edit Records In-Browser
1. Go to **CSV Ingestion Hub** &rarr; **In-Browser CSV Editor** (`/dashboard/teacher?tab=csv_editor`).
2. Select the student row you wish to modify.
3. Double-click the cell (e.g., update `days_absent` from $6$ to $2$ after medical excuse submission).
4. Click **Save Changes**. The student's academic sub-score ($S_{AC}$) updates automatically.

### How to Roll Back a Flawed CSV Upload
1. Go to **CSV Ingestion Hub** &rarr; **Revert Rollback** (`/dashboard/teacher?tab=revert_import`).
2. Find the erroneous batch identifier (e.g., `BATCH-2026-Q2-004`).
3. Click **Rollback Batch**. The previous state is restored within seconds.

---

## 4. Guidance Counselor How-To Guides

### How to Triage an Urgent Crisis Flag
1. Go to **Crisis Response** &rarr; **Crisis Alerts Queue** (`/dashboard/guidance?tab=crisis_alerts`).
2. Identify cases flagged with **HIGH RISK** or **EMERGENCY DISTRESS**.
3. Click **Open Case File** to review longitudinal wellness trends.
4. Initiate a confidential intake interview or contact the student's designated emergency guardian.

### How to Administer PHQ-9 & GAD-7 Screeners
1. Navigate to **Student Profiles** &rarr; **PHQ-9 / GAD-7 Screenings** (`/dashboard/guidance?tab=assessments`).
2. Select the student and choose **New Clinical Assessment**.
3. Record item responses (0–3 scale across 9 PHQ-9 or 7 GAD-7 items).
4. Click **Compute Severity**. The clinical score automatically updates the Mental Health sub-score ($S_{MH}$).

---

## 5. Administrator How-To Guides

### How to Audit AHP Weights and Consistency
1. Go to **Platform Config** &rarr; **AHP 5-Domain Risk Config** (`/dashboard/admin?tab=risk_config`).
2. Inspect the current weights:
   * Academic: $0.30$
   * Family: $0.20$
   * Health: $0.20$
   * Mental Health: $0.15$
   * Financial: $0.15$
3. Review the Principal Eigenvalue ($\lambda_{max} = 5.073$) and Consistency Ratio ($CR = 0.016$).

---

## 6. Student & Parent How-To Guides

### How to Use the AI Guidance Counselor Companion
1. Click the floating **AI Counselor** button (Sparkles icon) in the bottom-right corner.
2. Type your question or share how you are feeling in English, Tagalog, or Taglish.
3. The companion will offer empathetic listening, cognitive reframing, and campus resource suggestions.
4. If you are experiencing high stress, the assistant will provide immediate direct contacts for SAPC guidance staff and the 24/7 National Center for Mental Health (1553) hotline.

### How to Acknowledge Home Support (Parents)
1. Go to **Care & Interventions** &rarr; **Acknowledge Home Support** (`/dashboard/parent?tab=acknowledge_intervention`).
2. Review the joint action items established with the class teacher and counselor (e.g., designated home study schedule, clinic follow-up).
3. Click **Acknowledge & Support Plan** to confirm agreement.
