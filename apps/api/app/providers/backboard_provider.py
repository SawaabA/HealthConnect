import httpx

from app.core.config import settings
from app.providers.interfaces import AISummaryProvider


class BackboardProvider(AISummaryProvider):
    def __init__(self, base_url: str | None = None, api_key: str | None = None) -> None:
        self.base_url = base_url or settings.backboard_base_url
        self.api_key = api_key or settings.backboard_api_key

    def _post(self, endpoint: str, payload: dict) -> str:
        if not self.api_key:
            raise RuntimeError("BACKBOARD_API_KEY is not set")

        headers = {"Authorization": f"Bearer {self.api_key}"}
        with httpx.Client(timeout=20.0) as client:
            response = client.post(f"{self.base_url.rstrip('/')}/{endpoint}", json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
        return self._extract_text(data)

    @staticmethod
    def _extract_text(data: dict) -> str:
        primary_keys = (
            "summary",
            "output",
            "digest",
            "briefing",
            "explanation",
            "report",
            "recommendation",
            "result",
            "text",
        )
        for key in primary_keys:
            value = data.get(key)
            if isinstance(value, str) and value.strip():
                return value

        nested = data.get("data")
        if isinstance(nested, dict):
            for key in primary_keys:
                value = nested.get(key)
                if isinstance(value, str) and value.strip():
                    return value

        return ""

    def generate_patient_summary(self, *, patient_context: str, request_reason: str | None = None) -> str:
        return self._post(
            "summaries/patient",
            {"patient_context": patient_context, "request_reason": request_reason},
        )

    def generate_doctor_brief(self, *, patient_context: str, visit_context: str | None = None) -> str:
        return self._post(
            "summaries/doctor",
            {"patient_context": patient_context, "visit_context": visit_context},
        )

    def generate_audit_summary(self, *, audit_events: list[dict]) -> str:
        return self._post(
            "summaries/audit",
            {"audit_events": audit_events},
        )

    def generate_visit_recommendation(
        self,
        *,
        patient_context: str,
        last_physical_date: str | None = None,
        current_symptoms: list[str] | None = None,
    ) -> str:
        return self._post(
            "summaries/visit-recommendation",
            {
                "patient_context": patient_context,
                "last_physical_date": last_physical_date,
                "current_symptoms": current_symptoms or [],
            },
        )
