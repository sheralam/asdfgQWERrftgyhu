"""Ad endpoints."""

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_role, check_resource_ownership
from app.models.user import User
from app.models.campaign import Campaign
from app.schemas.ad import (
    AdUpdate,
    AdCreate,
    AdDetail,
    AdListItem,
    AdListResponse,
    TimeSlotResponse,
    ContentRatingResponse,
)
from app.services.ad_service import (
    get_ad,
    list_ads,
    create_ad,
    update_ad,
    delete_ad,
)

logger = logging.getLogger(__name__)
router = APIRouter()

CAMPAIGN_MANAGER_ROLES = ["campaign_manager", "app_admin", "system_admin"]


def _time_to_str(t) -> str:
    """Format time as HH:MM."""
    return t.strftime("%H:%M") if t else ""


def _ad_to_list_item(ad) -> AdListItem:
    return AdListItem(
        ad_id=ad.ad_id,
        campaign_id=ad.campaign_id,
        ad_type_id=ad.ad_type_id,
        ad_name=ad.ad_name,
        ad_description=ad.ad_description,
        media_type=ad.media_type,
        media_url=ad.media_url,
        ad_impression_duration_value=ad.ad_impression_duration_value,
        ad_impression_duration_unit=ad.ad_impression_duration_unit,
        ad_advertiser_forwarding_url=ad.ad_advertiser_forwarding_url,
        ad_status=ad.ad_status,
        created_at=ad.created_at,
    )


def _ad_to_detail(ad) -> AdDetail:
    time_slots = [
        TimeSlotResponse(
            time_slot_id=ts.time_slot_id,
            time_slot_start=_time_to_str(ts.time_slot_start),
            time_slot_end=_time_to_str(ts.time_slot_end),
        )
        for ts in (ad.time_slots or [])
    ]
    content_rating = None
    if ad.content_rating:
        content_rating = ContentRatingResponse(
            rating_id=ad.content_rating.rating_id,
            warning_required=ad.content_rating.warning_required,
            rating_system=ad.content_rating.rating_system,
            rating_label=ad.content_rating.rating_label,
            content_warnings=ad.content_rating.content_warnings or [],
            no_prohibited_content=ad.content_rating.no_prohibited_content,
        )
    return AdDetail(
        ad_id=ad.ad_id,
        campaign_id=ad.campaign_id,
        ad_type_id=ad.ad_type_id,
        ad_name=ad.ad_name,
        ad_description=ad.ad_description,
        media_type=ad.media_type,
        media_url=ad.media_url,
        media_content=ad.media_content,
        ad_impression_duration_value=ad.ad_impression_duration_value,
        ad_impression_duration_unit=ad.ad_impression_duration_unit,
        ad_advertiser_forwarding_url=ad.ad_advertiser_forwarding_url,
        ad_start_date=ad.ad_start_date,
        ad_end_date=ad.ad_end_date,
        ad_expiry_date=ad.ad_expiry_date,
        ad_status=ad.ad_status,
        created_by_name=ad.created_by_name,
        updated_by_name=ad.updated_by_name,
        created_at=ad.created_at,
        updated_at=ad.updated_at,
        time_slots=time_slots,
        content_rating=content_rating,
    )


@router.get("", response_model=AdListResponse)
def ad_list(
    page: int = 1,
    page_size: int = 50,
    campaign_id: UUID = None,
    status: str = None,
    ad_type: str = None,
    search: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all ads with pagination and filters."""
    skip = (page - 1) * page_size
    ads, total = list_ads(
        db,
        skip=skip,
        limit=page_size,
        campaign_id=campaign_id,
        status=status,
        ad_type=ad_type,
        search=search,
    )
    
    items = [_ad_to_list_item(ad) for ad in ads]
    
    return AdListResponse(
        ads=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", status_code=status.HTTP_201_CREATED, response_model=AdDetail)
def ad_create(
    data: AdCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(CAMPAIGN_MANAGER_ROLES)),
):
    """Create a new ad for a campaign. campaign_id should be in the request body."""
    campaign_id = data.campaign_id
    logger.info(f"Creating ad for campaign_id: {campaign_id}")
    logger.info(f"Ad data: {data.model_dump()}")
    
    # Verify campaign exists
    campaign = db.query(Campaign).filter(Campaign.campaign_id == campaign_id).first()
    if not campaign:
        logger.error(f"Campaign not found: {campaign_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )
    
    # Check ownership
    if not check_resource_ownership(current_user, str(campaign.campaign_created_by_id)):
        logger.error(f"User {current_user.user_id} not authorized for campaign {campaign_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add ads to this campaign",
        )
    
    try:
        ad = create_ad(db, campaign_id, data, current_user)
        logger.info(f"Successfully created ad: {ad.ad_id}")
    except ValueError as e:
        logger.error(f"ValueError creating ad: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Unexpected error creating ad: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating ad",
        )
    
    return _ad_to_detail(ad)


@router.get("/{ad_id}", response_model=AdDetail)
def ad_get(
    ad_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get ad by id."""
    ad = get_ad(db, ad_id)
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ad not found",
        )
    return _ad_to_detail(ad)


@router.put("/{ad_id}", response_model=AdDetail)
def ad_update(
    ad_id: UUID,
    data: AdUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(CAMPAIGN_MANAGER_ROLES)),
):
    """Update ad."""
    ad = get_ad(db, ad_id)
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ad not found",
        )
    campaign = db.query(Campaign).filter(Campaign.campaign_id == ad.campaign_id).first()
    if campaign and not check_resource_ownership(current_user, str(campaign.campaign_created_by_id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this ad",
        )
    try:
        ad = update_ad(db, ad_id, data, current_user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    return _ad_to_detail(ad)


@router.delete("/{ad_id}", status_code=status.HTTP_204_NO_CONTENT)
def ad_delete(
    ad_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(CAMPAIGN_MANAGER_ROLES)),
):
    """Delete ad."""
    ad = get_ad(db, ad_id)
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ad not found",
        )
    campaign = db.query(Campaign).filter(Campaign.campaign_id == ad.campaign_id).first()
    if campaign and not check_resource_ownership(current_user, str(campaign.campaign_created_by_id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this ad",
        )
    delete_ad(db, ad_id)
