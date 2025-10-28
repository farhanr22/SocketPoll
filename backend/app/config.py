from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    MONGO_CONNECTION_STRING: str
    CLOUDFLARE_TURNSTILE_SECRET_KEY: str
    ENABLE_DOCS: bool = True

    # Comma separated string of allowed origins
    ALLOWED_ORIGINS: str = "http://localhost:3000"

settings = Settings()
