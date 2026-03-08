from datetime import datetime

from pydantic import BaseModel

from app.models.enums import SummaryType
from app.schemas.common import ORMModel


class SummaryCreateRequest(BaseModel):
    patient_context: str
    visit_context: str | None = None
    access_request_id: int | None = None


class SummaryRead(ORMModel):
    id: int
    patient_id: int
    access_request_id: int | None
    summary_type: SummaryType
    content: str
    disclaimer: str
    audio_storage_key: str | None
    created_at: datetime
