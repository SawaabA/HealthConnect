from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "HealthConnect API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    sql_echo: bool = False
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    database_url: str = "sqlite:///./healthconnect.db"
    disable_auth: bool = True

    summary_disclaimer: str = "Assistive summary only. Not medical advice."

    auth0_domain: str | None = None
    auth0_audience: str | None = None
    auth0_issuer: str | None = None

    ai_provider: str = "mock"
    backboard_base_url: str = "https://api.backboard.io"
    backboard_api_key: str | None = None

    tts_provider: str = "mock"
    elevenlabs_api_key: str | None = None
    elevenlabs_voice_id: str = "EXAVITQu4vr4xnSDxMaL"

    storage_provider: str = "local"
    vultr_object_storage_endpoint: str | None = None
    vultr_object_storage_region: str = "ewr1"
    vultr_bucket_name: str | None = None
    vultr_access_key: str | None = None
    vultr_secret_key: str | None = None
    local_storage_path: str = "./generated-audio"


settings = Settings()
