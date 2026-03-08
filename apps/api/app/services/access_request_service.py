from sqlalchemy.orm import Session

from app.models.enums import AuditAction
from app.repositories.access_request_repository import AccessRequestRepository
from app.repositories.user_repository import UserRepository
from app.schemas.access_request import AccessRequestCreate
from app.services.audit_service import AuditService


class AccessRequestService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.access_requests = AccessRequestRepository(db)
        self.users = UserRepository(db)
        self.audit = AuditService(db)

    def create_access_request(self, *, doctor_user_id: int, payload: AccessRequestCreate):
        patient = self.users.get_patient_by_id(payload.patient_id)
        if patient is None:
            raise ValueError("Patient not found")

        access_request = self.access_requests.create(
            doctor_user_id=doctor_user_id,
            patient_id=payload.patient_id,
            requested_categories=[category.value for category in payload.categories],
            reason=payload.reason,
            requested_duration_hours=payload.duration_hours,
            break_glass_requested=payload.break_glass_requested,
        )

        if payload.break_glass_requested:
            self.audit.log(
                actor_user_id=doctor_user_id,
                action=AuditAction.BREAK_GLASS_REQUESTED.value,
                access_request_id=access_request.id,
                details={"placeholder": True},
            )

        self.audit.log(
            actor_user_id=doctor_user_id,
            action=AuditAction.ACCESS_REQUEST_CREATED.value,
            access_request_id=access_request.id,
            details={
                "patient_id": payload.patient_id,
                "categories": [category.value for category in payload.categories],
                "duration_hours": payload.duration_hours,
            },
        )
        self.db.commit()
        return access_request

    def get_access_request(self, request_id: int):
        access_request = self.access_requests.get_by_id(request_id)
        if access_request is None:
            raise ValueError("Access request not found")
        return access_request

    def list_patient_requests(self, patient_id: int):
        return self.access_requests.list_for_patient(patient_id)

    def list_doctor_requests(self, doctor_user_id: int):
        return self.access_requests.list_for_doctor(doctor_user_id)
