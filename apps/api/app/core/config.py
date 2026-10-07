from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nirman API"
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./nirman.db"
    
    # Supabase (optional for hosted mode)
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # AI Provider
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
