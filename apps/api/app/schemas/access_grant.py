from datetime import datetime

from app.models.enums import RecordCategory
from app.schemas.common import ORMModel


class AccessGrantRead(ORMModel):
    id: int
    access_request_id: int
    doctor_user_id: int
    patient_id: int
    granted_categories: list[RecordCategory]
    starts_at: datetime
    expires_at: datetime
    revoked_at: datetime | None
    created_by_user_id: int
