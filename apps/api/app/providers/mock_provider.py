from app.providers.interfaces import AISummaryProvider


class MockProvider(AISummaryProvider):
    def generate_patient_summary(self, *, patient_context: str, request_reason: str | None = None) -> str:
        reason = request_reason or "routine care"
        return (
            f"This is a plain-language explanation of your records for {reason}. "
            f"Highlights: {patient_context[:260]}"
        )

    def generate_doctor_brief(self, *, patient_context: str, visit_context: str | None = None) -> str:
        visit = visit_context or "upcoming appointment"
        return (
            f"Doctor briefing for {visit}. "
            f"Key findings and timeline snapshot: {patient_context[:300]}"
        )
