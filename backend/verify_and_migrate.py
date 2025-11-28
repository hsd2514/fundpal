import sqlite3
import os

DB_PATH = "fundpal.db"

def check_and_migrate():
    print(f"Checking database at: {os.path.abspath(DB_PATH)}")
    
    if not os.path.exists(DB_PATH):
        print("ERROR: Database file not found!")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check existing columns
    try:
        cursor.execute("PRAGMA table_info(investments)")
        columns = [row[1] for row in cursor.fetchall()]
        print(f"Current columns in 'investments': {columns}")
        
        if "fund_name" not in columns:
            print("Adding 'fund_name' column...")
            cursor.execute("ALTER TABLE investments ADD COLUMN fund_name TEXT")
            
        if "risk_level" not in columns:
            print("Adding 'risk_level' column...")
            cursor.execute("ALTER TABLE investments ADD COLUMN risk_level TEXT")
            
        conn.commit()
        print("Migration committed.")
        
        # Verify again
        cursor.execute("PRAGMA table_info(investments)")
        new_columns = [row[1] for row in cursor.fetchall()]
        print(f"New columns in 'investments': {new_columns}")
        
    except Exception as e:
        print(f"Error during verification/migration: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_and_migrate()
