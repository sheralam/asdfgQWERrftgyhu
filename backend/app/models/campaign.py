"""Campaign and audience targeting models."""

import uuid
from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Campaign(Base):
    """Advertising campaign."""

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
    campaign_status = Column(String(20), nullable=False, default="draft")
    campaign_created_by_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id"),
        nullable=False,
    )
    created_by_name = Column(String(200))
    updated_by_name = Column(String(200))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    created_by_user = relationship("User", back_populates="campaigns", foreign_keys=[campaign_created_by_id])
    ads = relationship("Ad", back_populates="campaign", cascade="all, delete-orphan")
    audience_targeting = relationship(
        "CampaignAudienceTargeting",
        back_populates="campaign",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint(
            "campaign_status IN ('active', 'inactive', 'paused', 'draft', 'expired')",
            name="check_campaign_status",
        ),
        CheckConstraint(
            "campaign_end_date >= campaign_start_date",
            name="check_campaign_dates",
        ),
    )


class CampaignAudienceTargeting(Base):
    """Audience targeting configuration for a campaign."""

    __tablename__ = "campaign_audience_targeting"

    audience_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(
        UUID(as_uuid=True),
        ForeignKey("campaigns.campaign_id", ondelete="CASCADE"),
        nullable=False,
    )
    region = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    cities = Column(ARRAY(Text))
    postcodes = Column(ARRAY(Text))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    campaign = relationship("Campaign", back_populates="audience_targeting")
