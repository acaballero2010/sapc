from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.models.user import User, UserRole
from app.models.student import Student
from app.schemas.user import Token, UserOut, UserCreate
from app.api.deps import get_current_user
from app.services.audit_service import AuditService

router = APIRouter()

@router.post("/login", response_model=Token)
def login_for_access_token(
    request: Request,
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled")

    # If user is a student, get their student profile id
    student_id = None
    if user.role == UserRole.STUDENT:
        student = db.query(Student).filter(Student.user_id == user.id).first()
        if student:
            student_id = student.id

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id,
        role=user.role.value,
        email=user.email,
        full_name=user.full_name,
        student_id=student_id,
        expires_delta=access_token_expires
    )

    # Log successful login for RA 10173 audit
    AuditService.log_event(
        db=db,
        actor=user,
        action="USER_LOGIN_SUCCESS",
        target_resource=f"user_id:{user.id}",
        details=f"User {user.email} ({user.role.value}) logged in",
        request=request
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role.value,
        "full_name": user.full_name,
        "email": user.email,
        "student_id": student_id
    }

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
