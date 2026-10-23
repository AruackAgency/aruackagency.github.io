from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from app.services.evermind_engine import evermind_engine
from app.services.aws_storage import aws_storage_manager
from app.schemas import MemoryItem, MemoryCreate, MemoryApproval, MemoryQuery, MemoryQueryResult

router = APIRouter(prefix="/api/memories", tags=["Evermind Memory Engine"])

@router.get("", response_model=List[MemoryItem])
def list_memories(
    status: Optional[str] = Query(None, description="pending, approved, or rejected"),
    mem_type: Optional[str] = Query(None, description="fact, task, decision, commitment, observation")
):
    return evermind_engine.list_memories(status=status, mem_type=mem_type)

@router.post("/query", response_model=MemoryQueryResult)
def query_memories(payload: MemoryQuery):
    """Evidence-grounded natural-language query over persistent memories."""
    return evermind_engine.search_and_ground_answer(
        query=payload.query,
        top_k=payload.top_k,
        only_approved=payload.only_approved
    )

@router.post("/{memory_id}/approve", response_model=MemoryItem)
def review_and_approve_memory(memory_id: str, approval: MemoryApproval):
    """
    User reviews and approves or rejects an extracted candidate memory.
    If approved, also triggers optional DynamoDB persistence.
    """
    item = evermind_engine.review_and_approve_memory(memory_id, approval)
    if not item:
        raise HTTPException(status_code=404, detail="Memory item not found.")
    
    # Optional cloud sync
    if item.approval_status == "approved":
        aws_storage_manager.sync_memory_to_dynamodb(item)

    return item

@router.delete("/{memory_id}")
def delete_memory(memory_id: str):
    success = evermind_engine.delete_memory(memory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory item not found.")
    return {"success": True, "deleted_id": memory_id}

@router.get("/data/export")
def export_user_data():
    """GDPR/Privacy export of all records."""
    return evermind_engine.export_all_records()

@router.post("/data/wipe")
def wipe_all_data():
    """Permanent deletion of all stored records."""
    return evermind_engine.delete_all_records()
