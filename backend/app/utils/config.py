from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    openai_model_stt: str = Field("whisper-1", env="OPENAI_MODEL_STT")
    openai_model_tts: str = Field("gpt-4o-mini-tts", env="OPENAI_MODEL_TTS")
    openai_model_chat: str = Field("gpt-4o-mini", env="OPENAI_MODEL_CHAT")
    frontend_origin: str | None = Field(None, env="FRONTEND_ORIGIN")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
