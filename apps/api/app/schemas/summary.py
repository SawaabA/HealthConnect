from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import SummaryType
from app.schemas.common import ORMModel


class SummaryCreateRequest(BaseModel):
    patient_context: str
    visit_context: str | None = None
    access_request_id: int | None = None


class AuditDigestCreateRequest(BaseModel):
    audit_events: list[dict]
    access_request_id: int | None = None


class VisitRecommendationCreateRequest(BaseModel):
    patient_context: str
    last_physical_date: str | None = None
    current_symptoms: list[str] = Field(default_factory=list)
    access_request_id: int | None = None


class SummaryUpdateRequest(BaseModel):
    content: str


class SummaryRead(ORMModel):
    id: int
    patient_id: int
    access_request_id: int | None
    summary_type: SummaryType
    content: str
    disclaimer: str
    audio_storage_key: str | None
    created_at: datetime
