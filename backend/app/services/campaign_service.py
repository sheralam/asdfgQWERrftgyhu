"""Campaign service."""

from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models.campaign import Campaign, CampaignAudienceTargeting
from app.models.user import User
from app.schemas.campaign import CampaignCreate, CampaignUpdate


def create_campaign(
    db: Session, campaign_data: CampaignCreate, current_user: User
) -> Campaign:
    """Create a new campaign."""
    # Create campaign
    campaign = Campaign(
        campaign_name=campaign_data.campaign_name,
        campaign_description=campaign_data.campaign_description,
        campaign_start_date=campaign_data.campaign_start_date,
        campaign_end_date=campaign_data.campaign_end_date,
        campaign_expiry_date=campaign_data.campaign_expiry_date,
        campaign_max_view_duration_value=campaign_data.campaign_max_view_duration_value,
        campaign_max_view_duration_unit=campaign_data.campaign_max_view_duration_unit,
        campaign_max_view_count=campaign_data.campaign_max_view_count,
        campaign_status=campaign_data.campaign_status,
        campaign_created_by_id=current_user.user_id,
        created_by_name=f"{current_user.first_name} {current_user.last_name}".strip() or current_user.username,
        updated_by_name=f"{current_user.first_name} {current_user.last_name}".strip() or current_user.username,
    )

    db.add(campaign)
    db.flush()

    # Add audience targeting if provided
    if campaign_data.audience_targeting:
        for targeting_data in campaign_data.audience_targeting:
            targeting = CampaignAudienceTargeting(
                campaign_id=campaign.campaign_id,
                region=targeting_data.region,
                country=targeting_data.country,
                cities=targeting_data.cities,
                postcodes=targeting_data.postcodes,
            )
            db.add(targeting)

    db.commit()
    db.refresh(campaign)
    return campaign


def get_campaign(db: Session, campaign_id: UUID) -> Optional[Campaign]:
    """Get campaign by ID."""
    return db.query(Campaign).filter(Campaign.campaign_id == campaign_id).first()


def list_campaigns(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    search: Optional[str] = None,
) -> tuple[List[Campaign], int]:
    """Get list of campaigns with pagination and filters."""
    query = db.query(Campaign)

    if status:
        query = query.filter(Campaign.campaign_status == status)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Campaign.campaign_name.ilike(search_filter),
                Campaign.campaign_description.ilike(search_filter),
            )
        )

    total = query.count()
    campaigns = query.order_by(Campaign.created_at.desc()).offset(skip).limit(limit).all()

    return campaigns, total


def update_campaign(
    db: Session, campaign_id: UUID, campaign_data: CampaignUpdate, current_user: User
) -> Optional[Campaign]:
    """Update a campaign."""
    campaign = db.query(Campaign).filter(Campaign.campaign_id == campaign_id).first()
    if not campaign:
        return None

    # Update fields
    update_data = campaign_data.model_dump(exclude_unset=True, exclude={"audience_targeting"})
    for field, value in update_data.items():
        setattr(campaign, field, value)

    campaign.updated_by_name = (
        f"{current_user.first_name} {current_user.last_name}".strip() or current_user.username
    )

    # Update audience targeting if provided
    if campaign_data.audience_targeting is not None:
        # Delete existing targeting
        db.query(CampaignAudienceTargeting).filter(
            CampaignAudienceTargeting.campaign_id == campaign_id
        ).delete()

        # Add new targeting
        for targeting_data in campaign_data.audience_targeting:
            targeting = CampaignAudienceTargeting(
                campaign_id=campaign.campaign_id,
                region=targeting_data.region,
                country=targeting_data.country,
                cities=targeting_data.cities,
                postcodes=targeting_data.postcodes,
            )
            db.add(targeting)

    db.commit()
    db.refresh(campaign)
    return campaign


def delete_campaign(db: Session, campaign_id: UUID) -> bool:
    """Delete a campaign."""
    campaign = db.query(Campaign).filter(Campaign.campaign_id == campaign_id).first()
    if not campaign:
        return False

    db.delete(campaign)
    db.commit()
    return True


def get_user_campaigns(
    db: Session, user_id: UUID, skip: int = 0, limit: int = 100
) -> tuple[List[Campaign], int]:
    """Get campaigns created by a specific user."""
    query = db.query(Campaign).filter(Campaign.campaign_created_by_id == user_id)
    total = query.count()
    campaigns = query.order_by(Campaign.created_at.desc()).offset(skip).limit(limit).all()
    return campaigns, total


def get_ad_count(db: Session, campaign_id: UUID) -> int:
    """Get count of ads for a campaign."""
    from app.models.ad import Ad
    return db.query(Ad).filter(Ad.campaign_id == campaign_id).count()
