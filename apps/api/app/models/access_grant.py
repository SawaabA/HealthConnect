from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class AccessGrant(Base):
    __tablename__ = "access_grants"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    access_request_id: Mapped[int] = mapped_column(ForeignKey("access_requests.id"), nullable=False, index=True)
    doctor_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False, index=True)
    granted_categories: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    access_request = relationship("AccessRequest", back_populates="access_grants")
    patient = relationship("Patient")
    doctor = relationship("User", foreign_keys=[doctor_user_id])
    created_by = relationship("User", foreign_keys=[created_by_user_id])
    audit_logs = relationship("AuditLog", back_populates="access_grant")
