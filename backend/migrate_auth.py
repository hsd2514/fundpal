import sqlite3
import os

DB_PATH = "fundpal.db"

def migrate_auth():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if password column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if "password" not in columns:
            print("Adding password column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN password TEXT")
            conn.commit()
            print("Migration successful: password column added.")
        else:
            print("Migration skipped: password column already exists.")
            
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_auth()
