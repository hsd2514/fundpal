import sqlite3
from datetime import datetime

SCHEMA = """
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE,
    name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles (persona)
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    
    -- Income
    income_type TEXT,  -- salaried, gig, business, mixed
    income_pattern TEXT,  -- daily, weekly, monthly, irregular
    monthly_income_min REAL,
    monthly_income_max REAL,
    
    -- Fixed expenses
    monthly_rent REAL DEFAULT 0,
    monthly_emi_total REAL DEFAULT 0,
    monthly_fixed_other REAL DEFAULT 0,
    supports_family INTEGER DEFAULT 0,
    
    -- Profile
    age_group TEXT,  -- 18-25, 26-35, 36-50, 50+
    literacy_level INTEGER DEFAULT 2,  -- 1, 2, 3
    risk_tolerance TEXT DEFAULT 'moderate',  -- conservative, moderate, aggressive
    
    -- Goals
    primary_goal TEXT,
    emergency_fund_target REAL,
    emergency_fund_current REAL DEFAULT 0,
    
    -- Preferences (learned)
    preferred_tone TEXT DEFAULT 'friendly',
    discipline_score REAL DEFAULT 0.5,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    type TEXT,  -- income, expense
    amount REAL,
    category TEXT,
    description TEXT,
    source TEXT,
    transaction_date DATE,
    logged_via TEXT DEFAULT 'chat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    name TEXT,
    target_amount REAL,
    current_amount REAL DEFAULT 0,
    deadline DATE,
    priority INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Debts
CREATE TABLE IF NOT EXISTS debts (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    name TEXT,
    principal REAL,
    current_balance REAL,
    interest_rate REAL,
    emi_amount REAL,
    emi_day INTEGER,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Behavior logs (for learning)
CREATE TABLE IF NOT EXISTS behavior_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    event_type TEXT,  -- nudge_opened, nudge_ignored, budget_override, etc.
    context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent decision logs (for audit)
CREATE TABLE IF NOT EXISTS agent_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    agent_name TEXT,
    input_message TEXT,
    output_response TEXT,
    decision_context TEXT,
    safety_check TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
    ON transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category 
    ON transactions(user_id, category);

-- Investments
CREATE TABLE IF NOT EXISTS investments (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    type TEXT, -- 'short_term', 'long_term', 'retirement'
    asset_class TEXT, -- 'Equity', 'Debt', 'Gold', 'Liquid'
    fund_name TEXT, -- Specific fund name
    risk_level TEXT, -- 'low', 'moderate', 'high'
    allocation_percentage REAL,
    amount REAL DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

def init_db(db_path="fundpal.db"):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.executescript(SCHEMA)
    conn.commit()
    conn.close()
    print(f"Database initialized at {db_path}")

if __name__ == "__main__":
    init_db()
