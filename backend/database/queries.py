import sqlite3
from typing import List, Dict, Any, Optional
from datetime import datetime

DB_PATH = "fundpal.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
    return conn

async def get_user_profile(user_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_profiles WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else {}

async def save_user_profile(user_id: str, data: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if exists
    cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
    if not cursor.fetchone():
        cursor.execute("INSERT INTO users (id) VALUES (?)", (user_id,))
    
    # Upsert profile
    columns = ", ".join(data.keys())
    placeholders = ", ".join(["?" for _ in data])
    updates = ", ".join([f"{k}=?" for k in data.keys()])
    values = list(data.values())
    
    # Simple implementation: Try insert, if fail update (or use INSERT OR REPLACE)
    # For SQLite, INSERT OR REPLACE is easiest
    
    # First ensure user_id is in data
    data['user_id'] = user_id
    data['id'] = user_id # Use user_id as profile id for 1:1 mapping
    
    columns = ", ".join(data.keys())
    placeholders = ", ".join(["?" for _ in data])
    values = list(data.values())
    
    query = f"INSERT OR REPLACE INTO user_profiles ({columns}) VALUES ({placeholders})"
    cursor.execute(query, values)
    conn.commit()
    conn.close()

async def get_user_state(user_id: str) -> Dict[str, Any]:
    """Aggregate state for agents"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get balance (mock for now, or calc from transactions)
    # In real app, this would be complex. For MVP, we might store current_balance in profile or calc it.
    # Let's assume we calculate from transactions + initial balance (if any)
    
    cursor.execute("SELECT SUM(amount) FROM transactions WHERE user_id = ? AND type = 'income'", (user_id,))
    income = cursor.fetchone()[0] or 0
    
    cursor.execute("SELECT SUM(amount) FROM transactions WHERE user_id = ? AND type = 'expense'", (user_id,))
    expense = cursor.fetchone()[0] or 0
    
    balance = income - expense
    
    conn.close()
    
    return {
        "current_balance": balance,
        "daily_essential": 500, # Mock default
        "emergency_fund_months": 0, # Mock
        "has_credit_card_debt": False, # Mock
        "categories": {}, # Mock
        "upcoming": [], # Mock
        "days_elapsed": 15, # Mock
        "days_in_month": 30 # Mock
    }

async def save_transaction(user_id: str, data: Any):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # data is ParsedTransaction object
    cursor.execute("""
        INSERT INTO transactions (id, user_id, type, amount, category, description, transaction_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        f"txn_{int(datetime.now().timestamp())}", # Simple ID
        user_id,
        data.transaction_type,
        data.amount,
        data.category,
        data.raw_query,
        data.date or datetime.now().isoformat()
    ))
    
    conn.commit()
    conn.close()


