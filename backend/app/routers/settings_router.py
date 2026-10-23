from fastapi import APIRouter
from typing import List, Dict, Any
from app.config import settings
from app.database import get_connection
from app.services.bee_service import bee_service
from app.services.aws_storage import aws_storage_manager
from app.services.doorstepops_service import doorstepops_service
from app.services.alexa_service import alexa_service
from app.schemas import SystemStatusResponse

router = APIRouter(prefix="/api/system", tags=["System & Settings"])

@router.get("/status", response_model=SystemStatusResponse)
def get_system_status():
    bee_stat = bee_service.get_status()
    aws_stat = aws_storage_manager.get_status()
    ring_stat = doorstepops_service.get_connection_status()
    alexa_stat = alexa_service.get_status()

    return SystemStatusResponse(
        app_name=settings.PROJECT_NAME,
        engine_name=settings.ENGINE_NAME,
        team_name=settings.TEAM_NAME,
        tagline=settings.TAGLINE,
        event=settings.EVENT,
        primary_track=settings.PRIMARY_TRACK,
        version=settings.VERSION,
        database_status="Operational (SQLite Primary with WAL Mode)",
        aws_status="Connected" if aws_stat.get("dynamodb_connected") else aws_stat["cloud_persistence"],
        bee_status="Connected" if bee_stat.get("logged_in") else "Authentication Required",
        ring_status=ring_stat["status"],
        firetv_status="Ready (Leanback Compliant)",
        alexa_status=alexa_stat["status"]
    )

@router.get("/aws/status")
def get_aws_status():
    return aws_storage_manager.get_status()

@router.get("/audit-logs")
def get_audit_logs(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
