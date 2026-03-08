from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.health_record import HealthRecord


class HealthRecordRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_by_patient_and_categories(
        self,
        *,
        patient_id: int,
        categories: set[str] | None,
    ) -> list[HealthRecord]:
        stmt = select(HealthRecord).where(HealthRecord.patient_id == patient_id)
        if categories:
            stmt = stmt.where(HealthRecord.category.in_(categories))
        stmt = stmt.order_by(HealthRecord.uploaded_at.desc())
        return list(self.db.scalars(stmt))

    def get_by_id(self, record_id: int) -> HealthRecord | None:
        stmt = select(HealthRecord).where(HealthRecord.id == record_id)
        return self.db.scalar(stmt)
