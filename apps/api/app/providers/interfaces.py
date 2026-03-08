from abc import ABC, abstractmethod


class AISummaryProvider(ABC):
    @abstractmethod
    def generate_patient_summary(self, *, patient_context: str, request_reason: str | None = None) -> str:
        raise NotImplementedError

    @abstractmethod
    def generate_doctor_brief(self, *, patient_context: str, visit_context: str | None = None) -> str:
        raise NotImplementedError

    @abstractmethod
    def generate_audit_summary(self, *, audit_events: list[dict]) -> str:
        raise NotImplementedError

    @abstractmethod
    def generate_visit_recommendation(
        self,
        *,
        patient_context: str,
        last_physical_date: str | None = None,
        current_symptoms: list[str] | None = None,
    ) -> str:
        raise NotImplementedError


class TTSProvider(ABC):
    @abstractmethod
    def synthesize(self, *, text: str, voice_id: str | None = None) -> bytes:
        raise NotImplementedError


class ObjectStorageProvider(ABC):
    @abstractmethod
    def upload_bytes(self, *, key: str, content: bytes, content_type: str) -> None:
        raise NotImplementedError

    @abstractmethod
    def download_bytes(self, *, key: str) -> bytes:
        raise NotImplementedError
