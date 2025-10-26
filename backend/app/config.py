from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGO_CONNECTION_STRING: str
    CLOUDFLARE_TURNSTILE_SECRET_KEY: str
    ENABLE_DOCS: bool = True

    # Comma separated string of allowed origins
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
