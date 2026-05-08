# Napkin Runbook — GymTrack

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-05-08] Backend runs on port 8000, frontend on port 5173**
   Do instead: start backend with `cd backend && uvicorn app.main:app --reload --port 8000`, frontend with `cd frontend && npm run dev`.

2. **[2026-05-08] Firebase Admin SDK used for all NoSQL data (tracking, social, routines, diet, notifications)**
   Do instead: use `from app.db.session import db` (Firestore client) for Firestore ops; SQLAlchemy only for user auth/library models.

3. **[2026-05-08] Hybrid DB — SQLAlchemy for users/library, Firestore for everything else**
   Do instead: check which DB the relevant model uses before writing queries. User model is SQL; posts/routines/diet plans are Firestore.

## Shell & Command Reliability
1. **[2026-05-08] Python venv lives at repo root `/venv`**
   Do instead: activate with `source /home/adrian/Documentos/ProyectoFinDeCurso/venv/bin/activate` before running backend commands.

2. **[2026-05-08] Frontend deps at repo root (node_modules next to package.json)**
   Do instead: check root `package.json` first; frontend-specific deps are in `frontend/package.json`.

## Domain Behavior Guardrails
1. **[2026-05-08] JWT auth via OAuth2PasswordBearer — token stored in localStorage via AuthContext**
   Do instead: always pass `Authorization: Bearer <token>` header; use `get_current_user` dep in FastAPI endpoints.

2. **[2026-05-08] Admin role gated by `is_admin` bool on User SQL model**
   Do instead: check `current_user.is_admin` in endpoints that need admin moderation (delete posts, etc.).

3. **[2026-05-08] XP gamification triggers on routine complete + diet log — engine in `backend/app/core/gamification.py`**
   Do instead: call gamification service after any XP-earning action; don't award XP directly in endpoints.

## User Directives
1. **[2026-05-08] Caveman mode active — terse fragments, no filler**
   Do instead: drop articles/filler, use fragments, keep technical terms exact.
