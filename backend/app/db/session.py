import json
import os
import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import settings

if not firebase_admin._apps:
    raw = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    if raw:
        # Railway: JSON completo pegado como variable de entorno
        cred = credentials.Certificate(json.loads(raw))
    else:
        # Local: ruta al fichero
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def get_db():
    yield db
