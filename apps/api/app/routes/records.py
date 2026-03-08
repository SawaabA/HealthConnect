from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, get_current_user
from app.core.database import get_db
from app.models.enums import RoleName
from app.repositories.health_record_repository import HealthRecordRepository
from app.repositories.user_repository import UserRepository
from app.schemas.health_record import HealthRecordRead
from app.services.access_control_service import AccessControlService

router = APIRouter(prefix="/records")


@router.get("/patients/{patient_id}", response_model=list[HealthRecordRead])
def list_patient_records(
    patient_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    users = UserRepository(db)
    health_records = HealthRecordRepository(db)
    access_control = AccessControlService(db)

    if user.role == RoleName.ADMIN:
        return health_records.list_by_patient_and_categories(patient_id=patient_id, categories=None)

    if user.role == RoleName.PATIENT:
        patient = users.get_patient_by_user_id(user.user_id)
        if patient is None or patient.id != patient_id:
            raise HTTPException(status_code=403, detail="Not authorized for this patient")
        return health_records.list_by_patient_and_categories(patient_id=patient_id, categories=None)

    if user.role == RoleName.GUARDIAN:
        if not users.is_guardian_of_patient(user.user_id, patient_id):
            raise HTTPException(status_code=403, detail="Not authorized for this patient")
        return health_records.list_by_patient_and_categories(patient_id=patient_id, categories=None)

    if user.role == RoleName.DOCTOR:
        records = access_control.list_accessible_records(doctor_user_id=user.user_id, patient_id=patient_id)
        for record in records:
            access_control.register_record_view(
                doctor_user_id=user.user_id,
                access_request_id=None,
                patient_id=patient_id,
                record_id=record.id,
                category=record.category,
            )
        return records

    raise HTTPException(status_code=403, detail="Role not allowed")


@router.get("/{record_id}", response_model=HealthRecordRead)
def get_record(
    record_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    health_records = HealthRecordRepository(db)
    users = UserRepository(db)
    access_control = AccessControlService(db)

    record = health_records.get_by_id(record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Record not found")

    if user.role == RoleName.ADMIN:
        return record

    if user.role == RoleName.PATIENT:
        patient = users.get_patient_by_user_id(user.user_id)
        if patient and patient.id == record.patient_id:
            return record

    if user.role == RoleName.GUARDIAN and users.is_guardian_of_patient(user.user_id, record.patient_id):
        return record

    if user.role == RoleName.DOCTOR and access_control.can_view_category(
        doctor_user_id=user.user_id,
        patient_id=record.patient_id,
        category=record.category,
    ):
        access_control.register_record_view(
            doctor_user_id=user.user_id,
            access_request_id=None,
            patient_id=record.patient_id,
            record_id=record.id,
            category=record.category,
        )
        return record

    raise HTTPException(status_code=403, detail="Record access denied")
