"""Auth Domain Service Layer (Module 1)"""
import uuid
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.modules.auth.models import User
from app.modules.auth.schemas import OnboardingCompleteRequest, UserLoginRequest, UserRegisterRequest
from app.modules.billing.models import Credit, CreditTransaction
from app.modules.profiles.models import Profile


class AuthService:
    """Handles registration, login, token refresh, and onboarding initialization."""

    @staticmethod
    async def register_user(db: AsyncSession, payload: UserRegisterRequest) -> dict:
        existing = await db.execute(select(User).where(User.email == payload.email.lower()))
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        role = payload.role.upper() if payload.role.upper() in ("CANDIDATE", "ADMIN") else "CANDIDATE"
        user = User(
            email=payload.email.lower(),
            password_hash=get_password_hash(payload.password),
            role=role,
            status="ACTIVE",
        )
        db.add(user)
        await db.flush()

        profile = Profile(
            user_id=user.user_id,
            headline=payload.full_name or payload.email.split("@")[0],
        )
        credit = Credit(
            user_id=user.user_id,
            balance=5,
            lifetime_granted=5,
            lifetime_consumed=0,
        )
        tx = CreditTransaction(
            user_id=user.user_id,
            amount=5,
            tx_type="BONUS",
            reason="Welcome signup bonus (5 free credits)",
            idempotency_key=f"signup_bonus_{user.user_id}",
        )
        db.add_all([profile, credit, tx])
        await db.commit()
        await db.refresh(user)

        access_token = create_access_token(str(user.user_id))
        refresh_token = create_refresh_token(str(user.user_id))

        return {
            "user": {
                "user_id": str(user.user_id),
                "email": user.email,
                "role": user.role,
                "headline": profile.headline,
                "onboarding_completed": False,
                "credits": 5,
                "credits_balance": 5,
            },
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    @staticmethod
    async def authenticate_user(db: AsyncSession, payload: UserLoginRequest) -> dict:
        result = await db.execute(select(User).where(User.email == payload.email.lower()))
        user = result.scalar_one_or_none()
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )
        if user.status != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive or suspended.",
            )

        prof_res = await db.execute(select(Profile).where(Profile.user_id == user.user_id))
        profile = prof_res.scalar_one_or_none()

        cred_res = await db.execute(select(Credit).where(Credit.user_id == user.user_id))
        credit = cred_res.scalar_one_or_none()

        access_token = create_access_token(str(user.user_id))
        refresh_token = create_refresh_token(str(user.user_id))

        return {
            "user": {
                "user_id": str(user.user_id),
                "email": user.email,
                "role": user.role,
                "headline": profile.headline if profile else None,
                "target_role": profile.target_role if profile else None,
                "location": profile.location if profile else None,
                "yoe": float(profile.yoe) if profile and profile.yoe is not None else None,
                "onboarding_completed": bool(profile and profile.target_role),
                "credits": credit.balance if credit else 5,
                "credits_balance": credit.balance if credit else 5,
            },
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    @staticmethod
    async def refresh_access_token(db: AsyncSession, refresh_token: str) -> dict:
        payload = decode_token(refresh_token, expected_type="refresh")
        user_id = payload["sub"]
        result = await db.execute(select(User).where(User.user_id == user_id))
        user = result.scalar_one_or_none()
        if not user or user.status != "ACTIVE":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user session.")
        return {
            "access_token": create_access_token(str(user.user_id)),
            "token_type": "bearer",
        }

    @staticmethod
    async def complete_onboarding(db: AsyncSession, user: User, payload: OnboardingCompleteRequest) -> dict:
        prof_res = await db.execute(select(Profile).where(Profile.user_id == user.user_id))
        profile = prof_res.scalar_one_or_none()
        if not profile:
            profile = Profile(user_id=user.user_id)
            db.add(profile)

        remote_pref = payload.remote_pref.upper()
        if remote_pref not in ("REMOTE", "HYBRID", "ONSITE"):
            remote_pref = "REMOTE"

        if payload.headline:
            profile.headline = payload.headline
        profile.target_role = payload.target_role
        profile.yoe = payload.yoe
        profile.location = payload.location
        profile.remote_pref = remote_pref

        await db.commit()
        await db.refresh(profile)

        return {
            "profile_id": str(profile.profile_id),
            "target_role": profile.target_role,
            "yoe": float(profile.yoe) if profile.yoe is not None else 0.0,
            "location": profile.location,
            "remote_pref": profile.remote_pref,
            "onboarding_completed": True,
        }
