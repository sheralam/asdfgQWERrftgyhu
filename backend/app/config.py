from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    # App
    app_name: str = "Campaign Studio API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Database
    database_host: str
    database_port: int = 5432
    database_name: str
    database_user: str
    database_password: str
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # CORS
    cors_origins: List[str] = ["http://localhost:5173"]
    
    # Encryption
    encryption_key: str
    
    class Config:
        env_file = ".env"
    
    @property
    def database_url(self) -> str:
        return f"postgresql://{self.database_user}:{self.database_password}@{self.database_host}:{self.database_port}/{self.database_name}"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
