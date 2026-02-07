"""Ad request/response schemas."""

from datetime import date, datetime, time
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


IMAGE_ONLY_AD_TYPES = {
    "top_bar_ad",
    "bottom_left_ad",
    "bottom_right_ad",
    "bottom_center_ad",
}
MULTIMEDIA_AD_TYPES = {"center_right_content_ad", "center_left_content_ad"}
VALID_AD_TYPES = IMAGE_ONLY_AD_TYPES | MULTIMEDIA_AD_TYPES
IMAGE_ONLY_MEDIA_TYPES = {"text", "image", "gif"}


class TimeSlotBase(BaseModel):
    """Time slot fields."""

    time_slot_start: str = Field(..., description="Time as HH:MM or HH:MM:SS")
    time_slot_end: str = Field(..., description="Time as HH:MM or HH:MM:SS")


class TimeSlotCreate(TimeSlotBase):
    """Time slot for create."""

    pass


class TimeSlotResponse(TimeSlotBase):
    """Time slot in response."""

    time_slot_id: UUID

    class Config:
        """Pydantic config."""

        from_attributes = True


class ContentRatingBase(BaseModel):
    """Content rating fields."""

    warning_required: bool = True
    rating_system: Optional[str] = Field(None, pattern="^(MPAA|ESRB)$")
    rating_label: Optional[str] = None
    content_warnings: List[str] = Field(default_factory=list)
    no_prohibited_content: bool = Field(..., description="Must be true")


class ContentRatingCreate(ContentRatingBase):
    """Content rating for create."""

    pass


class ContentRatingResponse(ContentRatingBase):
    """Content rating in response."""

    rating_id: UUID

    class Config:
        """Pydantic config."""

        from_attributes = True


class AdImpressionDuration(BaseModel):
    """Impression duration value/unit."""

    value: int
    unit: str = Field(..., pattern="^(seconds|minutes|hours)$")


class AdBase(BaseModel):
    """Shared ad fields."""

    ad_type_id: str = Field(..., pattern="^(top_bar_ad|bottom_left_ad|bottom_right_ad|bottom_center_ad|center_right_content_ad|center_left_content_ad)$")
    ad_name: str = Field(..., max_length=255)
    ad_description: Optional[str] = None
    media_type: str = Field(..., max_length=50)
    media_url: Optional[str] = None
    media_content: Optional[str] = None
    ad_impression_duration_value: Optional[int] = None
    ad_impression_duration_unit: Optional[str] = Field(None, pattern="^(seconds|minutes|hours)$")
    ad_advertiser_forwarding_url: Optional[str] = None
    ad_start_date: Optional[date] = None
    ad_end_date: Optional[date] = None
    ad_expiry_date: Optional[date] = None
    ad_status: str = Field(..., pattern="^(active|inactive|paused|draft|expired)$")


class AdCreate(AdBase):
    """Create ad request."""

    campaign_id: UUID
    time_slots: List[TimeSlotCreate] = Field(default_factory=list)
    content_rating: Optional[ContentRatingCreate] = None


class AdUpdate(BaseModel):
    """Partial ad update."""

    ad_name: Optional[str] = Field(None, max_length=255)
    ad_description: Optional[str] = None
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    media_content: Optional[str] = None
    ad_impression_duration_value: Optional[int] = None
    ad_impression_duration_unit: Optional[str] = Field(None, pattern="^(seconds|minutes|hours)$")
    ad_advertiser_forwarding_url: Optional[str] = None
    ad_start_date: Optional[date] = None
    ad_end_date: Optional[date] = None
    ad_expiry_date: Optional[date] = None
    ad_status: Optional[str] = Field(None, pattern="^(active|inactive|paused|draft|expired)$")
    time_slots: Optional[List[TimeSlotCreate]] = None
    content_rating: Optional[ContentRatingCreate] = None


class AdListItem(BaseModel):
    """Ad in list response."""

    ad_id: UUID
    campaign_id: UUID
    ad_type_id: str
    ad_name: str
    ad_description: Optional[str] = None
    media_type: str
    media_url: Optional[str] = None
    ad_impression_duration_value: Optional[int] = None
    ad_impression_duration_unit: Optional[str] = None
    ad_advertiser_forwarding_url: Optional[str] = None
    ad_status: str
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class AdDetail(AdBase):
    """Full ad detail response."""

    ad_id: UUID
    campaign_id: UUID
    created_by_name: Optional[str] = None
    updated_by_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    time_slots: List[TimeSlotResponse] = []
    content_rating: Optional[ContentRatingResponse] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class AdListResponse(BaseModel):
    """List of ads."""

    ads: List[AdListItem]
    total: int
    page: int
    page_size: int
