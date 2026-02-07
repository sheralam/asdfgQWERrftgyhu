"""Campaign endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_role, check_resource_ownership
from app.models.user import User
from app.models.campaign import Campaign
from app.schemas.campaign import (
    CampaignCreate,
    CampaignDetail,
    CampaignListItem,
    CampaignListResponse,
    CampaignUpdate,
    PaginationMeta,
    AudienceTargetingResponse,
    CampaignDetailAd,
)
from app.schemas.ad import AdListResponse, AdListItem, AdCreate, AdDetail
from app.services.campaign_service import (
    create_campaign,
    get_campaign,
    list_campaigns,
    update_campaign,
    delete_campaign,
    get_ad_count,
)
from app.services.ad_service import (
    create_ad,
    list_ads_by_campaign,
)
from app.routers.ads import _ad_to_list_item, _ad_to_detail

router = APIRouter()

CAMPAIGN_MANAGER_ROLES = ["campaign_manager", "app_admin", "system_admin"]


def _campaign_to_list_item(campaign, ad_count: int) -> CampaignListItem:
    return CampaignListItem(
        campaign_id=campaign.campaign_id,
        campaign_name=campaign.campaign_name,
        campaign_description=campaign.campaign_description,
        campaign_start_date=campaign.campaign_start_date,
        campaign_end_date=campaign.campaign_end_date,
        campaign_status=campaign.campaign_status,
        campaign_created_by_id=campaign.campaign_created_by_id,
        created_by_name=campaign.created_by_name,
        created_at=campaign.created_at,
        updated_at=campaign.updated_at,
        ad_count=ad_count,
    )


def _campaign_to_detail(campaign) -> CampaignDetail:
    at = campaign.audience_targeting
    audience = None
    if at:
        audience = AudienceTargetingResponse(
            audience_id=at.audience_id,
            region=at.region,
            country=at.country,
            cities=at.cities or [],
            postcodes=at.postcodes or [],
        )
    ads = [
        CampaignDetailAd(
            ad_id=a.ad_id,
            ad_type_id=a.ad_type_id,
            ad_name=a.ad_name,
            media_type=a.media_type,
            ad_status=a.ad_status,
            created_at=a.created_at,
        )
        for a in (campaign.ads or [])
    ]
    return CampaignDetail(
        campaign_id=campaign.campaign_id,
        campaign_name=campaign.campaign_name,
        campaign_description=campaign.campaign_description,
        campaign_start_date=campaign.campaign_start_date,
        campaign_end_date=campaign.campaign_end_date,
        campaign_expiry_date=campaign.campaign_expiry_date,
        campaign_max_view_duration_value=campaign.campaign_max_view_duration_value,
        campaign_max_view_duration_unit=campaign.campaign_max_view_duration_unit,
        campaign_max_view_count=campaign.campaign_max_view_count,
        campaign_status=campaign.campaign_status,
        campaign_created_by_id=campaign.campaign_created_by_id,
        created_by_name=campaign.created_by_name,
        updated_by_name=campaign.updated_by_name,
        created_at=campaign.created_at,
        updated_at=campaign.updated_at,
        audience_targeting=audience,
        ads=ads,
    )


@router.get("", response_model=CampaignListResponse)
def campaign_list(
    page: int = 1,
    limit: int = 20,
    status: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List campaigns with pagination and filters."""
    if limit > 100:
        limit = 100
    skip = (page - 1) * limit
    items, total = list_campaigns(
        db,
        skip=skip,
        limit=limit,
        status=status,
        search=search,
    )
    list_items = []
    for c in items:
        ad_count = get_ad_count(db, c.campaign_id)
        list_items.append(_campaign_to_list_item(c, ad_count))

    return CampaignListResponse(
        campaigns=list_items,
        total=total,
        page=page,
        page_size=limit,
    )


@router.get("/{campaign_id}", response_model=CampaignDetail)
def campaign_get(
    campaign_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get campaign by id."""
    campaign = get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )
    return _campaign_to_detail(campaign)


@router.get("/{campaign_id}/ads", response_model=AdListResponse)
def campaign_list_ads(
    campaign_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List ads for a campaign."""
    campaign = db.query(Campaign).filter(Campaign.campaign_id == campaign_id).first()
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )
    ads = list_ads_by_campaign(db, campaign_id)
    return AdListResponse(
        ads=[_ad_to_list_item(a) for a in ads],
        total=len(ads),
        page=1,
        page_size=len(ads),
    )


@router.post(
    "/{campaign_id}/ads",
    status_code=status.HTTP_201_CREATED,
    response_model=AdDetail,
)
def campaign_create_ad(
    campaign_id: UUID,
    data: AdCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(CAMPAIGN_MANAGER_ROLES)),
):
    """Create ad for campaign."""
    campaign = db.query(Campaign).filter(Campaign.campaign_id == campaign_id).first()
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )
    if not check_resource_ownership(current_user, str(campaign.campaign_created_by_id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add ads to this campaign",
        )
    try:
        ad = create_ad(db, campaign_id, data, current_user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    return _ad_to_detail(ad)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=CampaignDetail)
def campaign_create(
    data: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(CAMPAIGN_MANAGER_ROLES)),
):
    """Create campaign."""
    if data.campaign_end_date < data.campaign_start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="campaign_end_date must be >= campaign_start_date",
        )
    campaign = create_campaign(db, data, current_user)
    campaign = get_campaign(db, campaign.campaign_id)
    return _campaign_to_detail(campaign)


@router.put("/{campaign_id}", response_model=CampaignDetail)
def campaign_update(
    campaign_id: UUID,
    data: CampaignUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(CAMPAIGN_MANAGER_ROLES)),
):
    """Update campaign."""
    campaign = get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )
    if not check_resource_ownership(current_user, str(campaign.campaign_created_by_id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this campaign",
        )
    if data.campaign_start_date is not None and data.campaign_end_date is not None:
        if data.campaign_end_date < data.campaign_start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="campaign_end_date must be >= campaign_start_date",
            )
    campaign = update_campaign(db, campaign_id, data, current_user)
    campaign = get_campaign(db, campaign.campaign_id, load_ads=True, load_audience=True)
    return _campaign_to_detail(campaign)


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def campaign_delete(
    campaign_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(CAMPAIGN_MANAGER_ROLES)),
):
    """Delete campaign."""
    campaign = get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )
    if not check_resource_ownership(current_user, str(campaign.campaign_created_by_id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this campaign",
        )
    delete_campaign(db, campaign_id)
