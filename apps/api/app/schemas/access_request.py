from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import AccessRequestStatus, RecordCategory
from app.schemas.common import ORMModel


class AccessRequestCreate(BaseModel):
    patient_id: int
    categories: list[RecordCategory]
    reason: str = Field(min_length=10, max_length=1000)
    duration_hours: int = Field(ge=1, le=720)
    break_glass_requested: bool = False


class ConsentDecisionRequest(BaseModel):
    approved_categories: list[RecordCategory] | None = None
    duration_hours: int | None = Field(default=None, ge=1, le=720)


class AccessRequestRead(ORMModel):
    id: int
    doctor_user_id: int
    patient_id: int
    requested_categories: list[RecordCategory]
    reason: str
    requested_duration_hours: int
    break_glass_requested: bool
    status: AccessRequestStatus
    requested_at: datetime
    decided_at: datetime | None
    decided_by_user_id: int | None
