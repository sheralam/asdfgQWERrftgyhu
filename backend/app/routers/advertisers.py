"""Advertiser endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.advertiser import (
    AdvertiserCreate,
    AdvertiserUpdate,
    AdvertiserDetail,
    AdvertiserListItem,
    AdvertiserListResponse,
    PaginationMeta,
    ContactResponse,
    BankAccountResponse,
)
from app.services.advertiser_service import (
    create_advertiser,
    get_advertiser,
    list_advertisers,
    update_advertiser,
    delete_advertiser,
)

router = APIRouter()

CAMPAIGN_MANAGER_ROLES = ["campaign_manager", "app_admin", "system_admin"]
ADMIN_DELETE_ROLES = ["app_admin", "system_admin"]


@router.get("", response_model=AdvertiserListResponse)
def advertiser_list(
    page: int = 1,
    limit: int = 20,
    type: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List advertisers with pagination."""
    if limit > 100:
        limit = 100
    items, total = list_advertisers(
        db,
        page=page,
        limit=limit,
        advertiser_type=type,
        search=search,
    )
    total_pages = (total + limit - 1) // limit if total else 0
    return AdvertiserListResponse(
        data=[AdvertiserListItem(
            advertiser_id=a.advertiser_id,
            advertiser_name=a.advertiser_name,
            advertiser_type=a.advertiser_type,
            city=a.city,
            country=a.country,
            created_at=a.created_at,
        ) for a in items],
        pagination=PaginationMeta(
            page=page,
            limit=limit,
            total=total,
            total_pages=total_pages,
        ),
    )


@router.get("/{advertiser_id}", response_model=AdvertiserDetail)
def advertiser_get(
    advertiser_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get advertiser by id."""
    adv = get_advertiser(db, advertiser_id)
    if not adv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advertiser not found",
        )
    contacts = [
        ContactResponse(
            contact_id=c.contact_id,
            contact_name=c.contact_name,
            contact_email=c.contact_email,
            contact_phone=c.contact_phone,
            contact_address=c.contact_address,
            contact_city=c.contact_city,
            contact_state=c.contact_state,
            contact_postal_code=c.contact_postal_code,
            contact_country=c.contact_country,
            is_point_of_contact=c.is_point_of_contact,
            contact_type=c.contact_type,
        )
        for c in adv.contacts
    ]
    bank_accounts = [
        BankAccountResponse(
            bank_id=b.bank_id,
            bank_name=b.bank_name,
            bank_account_name=b.bank_account_name,
            bank_account_routing_number=b.bank_account_routing_number,
            bank_account_swift_code=b.bank_account_swift_code,
            bank_account_iban=b.bank_account_iban,
            bank_account_bic=b.bank_account_bic,
            bank_account_currency=b.bank_account_currency,
            is_default=b.is_default,
            is_verified=b.is_verified,
            is_sepa_compliant=b.is_sepa_compliant,
        )
        for b in adv.bank_accounts
    ]
    return AdvertiserDetail(
        advertiser_id=adv.advertiser_id,
        advertiser_name=adv.advertiser_name,
        advertiser_type=adv.advertiser_type,
        address_line_1=adv.address_line_1,
        address_line_2=adv.address_line_2,
        city=adv.city,
        state=adv.state,
        postal_code=adv.postal_code,
        country=adv.country,
        latitude=adv.latitude,
        longitude=adv.longitude,
        timezone=adv.timezone,
        contacts=contacts,
        bank_accounts=bank_accounts,
        created_at=adv.created_at,
    )


@router.post("", status_code=status.HTTP_201_CREATED, response_model=AdvertiserDetail)
def advertiser_create(
    data: AdvertiserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(CAMPAIGN_MANAGER_ROLES)),
):
    """Create advertiser."""
    adv = create_advertiser(db, data, current_user)
    return advertiser_get(adv.advertiser_id, db, current_user)


@router.put("/{advertiser_id}", response_model=AdvertiserDetail)
def advertiser_update(
    advertiser_id: UUID,
    data: AdvertiserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(CAMPAIGN_MANAGER_ROLES)),
):
    """Update advertiser."""
    adv = update_advertiser(db, advertiser_id, data)
    if not adv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advertiser not found",
        )
    return advertiser_get(advertiser_id, db, current_user)


@router.delete("/{advertiser_id}", status_code=status.HTTP_204_NO_CONTENT)
def advertiser_delete(
    advertiser_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(ADMIN_DELETE_ROLES)),
):
    """Delete advertiser (app_admin or system_admin only)."""
    if not delete_advertiser(db, advertiser_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advertiser not found",
        )
