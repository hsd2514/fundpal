from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import uuid
from datetime import datetime

router = APIRouter()

class DebtCreate(BaseModel):
    name: str
    principal: float
    interest_rate: float
    emi_amount: float
    emi_day: int

def get_db_connection():
    conn = sqlite3.connect('fundpal.db')
    conn.row_factory = sqlite3.Row
    return conn

@router.get("/debts")
async def get_debts(user_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM debts WHERE user_id = ?", (user_id,))
    debts = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return debts

@router.post("/debts")
async def create_debt(user_id: str, debt: DebtCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    debt_id = f"debt_{uuid.uuid4().hex[:8]}"
    
    cursor.execute("""
        INSERT INTO debts (id, user_id, name, principal, current_balance, interest_rate, emi_amount, emi_day)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        debt_id, 
        user_id, 
        debt.name, 
        debt.principal, 
        debt.principal, # Initial balance = principal
        debt.interest_rate, 
        debt.emi_amount, 
        debt.emi_day
    ))
    
    conn.commit()
    conn.close()
    return {"status": "success", "id": debt_id}
