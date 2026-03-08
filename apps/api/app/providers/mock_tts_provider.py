from app.providers.interfaces import TTSProvider


class MockTTSProvider(TTSProvider):
    def synthesize(self, *, text: str, voice_id: str | None = None) -> bytes:
        payload = f"MOCK-AUDIO::{voice_id or 'default'}::{text}"
        return payload.encode("utf-8")
