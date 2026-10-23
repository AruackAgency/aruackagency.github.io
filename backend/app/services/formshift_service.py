import uuid
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.database import get_connection, log_audit_event
from app.schemas import WorkoutItem, WorkoutAdaptAction

DEFAULT_EXERCISES_POOL = {
    "mobility": [
        {"name": "Cat-Cow Stretch", "instructions": "Flow smoothly between arching and rounding back with deep breaths.", "duration_seconds": 45, "difficulty": "beginner"},
        {"name": "Thoracic Spine Rotations", "instructions": "Keep hips square and rotate upper back, opening chest toward the ceiling.", "duration_seconds": 45, "difficulty": "beginner"},
        {"name": "Deep Goblet Squat Hold", "instructions": "Drop into a deep squat, use elbows to gently push knees outward.", "duration_seconds": 60, "difficulty": "intermediate"},
        {"name": "World's Greatest Stretch", "instructions": "Lunge forward, place opposite hand down, and reach leading arm up.", "duration_seconds": 60, "difficulty": "intermediate"},
        {"name": "Overhead Wall Slides", "instructions": "Maintain contact with wall across lower back, elbows, and wrists.", "duration_seconds": 45, "difficulty": "beginner"}
    ],
    "strength": [
        {"name": "Tempo Bodyweight Squats", "instructions": "3 seconds down, 1 second pause at bottom, explode up with glute squeeze.", "duration_seconds": 60, "target_reps": 15, "difficulty": "intermediate"},
        {"name": "Push-Ups with Controlled Eccentric", "instructions": "Maintain rigid plank line, lower chest to within an inch of floor.", "duration_seconds": 45, "target_reps": 12, "difficulty": "intermediate"},
        {"name": "Reverse Lunges", "instructions": "Step backward, keeping front knee tracking directly over second toe.", "duration_seconds": 60, "target_reps": 16, "difficulty": "intermediate"},
        {"name": "Hollow Body Core Hold", "instructions": "Press lower back firmly into floor, extend arms and legs outward.", "duration_seconds": 45, "difficulty": "intermediate"},
        {"name": "Glute Bridge Pulses", "instructions": "Drive through heels, elevate hips, and pulse at peak contraction.", "duration_seconds": 45, "target_reps": 20, "difficulty": "beginner"}
    ],
    "hiit": [
        {"name": "High Knees", "instructions": "Drive knees alternately to hip height with active arm pump.", "duration_seconds": 30, "difficulty": "intermediate"},
        {"name": "Mountain Climbers", "instructions": "Sprint knees toward chest while maintaining a level shoulders line.", "duration_seconds": 30, "difficulty": "intermediate"},
        {"name": "Burpees with Tuck Jump", "instructions": "Drop into chest-to-deck plank, spring back up into an explosive tuck jump.", "duration_seconds": 45, "difficulty": "advanced"},
        {"name": "Speed Skater Bounds", "instructions": "Bound laterally from foot to foot, absorbing impact softly on single leg.", "duration_seconds": 45, "difficulty": "intermediate"}
    ]
}

EASIER_VARIATIONS = {
    "Push-Ups with Controlled Eccentric": {"name": "Incline / Knee Push-Ups", "instructions": "Place hands elevated or knees grounded to reduce load.", "duration_seconds": 40},
    "Burpees with Tuck Jump": {"name": "Step-Back Burpees (No Jump)", "instructions": "Step feet back sequentially into plank without jumping.", "duration_seconds": 35},
    "Hollow Body Core Hold": {"name": "Bent-Knee Dead Bug", "instructions": "Bend knees at 90 degrees and alternate arm-leg extensions.", "duration_seconds": 35},
    "High Knees": {"name": "Marching High Knees", "instructions": "Eliminate the bounce, focus on tall posture and controlled hip drive.", "duration_seconds": 30}
}

HARDER_VARIATIONS = {
    "Push-Ups with Controlled Eccentric": {"name": "Decline Push-Ups / Diamond Push-Ups", "instructions": "Elevate feet on surface or bring hands together under sternum.", "duration_seconds": 50},
    "Tempo Bodyweight Squats": {"name": "Jump Squats with 3-Second Isometric Hold", "instructions": "Hold deep squat for 3 seconds then explode into maximum vertical jump.", "duration_seconds": 60},
    "Reverse Lunges": {"name": "Jumping Switch Lunges", "instructions": "Explosively switch legs mid-air and land softly in deep lunge.", "duration_seconds": 45}
}

class FormShiftService:
    def __init__(self):
        pass

    def get_firetv_status(self) -> Dict[str, Any]:
        """
        Reports honest Fire TV development & deployment status.
        Follows Amazon Fire TV Web App / Leanback Developer Guidelines.
        """
        return {
            "platform": "Amazon Fire TV (Fire OS / Leanback UI)",
            "remote_compatible": True,
            "supported_inputs": ["D-Pad Up", "D-Pad Down", "D-Pad Left", "D-Pad Right", "Select", "Back", "Play/Pause"],
            "controller_profile": "Standard Fire TV Voice Remote (Gen 3)",
            "adaptation_modes": ["Easier", "Harder", "Shorter", "Skip"],
            "deployment_notice": (
                "FormShift is rendered with a high-contrast 10-foot Leanback interface "
                "optimized for Fire TV web app containers and browser packaging. Remote simulation "
                "is directly operable via keyboard arrows, Enter, and Backspace."
            )
        }

    def start_session(self, category: str = "strength", difficulty: str = "intermediate") -> WorkoutItem:
        conn = get_connection()
        cursor = conn.cursor()
        now_iso = datetime.now(timezone.utc).isoformat()
        w_id = f"fs-{uuid.uuid4().hex[:8]}"

        exercises = list(DEFAULT_EXERCISES_POOL.get(category, DEFAULT_EXERCISES_POOL["strength"]))
        total_duration = sum(e.get("duration_seconds", 45) for e in exercises)

        cursor.execute("""
            INSERT INTO workouts (
                id, title, category, difficulty, duration_seconds, exercises,
                session_state, current_exercise_index, time_elapsed,
                adaptations_applied, summary, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            w_id,
            f"Adaptive {category.capitalize()} Session",
            category,
            difficulty,
            total_duration,
            json.dumps(exercises),
            "in_progress",
            0,
            0,
            json.dumps([]),
            json.dumps({"status": "started", "calories_burned": 0}),
            now_iso,
            now_iso
        ))
        conn.commit()
        conn.close()

        log_audit_event("START_FORMSHIFT_SESSION", "workout", w_id, {
            "category": category,
            "difficulty": difficulty,
            "exercises_count": len(exercises)
        })

        return self.get_session(w_id)

    def get_session(self, workout_id: str) -> Optional[WorkoutItem]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM workouts WHERE id = ?", (workout_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        return self._row_to_item(row)

    def get_active_session(self) -> Optional[WorkoutItem]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM workouts WHERE session_state IN ('in_progress', 'paused') ORDER BY updated_at DESC LIMIT 1")
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        return self._row_to_item(row)

    def adapt_session(self, workout_id: str, action_data: WorkoutAdaptAction) -> Optional[WorkoutItem]:
        """
        Applies real-time adaptation: 'easier', 'harder', 'shorter', 'skip'.
        """
        item = self.get_session(workout_id)
        if not item:
            return None

        exercises = list(item.exercises)
        current_idx = item.current_exercise_index
        adaptations = list(item.adaptations_applied)
        now_iso = datetime.now(timezone.utc).isoformat()

        action = action_data.action.lower()
        adaptation_record = {
            "action": action,
            "exercise_index": current_idx,
            "timestamp": now_iso,
            "feedback": action_data.feedback_reason or "User prompt via Fire TV remote"
        }

        if action == "skip":
            if current_idx < len(exercises) - 1:
                current_idx += 1
            else:
                return self.complete_session(workout_id)

        elif action == "shorter":
            # Keep current exercise and truncate remaining routine to 1 final finisher
            if current_idx + 1 < len(exercises):
                exercises = exercises[:current_idx + 2]
                adaptation_record["note"] = "Truncated remaining session to fit time restriction"

        elif action == "easier":
            current_ex_name = exercises[current_idx]["name"]
            if current_ex_name in EASIER_VARIATIONS:
                replacement = EASIER_VARIATIONS[current_ex_name]
                exercises[current_idx] = {**exercises[current_idx], **replacement}
                adaptation_record["note"] = f"Scaled down to {replacement['name']}"
            else:
                # Reduce duration
                orig_dur = exercises[current_idx].get("duration_seconds", 45)
                exercises[current_idx]["duration_seconds"] = max(20, orig_dur - 15)
                adaptation_record["note"] = f"Decreased duration to {exercises[current_idx]['duration_seconds']}s"

        elif action == "harder":
            current_ex_name = exercises[current_idx]["name"]
            if current_ex_name in HARDER_VARIATIONS:
                replacement = HARDER_VARIATIONS[current_ex_name]
                exercises[current_idx] = {**exercises[current_idx], **replacement}
                adaptation_record["note"] = f"Progressed to {replacement['name']}"
            else:
                orig_dur = exercises[current_idx].get("duration_seconds", 45)
                exercises[current_idx]["duration_seconds"] = orig_dur + 15
                adaptation_record["note"] = f"Increased duration to {exercises[current_idx]['duration_seconds']}s"

        adaptations.append(adaptation_record)

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE workouts
            SET exercises = ?, current_exercise_index = ?, adaptations_applied = ?, updated_at = ?
            WHERE id = ?
        """, (json.dumps(exercises), current_idx, json.dumps(adaptations), now_iso, workout_id))
        conn.commit()
        conn.close()

        log_audit_event("ADAPT_FORMSHIFT_SESSION", "workout", workout_id, {"action": action})
        return self.get_session(workout_id)

    def advance_exercise(self, workout_id: str) -> Optional[WorkoutItem]:
        item = self.get_session(workout_id)
        if not item:
            return None

        now_iso = datetime.now(timezone.utc).isoformat()
        current_idx = item.current_exercise_index
        exercises = item.exercises

        if current_idx >= len(exercises) - 1:
            return self.complete_session(workout_id)
        
        current_idx += 1
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE workouts
            SET current_exercise_index = ?, time_elapsed = time_elapsed + 45, updated_at = ?
            WHERE id = ?
        """, (current_idx, now_iso, workout_id))
        conn.commit()
        conn.close()

        return self.get_session(workout_id)

    def complete_session(self, workout_id: str) -> Optional[WorkoutItem]:
        now_iso = datetime.now(timezone.utc).isoformat()
        item = self.get_session(workout_id)
        if not item:
            return None

        summary = {
            "status": "completed",
            "completed_at": now_iso,
            "exercises_completed": len(item.exercises),
            "estimated_calories": len(item.exercises) * 18,
            "adaptations_count": len(item.adaptations_applied)
        }

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE workouts
            SET session_state = 'completed', summary = ?, updated_at = ?
            WHERE id = ?
        """, (json.dumps(summary), now_iso, workout_id))
        conn.commit()
        conn.close()

        log_audit_event("COMPLETE_FORMSHIFT_SESSION", "workout", workout_id, summary)
        return self.get_session(workout_id)

    def _row_to_item(self, row) -> WorkoutItem:
        exercises = []
        try:
            exercises = json.loads(row["exercises"]) if row["exercises"] else []
        except Exception:
            pass
        adaptations = []
        try:
            adaptations = json.loads(row["adaptations_applied"]) if row["adaptations_applied"] else []
        except Exception:
            pass
        summary = {}
        try:
            summary = json.loads(row["summary"]) if row["summary"] else {}
        except Exception:
            pass

        return WorkoutItem(
            id=row["id"],
            title=row["title"],
            category=row["category"],
            difficulty=row["difficulty"],
            duration_seconds=row["duration_seconds"],
            exercises=exercises,
            session_state=row["session_state"],
            current_exercise_index=row["current_exercise_index"],
            time_elapsed=row["time_elapsed"],
            adaptations_applied=adaptations,
            summary=summary,
            created_at=row["created_at"],
            updated_at=row["updated_at"]
        )

formshift_service = FormShiftService()
