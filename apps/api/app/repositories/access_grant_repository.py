from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.access_grant import AccessGrant


class AccessGrantRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(
        self,
        *,
        access_request_id: int,
        doctor_user_id: int,
        patient_id: int,
        granted_categories: list[str],
        starts_at: datetime,
        expires_at: datetime,
        created_by_user_id: int,
    ) -> AccessGrant:
        grant = AccessGrant(
            access_request_id=access_request_id,
            doctor_user_id=doctor_user_id,
            patient_id=patient_id,
            granted_categories=granted_categories,
            starts_at=starts_at,
            expires_at=expires_at,
            created_by_user_id=created_by_user_id,
        )
        self.db.add(grant)
        self.db.flush()
        self.db.refresh(grant)
        return grant

    def get_by_id(self, grant_id: int) -> AccessGrant | None:
        stmt = select(AccessGrant).where(AccessGrant.id == grant_id)
        return self.db.scalar(stmt)

    def list_for_doctor_and_patient(self, doctor_user_id: int, patient_id: int) -> list[AccessGrant]:
        stmt = select(AccessGrant).where(
            AccessGrant.doctor_user_id == doctor_user_id,
            AccessGrant.patient_id == patient_id,
        )
        return list(self.db.scalars(stmt))

    def list_for_request(self, request_id: int) -> list[AccessGrant]:
        stmt = select(AccessGrant).where(AccessGrant.access_request_id == request_id)
        return list(self.db.scalars(stmt))

    def save(self, grant: AccessGrant) -> AccessGrant:
        self.db.add(grant)
        self.db.flush()
        self.db.refresh(grant)
        return grant
