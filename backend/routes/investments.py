from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from database.queries import get_db_connection
from datetime import datetime
from services.portfolio import PortfolioService

portfolio_service = PortfolioService()

router = APIRouter()

class InvestmentPlan(BaseModel):
    allocation: Dict[str, Dict[str, Any]] # e.g. {"Short-term": {"asset": "Liquid", "pct": 20, "fund": "SBI Liquid"}}
    risk_profile: str
    total_amount: float = 0.0

class ExecuteRequest(BaseModel):
    symbol: str
    quantity: float
    action: str # "BUY" or "SELL"

@router.get("/investments")
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

@router.post("/investments")
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
    except Exception as e:
        print("ERROR saving investments:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()
            
    # --- PORTFOLIO EXECUTION ---
    # Execute buys AFTER closing the main connection to avoid SQLite locking issues
    print(f"DEBUG: Executing portfolio buys for {user_id}")
    for category, details in plan.allocation.items():
        try:
            ticker = details.get("ticker")
            if ticker:
                # Calculate amount for this fund
                fund_amount = plan.total_amount * (details.get("pct", 0) / 100)
                
                # Parsing "₹296.49"
                price_str = str(details.get("current_price", "0")).replace("₹", "").replace(",", "")
                try:
                    price = float(price_str)
                except:
                    price = 0
                    
                if price > 0:
                    quantity = fund_amount / price
                    # Execute Buy
                    print(f"DEBUG: Auto-buying {quantity:.2f} units of {ticker} for {user_id}")
                    portfolio_service.execute_buy(user_id, ticker, quantity)
        except Exception as e:
            print(f"DEBUG: Failed to auto-execute buy for {details.get('ticker')}: {e}")
            traceback.print_exc()

    return {"status": "success", "message": "Investment plan saved and executed"}

@router.post("/execute")
async def execute_trade(user_id: str, request: ExecuteRequest):
    """Execute a trade (Buy/Sell)"""
    if request.action.upper() == "BUY":
        result = portfolio_service.execute_buy(user_id, request.symbol, request.quantity)
    elif request.action.upper() == "SELL":
        result = portfolio_service.execute_sell(user_id, request.symbol, request.quantity)
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
        
    return result

@router.get("/portfolio")
async def get_portfolio(user_id: str):
    """Get user portfolio with live values"""
    return portfolio_service.get_portfolio(user_id)
