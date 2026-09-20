import os
from typing import List, Union, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "SAPC IntellySys"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sapc-intellysys-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # AI & External Services
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./sapc_intellysys.db"
    )
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    # AHP Domain Default Weights (Validated Psychometrician Matrix)
    AHP_WEIGHT_ACADEMIC: float = 0.30
    AHP_WEIGHT_FAMILY: float = 0.20
    AHP_WEIGHT_HEALTH: float = 0.20
    AHP_WEIGHT_MENTAL_HEALTH: float = 0.15
    AHP_WEIGHT_FINANCIAL: float = 0.15
    
    # Risk Tier Thresholds
    RISK_LOW_MAX: float = 39.9
    RISK_MEDIUM_MAX: float = 69.9
    RISK_HIGH_MAX: float = 100.0

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
