from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db, get_connection
from app.routers import (
    bee_router,
    evermind_router,
    looseends_router,
    doorstepops_router,
    formshift_router,
    alexa_router,
    settings_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    init_db()
    # Seed baseline items if database is empty
    _seed_initial_data()
    yield

def _seed_initial_data():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM incidents")
    if cursor.fetchone()[0] == 0:
        import uuid
        from datetime import datetime, timezone
        now_iso = datetime.now(timezone.utc).isoformat()
        
        # Seed an initial Ring DoorstepOps incident
        cursor.execute("""
            INSERT INTO incidents (
                id, event_type, timestamp, source_device, description,
                priority, assigned_owner, actions_taken, resolution_status,
                source_references, audit_history, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"inc-{uuid.uuid4().hex[:8]}",
            "package_delivery",
            now_iso,
            "Ring Video Doorbell Pro (Front Entrance)",
            "High-value hardware delivery detected at main office threshold. Requires verified custody handover.",
            "high",
            "Aryan Kumar (Operations Lead)",
            '[]',
            "open",
            '{"camera_resolution": "1080p HDR", "detection_confidence": 0.98, "motion_zone": "Threshold Zone 1"}',
            '[{"action": "EVENT_DETECTED", "timestamp": "' + now_iso + '", "actor": "Ring Telemetry Engine"}]',
            now_iso,
            now_iso
        ))
        conn.commit()
    conn.close()

app = FastAPI(
    title=f"{settings.PROJECT_NAME} API — {settings.TEAM_NAME}",
    description="Unified personal intelligence platform combining Bee Wearable AI, Evermind persistent memory, LooseEnds commitment ledger, DoorstepOps Ring incidents, and FormShift Fire TV adaptive workouts.",
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(bee_router.router)
app.include_router(evermind_router.router)
app.include_router(looseends_router.router)
app.include_router(doorstepops_router.router)
app.include_router(formshift_router.router)
app.include_router(alexa_router.router)
app.include_router(settings_router.router)

@app.get("/")
def get_root_identity():
    return {
        "team": settings.TEAM_NAME,
        "product": settings.PROJECT_NAME,
        "engine": settings.ENGINE_NAME,
        "tagline": settings.TAGLINE,
        "event": settings.EVENT,
        "primary_track": settings.PRIMARY_TRACK,
        "version": settings.VERSION,
        "status": "Operational",
        "docs_url": "/docs"
    }
