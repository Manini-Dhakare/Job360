"""Auth Domain Pydantic Schemas / DTOs (Section 9.2)"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    confirm_password: Optional[str] = None
    full_name: Optional[str] = None
    role: str = "CANDIDATE"


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class OnboardingCompleteRequest(BaseModel):
    headline: Optional[str] = None
    target_role: str
    yoe: float = 0.0
    location: str
    remote_pref: str = "REMOTE"
    resume_id: Optional[str] = None
