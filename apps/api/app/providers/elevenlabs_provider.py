import httpx

from app.core.config import settings
from app.providers.interfaces import TTSProvider


class ElevenLabsProvider(TTSProvider):
    def __init__(
        self,
        api_key: str | None = None,
        voice_id: str | None = None,
        model_id: str | None = None,
        output_format: str | None = None,
    ) -> None:
        self.api_key = api_key or settings.elevenlabs_api_key
        self.voice_id = voice_id or settings.elevenlabs_voice_id
        self.model_id = model_id or settings.elevenlabs_model_id
        self.output_format = output_format or settings.elevenlabs_output_format

    def synthesize(self, *, text: str, voice_id: str | None = None) -> bytes:
        if not self.api_key:
            raise RuntimeError("ELEVENLABS_API_KEY is not set")

        selected_voice_id = voice_id or self.voice_id
        endpoint = f"https://api.elevenlabs.io/v1/text-to-speech/{selected_voice_id}"
        headers = {
            "xi-api-key": self.api_key,
            "accept": "audio/mpeg",
            "content-type": "application/json",
        }
        payload = {
            "text": text,
            "model_id": self.model_id,
            "voice_settings": {"stability": 0.4, "similarity_boost": 0.8},
        }

        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                endpoint,
                headers=headers,
                json=payload,
                params={"output_format": self.output_format},
            )
            response.raise_for_status()
            return response.content
