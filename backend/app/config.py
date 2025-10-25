from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_CONNECTION_STRING: str
    CLOUDFLARE_TURNSTILE_SECRET_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()