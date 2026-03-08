from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    actor_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), index=True)
    action: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    access_request_id: Mapped[int | None] = mapped_column(ForeignKey("access_requests.id"), index=True)
    access_grant_id: Mapped[int | None] = mapped_column(ForeignKey("access_grants.id"), index=True)
    details: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    actor = relationship("User")
    access_request = relationship("AccessRequest", back_populates="audit_logs")
    access_grant = relationship("AccessGrant", back_populates="audit_logs")
