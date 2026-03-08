from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    health_card_number: Mapped[str | None] = mapped_column(String(32))
    date_of_birth: Mapped[Date | None] = mapped_column(Date)

    user = relationship("User", back_populates="patient_profile")
    guardians = relationship("Guardian", back_populates="patient")
    health_records = relationship("HealthRecord", back_populates="patient")
