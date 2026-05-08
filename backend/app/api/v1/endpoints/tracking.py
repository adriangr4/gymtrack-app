from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from google.cloud import firestore

from app.db.session import get_db
from app.schemas import tracking as schemas
from app.schemas.social import ContentRatingCreate, ContentRatingUpdate
from app.services.tracking import scheduled_workout as crud_sw
from app.services.social import content_rating as crud_rating
from app.services.routine import routine as crud_routine
from app.api import deps
from datetime import date, datetime
from app.core.gamification import calculate_level

router = APIRouter()

@router.get("/", response_model=List[schemas.ScheduledWorkout])
def read_scheduled_workouts(
    db: firestore.Client = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None
):

    if user_id:
        return crud_sw.get_by_user(db, user_id=user_id, skip=skip, limit=limit)
    return crud_sw.get_multi(db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.ScheduledWorkout)
def create_scheduled_workout(
    *,
    db: firestore.Client = Depends(get_db),
    workout_in: schemas.ScheduledWorkoutCreate,
    current_user: Any = Depends(deps.get_current_active_user),
):

    workout_data = workout_in.model_dump()
    workout_data["user_id"] = current_user.id

    return crud_sw.create(db=db, obj_in=workout_data)

@router.put("/{workout_id}", response_model=schemas.ScheduledWorkout)
def update_scheduled_workout(
    *,
    db: firestore.Client = Depends(get_db),
    workout_id: str,
    workout_in: schemas.ScheduledWorkoutUpdate,
):

    workout = crud_sw.get(db, id=workout_id)
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    workout = crud_sw.update(db, id=workout_id, obj_in=workout_in)
    workout = crud_sw.update(db, id=workout_id, obj_in=workout_in)
    return workout

@router.get("/{workout_id}", response_model=schemas.ScheduledWorkout)
def read_scheduled_workout(
    workout_id: str,
    db: firestore.Client = Depends(get_db),
):

    workout = crud_sw.get(db, id=workout_id)
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    workout_dict = workout.model_dump() if hasattr(workout, "model_dump") else dict(workout)

    if "logs" in workout_dict and workout_dict["logs"]:

        ex_ids = set()
        for log in workout_dict["logs"]:
            if "exercise_id" in log:
                ex_ids.add(log["exercise_id"])

        ex_lookup = {}
        if ex_ids:
            refs = [db.collection("exercises").document(eid) for eid in ex_ids]
            chunks = [refs[i:i + 100] for i in range(0, len(refs), 100)]
            for chunk in chunks:
                docs = db.get_all(chunk)
                for doc in docs:
                    if doc.exists:
                        d = doc.to_dict()
                        d["id"] = doc.id
                        ex_lookup[doc.id] = d

        for log in workout_dict["logs"]:
            if "exercise_id" in log and log["exercise_id"] in ex_lookup:

                log["exercise"] = ex_lookup[log["exercise_id"]]

    return workout_dict

@router.post("/{workout_id}/logs", response_model=schemas.ScheduledWorkout)

def create_workout_log(
    *,
    db: firestore.Client = Depends(get_db),
    workout_id: str,
    log_in: schemas.WorkoutLogCreate,
):

    workout = crud_sw.get(db, id=workout_id)
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    current_logs = [log.model_dump() for log in workout.logs] if workout.logs else []

    new_log_data = log_in.model_dump()

    import uuid
    new_log_data['id'] = str(uuid.uuid4())
    new_log_data['workout_id'] = workout_id
    new_log_data['created_at'] = datetime.utcnow().isoformat()

    current_logs.append(new_log_data)

    crud_sw.update(db, id=workout_id, obj_in={"logs": current_logs})

    return crud_sw.get(db, id=workout_id)

@router.post("/log-session", response_model=schemas.WorkoutCompletionResponse)
def log_session(
    *,
    db: firestore.Client = Depends(get_db),
    session_in: schemas.WorkoutSessionLog,
    current_user = Depends(deps.get_current_active_user),
):

    try:

        import uuid
        logs_data = []
        if session_in.logs:
            for log_item in session_in.logs:
                d = log_item.model_dump()
                d['id'] = str(uuid.uuid4())
                d['created_at'] = datetime.utcnow().isoformat()
                logs_data.append(d)

        workout_data = {
            "user_id": current_user.id,
            "routine_id": session_in.routine_id,
            "scheduled_date": date.today().isoformat(),
            "status": 'completed',
            "notes": f"Difficulty: {session_in.difficulty}, Rating: {session_in.rating}/5. Notes: {session_in.notes or ''}",
            "duration_seconds": session_in.duration_seconds,
            "calories_burned": session_in.calories_burned,
            "created_at": datetime.utcnow().isoformat(),
            "logs": logs_data
        }

        workout = crud_sw.create(db=db, obj_in=workout_data)

        existing = crud_rating.get_by_rater_and_content(
            db,
            rater_id=current_user.id,
            content_type='routine',
            content_id=session_in.routine_id
        )

        if existing:
            crud_rating.update(db, id=existing.id, obj_in={"score": session_in.rating})
        else:
            rating_data = {
                "rater_id": current_user.id,
                "content_type": 'routine',
                "content_id": session_in.routine_id,
                "score": session_in.rating
            }
            crud_rating.create(db=db, obj_in=rating_data)

        xp_gained = int(session_in.calories_burned / 2) if session_in.calories_burned else 50

        from app.services.user import user as crud_user

        user_data = crud_user.get(db, id=current_user.id)
        current_xp = user_data.xp or 0
        new_total_xp = current_xp + xp_gained

        old_level = calculate_level(current_xp)
        new_level = calculate_level(new_total_xp)
        level_up = new_level > old_level

        crud_user.update(db, id=current_user.id, obj_in={"xp": new_total_xp})

        prev_level_xp = (new_level - 1) ** 2 * 100
        next_level_xp = new_level ** 2 * 100

        return {
            "workout": workout.model_dump(),
            "xp_gained": xp_gained,
            "new_total_xp": new_total_xp,
            "new_level": new_level,
            "level_up": level_up,
            "prev_level_xp": prev_level_xp,
            "next_level_xp": next_level_xp
        }

    except Exception as e:
        print(f"Error logging session: {e}")
        raise HTTPException(status_code=400, detail=f"Error saving workout: {str(e)}")
