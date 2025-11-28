import sqlite3

def migrate():
    try:
        conn = sqlite3.connect("fundpal.db")
        cursor = conn.cursor()
        
        # Add fund_name column
        try:
            cursor.execute("ALTER TABLE investments ADD COLUMN fund_name TEXT")
            print("Added fund_name column")
        except sqlite3.OperationalError as e:
            print(f"fund_name might already exist: {e}")
            
        # Add risk_level column
        try:
            cursor.execute("ALTER TABLE investments ADD COLUMN risk_level TEXT")
            print("Added risk_level column")
        except sqlite3.OperationalError as e:
            print(f"risk_level might already exist: {e}")

        conn.commit()
        conn.close()
        print("Migration complete")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
