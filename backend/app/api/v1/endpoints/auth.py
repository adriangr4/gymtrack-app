from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from google.cloud import firestore

from app.db.session import get_db
from app.services.user import user as crud
from app.core import security
from app.core.config import settings
from app.schemas.user import User as UserSchema

router = APIRouter()

@router.post("/login/access-token", response_model=dict)
def login_access_token(
    db: firestore.Client = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:

    user_obj = crud.authenticate(db, email=form_data.username, password=form_data.password)
    if not user_obj:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user_obj.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": user_obj
    }
