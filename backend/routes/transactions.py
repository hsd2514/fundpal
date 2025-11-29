from fastapi import APIRouter, HTTPException
from typing import List
from database.queries import get_db_connection

router = APIRouter()

@router.get("/transactions")
async def get_transactions(user_id: str, limit: int = 20):
    """Get recent transactions"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC LIMIT ?", 
            (user_id, limit)
        )
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
