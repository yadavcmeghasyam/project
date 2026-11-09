import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "TrustLens AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Backend server config
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # MongoDB settings (falls back to local in-memory/file storage if unreachable)
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "trustlens_db"
    
    # LLM Settings (Optional - demo mode works automatically without keys)
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    DEFAULT_MODEL: str = "gemini-1.5-flash"
    
    # Auditor scoring weights
    SUPPORTED_WEIGHT: float = 1.0
    PARTIALLY_SUPPORTED_WEIGHT: float = 0.6
    UNSUPPORTED_WEIGHT: float = 0.2
    CONTRADICTED_WEIGHT: float = 0.0

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
