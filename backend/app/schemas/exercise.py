from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ExerciseBase(BaseModel):
    name: str
    description: Optional[str] = None
    muscle_group: Optional[str] = None
    video_url: Optional[str] = None
    type: Optional[str] = None

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseUpdate(ExerciseBase):
    name: Optional[str] = None

class ExerciseInDBBase(ExerciseBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Exercise(ExerciseInDBBase):
    pass
