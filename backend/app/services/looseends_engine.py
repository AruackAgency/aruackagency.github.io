import uuid
import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.database import get_connection, log_audit_event
from app.schemas import CommitmentItem, CommitmentCreate, CommitmentUpdate

class LooseEndsEngine:
    def __init__(self):
        pass

    def list_commitments(
        self,
        approval_status: Optional[str] = None,
        resolution_status: Optional[str] = None,
        project_topic: Optional[str] = None
    ) -> List[CommitmentItem]:
        conn = get_connection()
        cursor = conn.cursor()
        query = "SELECT * FROM commitments WHERE 1=1"
        params = []
        if approval_status:
            query += " AND approval_status = ?"
            params.append(approval_status)
        if resolution_status:
            query += " AND resolution_status = ?"
            params.append(resolution_status)
        if project_topic:
            query += " AND project_topic = ?"
            params.append(project_topic)
        
        query += " ORDER BY created_at DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()

        items = []
        now = datetime.now(timezone.utc)
        for r in rows:
            item = self._row_to_item(r, now)
            items.append(item)
        return items

    def get_commitment(self, commitment_id: str) -> Optional[CommitmentItem]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM commitments WHERE id = ?", (commitment_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        return self._row_to_item(row, datetime.now(timezone.utc))

    def create_commitment(self, data: CommitmentCreate) -> CommitmentItem:
        conn = get_connection()
        cursor = conn.cursor()
        now_iso = datetime.now(timezone.utc).isoformat()
        com_id = str(uuid.uuid4())

        cursor.execute("""
            INSERT INTO commitments (
                id, description, responsible_person, deadline, project_topic,
                source_record_id, source_timestamp, approval_status, resolution_status,
                draft_followup_message, followup_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            com_id,
            data.description,
            data.responsible_person,
            data.deadline,
            data.project_topic or "General",
            data.source_record_id,
            data.source_timestamp or now_iso,
            "approved",  # Manually created starts as approved
            "open",
            None,
            "none",
            now_iso,
            now_iso
        ))
        conn.commit()
        conn.close()

        log_audit_event("CREATE_COMMITMENT", "commitment", com_id, {"description": data.description})
        return self.get_commitment(com_id)

    def update_commitment(self, commitment_id: str, data: CommitmentUpdate) -> Optional[CommitmentItem]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM commitments WHERE id = ?", (commitment_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None

        now_iso = datetime.now(timezone.utc).isoformat()
        desc = data.description if data.description is not None else row["description"]
        resp = data.responsible_person if data.responsible_person is not None else row["responsible_person"]
        deadline = data.deadline if data.deadline is not None else row["deadline"]
        topic = data.project_topic if data.project_topic is not None else row["project_topic"]
        app_status = data.approval_status if data.approval_status is not None else row["approval_status"]
        res_status = data.resolution_status if data.resolution_status is not None else row["resolution_status"]
        draft_msg = data.draft_followup_message if data.draft_followup_message is not None else row["draft_followup_message"]
        fol_status = data.followup_status if data.followup_status is not None else row["followup_status"]

        cursor.execute("""
            UPDATE commitments
            SET description = ?, responsible_person = ?, deadline = ?, project_topic = ?,
                approval_status = ?, resolution_status = ?, draft_followup_message = ?,
                followup_status = ?, updated_at = ?
            WHERE id = ?
        """, (desc, resp, deadline, topic, app_status, res_status, draft_msg, fol_status, now_iso, commitment_id))

        conn.commit()
        conn.close()

        log_audit_event("UPDATE_COMMITMENT", "commitment", commitment_id, {
            "resolution_status": res_status,
            "approval_status": app_status
        })

        return self.get_commitment(commitment_id)

    def draft_followup(self, commitment_id: str) -> Optional[CommitmentItem]:
        """
        Drafts a professional follow-up message for an unresolved commitment.
        CRITICAL: Followup is saved in 'drafted' state. Does NOT send until user confirms!
        """
        item = self.get_commitment(commitment_id)
        if not item:
            return None

        recipient = item.responsible_person or "Team Member"
        deadline_text = f" by {item.deadline}" if item.deadline else ""
        draft_message = (
            f"Hi {recipient},\n\n"
            f"I wanted to follow up on our agreed commitment regarding: '{item.description}'{deadline_text}.\n"
            f"Could you provide a quick update on current progress or let me know if there are any blockers?\n\n"
            f"Best regards,\nEverlife AI / TEAM ORYVAN"
        )

        return self.update_commitment(
            commitment_id,
            CommitmentUpdate(
                draft_followup_message=draft_message,
                followup_status="drafted"
            )
        )

    def confirm_send_followup(self, commitment_id: str) -> Optional[CommitmentItem]:
        """
        Executes follow-up dispatch only after explicit user confirmation.
        """
        item = self.get_commitment(commitment_id)
        if not item or not item.draft_followup_message:
            return None

        log_audit_event("SEND_FOLLOWUP_CONFIRMED", "commitment", commitment_id, {
            "message": item.draft_followup_message,
            "recipient": item.responsible_person
        })

        return self.update_commitment(
            commitment_id,
            CommitmentUpdate(followup_status="confirmed")
        )

    def delete_commitment(self, commitment_id: str) -> bool:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM commitments WHERE id = ?", (commitment_id,))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        if deleted:
            log_audit_event("DELETE_COMMITMENT", "commitment", commitment_id, {})
        return deleted

    def _row_to_item(self, row, now: datetime) -> CommitmentItem:
        deadline_str = row["deadline"]
        is_overdue = False
        if deadline_str and row["resolution_status"] not in ("completed", "cancelled"):
            try:
                # Handle YYYY-MM-DD or ISO formats
                cleaned = deadline_str.replace("Z", "+00:00")
                if len(cleaned) == 10:
                    d_dt = datetime.fromisoformat(cleaned).replace(tzinfo=timezone.utc)
                else:
                    d_dt = datetime.fromisoformat(cleaned)
                    if d_dt.tzinfo is None:
                        d_dt = d_dt.replace(tzinfo=timezone.utc)
                if now > d_dt:
                    is_overdue = True
            except Exception:
                pass

        return CommitmentItem(
            id=row["id"],
            description=row["description"],
            responsible_person=row["responsible_person"],
            deadline=row["deadline"],
            project_topic=row["project_topic"],
            source_record_id=row["source_record_id"],
            source_timestamp=row["source_timestamp"],
            approval_status=row["approval_status"],
            resolution_status=row["resolution_status"],
            draft_followup_message=row["draft_followup_message"],
            followup_status=row["followup_status"],
            is_overdue=is_overdue,
            created_at=row["created_at"],
            updated_at=row["updated_at"]
        )

looseends_engine = LooseEndsEngine()
