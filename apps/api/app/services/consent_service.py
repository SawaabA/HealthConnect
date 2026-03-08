from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.enums import AccessRequestStatus, AuditAction, RecordCategory
from app.repositories.access_grant_repository import AccessGrantRepository
from app.repositories.access_request_repository import AccessRequestRepository
from app.repositories.user_repository import UserRepository
from app.services.audit_service import AuditService


class ConsentService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.access_requests = AccessRequestRepository(db)
        self.access_grants = AccessGrantRepository(db)
        self.users = UserRepository(db)
        self.audit = AuditService(db)

    def approve_request(
        self,
        *,
        request_id: int,
        approver_user_id: int,
        approved_categories: list[RecordCategory] | None = None,
        duration_hours: int | None = None,
    ):
        access_request = self.access_requests.get_by_id(request_id)
        if access_request is None:
            raise ValueError("Access request not found")
        if access_request.status != AccessRequestStatus.PENDING.value:
            raise ValueError("Only pending requests can be approved")
        if not self._is_patient_or_guardian(approver_user_id, access_request.patient_id):
            raise PermissionError("Only the patient or guardian can approve")

        requested_scope = set(access_request.requested_categories)
        granted_scope = (
            {category.value for category in approved_categories}
            if approved_categories
            else set(requested_scope)
        )
        if not granted_scope.issubset(requested_scope):
            raise ValueError("Approved categories must be a subset of requested categories")

        starts_at = datetime.utcnow()
        expires_at = starts_at + timedelta(hours=duration_hours or access_request.requested_duration_hours)

        grant = self.access_grants.create(
            access_request_id=access_request.id,
            doctor_user_id=access_request.doctor_user_id,
            patient_id=access_request.patient_id,
            granted_categories=sorted(granted_scope),
            starts_at=starts_at,
            expires_at=expires_at,
            created_by_user_id=approver_user_id,
        )

        access_request.status = AccessRequestStatus.APPROVED.value
        access_request.decided_at = starts_at
        access_request.decided_by_user_id = approver_user_id
        self.access_requests.save(access_request)

        self.audit.log(
            actor_user_id=approver_user_id,
            action=AuditAction.ACCESS_REQUEST_APPROVED.value,
            access_request_id=access_request.id,
            access_grant_id=grant.id,
            details={
                "granted_categories": sorted(granted_scope),
                "starts_at": starts_at.isoformat(),
                "expires_at": expires_at.isoformat(),
            },
        )
        self.db.commit()
        return access_request, grant

    def deny_request(self, *, request_id: int, approver_user_id: int):
        access_request = self.access_requests.get_by_id(request_id)
        if access_request is None:
            raise ValueError("Access request not found")
        if access_request.status != AccessRequestStatus.PENDING.value:
            raise ValueError("Only pending requests can be denied")
        if not self._is_patient_or_guardian(approver_user_id, access_request.patient_id):
            raise PermissionError("Only the patient or guardian can deny")

        now = datetime.utcnow()
        access_request.status = AccessRequestStatus.DENIED.value
        access_request.decided_at = now
        access_request.decided_by_user_id = approver_user_id
        self.access_requests.save(access_request)

        self.audit.log(
            actor_user_id=approver_user_id,
            action=AuditAction.ACCESS_REQUEST_DENIED.value,
            access_request_id=access_request.id,
            details={"denied_at": now.isoformat()},
        )
        self.db.commit()
        return access_request

    def revoke_grant(self, *, grant_id: int, actor_user_id: int):
        grant = self.access_grants.get_by_id(grant_id)
        if grant is None:
            raise ValueError("Grant not found")
        if not self._is_patient_or_guardian(actor_user_id, grant.patient_id):
            raise PermissionError("Only the patient or guardian can revoke this grant")

        if grant.revoked_at is None:
            grant.revoked_at = datetime.utcnow()
            self.access_grants.save(grant)

        access_request = self.access_requests.get_by_id(grant.access_request_id)
        if access_request and access_request.status == AccessRequestStatus.APPROVED.value:
            access_request.status = AccessRequestStatus.REVOKED.value
            self.access_requests.save(access_request)

        self.audit.log(
            actor_user_id=actor_user_id,
            action=AuditAction.ACCESS_GRANT_REVOKED.value,
            access_request_id=grant.access_request_id,
            access_grant_id=grant.id,
            details={"revoked_at": grant.revoked_at.isoformat()},
        )
        self.db.commit()
        return grant

    def _is_patient_or_guardian(self, user_id: int, patient_id: int) -> bool:
        patient = self.users.get_patient_by_user_id(user_id)
        if patient and patient.id == patient_id:
            return True
        return self.users.is_guardian_of_patient(user_id, patient_id)
