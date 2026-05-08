from typing import List
from google.cloud import firestore
from google.cloud.firestore import FieldFilter, Query
from app.services.base import CRUDBase
from app.schemas.tracking import ScheduledWorkout, ScheduledWorkoutCreate, ScheduledWorkoutUpdate, WorkoutLog, WorkoutLogCreate, WorkoutLogUpdate

class CRUDScheduledWorkout(CRUDBase[ScheduledWorkout, ScheduledWorkoutCreate, ScheduledWorkoutUpdate]):
    def get_by_user(self, db: firestore.Client, user_id: str, skip: int = 0, limit: int = 100) -> List[ScheduledWorkout]:

        docs = db.collection(self.collection_name)\
                 .where(filter=FieldFilter("user_id", "==", user_id))\
                 .limit(limit)\
                 .stream()

        results = [self.model(id=doc.id, **doc.to_dict()) for doc in docs]

        results.sort(key=lambda x: x.scheduled_date, reverse=True)
        return results

class CRUDWorkoutLog(CRUDBase[WorkoutLog, WorkoutLogCreate, WorkoutLogUpdate]):
    pass

scheduled_workout = CRUDScheduledWorkout("scheduled_workouts", ScheduledWorkout)
workout_log = CRUDWorkoutLog("workout_logs", WorkoutLog)
