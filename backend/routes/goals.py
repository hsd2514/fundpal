from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

router = APIRouter()

class GoalCreate(BaseModel):
    name: str
    target_amount: float
    deadline: str

@router.get("/api/goals")
async def get_goals(user_id: str):
    """Get user goals"""
    # Mock implementation
    return [
        {"id": "1", "name": "Emergency Fund", "target": 50000, "current": 12000, "deadline": "2024-12-31"},
        {"id": "2", "name": "New Laptop", "target": 80000, "current": 5000, "deadline": "2025-06-30"}
    ]

@router.post("/api/goals")
async def create_goal(user_id: str, goal: GoalCreate):
    """Create new goal"""
    # Mock implementation
    return {"status": "success", "id": "new_goal_id"}
