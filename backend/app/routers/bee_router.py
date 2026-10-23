from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List, Optional
from app.services.bee_service import bee_service
from app.services.evermind_engine import evermind_engine
from app.schemas import BeeStatusResponse

router = APIRouter(prefix="/api/bee", tags=["Bee Wearable AI"])

@router.get("/status", response_model=BeeStatusResponse)
def get_bee_status():
    """Returns official Bee CLI installation, connection, and auth status."""
    return bee_service.get_status()

@router.post("/login")
def bee_login_token(body: Dict[str, str] = Body(...)):
    """Authenticate Bee CLI using provided token."""
    token = body.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Token is required.")
    res = bee_service.login_with_token(token)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to login"))
    return res

@router.get("/now")
def get_bee_now():
    """Fetch live recent conversations directly from Bee Wearable API."""
    try:
        return bee_service.fetch_live_recent_record()
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.get("/conversations")
def list_bee_conversations(limit: int = 10):
    """List developer conversations from Bee CLI."""
    try:
        return bee_service.fetch_conversations_list(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.get("/conversations/{conversation_id}")
def get_bee_transcript(conversation_id: str):
    """Fetch specific conversation transcript from Bee CLI."""
    try:
        return bee_service.fetch_conversation_transcript(conversation_id)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.post("/sync")
def trigger_bee_sync(recent_days: int = 7):
    """Trigger Bee data synchronization to local markdown directory."""
    try:
        return bee_service.trigger_bee_sync(recent_days=recent_days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/import")
def import_bee_record(payload: Dict[str, Any] = Body(...)):
    """
    Ingests an actual Bee record (live JSON from device/watch, or transcript)
    into Evermind to extract candidate memories, decisions, and commitments.
    """
    try:
        candidates = evermind_engine.ingest_bee_record(payload)
        return {
            "success": True,
            "candidates_extracted": len(candidates),
            "candidates": candidates
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to ingest Bee record: {e}")
