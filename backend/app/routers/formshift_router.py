from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.formshift_service import formshift_service
from app.schemas import WorkoutItem, WorkoutAdaptAction

router = APIRouter(prefix="/api/workouts", tags=["FormShift Fire TV Workouts"])

@router.get("/firetv/status")
def get_firetv_capabilities():
    return formshift_service.get_firetv_status()

@router.get("/active", response_model=Optional[WorkoutItem])
def get_active_session():
    return formshift_service.get_active_session()

@router.post("/start", response_model=WorkoutItem)
def start_workout(
    category: str = Query("strength", description="mobility, strength, hiit"),
    difficulty: str = Query("intermediate", description="beginner, intermediate, advanced")
):
    return formshift_service.start_session(category=category, difficulty=difficulty)

@router.get("/{workout_id}", response_model=WorkoutItem)
def get_workout(workout_id: str):
    item = formshift_service.get_session(workout_id)
    if not item:
        raise HTTPException(status_code=404, detail="Workout session not found.")
    return item

@router.post("/{workout_id}/adapt", response_model=WorkoutItem)
def adapt_workout(workout_id: str, action_data: WorkoutAdaptAction):
    item = formshift_service.adapt_session(workout_id, action_data)
    if not item:
        raise HTTPException(status_code=404, detail="Workout session not found.")
    return item

@router.post("/{workout_id}/advance", response_model=WorkoutItem)
def advance_workout(workout_id: str):
    item = formshift_service.advance_exercise(workout_id)
    if not item:
        raise HTTPException(status_code=404, detail="Workout session not found.")
    return item

@router.post("/{workout_id}/complete", response_model=WorkoutItem)
def complete_workout(workout_id: str):
    item = formshift_service.complete_session(workout_id)
    if not item:
        raise HTTPException(status_code=404, detail="Workout session not found.")
    return item
