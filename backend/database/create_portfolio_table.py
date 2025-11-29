import sqlite3

DB_PATH = "fundpal.db"

def create_portfolio_table():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS portfolio (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        quantity REAL NOT NULL,
        average_buy_price REAL NOT NULL,
        current_value REAL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)
    
    conn.commit()
    conn.close()
    print("Portfolio table created successfully.")

if __name__ == "__main__":
    create_portfolio_table()
