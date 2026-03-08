from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.summary import Summary


class SummaryRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(
        self,
        *,
        patient_id: int,
        summary_type: str,
        content: str,
        disclaimer: str,
        access_request_id: int | None = None,
    ) -> Summary:
        summary = Summary(
            patient_id=patient_id,
            summary_type=summary_type,
            content=content,
            disclaimer=disclaimer,
            access_request_id=access_request_id,
        )
        self.db.add(summary)
        self.db.flush()
        self.db.refresh(summary)
        return summary

    def get_by_id(self, summary_id: int) -> Summary | None:
        stmt = select(Summary).where(Summary.id == summary_id)
        return self.db.scalar(stmt)

    def list_by_patient(self, patient_id: int, limit: int = 20) -> list[Summary]:
        stmt = (
            select(Summary)
            .where(Summary.patient_id == patient_id)
            .order_by(Summary.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt))

    def save(self, summary: Summary) -> Summary:
        self.db.add(summary)
        self.db.flush()
        self.db.refresh(summary)
        return summary
