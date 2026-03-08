from datetime import datetime

from sqlalchemy.orm import Session

from app.models.enums import AccessRequestStatus, AuditAction
from app.repositories.access_grant_repository import AccessGrantRepository
from app.repositories.access_request_repository import AccessRequestRepository
from app.repositories.health_record_repository import HealthRecordRepository
from app.services.audit_service import AuditService


class AccessControlService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.access_grants = AccessGrantRepository(db)
        self.access_requests = AccessRequestRepository(db)
        self.health_records = HealthRecordRepository(db)
        self.audit = AuditService(db)

    def get_accessible_categories(
        self,
        *,
        doctor_user_id: int,
        patient_id: int,
        now: datetime | None = None,
    ) -> set[str]:
        now = now or datetime.utcnow()
        grants = self.access_grants.list_for_doctor_and_patient(doctor_user_id, patient_id)
        categories: set[str] = set()
        changed = False

        for grant in grants:
            if grant.revoked_at is not None:
                continue

            if now >= grant.expires_at:
                changed = self._mark_request_expired(grant.access_request_id, now) or changed
                self.audit.log(
                    actor_user_id=None,
                    action=AuditAction.ACCESS_EXPIRED.value,
                    access_request_id=grant.access_request_id,
                    access_grant_id=grant.id,
                    details={"expired_at": grant.expires_at.isoformat()},
                )
                continue

            if grant.starts_at <= now:
                categories.update(grant.granted_categories)

        if changed:
            self.db.commit()

        return categories

    def list_accessible_records(
        self,
        *,
        doctor_user_id: int,
        patient_id: int,
        now: datetime | None = None,
    ):
        categories = self.get_accessible_categories(
            doctor_user_id=doctor_user_id,
            patient_id=patient_id,
            now=now,
        )
        if not categories:
            return []
        return self.health_records.list_by_patient_and_categories(
            patient_id=patient_id,
            categories=categories,
        )

    def can_view_category(
        self,
        *,
        doctor_user_id: int,
        patient_id: int,
        category: str,
        now: datetime | None = None,
    ) -> bool:
        categories = self.get_accessible_categories(
            doctor_user_id=doctor_user_id,
            patient_id=patient_id,
            now=now,
        )
        return category in categories

    def register_record_view(
        self,
        *,
        doctor_user_id: int,
        access_request_id: int | None,
        patient_id: int,
        record_id: int,
        category: str,
    ) -> None:
        self.audit.log(
            actor_user_id=doctor_user_id,
            action=AuditAction.RECORD_VIEWED.value,
            access_request_id=access_request_id,
            details={"patient_id": patient_id, "record_id": record_id, "category": category},
        )
        self.db.commit()

    def _mark_request_expired(self, request_id: int, now: datetime) -> bool:
        access_request = self.access_requests.get_by_id(request_id)
        if access_request is None:
            return False
        if access_request.status != AccessRequestStatus.APPROVED.value:
            return False

        access_request.status = AccessRequestStatus.EXPIRED.value
        access_request.decided_at = now
        self.access_requests.save(access_request)
        return True
