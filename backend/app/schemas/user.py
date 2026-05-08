from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_picture: Optional[str] = None
    level: int = 1
    xp: int = 0
    current_weight: Optional[float] = None
    daily_calorie_goal: Optional[int] = 2000
    current_diet_id: Optional[str] = None
    current_routine_id: Optional[str] = None
    height: Optional[int] = None
    is_admin: bool = False

    followers_count: int = 0
    following_count: int = 0
    routine_rating_sum: float = 0.0
    routine_rating_count: int = 0
    diet_rating_sum: float = 0.0
    diet_rating_count: int = 0

class UserCreate(UserBase):
    username: str
    email: EmailStr
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: Optional[str] = None
    created_at: Optional[datetime] = None
    reputation_score: float = 0.0

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class DashboardStats(BaseModel):
    calories_burned: int
    calories_target: int
    time_minutes: int
    steps: int
    mission_name: Optional[str] = None
    mission_duration: Optional[int] = None
    mission_img: Optional[str] = None

class WeightLogBase(BaseModel):
    weight: float
    date: datetime

class WeightLogCreate(WeightLogBase):
    pass

class WeightLog(WeightLogBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True

class PublicUserProfile(BaseModel):
    id: str
    username: str
    profile_picture: Optional[str] = None
    followers_count: int = 0
    following_count: int = 0
    routine_avg_rating: float = 0.0
    diet_avg_rating: float = 0.0
    is_following: bool = False

    class Config:
        from_attributes = True
