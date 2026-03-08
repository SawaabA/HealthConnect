from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.enums import AuditAction, SummaryType
from app.providers.backboard_provider import BackboardProvider
from app.providers.interfaces import AISummaryProvider, ObjectStorageProvider, TTSProvider
from app.providers.elevenlabs_provider import ElevenLabsProvider
from app.providers.mock_provider import MockProvider
from app.providers.mock_tts_provider import MockTTSProvider
from app.providers.storage_provider import LocalStorageProvider, VultrObjectStorageProvider
from app.repositories.summary_repository import SummaryRepository
from app.services.audit_service import AuditService


def resolve_summary_provider() -> AISummaryProvider:
    if settings.ai_provider.lower() == "backboard":
        return BackboardProvider()
    return MockProvider()


def resolve_tts_provider() -> TTSProvider:
    if settings.tts_provider.lower() == "elevenlabs":
        return ElevenLabsProvider()
    return MockTTSProvider()


def resolve_storage_provider() -> ObjectStorageProvider:
    if settings.storage_provider.lower() == "vultr":
        return VultrObjectStorageProvider()
    return LocalStorageProvider()


class SummaryService:
    def __init__(
        self,
        db: Session,
        summary_provider: AISummaryProvider | None = None,
        tts_provider: TTSProvider | None = None,
        storage_provider: ObjectStorageProvider | None = None,
    ) -> None:
        self.db = db
        self.summary_provider = summary_provider or resolve_summary_provider()
        self.tts_provider = tts_provider or resolve_tts_provider()
        self.storage_provider = storage_provider or resolve_storage_provider()
        self.summaries = SummaryRepository(db)
        self.audit = AuditService(db)

    def generate_patient_summary(
        self,
        *,
        patient_id: int,
        patient_context: str,
        request_reason: str | None = None,
        access_request_id: int | None = None,
    ):
        generated = self.summary_provider.generate_patient_summary(
            patient_context=patient_context,
            request_reason=request_reason,
        )
        content = self._with_disclaimer(generated)
        summary = self.summaries.create(
            patient_id=patient_id,
            summary_type=SummaryType.PATIENT_EXPLANATION.value,
            content=content,
            disclaimer=settings.summary_disclaimer,
            access_request_id=access_request_id,
        )
        self.audit.log(
            actor_user_id=None,
            action=AuditAction.SUMMARY_GENERATED.value,
            access_request_id=access_request_id,
            details={"summary_id": summary.id, "summary_type": SummaryType.PATIENT_EXPLANATION.value},
        )
        self.db.commit()
        return summary

    def generate_doctor_brief(
        self,
        *,
        patient_id: int,
        patient_context: str,
        visit_context: str | None = None,
        access_request_id: int | None = None,
    ):
        generated = self.summary_provider.generate_doctor_brief(
            patient_context=patient_context,
            visit_context=visit_context,
        )
        content = self._with_disclaimer(generated)
        summary = self.summaries.create(
            patient_id=patient_id,
            summary_type=SummaryType.DOCTOR_BRIEF.value,
            content=content,
            disclaimer=settings.summary_disclaimer,
            access_request_id=access_request_id,
        )
        self.audit.log(
            actor_user_id=None,
            action=AuditAction.SUMMARY_GENERATED.value,
            access_request_id=access_request_id,
            details={"summary_id": summary.id, "summary_type": SummaryType.DOCTOR_BRIEF.value},
        )
        self.db.commit()
        return summary

    def generate_audit_digest(
        self,
        *,
        patient_id: int,
        audit_events: list[dict],
        access_request_id: int | None = None,
    ):
        try:
            generated = self.summary_provider.generate_audit_summary(audit_events=audit_events)
        except Exception:
            # Keep demo flow alive if external provider payload/endpoint changes.
            generated = MockProvider().generate_audit_summary(audit_events=audit_events)

        if not generated.strip():
            generated = MockProvider().generate_audit_summary(audit_events=audit_events)
        content = self._with_disclaimer(generated)
        summary = self.summaries.create(
            patient_id=patient_id,
            summary_type=SummaryType.AUDIT_DIGEST.value,
            content=content,
            disclaimer=settings.summary_disclaimer,
            access_request_id=access_request_id,
        )
        self.audit.log(
            actor_user_id=None,
            action=AuditAction.SUMMARY_GENERATED.value,
            access_request_id=access_request_id,
            details={"summary_id": summary.id, "summary_type": SummaryType.AUDIT_DIGEST.value},
        )
        self.db.commit()
        return summary

    def generate_visit_recommendation(
        self,
        *,
        patient_id: int,
        patient_context: str,
        last_physical_date: str | None = None,
        current_symptoms: list[str] | None = None,
        access_request_id: int | None = None,
    ):
        try:
            generated = self.summary_provider.generate_visit_recommendation(
                patient_context=patient_context,
                last_physical_date=last_physical_date,
                current_symptoms=current_symptoms or [],
            )
        except Exception:
            generated = MockProvider().generate_visit_recommendation(
                patient_context=patient_context,
                last_physical_date=last_physical_date,
                current_symptoms=current_symptoms or [],
            )

        if not generated.strip():
            generated = MockProvider().generate_visit_recommendation(
                patient_context=patient_context,
                last_physical_date=last_physical_date,
                current_symptoms=current_symptoms or [],
            )

        content = self._with_disclaimer(generated)
        summary = self.summaries.create(
            patient_id=patient_id,
            summary_type=SummaryType.VISIT_RECOMMENDATION.value,
            content=content,
            disclaimer=settings.summary_disclaimer,
            access_request_id=access_request_id,
        )
        self.audit.log(
            actor_user_id=None,
            action=AuditAction.SUMMARY_GENERATED.value,
            access_request_id=access_request_id,
            details={"summary_id": summary.id, "summary_type": SummaryType.VISIT_RECOMMENDATION.value},
        )
        self.db.commit()
        return summary

    def synthesize_audio(self, *, summary_id: int, voice_id: str | None = None):
        summary = self.summaries.get_by_id(summary_id)
        if summary is None:
            raise ValueError("Summary not found")

        audio = self.tts_provider.synthesize(text=summary.content, voice_id=voice_id)
        storage_key = f"summaries/{summary.id}.mp3"
        try:
            self.storage_provider.upload_bytes(key=storage_key, content=audio, content_type="audio/mpeg")
            summary.audio_storage_key = storage_key
        except Exception:
            # Demo fallback: if remote object storage is misconfigured, keep audio usable locally.
            local_storage = LocalStorageProvider()
            local_storage.upload_bytes(key=storage_key, content=audio, content_type="audio/mpeg")
            summary.audio_storage_key = f"local:{storage_key}"
        self.summaries.save(summary)

        self.audit.log(
            actor_user_id=None,
            action=AuditAction.AUDIO_GENERATED.value,
            access_request_id=summary.access_request_id,
            details={"summary_id": summary.id, "audio_storage_key": storage_key},
        )
        self.db.commit()
        return summary

    def get_audio_bytes(self, *, summary_id: int) -> bytes:
        summary = self.summaries.get_by_id(summary_id)
        if summary is None:
            raise ValueError("Summary not found")
        if not summary.audio_storage_key:
            raise ValueError("Audio has not been generated for this summary")
        if summary.audio_storage_key.startswith("local:"):
            key = summary.audio_storage_key.removeprefix("local:")
            return LocalStorageProvider().download_bytes(key=key)
        return self.storage_provider.download_bytes(key=summary.audio_storage_key)

    def update_summary_content(self, *, summary_id: int, content: str):
        summary = self.summaries.get_by_id(summary_id)
        if summary is None:
            raise ValueError("Summary not found")
        if not content or not content.strip():
            raise ValueError("Summary content cannot be empty")

        summary.content = self._with_disclaimer(content.strip())
        self.summaries.save(summary)
        self.audit.log(
            actor_user_id=None,
            action=AuditAction.SUMMARY_EDITED.value,
            access_request_id=summary.access_request_id,
            details={"summary_id": summary.id},
        )
        self.db.commit()
        return summary

    def list_patient_summaries(self, *, patient_id: int):
        return self.summaries.list_by_patient(patient_id)

    @staticmethod
    def _with_disclaimer(content: str) -> str:
        disclaimer = settings.summary_disclaimer
        if disclaimer in content:
            return content
        return f"{content}\n\n{disclaimer}"
