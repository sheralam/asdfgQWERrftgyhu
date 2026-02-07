"""Campaign schemas."""

from datetime import date, datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field


class CampaignAudienceTargetingBase(BaseModel):
    """Base audience targeting schema."""
    region: str = Field(..., max_length=100)
    country: str = Field(..., max_length=100)
    cities: Optional[List[str]] = Field(default_factory=list)
    postcodes: Optional[List[str]] = Field(default_factory=list)


class CampaignAudienceTargetingCreate(CampaignAudienceTargetingBase):
    """Schema for creating audience targeting."""
    pass


class CampaignAudienceTargeting(CampaignAudienceTargetingBase):
    """Audience targeting response schema."""
    audience_id: UUID
    campaign_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CampaignBase(BaseModel):
    """Base campaign schema."""
    campaign_name: str = Field(..., max_length=255)
    campaign_description: Optional[str] = None
    campaign_start_date: date
    campaign_end_date: date
    campaign_expiry_date: Optional[date] = None
    campaign_max_view_duration_value: Optional[int] = None
    campaign_max_view_duration_unit: Optional[str] = Field(None, max_length=20)
    campaign_max_view_count: Optional[int] = None
    campaign_status: str = Field(default="draft", max_length=20)


class CampaignCreate(CampaignBase):
    """Schema for creating a campaign."""
    audience_targeting: Optional[List[CampaignAudienceTargetingCreate]] = Field(default_factory=list)


class CampaignUpdate(BaseModel):
    """Schema for updating a campaign."""
    campaign_name: Optional[str] = Field(None, max_length=255)
    campaign_description: Optional[str] = None
    campaign_start_date: Optional[date] = None
    campaign_end_date: Optional[date] = None
    campaign_expiry_date: Optional[date] = None
    campaign_max_view_duration_value: Optional[int] = None
    campaign_max_view_duration_unit: Optional[str] = None
    campaign_max_view_count: Optional[int] = None
    campaign_status: Optional[str] = None
    audience_targeting: Optional[List[CampaignAudienceTargetingCreate]] = None


class Campaign(CampaignBase):
    """Campaign response schema."""
    campaign_id: UUID
    campaign_created_by_id: UUID
    created_by_name: Optional[str] = None
    updated_by_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    audience_targeting: List[CampaignAudienceTargeting] = Field(default_factory=list)

    class Config:
        from_attributes = True


class CampaignWithAds(Campaign):
    """Campaign with ads included."""
    ads: List["Ad"] = Field(default_factory=list)

    class Config:
        from_attributes = True


class CampaignList(BaseModel):
    """Campaign list response."""
    campaigns: List[Campaign]
    total: int
    page: int
    page_size: int


class PaginationMeta(BaseModel):
    """Pagination metadata."""
    page: int
    limit: int
    total: int
    total_pages: int


class CampaignListItem(BaseModel):
    """Campaign item in list response."""
    campaign_id: UUID
    campaign_name: str
    campaign_description: Optional[str] = None
    campaign_start_date: date
    campaign_end_date: date
    campaign_status: str
    campaign_created_by_id: UUID
    created_by_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    ad_count: int

    class Config:
        from_attributes = True


class CampaignListResponse(BaseModel):
    """Paginated campaign list response."""
    campaigns: List[CampaignListItem]
    total: int
    page: int
    page_size: int


class AudienceTargetingResponse(BaseModel):
    """Audience targeting in response."""
    audience_id: UUID
    region: str
    country: str
    cities: List[str]
    postcodes: List[str]

    class Config:
        from_attributes = True


class CampaignDetailAd(BaseModel):
    """Ad summary in campaign detail."""
    ad_id: UUID
    ad_type_id: str
    ad_name: str
    media_type: str
    ad_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class CampaignDetail(BaseModel):
    """Full campaign detail with ads."""
    campaign_id: UUID
    campaign_name: str
    campaign_description: Optional[str] = None
    campaign_start_date: date
    campaign_end_date: date
    campaign_expiry_date: Optional[date] = None
    campaign_max_view_duration_value: Optional[int] = None
    campaign_max_view_duration_unit: Optional[str] = None
    campaign_max_view_count: Optional[int] = None
    campaign_status: str
    campaign_created_by_id: UUID
    created_by_name: Optional[str] = None
    updated_by_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    audience_targeting: Optional[AudienceTargetingResponse] = None
    ads: List[CampaignDetailAd] = Field(default_factory=list)

    class Config:
        from_attributes = True
