from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from database.queries import get_db_connection
from datetime import datetime

router = APIRouter()

class InvestmentPlan(BaseModel):
    allocation: Dict[str, Dict[str, Any]] # e.g. {"Short-term": {"asset": "Liquid", "pct": 20, "fund": "SBI Liquid"}}
    risk_profile: str

@router.get("/api/investments")
async def get_investments(user_id: str):
    """Get user investments"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM investments WHERE user_id = ?", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import traceback
import uuid

@router.post("/api/investments")
async def save_investment_plan(user_id: str, plan: InvestmentPlan):
    """Save investment allocation as active investments"""
    print(f"DEBUG: Saving investment plan for {user_id}: {plan}")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Clear existing for MVP simplicity (or append)
        cursor.execute("DELETE FROM investments WHERE user_id = ?", (user_id,))
        
        for category, details in plan.allocation.items():
            # details = {"pct": 60, "fund": "Name", "expected_return": "12%"}
            # category is the Asset Class (e.g. "Equity")
            
            # Map category to type (simple heuristic)
            inv_type = "growth"
            if category in ["Liquid", "FD", "Debt"]:
                inv_type = "safety"
            elif category == "Gold":
                inv_type = "hedging"
            
            # Use UUID for unique ID
            inv_id = f"inv_{uuid.uuid4().hex[:8]}"
            
            cursor.execute("""
                INSERT INTO investments (id, user_id, type, asset_class, fund_name, risk_level, allocation_percentage, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                inv_id,
                user_id,
                inv_type,
                category, # Use category as asset_class
                details.get("fund", "Generic Fund"),
                "moderate", 
                details.get("pct", 0),
                "active"
            ))
            
        conn.commit()
        return {"status": "success", "message": "Investment plan saved"}
    except Exception as e:
        print("ERROR saving investments:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()
