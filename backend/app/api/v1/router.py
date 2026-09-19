from fastapi import APIRouter
from app.api.v1 import auth, students, academic, assessments, risk_assessment, chatbot, analytics, audit, reports, notifications

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(students.router, prefix="/students", tags=["Students & Sections"])
api_router.include_router(academic.router, prefix="/academic", tags=["Academic & SASS CSV"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["Non-Academic Assessments"])
api_router.include_router(risk_assessment.router, prefix="/risk", tags=["AHP Risk Decision Engine & Interventions"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["NLP Guidance Chatbot & Alerts"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Cohort Analytics"])
api_router.include_router(audit.router, prefix="/audit", tags=["RA 10173 Audit Logs"])
api_router.include_router(reports.router, prefix="/reports", tags=["Institutional DepEd/CHED Reports"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Multi-Channel Parent Alerts"])


