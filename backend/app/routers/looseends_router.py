from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.looseends_engine import looseends_engine
from app.schemas import CommitmentItem, CommitmentCreate, CommitmentUpdate

router = APIRouter(prefix="/api/commitments", tags=["LooseEnds Commitment Intelligence"])

@router.get("", response_model=List[CommitmentItem])
def list_commitments(
    approval_status: Optional[str] = Query(None),
    resolution_status: Optional[str] = Query(None),
    project_topic: Optional[str] = Query(None)
):
    return looseends_engine.list_commitments(
        approval_status=approval_status,
        resolution_status=resolution_status,
        project_topic=project_topic
    )

@router.post("", response_model=CommitmentItem)
def create_commitment(payload: CommitmentCreate):
    return looseends_engine.create_commitment(payload)

@router.get("/{commitment_id}", response_model=CommitmentItem)
def get_commitment(commitment_id: str):
    item = looseends_engine.get_commitment(commitment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Commitment not found.")
    return item

@router.patch("/{commitment_id}", response_model=CommitmentItem)
def update_commitment(commitment_id: str, payload: CommitmentUpdate):
    item = looseends_engine.update_commitment(commitment_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Commitment not found.")
    return item

@router.post("/{commitment_id}/draft-followup", response_model=CommitmentItem)
def draft_followup(commitment_id: str):
    """
    Drafts an automated follow-up. Leaves status in 'drafted'.
    Does NOT send without explicit confirmation!
    """
    item = looseends_engine.draft_followup(commitment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Commitment not found.")
    return item

@router.post("/{commitment_id}/confirm-send", response_model=CommitmentItem)
def confirm_send_followup(commitment_id: str):
    """
    User explicitly confirms sending the drafted follow-up message.
    """
    item = looseends_engine.confirm_send_followup(commitment_id)
    if not item:
        raise HTTPException(status_code=400, detail="Commitment not found or no draft message exists.")
    return item

@router.delete("/{commitment_id}")
def delete_commitment(commitment_id: str):
    success = looseends_engine.delete_commitment(commitment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Commitment not found.")
    return {"success": True, "deleted_id": commitment_id}
