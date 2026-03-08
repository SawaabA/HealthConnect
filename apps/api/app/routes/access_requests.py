from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, get_current_user, require_role
from app.core.database import get_db
from app.models.enums import RoleName
from app.repositories.user_repository import UserRepository
from app.schemas.access_request import AccessRequestCreate, AccessRequestRead
from app.services.access_request_service import AccessRequestService

router = APIRouter(prefix="/access-requests")


@router.post("/", response_model=AccessRequestRead, status_code=status.HTTP_201_CREATED)
def create_access_request(
    payload: AccessRequestCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    require_role(user, {RoleName.DOCTOR})
    service = AccessRequestService(db)
    try:
        return service.create_access_request(doctor_user_id=user.user_id, payload=payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/doctor/me", response_model=list[AccessRequestRead])
def list_my_access_requests(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    require_role(user, {RoleName.DOCTOR})
    service = AccessRequestService(db)
    return service.list_doctor_requests(user.user_id)


@router.get("/patient/{patient_id}", response_model=list[AccessRequestRead])
def list_patient_access_requests(
    patient_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    service = AccessRequestService(db)
    users = UserRepository(db)

    if user.role == RoleName.DOCTOR:
        doctor_requests = service.list_doctor_requests(user.user_id)
        return [item for item in doctor_requests if item.patient_id == patient_id]

    if user.role == RoleName.PATIENT:
        patient = users.get_patient_by_user_id(user.user_id)
        if patient is None or patient.id != patient_id:
            raise HTTPException(status_code=403, detail="Not authorized for this patient")

    if user.role == RoleName.GUARDIAN and not users.is_guardian_of_patient(user.user_id, patient_id):
        raise HTTPException(status_code=403, detail="Not authorized for this patient")

    if user.role not in {RoleName.PATIENT, RoleName.GUARDIAN, RoleName.ADMIN, RoleName.DOCTOR}:
        raise HTTPException(status_code=403, detail="Role not allowed")

    return service.list_patient_requests(patient_id)


@router.get("/{request_id}", response_model=AccessRequestRead)
def get_access_request(
    request_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    service = AccessRequestService(db)
    users = UserRepository(db)
    try:
        access_request = service.get_access_request(request_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    if user.role == RoleName.ADMIN:
        return access_request
    if user.role == RoleName.DOCTOR and access_request.doctor_user_id == user.user_id:
        return access_request
    if user.role == RoleName.PATIENT:
        patient = users.get_patient_by_user_id(user.user_id)
        if patient and patient.id == access_request.patient_id:
            return access_request
    if user.role == RoleName.GUARDIAN and users.is_guardian_of_patient(user.user_id, access_request.patient_id):
        return access_request

    raise HTTPException(status_code=403, detail="Not authorized to view this request")
