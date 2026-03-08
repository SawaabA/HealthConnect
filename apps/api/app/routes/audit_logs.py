from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, get_current_user, require_role
from app.core.database import get_db
from app.models.enums import RoleName
from app.repositories.audit_log_repository import AuditLogRepository
from app.schemas.audit_log import AuditLogRead

router = APIRouter(prefix="/audit-logs")


@router.get("/", response_model=list[AuditLogRead])
def list_audit_logs(
    limit: int = 100,
    db: Annotated[Session, Depends(get_db)] = None,
    user: Annotated[CurrentUser, Depends(get_current_user)] = None,
):
    require_role(user, {RoleName.ADMIN})
    repository = AuditLogRepository(db)
    return repository.list_recent(limit=limit)
