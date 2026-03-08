from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.access_request import AccessRequest


class AccessRequestRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(
        self,
        *,
        doctor_user_id: int,
        patient_id: int,
        requested_categories: list[str],
        reason: str,
        requested_duration_hours: int,
        break_glass_requested: bool,
    ) -> AccessRequest:
        access_request = AccessRequest(
            doctor_user_id=doctor_user_id,
            patient_id=patient_id,
            requested_categories=requested_categories,
            reason=reason,
            requested_duration_hours=requested_duration_hours,
            break_glass_requested=break_glass_requested,
            status="pending",
        )
        self.db.add(access_request)
        self.db.flush()
        self.db.refresh(access_request)
        return access_request

    def get_by_id(self, request_id: int) -> AccessRequest | None:
        stmt = select(AccessRequest).where(AccessRequest.id == request_id)
        return self.db.scalar(stmt)

    def list_for_patient(self, patient_id: int) -> list[AccessRequest]:
        stmt = (
            select(AccessRequest)
            .where(AccessRequest.patient_id == patient_id)
            .order_by(AccessRequest.requested_at.desc())
        )
        return list(self.db.scalars(stmt))

    def list_for_doctor(self, doctor_user_id: int) -> list[AccessRequest]:
        stmt = (
            select(AccessRequest)
            .where(AccessRequest.doctor_user_id == doctor_user_id)
            .order_by(AccessRequest.requested_at.desc())
        )
        return list(self.db.scalars(stmt))

    def save(self, access_request: AccessRequest) -> AccessRequest:
        self.db.add(access_request)
        self.db.flush()
        self.db.refresh(access_request)
        return access_request
