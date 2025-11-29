from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import uuid
from datetime import datetime
from fastapi.responses import HTMLResponse
from database.schema import init_db
import sqlite3

router = APIRouter()

# In-memory store for pending orders (Handshake only)
PENDING_ORDERS = {}

class CreateOrderRequest(BaseModel):
    amount: float
    user_id: str
    user_phone: str = "9999999999"
    user_name: str = "FundPal User"

def get_db_connection():
    conn = sqlite3.connect('fundpal.db')
    conn.row_factory = sqlite3.Row
    return conn

@router.get("/api/payment/gateway", response_class=HTMLResponse)
async def payment_gateway(order_id: str, amount: float):
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>FundPal Secure Payment</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body {{ font-family: -apple-system, sans-serif; background: #f3f4f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }}
            .card {{ background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); width: 90%; max-width: 400px; text-align: center; }}
            .amount {{ font-size: 2.5rem; font-weight: bold; color: #111827; margin: 1rem 0; }}
            .btn {{ display: block; width: 100%; padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; margin-top: 1rem; cursor: pointer; border: none; }}
            .btn-success {{ background: #10b981; color: white; }}
            .btn-fail {{ background: #ef4444; color: white; }}
            .label {{ color: #6b7280; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="label">Paying FundPal</div>
            <div class="amount">₹{amount}</div>
            <div class="label">Order: {order_id}</div>
            
            <button class="btn btn-success" onclick="window.location.href='https://google.com?status=success'">
                Confirm Payment
            </button>
            <button class="btn btn-fail" onclick="window.location.href='https://google.com?status=failed'">
                Cancel
            </button>
        </div>
    </body>
    </html>
    """
    return html_content

@router.post("/api/payment/create-order")
async def create_order(order_req: CreateOrderRequest):
    print("DEBUG: Creating Internal Payment Order")
    
    # Store order details for verification
    order_id = f"order_{uuid.uuid4().hex[:8]}"
    PENDING_ORDERS[order_id] = {
        "amount": order_req.amount,
        "user_id": order_req.user_id,
        "status": "PENDING"
    }
    
    # Use the IP that the mobile app uses to reach the backend
    # Hardcoded for Hackathon demo stability
    BACKEND_HOST = "172.20.10.5:8000" 
    
    return {
        "payment_session_id": f"sess_{uuid.uuid4().hex[:8]}",
        "order_id": order_id,
        "payment_link": f"http://{BACKEND_HOST}/api/payment/gateway?order_id={order_id}&amount={order_req.amount}"
    }

@router.post("/api/payment/verify")
async def verify_payment(order_id: str):
    order_data = PENDING_ORDERS.get(order_id)
    if order_data:
        # Insert into database
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            txn_id = f"txn_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO transactions (id, user_id, type, amount, category, description, source, transaction_date, logged_via)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                txn_id,
                order_data['user_id'],
                'income',
                order_data['amount'],
                'Salary/Income',
                'Added via FundPal Gateway',
                'Bank Transfer',
                datetime.now().strftime('%Y-%m-%d'),
                'app_payment'
            ))
            conn.commit()
            conn.close()
            print(f"DEBUG: Transaction {txn_id} recorded for Order {order_id}")
            return {"status": "success", "data": {"order_status": "PAID"}}
        except Exception as e:
            print(f"DB Error: {e}")
            return {"status": "failed", "message": str(e)}
    else:
        return {"status": "failed", "message": "Order not found"}
