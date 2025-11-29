from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

router = APIRouter()

class GoalCreate(BaseModel):
    name: str
    target_amount: float
    deadline: str

import sqlite3
import uuid
from datetime import datetime

def get_db_connection():
    conn = sqlite3.connect('fundpal.db')
    conn.row_factory = sqlite3.Row
    return conn

@router.get("/goals")
async def get_goals(user_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM goals WHERE user_id = ?", (user_id,))
    goals = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return goals

@router.post("/goals")
async def create_goal(user_id: str, goal: GoalCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    goal_id = f"goal_{uuid.uuid4().hex[:8]}"
    
    cursor.execute("""
        INSERT INTO goals (id, user_id, name, target_amount, deadline)
        VALUES (?, ?, ?, ?, ?)
    """, (goal_id, user_id, goal.name, goal.target_amount, goal.deadline))
    
    conn.commit()
    conn.close()
    return {"status": "success", "id": goal_id}
