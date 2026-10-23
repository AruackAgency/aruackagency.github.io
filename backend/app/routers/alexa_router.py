from fastapi import APIRouter, Body
from typing import Dict, Any
from app.services.alexa_service import alexa_service

router = APIRouter(prefix="/api/alexa", tags=["Alexa+ Voice Integration"])

@router.get("/status")
def get_alexa_status():
    return alexa_service.get_status()

@router.get("/interaction-model")
def get_interaction_model():
    """Downloadable interaction model JSON for the Amazon Alexa Developer Console."""
    return alexa_service.get_interaction_model_json()

@router.post("/webhook")
def handle_alexa_webhook(payload: Dict[str, Any] = Body(...)):
    """Receives and answers ASK intent requests from Alexa or Echo devices."""
    return alexa_service.handle_alexa_request(payload)
