from datetime import datetime

from app.schemas.common import ORMModel


class AuditLogRead(ORMModel):
    id: int
    actor_user_id: int | None
    action: str
    access_request_id: int | None
    access_grant_id: int | None
    details: dict
    created_at: datetime
