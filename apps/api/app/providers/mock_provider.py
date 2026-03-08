from datetime import date

from app.providers.interfaces import AISummaryProvider


class MockProvider(AISummaryProvider):
    @staticmethod
    def _detect_profile(patient_context: str) -> dict[str, str]:
        context = (patient_context or "").lower()
        if "sarah chen" in context or "type 1 diabetes" in context:
            return {
                "label": "Sarah Chen profile",
                "risk": "low to moderate",
                "focus": "glycemic stability and hydration habits",
                "visit_hint": "review insulin adherence and HbA1c trend",
            }
        if "daniel okafor" in context or "hypertension" in context or "ckd" in context:
            return {
                "label": "Daniel Okafor profile",
                "risk": "moderate",
                "focus": "renal monitoring and blood pressure control",
                "visit_hint": "check edema progression and kidney panel",
            }
        if "leila minhas" in context or "asthma" in context:
            return {
                "label": "Leila Minhas profile",
                "risk": "pediatric monitoring",
                "focus": "trigger avoidance and inhaler technique",
                "visit_hint": "validate school action plan and rescue inhaler use",
            }
        if "amina yusuf" in context or "migraine" in context:
            return {
                "label": "Amina Yusuf profile",
                "risk": "episodic symptom risk",
                "focus": "headache trigger tracking and medication response",
                "visit_hint": "review frequency pattern and red-flag symptoms",
            }
        return {
            "label": "General profile",
            "risk": "standard review",
            "focus": "core symptom review",
            "visit_hint": "confirm timeline and treatment adherence",
        }

    def generate_patient_summary(self, *, patient_context: str, request_reason: str | None = None) -> str:
        reason = request_reason or "routine care"
        profile = self._detect_profile(patient_context)
        return (
            f"{profile['label']} summary for {reason}. "
            f"Your records suggest {profile['focus']}. "
            f"Next step: {profile['visit_hint']}. "
            f"Highlights from file text: {patient_context[:220]}"
        )

    def generate_doctor_brief(self, *, patient_context: str, visit_context: str | None = None) -> str:
        visit = visit_context or "upcoming appointment"
        profile = self._detect_profile(patient_context)
        return (
            f"Doctor briefing for {visit} ({profile['label']}). "
            f"Risk band: {profile['risk']}. "
            f"Priority focus: {profile['focus']}. "
            f"Action cue: {profile['visit_hint']}. "
            f"Timeline snapshot: {patient_context[:220]}"
        )

    def generate_audit_summary(self, *, audit_events: list[dict]) -> str:
        if not audit_events:
            return "No audit events were found for the selected range."

        top_actions: dict[str, int] = {}
        for event in audit_events:
            action = str(event.get("action") or event.get("event") or "unknown")
            top_actions[action] = top_actions.get(action, 0) + 1

        ranked = sorted(top_actions.items(), key=lambda item: item[1], reverse=True)
        highlights = ", ".join([f"{action} ({count})" for action, count in ranked[:4]])
        return (
            f"Audit digest generated from {len(audit_events)} events. "
            f"Most frequent actions: {highlights}."
        )

    def generate_visit_recommendation(
        self,
        *,
        patient_context: str,
        last_physical_date: str | None = None,
        current_symptoms: list[str] | None = None,
    ) -> str:
        symptom_list = [item.strip() for item in (current_symptoms or []) if item and item.strip()]
        symptom_text = ", ".join(symptom_list[:4]) if symptom_list else "no urgent symptoms reported"
        profile = self._detect_profile(patient_context)

        days_since_physical = None
        if last_physical_date:
            try:
                parsed = date.fromisoformat(last_physical_date)
                days_since_physical = (date.today() - parsed).days
            except ValueError:
                days_since_physical = None

        if days_since_physical is None:
            cadence = "book a routine check-in within 8 to 12 weeks"
        elif days_since_physical >= 365:
            cadence = "book a full annual physical in the next 2 weeks"
        elif days_since_physical >= 180:
            cadence = "book a follow-up within 2 to 4 weeks"
        elif symptom_list:
            cadence = "book a symptom-focused follow-up within 7 days"
        else:
            cadence = "maintain the current care plan and recheck in 8 weeks"

        return (
            f"{profile['label']} visit recommendation based on available timeline and symptoms: "
            f"{cadence}. Current symptom snapshot: {symptom_text}. "
            f"Priority focus: {profile['focus']}. "
            f"Context reviewed: {patient_context[:180]}"
        )
