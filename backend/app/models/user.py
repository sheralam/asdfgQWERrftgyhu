"""User model."""

import uuid
from sqlalchemy import Column, DateTime, Boolean, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    """System user."""

    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.role_id"), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    role = relationship("Role", back_populates="users")
    campaigns = relationship(
        "Campaign",
        back_populates="created_by_user",
        foreign_keys="Campaign.campaign_created_by_id",
    )
    ads_created = relationship(
        "Ad",
        back_populates="created_by_user",
        foreign_keys="Ad.ad_created_by_id",
    )
    advertisers_created = relationship(
        "Advertiser",
        back_populates="created_by_user",
        foreign_keys="Advertiser.created_by_id",
    )
