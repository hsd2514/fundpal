from fastapi import APIRouter, HTTPException
from database.queries import get_user_state

router = APIRouter()

@router.get("/api/dashboard")
async def get_dashboard(user_id: str):
    """Get dashboard data"""
    try:
        # In a real app, this would aggregate data from multiple tables
        # For now, we reuse the get_user_state which provides a summary
        state = await get_user_state(user_id)
        return state
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
