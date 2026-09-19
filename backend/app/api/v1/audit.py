from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.audit import AuditLog
from app.api.deps import require_admin, require_counselor_or_admin

router = APIRouter()

class AuditLogOut(BaseModel):
    id: int
    actor_id: Optional[int] = None
    actor_role: str
    action: str
    target_resource: str
    ip_address: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

@router.get("/logs", response_model=List[AuditLogOut])
def get_audit_logs(
    limit: int = 100,
    action: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_counselor_or_admin)
):
    """
    RA 10173 Compliance Audit Trail:
    Provides transparency of all accesses to student records, grades, psychiatric notes, and chatbot alerts.
    """
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    logs = query.order_by(AuditLog.id.desc()).limit(limit).all()
    return logs
