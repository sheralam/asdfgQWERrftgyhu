"""Advertiser business logic."""

from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models.advertiser import Advertiser, AdvertiserContact, AdvertiserBankAccount
from app.models.user import User
from app.schemas.advertiser import (
    AdvertiserCreate,
    AdvertiserUpdate,
    ContactCreate,
    BankAccountCreate,
)
from app.utils.encryption import encrypt_value


def _creator_name(user: User) -> str:
    if user.first_name or user.last_name:
        return " ".join(filter(None, [user.first_name, user.last_name])).strip()
    return user.username or ""


def list_advertisers(
    db: Session,
    *,
    page: int = 1,
    limit: int = 20,
    advertiser_type: Optional[str] = None,
    search: Optional[str] = None,
) -> tuple[List[Advertiser], int]:
    """List advertisers with pagination. Returns (items, total)."""
    q = db.query(Advertiser)
    if advertiser_type:
        q = q.filter(Advertiser.advertiser_type == advertiser_type)
    if search:
        q = q.filter(Advertiser.advertiser_name.ilike(f"%{search}%"))

    total = q.count()
    q = q.order_by(Advertiser.advertiser_name).offset((page - 1) * limit).limit(limit)
    return q.all(), total


def get_advertiser(db: Session, advertiser_id: UUID) -> Optional[Advertiser]:
    """Get advertiser by id with contacts and bank accounts."""
    return (
        db.query(Advertiser)
        .filter(Advertiser.advertiser_id == advertiser_id)
        .options(
            joinedload(Advertiser.contacts),
            joinedload(Advertiser.bank_accounts),
        )
        .first()
    )


def create_advertiser(db: Session, data: AdvertiserCreate, user: User) -> Advertiser:
    """Create advertiser with contacts and optional bank accounts."""
    adv = Advertiser(
        advertiser_name=data.advertiser_name,
        advertiser_type=data.advertiser_type,
        address_line_1=data.address_line_1,
        address_line_2=data.address_line_2,
        city=data.city,
        state=data.state,
        postal_code=data.postal_code,
        country=data.country,
        latitude=data.latitude,
        longitude=data.longitude,
        timezone=data.timezone,
        created_by_id=user.user_id,
    )
    db.add(adv)
    db.flush()

    for c in data.contacts:
        db.add(
            AdvertiserContact(
                advertiser_id=adv.advertiser_id,
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
        )

    for b in data.bank_accounts:
        db.add(
            AdvertiserBankAccount(
                advertiser_id=adv.advertiser_id,
                bank_name=b.bank_name,
                bank_account_number_encrypted=encrypt_value(b.bank_account_number),
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
        )

    db.commit()
    db.refresh(adv)
    return get_advertiser(db, adv.advertiser_id)


def update_advertiser(
    db: Session,
    advertiser_id: UUID,
    data: AdvertiserUpdate,
) -> Optional[Advertiser]:
    """Update advertiser (partial)."""
    adv = get_advertiser(db, advertiser_id)
    if not adv:
        return None

    update = data.model_dump(exclude_unset=True)
    contacts_data = update.pop("contacts", None)
    bank_accounts_data = update.pop("bank_accounts", None)

    for k, v in update.items():
        setattr(adv, k, v)

    if contacts_data is not None:
        for c in adv.contacts:
            db.delete(c)
        for c in contacts_data:
            db.add(
                AdvertiserContact(
                    advertiser_id=adv.advertiser_id,
                    contact_name=c["contact_name"],
                    contact_email=c["contact_email"],
                    contact_phone=c["contact_phone"],
                    contact_address=c.get("contact_address"),
                    contact_city=c.get("contact_city"),
                    contact_state=c.get("contact_state"),
                    contact_postal_code=c.get("contact_postal_code"),
                    contact_country=c.get("contact_country"),
                    is_point_of_contact=c.get("is_point_of_contact", False),
                    contact_type=c["contact_type"],
                )
            )

    if bank_accounts_data is not None:
        for b in adv.bank_accounts:
            db.delete(b)
        for b in bank_accounts_data:
            db.add(
                AdvertiserBankAccount(
                    advertiser_id=adv.advertiser_id,
                    bank_name=b["bank_name"],
                    bank_account_number_encrypted=encrypt_value(b.get("bank_account_number") or ""),
                    bank_account_name=b["bank_account_name"],
                    bank_account_routing_number=b.get("bank_account_routing_number"),
                    bank_account_swift_code=b.get("bank_account_swift_code"),
                    bank_account_iban=b.get("bank_account_iban"),
                    bank_account_bic=b.get("bank_account_bic"),
                    bank_account_currency=b["bank_account_currency"],
                    is_default=b.get("is_default", False),
                    is_verified=b.get("is_verified", False),
                    is_sepa_compliant=b.get("is_sepa_compliant", False),
                )
            )

    db.commit()
    db.refresh(adv)
    return get_advertiser(db, advertiser_id)


def delete_advertiser(db: Session, advertiser_id: UUID) -> bool:
    """Delete advertiser (cascade contacts and bank accounts)."""
    adv = db.query(Advertiser).filter(Advertiser.advertiser_id == advertiser_id).first()
    if not adv:
        return False
    db.delete(adv)
    db.commit()
    return True
