"""Auth Domain Router (Developer Squad 1)"""
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.responses import standard_success_response
from app.core.database import get_db_session
from app.core.security import get_current_user
from app.modules.auth.models import User
from app.modules.auth.schemas import OnboardingCompleteRequest, UserLoginRequest, UserRegisterRequest
from app.modules.auth.service import AuthService
from app.modules.billing.models import Credit
from app.modules.profiles.models import Profile

router = APIRouter()


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str | None = None) -> None:
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=60 * 15,
    )
    if refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            samesite="lax",
            max_age=60 * 60 * 24 * 7,
        )


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db_session),
):
    """Register candidate user account and grant 5 free credits."""
    data = await AuthService.register_user(db, payload)
    _set_auth_cookies(response, data["access_token"], data["refresh_token"])
    return standard_success_response(data)


@router.post("/login")
async def login(
    payload: UserLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db_session),
):
    """Authenticate user and issue JWT token pair."""
    data = await AuthService.authenticate_user(db, payload)
    _set_auth_cookies(response, data["access_token"], data["refresh_token"])
    return standard_success_response(data)


@router.post("/refresh")
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db_session),
):
    """Refresh JWT access token using HttpOnly cookie."""
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token.")
    data = await AuthService.refresh_access_token(db, token)
    _set_auth_cookies(response, data["access_token"])
    return standard_success_response(data)


@router.post("/logout")
async def logout(response: Response):
    """Clear auth cookies."""
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return standard_success_response({"logged_out": True})


@router.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Return authenticated user profile and onboarding status."""
    prof_res = await db.execute(select(Profile).where(Profile.user_id == current_user.user_id))
    profile = prof_res.scalar_one_or_none()
    cred_res = await db.execute(select(Credit).where(Credit.user_id == current_user.user_id))
    credit = cred_res.scalar_one_or_none()

    return standard_success_response(
        {
            "user_id": str(current_user.user_id),
            "email": current_user.email,
            "role": current_user.role,
            "headline": profile.headline if profile else None,
            "target_role": profile.target_role if profile else None,
            "location": profile.location if profile else None,
            "yoe": float(profile.yoe) if profile and profile.yoe is not None else None,
            "remote_pref": profile.remote_pref if profile else "REMOTE",
            "onboarding_completed": bool(profile and profile.target_role),
            "credits": credit.balance if credit else 5,
        }
    )


@router.post("/onboarding/complete")
async def complete_onboarding(
    payload: OnboardingCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Finalize onboarding questionnaire and update candidate profile."""
    data = await AuthService.complete_onboarding(db, current_user, payload)
    return standard_success_response(data)
