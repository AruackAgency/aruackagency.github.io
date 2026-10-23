from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.doorstepops_service import doorstepops_service
from app.schemas import IncidentItem, IncidentCreate, IncidentUpdate

router = APIRouter(prefix="/api/incidents", tags=["DoorstepOps Ring Incidents"])

@router.get("/status")
def get_ring_status():
    """Returns official Ring developer connection state and requirements."""
    return doorstepops_service.get_connection_status()

@router.get("", response_model=List[IncidentItem])
def list_incidents(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None)
):
    return doorstepops_service.list_incidents(resolution_status=status, priority=priority)

@router.post("", response_model=IncidentItem)
def create_incident(payload: IncidentCreate):
    return doorstepops_service.create_incident(payload)

@router.get("/{incident_id}", response_model=IncidentItem)
def get_incident(incident_id: str):
    item = doorstepops_service.get_incident(incident_id)
    if not item:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return item

@router.patch("/{incident_id}", response_model=IncidentItem)
def update_incident(incident_id: str, payload: IncidentUpdate):
    item = doorstepops_service.update_incident(incident_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return item
