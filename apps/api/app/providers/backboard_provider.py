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
        return str(data.get("summary") or data.get("output") or "")

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
