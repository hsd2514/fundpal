from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, onboarding, dashboard, goals, transactions, investments, auth, payment, debts, bills, insights

from database.schema import init_db
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    init_db()

# Include routers
app.include_router(chat.router, prefix="/api")
app.include_router(onboarding.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(goals.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(investments.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth")
app.include_router(payment.router)
app.include_router(debts.router, prefix="/api")
app.include_router(bills.router, prefix="/api")
app.include_router(insights.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "FundPal API is running"}
