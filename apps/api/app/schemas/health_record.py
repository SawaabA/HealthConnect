from datetime import datetime

from app.models.enums import RecordCategory
from app.schemas.common import ORMModel


class HealthRecordRead(ORMModel):
    id: int
    patient_id: int
    category: RecordCategory
    title: str
    uploaded_at: datetime
    source_provider: str
    storage_key: str
    mime_type: str
