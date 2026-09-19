from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student, Parent
from app.models.risk import ParentNotification, NotificationChannel, NotificationStatus, RiskScore
from app.api.deps import get_current_user, require_faculty
from app.services.audit_service import AuditService

router = APIRouter()

class NotificationDispatchCreate(BaseModel):
    student_id: int
    parent_contact: str
    channel: NotificationChannel = NotificationChannel.BOTH
    notification_type: str = "case_conference"
    subject: str
    message_body: str
    meeting_date: Optional[datetime] = None
    meeting_location: Optional[str] = "Room 204 Guidance Center, SAPC"

class ParentNotificationOut(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    sender_id: int
    sender_name: Optional[str] = None
    parent_contact: str
    channel: NotificationChannel
    notification_type: str
    subject: str
    message_body: str
    meeting_date: Optional[datetime] = None
    meeting_location: Optional[str] = None
    status: NotificationStatus
    created_at: datetime
    acknowledged_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AcknowledgeRequest(BaseModel):
    action: str = "confirm" # "confirm" or "reschedule"
    notes: Optional[str] = None

DEFAULT_TEMPLATES = [
    {
        "id": "case_conference_taglish",
        "title": "Case Conference Invite (Taglish / Collaborative)",
        "subject": "SAPC Guidance Office: Parent-Teacher-Counselor Collaborative Case Conference",
        "channel": "both",
        "body": "Magandang araw po mula sa San Antonio de Padua College (SAPC) Guidance Center. Nais po namin kayong anyayahan sa isang maikling Parent-Counselor Consultation upang magtulungan sa academic at personal growth ng inyong anak. Mangyaring kumpirmahin po ang inyong pagdalo. Maraming salamat po sa inyong suporta!"
    },
    {
        "id": "attendance_alert",
        "title": "Attendance & Participation Warning (Bilingual)",
        "subject": "SAPC Student Attendance & Classroom Engagement Notice",
        "channel": "sms",
        "body": "SAPC Attendance Advisory: Magandang araw po. Napansin po ng Adviser ang ilang unexcused absences ng inyong anak ngayong quarter. Hinihiling po namin ang inyong koordinasyon upang maiwasan ang academic risk penalties. Salamat po."
    },
    {
        "id": "academic_remediation_notice",
        "title": "Academic Remediation & Peer Tutoring Referral",
        "subject": "SAPC Academic Support & Subject Remediation Opportunity",
        "channel": "email",
        "body": "Greetings from San Antonio de Padua College. As part of our early failure prevention program, we would like to offer your child a slot in the SAPC Peer Tutoring & Subject Remediation Circle. We invite you to a brief orientation meeting regarding this support service."
    }
]

@router.get("/templates")
def get_notification_templates(current_user: User = Depends(get_current_user)):
    return DEFAULT_TEMPLATES

@router.post("/dispatch", response_model=ParentNotificationOut)
def dispatch_parent_alert(
    data: NotificationDispatchCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    """
    Dispatches a multi-channel (SMS/Email) parent notification.
    Logs immutable audit trail under RA 10173.
    """
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    notification = ParentNotification(
        student_id=data.student_id,
        sender_id=current_user.id,
        parent_contact=data.parent_contact,
        channel=data.channel,
        notification_type=data.notification_type,
        subject=data.subject,
        message_body=data.message_body,
        meeting_date=data.meeting_date,
        meeting_location=data.meeting_location,
        status=NotificationStatus.SENT
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    # RA 10173 Audit
    AuditService.log_event(
        db=db,
        actor=current_user,
        action="DISPATCH_PARENT_ALERT",
        target_resource=f"student_id:{data.student_id},channel:{data.channel.value}",
        details=f"Dispatched {data.channel.value} meeting alert to {data.parent_contact} for {student.first_name} {student.last_name}",
        request=request
    )

    return ParentNotificationOut(
        id=notification.id,
        student_id=notification.student_id,
        student_name=f"{student.first_name} {student.last_name}",
        sender_id=notification.sender_id,
        sender_name=current_user.full_name,
        parent_contact=notification.parent_contact,
        channel=notification.channel,
        notification_type=notification.notification_type,
        subject=notification.subject,
        message_body=notification.message_body,
        meeting_date=notification.meeting_date,
        meeting_location=notification.meeting_location,
        status=notification.status,
        created_at=notification.created_at,
        acknowledged_at=notification.acknowledged_at
    )

@router.get("/student/{student_id}", response_model=List[ParentNotificationOut])
def get_student_notifications(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    notifications = db.query(ParentNotification).filter(
        ParentNotification.student_id == student_id
    ).order_by(ParentNotification.created_at.desc()).all()

    return [
        ParentNotificationOut(
            id=n.id,
            student_id=n.student_id,
            student_name=f"{student.first_name} {student.last_name}",
            sender_id=n.sender_id,
            sender_name=n.sender.full_name if n.sender else "Faculty",
            parent_contact=n.parent_contact,
            channel=n.channel,
            notification_type=n.notification_type,
            subject=n.subject,
            message_body=n.message_body,
            meeting_date=n.meeting_date,
            meeting_location=n.meeting_location,
            status=n.status,
            created_at=n.created_at,
            acknowledged_at=n.acknowledged_at
        )
        for n in notifications
    ]

@router.get("/parent-inbox", response_model=List[ParentNotificationOut])
def get_parent_inbox(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns alerts received by the logged-in parent or all active alerts for demo.
    """
    notifications = db.query(ParentNotification).order_by(ParentNotification.created_at.desc()).all()
    results = []
    for n in notifications:
        s = n.student
        results.append(ParentNotificationOut(
            id=n.id,
            student_id=n.student_id,
            student_name=f"{s.first_name} {s.last_name}" if s else "Student",
            sender_id=n.sender_id,
            sender_name=n.sender.full_name if n.sender else "Guidance Office",
            parent_contact=n.parent_contact,
            channel=n.channel,
            notification_type=n.notification_type,
            subject=n.subject,
            message_body=n.message_body,
            meeting_date=n.meeting_date,
            meeting_location=n.meeting_location,
            status=n.status,
            created_at=n.created_at,
            acknowledged_at=n.acknowledged_at
        ))
    return results

@router.post("/{notification_id}/acknowledge")
def acknowledge_notification(
    notification_id: int,
    data: AcknowledgeRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = db.query(ParentNotification).filter(ParentNotification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.status = NotificationStatus.ACKNOWLEDGED if data.action == "confirm" else NotificationStatus.RESCHEDULED
    notification.acknowledged_at = datetime.now(timezone.utc)
    db.commit()

    return {"success": True, "status": notification.status.value, "acknowledged_at": notification.acknowledged_at}
