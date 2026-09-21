import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.student import Student, Section, Parent
from app.models.academic import AcademicRecord
from app.models.assessment import NonAcademicAssessment, CounselorNote, DomainType
from app.models.chatbot import ChatbotSession, ChatMessage, SentimentCategory
from app.models.risk import InterventionPlan, RiskTier, InterventionStatus
from app.services.ahp_engine import AHPEngine
from app.services.sass_parser import SASSParserService

def seed_database():
    print("Dropping and recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    print("Seeding Users...")
    admin_user = User(
        email="admin@sapc.edu.ph",
        hashed_password=get_password_hash("admin123"),
        full_name="Dr. Remedios Santos (Administrator)",
        role=UserRole.ADMIN
    )
    counselor_user = User(
        email="counselor@sapc.edu.ph",
        hashed_password=get_password_hash("counselor123"),
        full_name="Maria Theresa Cruz, RGC (Guidance Counselor)",
        role=UserRole.GUIDANCE_COUNSELOR
    )
    teacher_user = User(
        email="teacher@sapc.edu.ph",
        hashed_password=get_password_hash("teacher123"),
        full_name="Prof. Ernesto Bautista (Class Adviser)",
        role=UserRole.TEACHER
    )
    parent_user = User(
        email="parent@sapc.edu.ph",
        hashed_password=get_password_hash("parent123"),
        full_name="Carmen Dimaculangan (Parent)",
        role=UserRole.PARENT
    )
    student_user1 = User(
        email="student@sapc.edu.ph",
        hashed_password=get_password_hash("student123"),
        full_name="Joshua Dimaculangan",
        role=UserRole.STUDENT
    )
    student_user2 = User(
        email="angelica@sapc.edu.ph",
        hashed_password=get_password_hash("student123"),
        full_name="Angelica Dela Cruz",
        role=UserRole.STUDENT
    )
    student_user3 = User(
        email="mark@sapc.edu.ph",
        hashed_password=get_password_hash("student123"),
        full_name="Mark Anthony Reyes",
        role=UserRole.STUDENT
    )

    db.add_all([admin_user, counselor_user, teacher_user, parent_user, student_user1, student_user2, student_user3])
    db.flush()

    print("Seeding Sections...")
    sec1 = Section(name="Grade 7 - St. Anthony", grade_level="7", adviser_id=teacher_user.id)
    sec2 = Section(name="Grade 8 - St. Benedict", grade_level="8", adviser_id=teacher_user.id)
    sec3 = Section(name="Grade 9 - St. Pedro Calungsod", grade_level="9", adviser_id=teacher_user.id)
    sec4 = Section(name="Grade 10 - St. Thomas Aquinas", grade_level="10", adviser_id=teacher_user.id)
    db.add_all([sec1, sec2, sec3, sec4])
    db.flush()

    print("Seeding Parents & Students...")
    parent_profile = Parent(
        user_id=parent_user.id,
        contact_number="+63 917 123 4567",
        relationship_type="Mother"
    )
    db.add(parent_profile)
    db.flush()

    # Student 1: Joshua (High Risk student with multi-factor academic & mental health flags)
    s1 = Student(
        lrn="109238475612",
        first_name="Joshua",
        last_name="Dimaculangan",
        middle_name="Reyes",
        gender="Male",
        email="student@sapc.edu.ph",
        user_id=student_user1.id,
        parent_id=parent_profile.id,
        section_id=sec1.id
    )

    # Student 2: Angelica (Medium Risk student with financial & attendance strains)
    s2 = Student(
        lrn="109238475613",
        first_name="Angelica",
        last_name="Dela Cruz",
        middle_name="Santos",
        gender="Female",
        email="angelica@sapc.edu.ph",
        user_id=student_user2.id,
        section_id=sec1.id
    )

    # Student 3: Mark (Low Risk student in good academic and social standing)
    s3 = Student(
        lrn="109238475614",
        first_name="Mark Anthony",
        last_name="Reyes",
        middle_name="Castro",
        gender="Male",
        email="mark@sapc.edu.ph",
        user_id=student_user3.id,
        section_id=sec2.id
    )

    db.add_all([s1, s2, s3])
    db.flush()

    print("Seeding SASS Academic Records...")
    # S1 Academic: Low GPA, 2 failed subjects, 11 absences
    risk_s1_acad = AHPEngine.normalize_academic_risk(gpa=73.5, failed_count=2, incomplete_count=1, attendance_rate=78.0, absences=11)
    acad1 = AcademicRecord(
        student_id=s1.id,
        school_year="2025-2026",
        semester="1st",
        quarter="Midterm",
        gpa=73.5,
        failed_subjects_count=2,
        incomplete_subjects_count=1,
        attendance_rate=78.0,
        absences_count=11,
        tardiness_count=5,
        normalized_academic_risk=risk_s1_acad
    )

    # S2 Academic: Moderate GPA, 0 failed, 1 incomplete, 5 absences
    risk_s2_acad = AHPEngine.normalize_academic_risk(gpa=81.0, failed_count=0, incomplete_count=1, attendance_rate=88.5, absences=5)
    acad2 = AcademicRecord(
        student_id=s2.id,
        school_year="2025-2026",
        semester="1st",
        quarter="Midterm",
        gpa=81.0,
        failed_subjects_count=0,
        incomplete_subjects_count=1,
        attendance_rate=88.5,
        absences_count=5,
        tardiness_count=2,
        normalized_academic_risk=risk_s2_acad
    )

    # S3 Academic: High GPA, 0 failed, 100% attendance
    risk_s3_acad = AHPEngine.normalize_academic_risk(gpa=92.5, failed_count=0, incomplete_count=0, attendance_rate=98.0, absences=1)
    acad3 = AcademicRecord(
        student_id=s3.id,
        school_year="2025-2026",
        semester="1st",
        quarter="Midterm",
        gpa=92.5,
        failed_subjects_count=0,
        incomplete_subjects_count=0,
        attendance_rate=98.0,
        absences_count=1,
        tardiness_count=0,
        normalized_academic_risk=risk_s3_acad
    )
    db.add_all([acad1, acad2, acad3])
    db.flush()

    print("Seeding Non-Academic Domain Assessments...")
    # S1 Assessments: High Mental Health distress & Family conflict
    ass_s1_mh = NonAcademicAssessment(
        student_id=s1.id,
        domain=DomainType.MENTAL_HEALTH,
        risk_score=85.0,
        source="counselor_evaluation",
        indicator_summary="High stress, severe anxiety attacks during exam weeks",
        notes="Student reported feeling overwhelmed and hopeless regarding academic expectations."
    )
    ass_s1_fam = NonAcademicAssessment(
        student_id=s1.id,
        domain=DomainType.FAMILY,
        risk_score=75.0,
        source="survey",
        indicator_summary="Parental conflict and financial pressure at home"
    )
    ass_s1_fin = NonAcademicAssessment(
        student_id=s1.id,
        domain=DomainType.FINANCIAL,
        risk_score=50.0,
        source="survey",
        indicator_summary="Occasional delays in tuition fee installment"
    )
    ass_s1_health = NonAcademicAssessment(
        student_id=s1.id,
        domain=DomainType.HEALTH,
        risk_score=35.0,
        source="clinic_record",
        indicator_summary="Frequent tension headaches"
    )

    # S2 Assessments: High Financial strain
    ass_s2_fin = NonAcademicAssessment(
        student_id=s2.id,
        domain=DomainType.FINANCIAL,
        risk_score=80.0,
        source="survey",
        indicator_summary="Pending promissory note for 1st trimester tuition"
    )
    ass_s2_fam = NonAcademicAssessment(
        student_id=s2.id,
        domain=DomainType.FAMILY,
        risk_score=30.0,
        source="survey",
        indicator_summary="Supportive family environment"
    )

    db.add_all([ass_s1_mh, ass_s1_fam, ass_s1_fin, ass_s1_health, ass_s2_fin, ass_s2_fam])
    db.flush()

    print("Seeding Counselor Confidential Notes (RA 10173 Protected)...")
    cn1 = CounselorNote(
        student_id=s1.id,
        counselor_id=counselor_user.id,
        observation_summary="Initial counseling intake session conducted. Joshua shows severe emotional fatigue and fear of letting his parents down.",
        mental_health_indicators="Anxiety (moderate-severe), sleep disturbance, cognitive overload.",
        recommended_action="1. Bi-weekly wellness check-ins. 2. Academic workload pacing plan with adviser. 3. Refer to peer study buddy."
    )
    db.add(cn1)

    print("Seeding Student Chatbot Session with NLP Distress Detection...")
    chat_sess = ChatbotSession(
        student_id=s1.id,
        session_token="seed-chat-session-001",
        aggregate_distress_score=88.0,
        flagged_for_counselor=True,
        flag_reason="Distress detected (hopeless, overwhelmed, anxiety)"
    )
    db.add(chat_sess)
    db.flush()

    msg1 = ChatMessage(
        session_id=chat_sess.id,
        sender="student",
        message_text="I feel completely overwhelmed and hopeless with my math subjects. I don't think I can pass.",
        sentiment=SentimentCategory.DISTRESSED,
        sentiment_score=-0.78,
        distress_keywords_detected="hopeless, overwhelmed",
        inferred_domain="mental_health"
    )
    msg2 = ChatMessage(
        session_id=chat_sess.id,
        sender="bot",
        message_text="I hear how overwhelming things feel right now. I have notified the Guidance Center so counselor Maria can provide safe, confidential guidance.",
        sentiment=SentimentCategory.POSITIVE,
        sentiment_score=0.5,
        inferred_domain="mental_health"
    )
    db.add_all([msg1, msg2])

    print("Seeding Counselor Intervention Plan...")
    intervention1 = InterventionPlan(
        student_id=s1.id,
        counselor_id=counselor_user.id,
        title="Comprehensive Academic & Mental Health Care Plan",
        target_domain="Academic & Mental Health",
        risk_level_at_creation=RiskTier.HIGH,
        description="Structured remediation protocol combining peer math tutoring and weekly counseling consultations.",
        action_items="- Coordinate with Prof. Bautista for Math remediation\n- Weekly counseling sessions every Wednesday 2PM\n- Parent consultation on family expectations",
        status=InterventionStatus.IN_PROGRESS,
        scheduled_followup=datetime.now(timezone.utc) + timedelta(days=7)
    )
    db.add(intervention1)
    db.commit()

    print("Calculating AHP Multi-Criteria Composite Risk for all students...")
    SASSParserService.recalculate_student_risk(db, s1.id)
    SASSParserService.recalculate_student_risk(db, s2.id)
    SASSParserService.recalculate_student_risk(db, s3.id)
    db.commit()

    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
