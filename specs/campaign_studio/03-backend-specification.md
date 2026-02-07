# Backend Specification - Campaign Studio API

## 1. Technology Stack

- **Language**: Python 3.11+
- **Framework**: FastAPI 0.104+
- **ORM**: SQLAlchemy 2.0+
- **Database**: PostgreSQL 15+
- **Validation**: Pydantic v2
- **Authentication**: JWT (python-jose)
- **Password Hashing**: passlib with bcrypt
- **Migrations**: Alembic
- **Testing**: pytest, pytest-asyncio
- **CORS**: fastapi-cors-middleware
- **Environment**: python-dotenv

## 2. Project Structure

```
backend/
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry
│   ├── config.py               # Configuration management
│   ├── database.py             # Database connection
│   ├── dependencies.py         # Dependency injection
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── role.py
│   │   ├── campaign.py
│   │   ├── ad.py
│   │   ├── advertiser.py
│   │   └── audit_log.py
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── campaign.py
│   │   ├── ad.py
│   │   ├── advertiser.py
│   │   └── auth.py
│   ├── routers/                # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── campaigns.py
│   │   ├── ads.py
│   │   ├── advertisers.py
│   │   └── users.py
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── campaign_service.py
│   │   ├── ad_service.py
│   │   └── advertiser_service.py
│   ├── utils/                  # Utility functions
│   │   ├── __init__.py
│   │   ├── security.py
│   │   ├── encryption.py
│   │   └── validators.py
│   └── middleware/             # Custom middleware
│       ├── __init__.py
│       ├── auth_middleware.py
│       └── audit_middleware.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_campaigns.py
│   ├── test_ads.py
│   └── test_advertisers.py
├── requirements.txt
├── requirements-dev.txt
├── .env.example
├── alembic.ini
└── README.md
```

## 3. Core Dependencies (requirements.txt)

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.12.1
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-dotenv==1.0.0
```

## 4. Configuration (app/config.py)

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

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
    cors_origins: list[str] = ["http://localhost:5173"]
    
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
```

## 5. Database Connection (app/database.py)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## 6. Main Application (app/main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import auth, campaigns, ads, advertisers, users
from app.middleware.audit_middleware import AuditMiddleware

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware
app.add_middleware(AuditMiddleware)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(campaigns.router, prefix="/api/campaigns", tags=["Campaigns"])
app.include_router(ads.router, prefix="/api/ads", tags=["Ads"])
app.include_router(advertisers.router, prefix="/api/advertisers", tags=["Advertisers"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": settings.app_version}
```

## 7. Authentication & Security

### JWT Token Generation (app/utils/security.py)

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def decode_token(token: str):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None
```

### Authentication Dependency (app/dependencies.py)

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.security import decode_token
from app.models.user import User

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user

def require_role(required_roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role.role_name not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker
```

## 8. Key Models

### Campaign Model (app/models/campaign.py)

```python
from sqlalchemy import Column, String, Date, Integer, DateTime, ForeignKey, CheckConstraint, ARRAY, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base

class Campaign(Base):
    __tablename__ = "campaigns"
    
    campaign_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_name = Column(String(255), nullable=False)
    campaign_description = Column(Text)
    campaign_start_date = Column(Date, nullable=False)
    campaign_end_date = Column(Date, nullable=False)
    campaign_expiry_date = Column(Date)
    campaign_max_view_duration_value = Column(Integer)
    campaign_max_view_duration_unit = Column(String(20))
    campaign_max_view_count = Column(Integer)
    campaign_status = Column(String(20), nullable=False, default='draft')
    campaign_created_by_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id'), nullable=False)
    created_by_name = Column(String(200))
    updated_by_name = Column(String(200))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    created_by = relationship("User", foreign_keys=[campaign_created_by_id])
    ads = relationship("Ad", back_populates="campaign", cascade="all, delete-orphan")
    audience_targeting = relationship("CampaignAudienceTargeting", back_populates="campaign", cascade="all, delete-orphan")
    
    __table_args__ = (
        CheckConstraint("campaign_status IN ('active', 'inactive', 'paused', 'draft', 'expired')"),
        CheckConstraint("campaign_end_date >= campaign_start_date"),
    )

class CampaignAudienceTargeting(Base):
    __tablename__ = "campaign_audience_targeting"
    
    audience_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey('campaigns.campaign_id', ondelete='CASCADE'), nullable=False)
    region = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    cities = Column(ARRAY(Text))
    postcodes = Column(ARRAY(Text))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    campaign = relationship("Campaign", back_populates="audience_targeting")
```

### Ad Model (app/models/ad.py)

```python
from sqlalchemy import Column, String, Date, Integer, DateTime, ForeignKey, CheckConstraint, Text, Time, Boolean, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base

class Ad(Base):
    __tablename__ = "ads"
    
    ad_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey('campaigns.campaign_id', ondelete='CASCADE'), nullable=False)
    ad_type_id = Column(String(50), nullable=False)
    ad_name = Column(String(255), nullable=False)
    ad_description = Column(Text)
    media_type = Column(String(50), nullable=False)
    media_url = Column(Text)
    media_content = Column(Text)
    ad_impression_duration_value = Column(Integer)
    ad_impression_duration_unit = Column(String(20))
    ad_advertiser_forwarding_url = Column(Text)
    ad_start_date = Column(Date)
    ad_end_date = Column(Date)
    ad_expiry_date = Column(Date)
    ad_in_view_duration_value = Column(Integer)
    ad_in_view_duration_unit = Column(String(20))
    ad_view_count = Column(Integer, default=0)
    ad_status = Column(String(20), nullable=False, default='draft')
    ad_created_by_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id'), nullable=False)
    created_by_name = Column(String(200))
    updated_by_name = Column(String(200))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    campaign = relationship("Campaign", back_populates="ads")
    created_by = relationship("User")
    time_slots = relationship("AdTimeSlot", back_populates="ad", cascade="all, delete-orphan")
    content_rating = relationship("AdContentRating", back_populates="ad", uselist=False, cascade="all, delete-orphan")
    
    __table_args__ = (
        CheckConstraint("ad_status IN ('active', 'inactive', 'paused', 'draft', 'expired')"),
        CheckConstraint("ad_type_id IN ('top_bar_ad', 'bottom_left_ad', 'bottom_right_ad', 'bottom_center_ad', 'center_right_content_ad', 'center_left_content_ad')"),
    )

class AdTimeSlot(Base):
    __tablename__ = "ad_time_slots"
    
    time_slot_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ad_id = Column(UUID(as_uuid=True), ForeignKey('ads.ad_id', ondelete='CASCADE'), nullable=False)
    time_slot_start = Column(Time, nullable=False)
    time_slot_end = Column(Time, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    ad = relationship("Ad", back_populates="time_slots")

class AdContentRating(Base):
    __tablename__ = "ad_content_ratings"
    
    rating_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ad_id = Column(UUID(as_uuid=True), ForeignKey('ads.ad_id', ondelete='CASCADE'), nullable=False)
    warning_required = Column(Boolean, default=True)
    rating_system = Column(String(50))
    rating_label = Column(String(10))
    content_warnings = Column(ARRAY(Text))
    no_prohibited_content = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    ad = relationship("Ad", back_populates="content_rating")
```

## 9. Development Setup

### Environment File (.env)

```bash
# App
APP_NAME=Campaign Studio API
DEBUG=true

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=campaign-studio
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=["http://localhost:5173"]

# Encryption
ENCRYPTION_KEY=your-encryption-key-32-chars
```

### Run Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Create migration
alembic revision --autogenerate -m "description"
```

## 10. Testing Strategy

- Unit tests for services and utilities
- Integration tests for API endpoints
- Test database with fixtures
- Mock external dependencies
- Achieve >80% code coverage

This specification provides the complete backend structure for the Campaign Studio API.
