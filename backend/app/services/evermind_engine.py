import json
import uuid
import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
from app.database import get_connection, log_audit_event
from app.schemas import MemoryItem, MemoryCreate, MemoryApproval, MemoryQueryResult

class EvermindEngine:
    def __init__(self):
        pass

    def extract_candidates_from_text(
        self,
        text: str,
        source_id: str = "bee-live",
        source_timestamp: Optional[str] = None,
        source_type: str = "bee_wearable"
    ) -> List[Dict[str, Any]]:
        """
        Analyzes conversation transcripts or summaries to extract candidate facts,
        decisions, tasks, and commitments with explicit evidence quotes and confidence scores.
        """
        if not source_timestamp:
            source_timestamp = datetime.now(timezone.utc).isoformat()

        candidates = []
        sentences = [s.strip() for s in re.split(r'(?<=[.!?\n])\s+', text) if len(s.strip()) > 6]

        # Regex patterns for high-precision extraction
        commitment_patterns = [
            (r"(?:i will|i'll|i promise to|i shall|i commit to)\s+(.+)", "commitment", 0.92),
            (r"(?:we will|we'll|we need to make sure to)\s+(.+)", "commitment", 0.88),
            (r"(?:i have to|i must|i need to)\s+(?:send|submit|review|deliver|complete|call|email)\s+(.+)", "commitment", 0.90),
            (r"(?:action item|todo|to-do):\s*(.+)", "task", 0.95),
            (r"(?:follow up with|follow-up with)\s+(.+)", "commitment", 0.89),
        ]

        decision_patterns = [
            (r"(?:we decided to|we've decided to|we agreed to|the decision is to)\s+(.+)", "decision", 0.94),
            (r"(?:let's go with|going with|we chose|chosen)\s+(.+)", "decision", 0.87),
            (r"(?:conclusion is|agreed that)\s+(.+)", "decision", 0.90),
        ]

        fact_patterns = [
            (r"(?:the deadline is|due date is|scheduled for)\s+(.+)", "fact", 0.93),
            (r"(?:budget is|cost is|price is|priced at)\s+(.+)", "fact", 0.91),
            (r"(?:the client is|customer is|stakeholder is)\s+(.+)", "fact", 0.89),
            (r"(?:the requirement is|the plan is)\s+(.+)", "fact", 0.85),
            (r"(?:the venue is|location is|meeting is at)\s+(.+)", "fact", 0.88),
        ]

        for sentence in sentences:
            matched = False
            
            # Check commitments
            for pattern, mem_type, base_conf in commitment_patterns:
                m = re.search(pattern, sentence, re.IGNORECASE)
                if m:
                    extracted = m.group(1).strip()
                    candidates.append({
                        "id": f"cand-{uuid.uuid4().hex[:8]}",
                        "type": mem_type,
                        "content": self._clean_content(sentence),
                        "evidence": f'"{sentence}"',
                        "source_type": source_type,
                        "source_id": source_id,
                        "timestamp": source_timestamp,
                        "confidence": base_conf,
                        "approval_status": "pending",
                        "tags": ["extracted", mem_type]
                    })
                    matched = True
                    break
            
            if matched:
                continue

            # Check decisions
            for pattern, mem_type, base_conf in decision_patterns:
                m = re.search(pattern, sentence, re.IGNORECASE)
                if m:
                    candidates.append({
                        "id": f"cand-{uuid.uuid4().hex[:8]}",
                        "type": mem_type,
                        "content": self._clean_content(sentence),
                        "evidence": f'"{sentence}"',
                        "source_type": source_type,
                        "source_id": source_id,
                        "timestamp": source_timestamp,
                        "confidence": base_conf,
                        "approval_status": "pending",
                        "tags": ["extracted", mem_type]
                    })
                    matched = True
                    break

            if matched:
                continue

            # Check facts
            for pattern, mem_type, base_conf in fact_patterns:
                m = re.search(pattern, sentence, re.IGNORECASE)
                if m:
                    candidates.append({
                        "id": f"cand-{uuid.uuid4().hex[:8]}",
                        "type": mem_type,
                        "content": self._clean_content(sentence),
                        "evidence": f'"{sentence}"',
                        "source_type": source_type,
                        "source_id": source_id,
                        "timestamp": source_timestamp,
                        "confidence": base_conf,
                        "approval_status": "pending",
                        "tags": ["extracted", mem_type]
                    })
                    matched = True
                    break

        return candidates

    def _clean_content(self, text: str) -> str:
        text = text.strip()
        if text.startswith("- ") or text.startswith("* "):
            text = text[2:].strip()
        return text[0].upper() + text[1:] if text else text

    def ingest_bee_record(self, raw_record: Dict[str, Any]) -> List[MemoryItem]:
        """
        Ingests an actual Bee record (e.g. from `bee now --json` or `bee conversations get <id> --json`).
        Creates candidate memories in the database awaiting user review and approval.
        """
        source_id = str(raw_record.get("id") or raw_record.get("conversationId") or f"bee-{uuid.uuid4().hex[:6]}")
        source_timestamp = str(raw_record.get("timestamp") or raw_record.get("startTime") or datetime.now(timezone.utc).isoformat())
        
        # Aggregate text from utterances, transcript, or summary
        transcript_parts = []
        
        # Check if record has utterances list
        if "utterances" in raw_record and isinstance(raw_record["utterances"], list):
            for u in raw_record["utterances"]:
                speaker = u.get("speaker", "Speaker")
                text = u.get("text", "")
                if text:
                    transcript_parts.append(f"{speaker}: {text}")
        elif "transcript" in raw_record and isinstance(raw_record["transcript"], str):
            transcript_parts.append(raw_record["transcript"])
        elif "summary" in raw_record and isinstance(raw_record["summary"], str):
            transcript_parts.append(raw_record["summary"])
        elif "title" in raw_record:
            transcript_parts.append(f"{raw_record.get('title', '')}. {raw_record.get('details', '')}")
        elif "text" in raw_record:
            transcript_parts.append(raw_record["text"])
        else:
            transcript_parts.append(json.dumps(raw_record))

        combined_text = "\n".join(transcript_parts)
        candidates = self.extract_candidates_from_text(
            combined_text,
            source_id=source_id,
            source_timestamp=source_timestamp,
            source_type="bee_wearable"
        )

        saved_candidates = []
        conn = get_connection()
        cursor = conn.cursor()
        now_iso = datetime.now(timezone.utc).isoformat()

        for cand in candidates:
            # Check for existing memory with exact content and source
            cursor.execute(
                "SELECT id FROM memories WHERE content = ? AND source_id = ?",
                (cand["content"], cand["source_id"])
            )
            existing = cursor.fetchone()
            if existing:
                continue

            mem_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO memories (
                    id, type, content, evidence, source_type, source_id,
                    timestamp, confidence, approval_status, approved_at,
                    tags, metadata, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                mem_id,
                cand["type"],
                cand["content"],
                cand["evidence"],
                cand["source_type"],
                cand["source_id"],
                cand["timestamp"],
                cand["confidence"],
                "pending",  # Requires review & approval
                None,
                json.dumps(cand.get("tags", [])),
                json.dumps({"raw_source": source_id, "ingested_at": now_iso}),
                now_iso,
                now_iso
            ))

            saved_candidates.append(MemoryItem(
                id=mem_id,
                type=cand["type"],
                content=cand["content"],
                evidence=cand["evidence"],
                source_type=cand["source_type"],
                source_id=cand["source_id"],
                timestamp=cand["timestamp"],
                confidence=cand["confidence"],
                approval_status="pending",
                approved_at=None,
                tags=cand.get("tags", []),
                metadata={"raw_source": source_id},
                created_at=now_iso,
                updated_at=now_iso
            ))

        conn.commit()
        conn.close()

        log_audit_event("INGEST_BEE_RECORD", "source_record", source_id, {
            "candidate_count": len(saved_candidates),
            "timestamp": source_timestamp
        })

        return saved_candidates

    def review_and_approve_memory(self, memory_id: str, approval: MemoryApproval) -> Optional[MemoryItem]:
        """
        Lets the user review and approve or reject the candidate memory.
        If approved, status is changed to 'approved' and timestamp recorded.
        If the memory is a commitment, it is automatically synchronized into LooseEnds ledger!
        """
        conn = get_connection()
        cursor = conn.cursor()
        now_iso = datetime.now(timezone.utc).isoformat()

        cursor.execute("SELECT * FROM memories WHERE id = ?", (memory_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None

        new_status = approval.status  # 'approved' or 'rejected'
        content = approval.content if approval.content is not None else row["content"]
        approved_at = now_iso if new_status == "approved" else None

        cursor.execute("""
            UPDATE memories
            SET approval_status = ?, content = ?, approved_at = ?, updated_at = ?
            WHERE id = ?
        """, (new_status, content, approved_at, now_iso, memory_id))

        conn.commit()

        # If approved and it is a commitment or task, push to LooseEnds table if not already present
        if new_status == "approved" and row["type"] in ("commitment", "task"):
            cursor.execute("SELECT id FROM commitments WHERE source_record_id = ?", (memory_id,))
            if not cursor.fetchone():
                com_id = str(uuid.uuid4())
                cursor.execute("""
                    INSERT INTO commitments (
                        id, description, responsible_person, deadline, project_topic,
                        source_record_id, source_timestamp, approval_status, resolution_status,
                        draft_followup_message, followup_status, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    com_id,
                    content,
                    None,
                    None,
                    "Bee Context",
                    memory_id,
                    row["timestamp"],
                    "approved",
                    "open",
                    None,
                    "none",
                    now_iso,
                    now_iso
                ))
                conn.commit()

        cursor.execute("SELECT * FROM memories WHERE id = ?", (memory_id,))
        updated_row = cursor.fetchone()
        conn.close()

        log_audit_event("MEMORY_APPROVAL_REVIEW", "memory", memory_id, {
            "status": new_status,
            "previous_content": row["content"],
            "final_content": content
        })

        return self._row_to_memory_item(updated_row)

    def search_and_ground_answer(self, query: str, top_k: int = 5, only_approved: bool = True) -> MemoryQueryResult:
        """
        Performs evidence-grounded search across memories.
        Returns evidence items, confidence, and answer grounded in verified memories.
        Never fabricates an answer without source evidence.
        """
        conn = get_connection()
        cursor = conn.cursor()

        status_clause = "WHERE approval_status = 'approved'" if only_approved else ""
        cursor.execute(f"SELECT * FROM memories {status_clause} ORDER BY timestamp DESC")
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return MemoryQueryResult(
                query=query,
                answer="No approved memories found in Evermind. Ingest records from your Bee Wearable and approve them to establish your memory baseline.",
                evidence_items=[],
                confidence=0.0,
                missing_context="No records exist in the database."
            )

        query_tokens = set(re.findall(r'\w+', query.lower()))
        scored_items = []

        for row in rows:
            item = self._row_to_memory_item(row)
            content_tokens = set(re.findall(r'\w+', item.content.lower()))
            evidence_tokens = set(re.findall(r'\w+', (item.evidence or "").lower()))
            tags_tokens = set([t.lower() for t in item.tags])
            
            overlap = len(query_tokens & (content_tokens | evidence_tokens | tags_tokens))
            score = overlap / max(len(query_tokens), 1)
            
            # Exact substring match boost
            if query.lower() in item.content.lower() or (item.evidence and query.lower() in item.evidence.lower()):
                score += 1.0

            if score > 0.1:
                scored_items.append((score, item))

        scored_items.sort(key=lambda x: x[0], reverse=True)
        top_matches = [item for _, item in scored_items[:top_k]]

        if not top_matches:
            return MemoryQueryResult(
                query=query,
                answer=f"I searched Evermind for '{query}', but found no verified memories matching your inquiry. Would you like to review pending extractions or query recent Bee recordings?",
                evidence_items=[],
                confidence=0.1,
                missing_context=f"No matching memories for terms: {', '.join(query_tokens)}"
            )

        # Build evidence-grounded synthesis
        evidence_citations = []
        for i, m in enumerate(top_matches, 1):
            evidence_citations.append(
                f"[{i}] {m.type.upper()}: {m.content}\n    Source: {m.source_type} (ID: {m.source_id}) | Recorded: {m.timestamp}\n    Evidence quote: {m.evidence or 'N/A'}"
            )

        summary_bullets = [f"• {m.content}" for m in top_matches]
        answer_text = (
            f"Based on {len(top_matches)} verified evidence record(s) in Evermind:\n\n"
            + "\n".join(summary_bullets)
            + "\n\nEvidence Citations:\n"
            + "\n".join(evidence_citations)
        )

        return MemoryQueryResult(
            query=query,
            answer=answer_text,
            evidence_items=top_matches,
            confidence=min(1.0, 0.5 + (len(top_matches) * 0.15)),
            missing_context=None
        )

    def list_memories(self, status: Optional[str] = None, mem_type: Optional[str] = None) -> List[MemoryItem]:
        conn = get_connection()
        cursor = conn.cursor()
        query = "SELECT * FROM memories WHERE 1=1"
        params = []
        if status:
            query += " AND approval_status = ?"
            params.append(status)
        if mem_type:
            query += " AND type = ?"
            params.append(mem_type)
        query += " ORDER BY created_at DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        return [self._row_to_memory_item(r) for r in rows]

    def delete_memory(self, memory_id: str) -> bool:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM memories WHERE id = ?", (memory_id,))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        if deleted:
            log_audit_event("DELETE_MEMORY", "memory", memory_id, {})
        return deleted

    def export_all_records(self) -> Dict[str, Any]:
        """Supports GDPR/privacy compliant export of all user memories."""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM memories")
        memories = [dict(r) for r in cursor.fetchall()]
        cursor.execute("SELECT * FROM commitments")
        commitments = [dict(r) for r in cursor.fetchall()]
        cursor.execute("SELECT * FROM incidents")
        incidents = [dict(r) for r in cursor.fetchall()]
        cursor.execute("SELECT * FROM audit_logs")
        logs = [dict(r) for r in cursor.fetchall()]
        conn.close()

        log_audit_event("EXPORT_ALL_DATA", "user_account", "all", {"exported_records": len(memories)})

        return {
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "product": "Everlife AI",
            "engine": "Evermind",
            "team": "TEAM ORYVAN",
            "memories_count": len(memories),
            "commitments_count": len(commitments),
            "incidents_count": len(incidents),
            "memories": memories,
            "commitments": commitments,
            "incidents": incidents,
            "audit_logs": logs
        }

    def delete_all_records(self) -> Dict[str, int]:
        """Supports complete data deletion."""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM memories")
        m_count = cursor.rowcount
        cursor.execute("DELETE FROM commitments")
        c_count = cursor.rowcount
        cursor.execute("DELETE FROM incidents")
        i_count = cursor.rowcount
        cursor.execute("DELETE FROM workouts")
        w_count = cursor.rowcount
        conn.commit()
        conn.close()

        log_audit_event("WIPE_ALL_DATA", "user_account", "all", {
            "deleted_memories": m_count,
            "deleted_commitments": c_count
        })

        return {
            "deleted_memories": m_count,
            "deleted_commitments": c_count,
            "deleted_incidents": i_count,
            "deleted_workouts": w_count
        }

    def _row_to_memory_item(self, row) -> MemoryItem:
        tags = []
        try:
            tags = json.loads(row["tags"]) if row["tags"] else []
        except Exception:
            pass
        metadata = {}
        try:
            metadata = json.loads(row["metadata"]) if row["metadata"] else {}
        except Exception:
            pass

        return MemoryItem(
            id=row["id"],
            type=row["type"],
            content=row["content"],
            evidence=row["evidence"],
            source_type=row["source_type"],
            source_id=row["source_id"],
            timestamp=row["timestamp"],
            confidence=row["confidence"],
            approval_status=row["approval_status"],
            approved_at=row["approved_at"],
            tags=tags,
            metadata=metadata,
            created_at=row["created_at"],
            updated_at=row["updated_at"]
        )

evermind_engine = EvermindEngine()
