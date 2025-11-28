from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, onboarding, dashboard, goals, transactions, investments
from database.schema import init_db

app = FastAPI(title="FundPal API")

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

app.include_router(chat.router)
app.include_router(onboarding.router)
app.include_router(dashboard.router)
app.include_router(goals.router)
app.include_router(goals.router)
app.include_router(transactions.router)
app.include_router(investments.router)

@app.get("/")
async def root():
    return {"message": "FundPal API is running"}
