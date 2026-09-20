# SAPC IntellySys: Multi-Factor Student Failure Decision Support System

A web-based Decision Support System addressing multi-factor student failure causes for San Antonio de Padua College (SAPC).

## Core Features
- **Academic Data Processing**: Ingest SASS CSV exports (grades, attendance, absences, incomplete coursework).
- **Non-Academic Evaluation**: 4 qualitative assessment domains (Mental Health, Health, Financial, Family) through structured surveys, counselor observations, and an NLP-powered student chatbot.
- **Decision Engine**: Multi-Criteria Analytic Hierarchy Process (AHP) weighted risk composite scoring (Psychometrician Validated):
  - Academic: `0.3000` (30%)
  - Family: `0.2000` (20%)
  - Health: `0.2000` (20%)
  - Mental Health: `0.1500` (15%)
  - Financial: `0.1500` (15%)
- **Risk Tiers**:
  - Low Risk: `0.0` – `39.9`
  - Medium Risk: `40.0` – `69.9`
  - High Risk: `70.0` – `100.0`
- **Security & Privacy Compliance**: Role-Based Access Control (RBAC) compliant with the Philippine Data Privacy Act (RA 10173). Mental health records and NLP logs are restricted to authorized Guidance Counselors.
