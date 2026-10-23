import sqlite3
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.config import settings

def get_connection():
    conn = sqlite3.connect(settings.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Evermind Memories table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        evidence TEXT,
        source_type TEXT NOT NULL,
        source_id TEXT,
        timestamp TEXT NOT NULL,
        confidence REAL DEFAULT 1.0,
        approval_status TEXT NOT NULL DEFAULT 'pending',
        approved_at TEXT,
        tags TEXT DEFAULT '[]',
        metadata TEXT DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # 2. LooseEnds Commitments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS commitments (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        responsible_person TEXT,
        deadline TEXT,
        project_topic TEXT,
        source_record_id TEXT,
        source_timestamp TEXT,
        approval_status TEXT NOT NULL DEFAULT 'pending',
        resolution_status TEXT NOT NULL DEFAULT 'open',
        draft_followup_message TEXT,
        followup_status TEXT NOT NULL DEFAULT 'none',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # 3. DoorstepOps Ring Business Incidents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        source_device TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'medium',
        assigned_owner TEXT,
        actions_taken TEXT DEFAULT '[]',
        resolution_status TEXT NOT NULL DEFAULT 'open',
        source_references TEXT DEFAULT '{}',
        audit_history TEXT DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # 4. FormShift Fire TV Workouts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL DEFAULT 'intermediate',
        duration_seconds INTEGER NOT NULL,
        exercises TEXT NOT NULL DEFAULT '[]',
        session_state TEXT NOT NULL DEFAULT 'idle',
        current_exercise_index INTEGER DEFAULT 0,
        time_elapsed INTEGER DEFAULT 0,
        adaptations_applied TEXT DEFAULT '[]',
        summary TEXT DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # 5. Audit Log table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        details TEXT,
        timestamp TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

def log_audit_event(action: str, entity_type: str, entity_id: Optional[str], details: Dict[str, Any]):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        now_iso = datetime.now(timezone.utc).isoformat()
        cursor.execute(
            "INSERT INTO audit_logs (id, action, entity_type, entity_id, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), action, entity_type, entity_id, json.dumps(details), now_iso)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error logging audit event: {e}")
