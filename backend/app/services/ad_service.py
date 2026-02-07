"""Ad service."""

from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models.ad import Ad, AdTimeSlot, AdContentRating
from app.models.user import User
from app.schemas.ad import AdCreate, AdUpdate


def create_ad(db: Session, campaign_id: UUID, ad_data: AdCreate, current_user: User) -> Ad:
    """Create a new ad."""
    # Create ad
    ad = Ad(
        campaign_id=campaign_id,
        ad_type_id=ad_data.ad_type_id,
        ad_name=ad_data.ad_name,
        ad_description=ad_data.ad_description,
        media_type=ad_data.media_type,
        media_url=ad_data.media_url,
        media_content=ad_data.media_content,
        ad_impression_duration_value=ad_data.ad_impression_duration_value,
        ad_impression_duration_unit=ad_data.ad_impression_duration_unit,
        ad_advertiser_forwarding_url=ad_data.ad_advertiser_forwarding_url,
        ad_start_date=ad_data.ad_start_date,
        ad_end_date=ad_data.ad_end_date,
        ad_expiry_date=ad_data.ad_expiry_date,
        ad_status=ad_data.ad_status,
        ad_created_by_id=current_user.user_id,
        created_by_name=f"{current_user.first_name} {current_user.last_name}".strip() or current_user.username,
        updated_by_name=f"{current_user.first_name} {current_user.last_name}".strip() or current_user.username,
    )

    db.add(ad)
    db.flush()

    # Add time slots if provided
    if ad_data.time_slots:
        for slot_data in ad_data.time_slots:
            time_slot = AdTimeSlot(
                ad_id=ad.ad_id,
                time_slot_start=slot_data.time_slot_start,
                time_slot_end=slot_data.time_slot_end,
            )
            db.add(time_slot)

    # Add content rating if provided
    if ad_data.content_rating:
        rating = AdContentRating(
            ad_id=ad.ad_id,
            warning_required=ad_data.content_rating.warning_required,
            rating_system=ad_data.content_rating.rating_system,
            rating_label=ad_data.content_rating.rating_label,
            content_warnings=ad_data.content_rating.content_warnings,
            no_prohibited_content=ad_data.content_rating.no_prohibited_content,
        )
        db.add(rating)

    db.commit()
    db.refresh(ad)
    return ad


def get_ad(db: Session, ad_id: UUID) -> Optional[Ad]:
    """Get ad by ID."""
    return db.query(Ad).filter(Ad.ad_id == ad_id).first()


def list_ads(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    campaign_id: Optional[UUID] = None,
    status: Optional[str] = None,
    ad_type: Optional[str] = None,
    search: Optional[str] = None,
) -> tuple[List[Ad], int]:
    """Get list of ads with pagination and filters."""
    query = db.query(Ad)

    if campaign_id:
        query = query.filter(Ad.campaign_id == campaign_id)

    if status:
        query = query.filter(Ad.ad_status == status)

    if ad_type:
        query = query.filter(Ad.ad_type_id == ad_type)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Ad.ad_name.ilike(search_filter),
                Ad.ad_description.ilike(search_filter),
            )
        )

    total = query.count()
    ads = query.order_by(Ad.created_at.desc()).offset(skip).limit(limit).all()

    return ads, total


def list_ads_by_campaign(db: Session, campaign_id: UUID) -> List[Ad]:
    """Get all ads for a campaign."""
    return db.query(Ad).filter(Ad.campaign_id == campaign_id).order_by(Ad.created_at.desc()).all()


def update_ad(
    db: Session, ad_id: UUID, ad_data: AdUpdate, current_user: User
) -> Optional[Ad]:
    """Update an ad."""
    ad = db.query(Ad).filter(Ad.ad_id == ad_id).first()
    if not ad:
        return None

    # Update fields
    update_data = ad_data.model_dump(
        exclude_unset=True, exclude={"time_slots", "content_rating"}
    )
    for field, value in update_data.items():
        setattr(ad, field, value)

    ad.updated_by_name = (
        f"{current_user.first_name} {current_user.last_name}".strip() or current_user.username
    )

    # Update time slots if provided
    if ad_data.time_slots is not None:
        # Delete existing time slots
        db.query(AdTimeSlot).filter(AdTimeSlot.ad_id == ad_id).delete()

        # Add new time slots
        for slot_data in ad_data.time_slots:
            time_slot = AdTimeSlot(
                ad_id=ad.ad_id,
                time_slot_start=slot_data.time_slot_start,
                time_slot_end=slot_data.time_slot_end,
            )
            db.add(time_slot)

    # Update content rating if provided
    if ad_data.content_rating is not None:
        # Delete existing rating
        db.query(AdContentRating).filter(AdContentRating.ad_id == ad_id).delete()

        # Add new rating
        rating = AdContentRating(
            ad_id=ad.ad_id,
            warning_required=ad_data.content_rating.warning_required,
            rating_system=ad_data.content_rating.rating_system,
            rating_label=ad_data.content_rating.rating_label,
            content_warnings=ad_data.content_rating.content_warnings,
            no_prohibited_content=ad_data.content_rating.no_prohibited_content,
        )
        db.add(rating)

    db.commit()
    db.refresh(ad)
    return ad


def delete_ad(db: Session, ad_id: UUID) -> bool:
    """Delete an ad."""
    ad = db.query(Ad).filter(Ad.ad_id == ad_id).first()
    if not ad:
        return False

    db.delete(ad)
    db.commit()
    return True
