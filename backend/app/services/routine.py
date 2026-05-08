from typing import Any, Dict, Union, List
from google.cloud import firestore
from app.services.base import CRUDBase
from app.schemas.routine import Routine, RoutineCreate, RoutineUpdate

class CRUDRoutine(CRUDBase[Routine, RoutineCreate, RoutineUpdate]):
    def create(self, db: firestore.Client, *, obj_in: Union[RoutineCreate, Dict[str, Any]]) -> Routine:
        from fastapi.encoders import jsonable_encoder
        from datetime import datetime

        req_data = jsonable_encoder(obj_in)
        if "average_rating" not in req_data:
            req_data["average_rating"] = 0.0
        if "rating_count" not in req_data:
            req_data["rating_count"] = 0
        if "created_at" not in req_data:
            req_data["created_at"] = datetime.utcnow().isoformat()

        return super().create(db, obj_in=req_data)

    def get_with_exercises(self, db: firestore.Client, id: str) -> Union[Dict, None]:
        routine = self.get(db, id=id)
        if not routine:
            return None

        exercises_ref = db.collection("routine_exercises").where("routine_id", "==", id).stream()
        exercises = []
        for doc in exercises_ref:
            ex_data = doc.to_dict()
            ex_data["id"] = doc.id

            if "exercise_id" in ex_data:
                ex_doc = db.collection("exercises").document(ex_data["exercise_id"]).get()
                if ex_doc.exists:
                    full_ex = ex_doc.to_dict()
                    full_ex["id"] = ex_doc.id
                    ex_data["exercise"] = full_ex
                else:
                    ex_data["exercise"] = None

            exercises.append(ex_data)

        if hasattr(routine, "model_dump"):
            routine_dict = routine.model_dump()
        else:
            routine_dict = dict(routine)

        routine_dict["exercises"] = exercises
        return routine_dict

    def get_multi_with_exercises(self, db: firestore.Client, *, creator_id: str = None, skip: int = 0, limit: int = 100) -> List[Dict]:
        docs_collection = {}

        # Always include system/predefined routines
        try:
            q_sys = db.collection(self.collection_name).where(filter=firestore.FieldFilter("creator_id", "==", "system")).stream()
            for d in q_sys:
                docs_collection[d.id] = d.to_dict()
        except Exception as e:
            print(f"WARN: Error fetching system routines: {e}")

        if creator_id:
            try:
                q1 = db.collection(self.collection_name).where(filter=firestore.FieldFilter("creator_id", "==", creator_id)).stream()
                for d in q1:
                    docs_collection[d.id] = d.to_dict()
            except Exception as e:
                print(f"WARN: Error fetching routines for creator_id {creator_id}: {e}")

        sorted_docs = sorted(docs_collection.items(), key=lambda x: str(x[1].get("created_at", "")), reverse=True)
        paginated = sorted_docs[skip : skip + limit]

        routines = []
        for item_id, item_data in paginated:
            data = {k: v for k, v in item_data.items() if k != "id"}
            try:
                routines.append(self.model(id=item_id, **data))
            except Exception as e:
                print(f"WARN: Could not parse routine {item_id}: {e}")
                continue

        results = []
        routine_map = {}
        routine_ids = []

        for routine in routines:
            if hasattr(routine, "model_dump"):
                r_dict = routine.model_dump()
            else:
                r_dict = dict(routine)
            r_dict["exercises"] = []
            results.append(r_dict)
            routine_map[r_dict["id"]] = r_dict
            routine_ids.append(r_dict["id"])

        if not routine_ids:
            return results

        all_exercise_ids = set()
        routine_exercises_list = []

        chunk_size = 10
        id_chunks = [routine_ids[i:i + chunk_size] for i in range(0, len(routine_ids), chunk_size)]

        for chunk in id_chunks:

            query = db.collection("routine_exercises").where("routine_id", "in", chunk)
            docs = query.stream()

            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                routine_exercises_list.append(data)
                if "exercise_id" in data:
                    all_exercise_ids.add(data["exercise_id"])

        exercise_lookup = {}
        if all_exercise_ids:
            refs = [db.collection("exercises").document(eid) for eid in all_exercise_ids]

            ref_chunks = [refs[i:i + 100] for i in range(0, len(refs), 100)]

            for chunk in ref_chunks:
                fetched_docs = db.get_all(chunk)
                for doc in fetched_docs:
                    if doc.exists:
                        data = doc.to_dict()
                        data["id"] = doc.id
                        exercise_lookup[doc.id] = data

        for rex in routine_exercises_list:
             if "exercise_id" in rex and rex["exercise_id"] in exercise_lookup:
                 rex["exercise"] = exercise_lookup[rex["exercise_id"]]
             else:
                 rex["exercise"] = None

             r_id = rex.get("routine_id")
             if r_id in routine_map:
                 try:
                     routine_map[r_id]["exercises"].append(rex)
                 except KeyError:
                     routine_map[r_id]["exercises"] = [rex]

        for r_dict in results:
             if "exercises" in r_dict:

                 pass

        return results

routine = CRUDRoutine("routines", Routine)
