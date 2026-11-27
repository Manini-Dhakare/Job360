"""Auth Domain Router (Developer Squad 1)"""
from fastapi import APIRouter

router = APIRouter()

# Foundational route signatures per API Catalog (Section 9.2)
@router.post("/register")
async def register():
    """Register candidate user account."""
    return {"message": "Endpoint stub - ready for implementation"}

@router.post("/login")
async def login():
    """Authenticate user and issue JWT token pair."""
    return {"message": "Endpoint stub - ready for implementation"}

@router.post("/refresh")
async def refresh_token():
    """Refresh JWT access token using HttpOnly cookie."""
    return {"message": "Endpoint stub - ready for implementation"}

@router.post("/onboarding/complete")
async def complete_onboarding():
    """Finalize onboarding questionnaire and initialize 5 free credits."""
    return {"message": "Endpoint stub - ready for implementation"}
