from typing import Optional
from sqlalchemy.orm import Session
from fastapi import Request
from app.models.audit import AuditLog
from app.models.user import User

class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        actor: Optional[User],
        action: str,
        target_resource: str,
        details: Optional[str] = None,
        request: Optional[Request] = None
    ) -> AuditLog:
        """
        Records an audit event in compliance with the Philippine Data Privacy Act (RA 10173).
        """
        ip_address = request.client.host if request and request.client else None
        user_agent = request.headers.get("user-agent") if request else None
        actor_id = actor.id if actor else None
        actor_role = actor.role.value if actor and hasattr(actor.role, "value") else (actor.role if actor else "anonymous")

        audit_entry = AuditLog(
            actor_id=actor_id,
            actor_role=str(actor_role),
            action=action,
            target_resource=target_resource,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details
        )
        db.add(audit_entry)
        db.commit()
        return audit_entry
