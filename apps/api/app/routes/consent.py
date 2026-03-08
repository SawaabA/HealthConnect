from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, get_current_user, require_role
from app.core.database import get_db
from app.models.enums import RoleName
from app.schemas.access_grant import AccessGrantRead
from app.schemas.access_request import AccessRequestRead, ConsentDecisionRequest
from app.services.consent_service import ConsentService

router = APIRouter(prefix="/consent")


@router.post("/{request_id}/approve")
def approve_access_request(
    request_id: int,
    payload: ConsentDecisionRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    require_role(user, {RoleName.PATIENT, RoleName.GUARDIAN})
    service = ConsentService(db)
    try:
        access_request, grant = service.approve_request(
            request_id=request_id,
            approver_user_id=user.user_id,
            approved_categories=payload.approved_categories,
            duration_hours=payload.duration_hours,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc

    return {
        "request": AccessRequestRead.model_validate(access_request),
        "grant": AccessGrantRead.model_validate(grant),
    }


@router.post("/{request_id}/deny", response_model=AccessRequestRead)
def deny_access_request(
    request_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    require_role(user, {RoleName.PATIENT, RoleName.GUARDIAN})
    service = ConsentService(db)
    try:
        return service.deny_request(request_id=request_id, approver_user_id=user.user_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc


@router.post("/grants/{grant_id}/revoke", response_model=AccessGrantRead)
def revoke_access_grant(
    grant_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    require_role(user, {RoleName.PATIENT, RoleName.GUARDIAN})
    service = ConsentService(db)
    try:
        grant = service.revoke_grant(grant_id=grant_id, actor_user_id=user.user_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    return grant
