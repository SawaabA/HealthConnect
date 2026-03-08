from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.guardian import Guardian
from app.models.patient import Patient
from app.models.user import User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_first_user(self) -> User | None:
        return self.db.scalar(select(User).order_by(User.id.asc()))

    def get_user_by_id(self, user_id: int) -> User | None:
        return self.db.scalar(select(User).where(User.id == user_id))

    def get_patient_by_id(self, patient_id: int) -> Patient | None:
        return self.db.scalar(select(Patient).where(Patient.id == patient_id))

    def get_patient_by_user_id(self, user_id: int) -> Patient | None:
        stmt = select(Patient).where(Patient.user_id == user_id)
        return self.db.scalar(stmt)

    def is_guardian_of_patient(self, guardian_user_id: int, patient_id: int) -> bool:
        stmt = select(Guardian).where(
            Guardian.guardian_user_id == guardian_user_id,
            Guardian.patient_id == patient_id,
        )
        return self.db.scalar(stmt) is not None
