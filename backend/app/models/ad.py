"""Ad, time slot, and content rating models."""

import uuid
from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text, Time, Boolean
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Ad(Base):
    """Advertisement."""

    __tablename__ = "ads"

    ad_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(
        UUID(as_uuid=True),
        ForeignKey("campaigns.campaign_id", ondelete="CASCADE"),
        nullable=False,
    )
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
    ad_status = Column(String(20), nullable=False, default="draft")
    ad_created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    created_by_name = Column(String(200))
    updated_by_name = Column(String(200))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    campaign = relationship("Campaign", back_populates="ads")
    created_by_user = relationship("User", back_populates="ads_created", foreign_keys=[ad_created_by_id])
    time_slots = relationship("AdTimeSlot", back_populates="ad", cascade="all, delete-orphan")
    content_rating = relationship(
        "AdContentRating",
        back_populates="ad",
        uselist=False,
        cascade="all, delete-orphan",
    )


class AdTimeSlot(Base):
    """Time slot for ad display."""

    __tablename__ = "ad_time_slots"

    time_slot_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ad_id = Column(
        UUID(as_uuid=True),
        ForeignKey("ads.ad_id", ondelete="CASCADE"),
        nullable=False,
    )
    time_slot_start = Column(Time, nullable=False)
    time_slot_end = Column(Time, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ad = relationship("Ad", back_populates="time_slots")


class AdContentRating(Base):
    """Content rating for an ad."""

    __tablename__ = "ad_content_ratings"

    rating_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ad_id = Column(
        UUID(as_uuid=True),
        ForeignKey("ads.ad_id", ondelete="CASCADE"),
        nullable=False,
    )
    warning_required = Column(Boolean, default=True)
    rating_system = Column(String(50))
    rating_label = Column(String(10))
    content_warnings = Column(ARRAY(Text))
    no_prohibited_content = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    ad = relationship("Ad", back_populates="content_rating")
