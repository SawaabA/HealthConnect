from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Guardian(Base):
    __tablename__ = "guardians"
    __table_args__ = (
        UniqueConstraint("guardian_user_id", "patient_id", name="uq_guardian_patient"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    guardian_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False)
    relationship_label: Mapped[str] = mapped_column(String(60), default="guardian", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    guardian_user = relationship("User", back_populates="guardian_links")
    patient = relationship("Patient", back_populates="guardians")
