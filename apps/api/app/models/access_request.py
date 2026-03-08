from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class AccessRequest(Base):
    __tablename__ = "access_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    doctor_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False, index=True)
    requested_categories: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    requested_duration_hours: Mapped[int] = mapped_column(Integer, nullable=False)
    break_glass_requested: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(24), default="pending", nullable=False, index=True)
    requested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime)
    decided_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))

    doctor = relationship("User", foreign_keys=[doctor_user_id])
    patient = relationship("Patient")
    decided_by = relationship("User", foreign_keys=[decided_by_user_id])
    access_grants = relationship("AccessGrant", back_populates="access_request")
    audit_logs = relationship("AuditLog", back_populates="access_request")
