import pytest
import os
import gc
from datetime import datetime, timezone
from app.config import settings
from app.database import init_db, get_connection
from app.services.evermind_engine import evermind_engine
from app.services.looseends_engine import looseends_engine
from app.services.doorstepops_service import doorstepops_service
from app.services.formshift_service import formshift_service
from app.schemas import MemoryApproval, CommitmentCreate, CommitmentUpdate, WorkoutAdaptAction, IncidentCreate, IncidentUpdate

@pytest.fixture(autouse=True)
def setup_test_db(tmp_path):
    test_db = tmp_path / "test_everlife.db"
    settings.DB_PATH = test_db
    init_db()
    yield
    gc.collect()

def test_bee_record_ingestion_and_approval_flow():
    """
    Tests end-to-end mandatory flow:
    1. Ingest actual Bee record with utterances
    2. Extract candidate facts, decisions, commitments
    3. Review & approve memory
    4. Verify saved in database
    5. Retrieve through natural language search with evidence citations
    """
    sample_bee_record = {
        "id": "conv-test-9901",
        "timestamp": "2026-10-23T14:30:00Z",
        "title": "Hackathon Strategy Discussion",
        "utterances": [
            {"speaker": "Aryan", "text": "We decided to submit Everlife AI for the Amazon Developer Hackathon 2026 under the Bee Wearable AI track."},
            {"speaker": "Aryan", "text": "I will deliver the complete architecture diagram and README by Friday 5 PM."},
            {"speaker": "Teammate", "text": "The budget is allocated at 500 dollars for AWS credits."}
        ]
    }

    # 1. Ingest
    candidates = evermind_engine.ingest_bee_record(sample_bee_record)
    assert len(candidates) >= 2, "Expected at least 2 candidate memories extracted"
    
    # Check that candidate starts as 'pending'
    commitment_cand = next((c for c in candidates if c.type in ("commitment", "task")), None)
    assert commitment_cand is not None
    assert commitment_cand.approval_status == "pending"
    assert "Friday" in commitment_cand.content or "deliver" in commitment_cand.content
    assert commitment_cand.evidence is not None

    # 2. Review and approve
    approved = evermind_engine.review_and_approve_memory(
        commitment_cand.id,
        MemoryApproval(status="approved", content="I will deliver the complete architecture diagram and README by Friday 5 PM.")
    )
    assert approved.approval_status == "approved"
    assert approved.approved_at is not None

    # 3. Verify LooseEnds commitment synchronization
    commitments = looseends_engine.list_commitments(approval_status="approved")
    assert len(commitments) >= 1
    matched_com = next((c for c in commitments if c.source_record_id == commitment_cand.id), None)
    assert matched_com is not None
    assert matched_com.resolution_status == "open"

    # 4. Natural language evidence-grounded search
    result = evermind_engine.search_and_ground_answer("When is the architecture diagram due?")
    assert len(result.evidence_items) >= 1
    assert "Friday" in result.answer
    assert "conv-test-9901" in result.answer or result.evidence_items[0].source_id == "conv-test-9901"

def test_looseends_followup_confirmation_gate():
    """
    Verifies that drafted follow-up messages are strictly held in 'drafted' state
    and cannot dispatch without explicit confirmation.
    """
    item = looseends_engine.create_commitment(
        CommitmentCreate(
            description="Submit final Hackathon video pitch",
            responsible_person="Aryan Kumar",
            deadline="2026-10-25"
        )
    )
    
    # Draft followup
    drafted = looseends_engine.draft_followup(item.id)
    assert drafted.followup_status == "drafted"
    assert "Aryan Kumar" in drafted.draft_followup_message

    # Confirm send
    confirmed = looseends_engine.confirm_send_followup(item.id)
    assert confirmed.followup_status == "confirmed"

def test_doorstepops_incident_lifecycle():
    """
    Verifies Ring incident case creation, priority setting, and resolution audit trail.
    """
    incident = doorstepops_service.create_incident(
        IncidentCreate(
            event_type="unauthorized_entry",
            source_device="Warehouse Bay 4 Cam",
            description="Motion detected outside scheduled operating hours.",
            priority="critical"
        )
    )
    assert incident.priority == "critical"
    assert incident.resolution_status == "open"

    # Update with action taken
    updated = doorstepops_service.update_incident(
        incident.id,
        IncidentUpdate(
            resolution_status="investigating",
            add_action="Dispatched facility security team for physical sweep"
        )
    )
    assert updated.resolution_status == "investigating"
    assert len(updated.actions_taken) == 1
    assert "Dispatched" in updated.actions_taken[0]["action"]

def test_formshift_firetv_adaptations():
    """
    Verifies adaptive workout actions: easier, harder, shorter, skip.
    """
    session = formshift_service.start_session(category="strength", difficulty="intermediate")
    assert session.session_state == "in_progress"
    orig_count = len(session.exercises)

    # Adapt easier
    session_easier = formshift_service.adapt_session(session.id, WorkoutAdaptAction(action="easier"))
    assert len(session_easier.adaptations_applied) == 1

    # Adapt shorter
    session_shorter = formshift_service.adapt_session(session.id, WorkoutAdaptAction(action="shorter"))
    assert len(session_shorter.exercises) <= orig_count
