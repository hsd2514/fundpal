from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database.queries import get_db_connection
import uuid

router = APIRouter()

class LoginRequest(BaseModel):
    phone: str
    password: str

class SignupRequest(BaseModel):
    phone: str
    password: str
    name: str

@router.post("/signup")
async def signup(request: SignupRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE phone = ?", (request.phone,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Phone number already registered")
        
        user_id = str(uuid.uuid4())
        
        # Create user
        cursor.execute(
            "INSERT INTO users (id, phone, name, password) VALUES (?, ?, ?, ?)",
            (user_id, request.phone, request.name, request.password)
        )
        
        # Create default profile
        cursor.execute(
            "INSERT INTO user_profiles (id, user_id) VALUES (?, ?)",
            (str(uuid.uuid4()), user_id)
        )
        
        conn.commit()
        return {"id": user_id, "name": request.name, "phone": request.phone}
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        print(f"Signup error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        conn.close()

@router.post("/login")
async def login(request: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "SELECT id, name, phone FROM users WHERE phone = ? AND password = ?", 
            (request.phone, request.password)
        )
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid phone or password")
            
        return {"id": user[0], "name": user[1], "phone": user[2]}
        
    finally:
        conn.close()
