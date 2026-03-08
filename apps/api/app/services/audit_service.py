from sqlalchemy.orm import Session

from app.repositories.audit_log_repository import AuditLogRepository


class AuditService:
    def __init__(self, db: Session) -> None:
        self.audit_logs = AuditLogRepository(db)

    def log(
        self,
        *,
        actor_user_id: int | None,
        action: str,
        access_request_id: int | None = None,
        access_grant_id: int | None = None,
        details: dict | None = None,
    ) -> None:
        self.audit_logs.create(
            actor_user_id=actor_user_id,
            action=action,
            access_request_id=access_request_id,
            access_grant_id=access_grant_id,
            details=details or {},
        )
