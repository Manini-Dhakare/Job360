"""Auth Domain Pydantic Schemas / DTOs (Section 9.2)"""
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: str = "CANDIDATE"


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class OnboardingCompleteRequest(BaseModel):
    target_role: str
    yoe: float
    location: str
    resume_id: Optional[str] = None
