from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class MemoryItem(BaseModel):
    id: str
    type: str  # fact, task, decision, commitment, observation
    content: str
    evidence: Optional[str] = None
    source_type: str  # bee_wearable, voice_utterance, manual, alexa
    source_id: Optional[str] = None
    timestamp: str
    confidence: float = 1.0
    approval_status: str = "pending"  # pending, approved, rejected
    approved_at: Optional[str] = None
    tags: List[str] = []
    metadata: Dict[str, Any] = {}
    created_at: str
    updated_at: str

class MemoryCreate(BaseModel):
    type: str
    content: str
    evidence: Optional[str] = None
    source_type: str = "manual"
    source_id: Optional[str] = None
    timestamp: Optional[str] = None
    confidence: float = 1.0
    tags: List[str] = []
    metadata: Dict[str, Any] = {}

class MemoryApproval(BaseModel):
    status: str  # approved, rejected
    content: Optional[str] = None  # user can edit content before approving

class MemoryQuery(BaseModel):
    query: str
    top_k: int = 5
    only_approved: bool = True

class MemoryQueryResult(BaseModel):
    query: str
    answer: str
    evidence_items: List[MemoryItem]
    confidence: float
    missing_context: Optional[str] = None

class CommitmentItem(BaseModel):
    id: str
    description: str
    responsible_person: Optional[str] = None
    deadline: Optional[str] = None
    project_topic: Optional[str] = None
    source_record_id: Optional[str] = None
    source_timestamp: Optional[str] = None
    approval_status: str = "pending"  # pending, approved, rejected
    resolution_status: str = "open"  # open, in_progress, completed, cancelled
    draft_followup_message: Optional[str] = None
    followup_status: str = "none"  # none, drafted, confirmed, sent
    is_overdue: bool = False
    created_at: str
    updated_at: str

class CommitmentCreate(BaseModel):
    description: str
    responsible_person: Optional[str] = None
    deadline: Optional[str] = None
    project_topic: Optional[str] = None
    source_record_id: Optional[str] = None
    source_timestamp: Optional[str] = None

class CommitmentUpdate(BaseModel):
    description: Optional[str] = None
    responsible_person: Optional[str] = None
    deadline: Optional[str] = None
    project_topic: Optional[str] = None
    approval_status: Optional[str] = None
    resolution_status: Optional[str] = None
    draft_followup_message: Optional[str] = None
    followup_status: Optional[str] = None

class IncidentItem(BaseModel):
    id: str
    event_type: str  # motion, doorbell_ring, package_delivery, access_attempt, unauthorized_entry
    timestamp: str
    source_device: str
    description: str
    priority: str = "medium"  # critical, high, medium, low
    assigned_owner: Optional[str] = None
    actions_taken: List[Dict[str, Any]] = []
    resolution_status: str = "open"  # open, investigating, remediated, closed
    source_references: Dict[str, Any] = {}
    audit_history: List[Dict[str, Any]] = []
    created_at: str
    updated_at: str

class IncidentCreate(BaseModel):
    event_type: str
    source_device: str
    description: str
    priority: str = "medium"
    assigned_owner: Optional[str] = None
    source_references: Optional[Dict[str, Any]] = None

class IncidentUpdate(BaseModel):
    priority: Optional[str] = None
    assigned_owner: Optional[str] = None
    resolution_status: Optional[str] = None
    add_action: Optional[str] = None

class WorkoutExercise(BaseModel):
    name: str
    instructions: str
    duration_seconds: int
    target_reps: Optional[int] = None
    difficulty: str  # beginner, intermediate, advanced

class WorkoutItem(BaseModel):
    id: str
    title: str
    category: str
    difficulty: str
    duration_seconds: int
    exercises: List[Dict[str, Any]]
    session_state: str  # idle, in_progress, paused, completed
    current_exercise_index: int
    time_elapsed: int
    adaptations_applied: List[Dict[str, Any]]
    summary: Dict[str, Any]
    created_at: str
    updated_at: str

class WorkoutAdaptAction(BaseModel):
    action: str  # easier, harder, shorter, skip
    feedback_reason: Optional[str] = None

class BeeStatusResponse(BaseModel):
    cli_installed: bool
    version: Optional[str] = None
    logged_in: bool
    api_endpoint: str
    account_info: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    instructions: str

class BeeSyncRecord(BaseModel):
    id: str
    source: str
    timestamp: str
    raw_text: str
    utterances: List[Dict[str, Any]] = []
    candidate_memories: List[Dict[str, Any]] = []

class SystemStatusResponse(BaseModel):
    app_name: str
    engine_name: str
    team_name: str
    tagline: str
    event: str
    primary_track: str
    version: str
    database_status: str
    aws_status: str
    bee_status: str
    ring_status: str
    firetv_status: str
    alexa_status: str
