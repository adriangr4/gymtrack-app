from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Body
from google.cloud import firestore

from app.db.session import get_db
from app.services.diet import diet as diet_crud
from app.services.social import content_rating as rating_crud
from app.schemas.diet_social import Diet as DietSchema, DietCreate, Rating as RatingSchema, RatingCreate
from app.api import deps
from datetime import datetime

router = APIRouter()

@router.get("/diets/", response_model=List[DietSchema])
def read_diets(
    db: firestore.Client = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    try:

        collection_ref = db.collection(diet_crud.collection_name)
        docs = collection_ref.order_by("created_at", direction=firestore.Query.DESCENDING).limit(limit).stream()
        def _map_doc(doc):
            data = doc.to_dict()
            if "id" in data:
                 del data["id"]
            return diet_crud.model(id=doc.id, **data)

        results = [_map_doc(doc) for doc in docs]
        return results
    except Exception as e:
        print(f"WARN: Sorted diet query failed (likely missing index). Falling back to unsorted. Error: {e}")
        return diet_crud.get_multi(db, skip=skip, limit=limit)

@router.post("/diets/", response_model=DietSchema)
def create_diet(
    *,
    db: firestore.Client = Depends(get_db),
    diet_in: DietCreate,
    current_user: Any = Depends(deps.get_current_active_user),
):

    data = diet_in.model_dump()
    data['creator_id'] = current_user.id
    return diet_crud.create(db=db, obj_in=data)

@router.post("/ratings/", response_model=RatingSchema)
def rate_content(
    *,
    db: firestore.Client = Depends(get_db),
    rating_in: RatingCreate,
    current_user: Any = Depends(deps.get_current_active_user),
):

    existing = rating_crud.get_by_rater_and_content(
        db,
        rater_id=current_user.id,
        content_type=rating_in.content_type,
        content_id=rating_in.content_id
    )

    if existing:

        return rating_crud.update(db, id=existing.id, obj_in={"score": rating_in.score})
    else:

        data = rating_in.model_dump()
        data['rater_id'] = current_user.id
        data['created_at'] = datetime.utcnow()
        return rating_crud.create(db=db, obj_in=data)
