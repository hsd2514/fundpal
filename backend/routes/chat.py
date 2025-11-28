from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from agents.orchestrator import AgentOrchestrator

router = APIRouter()
orchestrator = AgentOrchestrator()

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    alerts: List[str] = []
    mode: str = "normal"
    parsed: dict = {}
    card: Optional[dict] = None

@router.post("/api/chat", response_model=ChatResponse)
async def chat(user_id: str, message: ChatMessage):
    """Main chat endpoint"""
    try:
        result = await orchestrator.process_message(user_id, message.message)
        return ChatResponse(
            response=result["response"],
            alerts=result.get("alerts", []),
            mode=result.get("mode", "normal"),
            parsed=result.get("parsed", {}),
            card=result.get("card")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
