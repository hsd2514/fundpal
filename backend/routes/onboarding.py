from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.queries import save_user_profile, get_user_profile

router = APIRouter()

class OnboardingData(BaseModel):
    income_type: str
    income_pattern: str
    monthly_income_min: float
    monthly_income_max: float
    monthly_rent: float = 0
    monthly_emi_total: float = 0
    monthly_fixed_other: float = 0
    supports_family: bool = False
    age_group: str
    primary_goal: str
    risk_tolerance: str = "moderate"
    literacy_level: int = 2

@router.post("/api/onboarding")
async def complete_onboarding(user_id: str, data: OnboardingData):
    """Save onboarding data"""
    try:
        await save_user_profile(user_id, data.dict())
        return {"status": "success", "message": "Profile created"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/profile")
async def get_profile(user_id: str):
    """Get user profile"""
    try:
        profile = await get_user_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
