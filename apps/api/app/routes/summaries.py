from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, get_current_user, require_role
from app.core.database import get_db
from app.models.enums import RoleName
from app.repositories.access_request_repository import AccessRequestRepository
from app.repositories.user_repository import UserRepository
from app.schemas.summary import (
    AuditDigestCreateRequest,
    SummaryCreateRequest,
    SummaryRead,
    SummaryUpdateRequest,
    VisitRecommendationCreateRequest,
)
from app.services.summary_service import SummaryService

router = APIRouter(prefix="/summaries")


@router.post("/patients/{patient_id}/patient-friendly", response_model=SummaryRead)
def generate_patient_summary(
    patient_id: int,
    payload: SummaryCreateRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    require_role(user, {RoleName.PATIENT, RoleName.GUARDIAN, RoleName.DOCTOR, RoleName.ADMIN})
    users = UserRepository(db)
    if user.role == RoleName.PATIENT:
        patient = users.get_patient_by_user_id(user.user_id)
        if patient is None or patient.id != patient_id:
            raise HTTPException(status_code=403, detail="Not authorized for this patient")
    if user.role == RoleName.GUARDIAN and not users.is_guardian_of_patient(user.user_id, patient_id):
        raise HTTPException(status_code=403, detail="Not authorized for this patient")

    service = SummaryService(db)
    return service.generate_patient_summary(
        patient_id=patient_id,
        patient_context=payload.patient_context,
        request_reason=payload.visit_context,
        access_request_id=payload.access_request_id,
    )


@router.post("/requests/{request_id}/doctor-brief", response_model=SummaryRead)
def generate_doctor_brief(
    request_id: int,
    payload: SummaryCreateRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    require_role(user, {RoleName.DOCTOR, RoleName.ADMIN})
    access_requests = AccessRequestRepository(db)
    request = access_requests.get_by_id(request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Access request not found")
    if user.role == RoleName.DOCTOR and request.doctor_user_id != user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this request")

    service = SummaryService(db)
    return service.generate_doctor_brief(
        patient_id=request.patient_id,
        patient_context=payload.patient_context,
        visit_context=payload.visit_context,
        access_request_id=request.id,
    )


@router.post("/{summary_id}/audio", response_model=SummaryRead)
def generate_summary_audio(
    summary_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    require_role(user, {RoleName.PATIENT, RoleName.GUARDIAN, RoleName.DOCTOR, RoleName.ADMIN})
    service = SummaryService(db)
    try:
        return service.synthesize_audio(summary_id=summary_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Audio generation failed: {exc}",
        ) from exc


@router.get("/patients/{patient_id}", response_model=list[SummaryRead])
def list_patient_summaries(
    patient_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    require_role(user, {RoleName.PATIENT, RoleName.GUARDIAN, RoleName.DOCTOR, RoleName.ADMIN})
    users = UserRepository(db)

    if user.role == RoleName.PATIENT:
        patient = users.get_patient_by_user_id(user.user_id)
        if patient is None or patient.id != patient_id:
            raise HTTPException(status_code=403, detail="Not authorized for this patient")

    if user.role == RoleName.GUARDIAN and not users.is_guardian_of_patient(user.user_id, patient_id):
        raise HTTPException(status_code=403, detail="Not authorized for this patient")

    service = SummaryService(db)
    return service.list_patient_summaries(patient_id=patient_id)


@router.post("/patients/{patient_id}/audit-digest", response_model=SummaryRead)
def generate_audit_digest(
    patient_id: int,
    payload: AuditDigestCreateRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    require_role(user, {RoleName.PATIENT, RoleName.GUARDIAN, RoleName.ADMIN})
    users = UserRepository(db)

    if user.role == RoleName.PATIENT:
        patient = users.get_patient_by_user_id(user.user_id)
        if patient is None or patient.id != patient_id:
            raise HTTPException(status_code=403, detail="Not authorized for this patient")

    if user.role == RoleName.GUARDIAN and not users.is_guardian_of_patient(user.user_id, patient_id):
        raise HTTPException(status_code=403, detail="Not authorized for this patient")

    service = SummaryService(db)
    return service.generate_audit_digest(
        patient_id=patient_id,
        audit_events=payload.audit_events,
        access_request_id=payload.access_request_id,
    )


@router.post("/patients/{patient_id}/visit-recommendation", response_model=SummaryRead)
def generate_visit_recommendation(
    patient_id: int,
    payload: VisitRecommendationCreateRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    require_role(user, {RoleName.DOCTOR, RoleName.ADMIN})
    service = SummaryService(db)
    return service.generate_visit_recommendation(
        patient_id=patient_id,
        patient_context=payload.patient_context,
        last_physical_date=payload.last_physical_date,
        current_symptoms=payload.current_symptoms,
        access_request_id=payload.access_request_id,
    )


@router.patch("/{summary_id}", response_model=SummaryRead)
def update_summary_content(
    summary_id: int,
    payload: SummaryUpdateRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    require_role(user, {RoleName.DOCTOR, RoleName.ADMIN})
    service = SummaryService(db)
    try:
        return service.update_summary_content(summary_id=summary_id, content=payload.content)
    except ValueError as exc:
        detail = str(exc)
        status = 404 if "not found" in detail.lower() else 400
        raise HTTPException(status_code=status, detail=detail) from exc


@router.get("/{summary_id}/audio/stream")
def stream_summary_audio(
    summary_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[CurrentUser, Depends(get_current_user)],
):
    require_role(user, {RoleName.PATIENT, RoleName.GUARDIAN, RoleName.DOCTOR, RoleName.ADMIN})
    service = SummaryService(db)
    try:
        audio = service.get_audio_bytes(summary_id=summary_id)
        return Response(content=audio, media_type="audio/mpeg")
    except ValueError as exc:
        detail = str(exc)
        status = 404 if "not found" in detail.lower() else 400
        raise HTTPException(status_code=status, detail=detail) from exc
