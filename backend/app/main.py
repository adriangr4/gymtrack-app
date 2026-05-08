from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import firestore

from app.core.config import settings
from app.db.session import get_db

from app.api.v1.api import api_router

app = FastAPI(title=settings.PROJECT_NAME)

import os

_extra = os.getenv("ALLOWED_ORIGINS", "")
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
] + [o.strip() for o in _extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.exceptions import RequestValidationError
from fastapi.requests import Request
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Bienvenido a GymTrack API (Firestore)"}

@app.get("/health")
def health_check(db: firestore.Client = Depends(get_db)):
    try:

        cols = db.collections()

        next(cols, None)
        return {"status": "ok", "database": "connected", "project": db.project}
    except Exception as e:
        return {"status": "error", "database": str(e)}
