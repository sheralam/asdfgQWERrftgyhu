"""Advertiser request/response schemas."""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


VALID_ADVERTISER_TYPES = {"individual", "business", "enterprise", "agency"}
VALID_CONTACT_TYPES = {
    "admin", "manager", "sales", "support", "marketing",
    "tech", "it", "hr", "finance",
}


class ContactBase(BaseModel):
    """Contact fields."""

    contact_name: str = Field(..., max_length=200)
    contact_email: EmailStr
    contact_phone: str = Field(..., max_length=50)
    contact_address: Optional[str] = None
    contact_city: Optional[str] = None
    contact_state: Optional[str] = None
    contact_postal_code: Optional[str] = None
    contact_country: Optional[str] = None
    is_point_of_contact: bool = False
    contact_type: str = Field(..., pattern="^(admin|manager|sales|support|marketing|tech|it|hr|finance)$")


class ContactCreate(ContactBase):
    """Contact for create."""

    pass


class ContactResponse(ContactBase):
    """Contact in response (no sensitive data)."""

    contact_id: UUID

    class Config:
        """Pydantic config."""

        from_attributes = True


class BankAccountBase(BaseModel):
    """Bank account fields (account number sent for create, never returned)."""

    bank_name: str = Field(..., max_length=255)
    bank_account_number: Optional[str] = Field(None, description="Plain text; encrypted at rest")
    bank_account_name: str = Field(..., max_length=255)
    bank_account_routing_number: Optional[str] = None
    bank_account_swift_code: Optional[str] = None
    bank_account_iban: Optional[str] = None
    bank_account_bic: Optional[str] = None
    bank_account_currency: str = Field(..., min_length=3, max_length=3)
    is_default: bool = False
    is_verified: bool = False
    is_sepa_compliant: bool = False


class BankAccountCreate(BankAccountBase):
    """Bank account for create (includes account number)."""

    bank_account_number: str = Field(..., description="Plain text; will be encrypted")


class BankAccountResponse(BaseModel):
    """Bank account in response (no account number)."""

    bank_id: UUID
    bank_name: str
    bank_account_name: str
    bank_account_routing_number: Optional[str] = None
    bank_account_swift_code: Optional[str] = None
    bank_account_iban: Optional[str] = None
    bank_account_bic: Optional[str] = None
    bank_account_currency: str
    is_default: bool
    is_verified: bool
    is_sepa_compliant: bool

    class Config:
        """Pydantic config."""

        from_attributes = True


class AdvertiserBase(BaseModel):
    """Shared advertiser fields."""

    advertiser_name: str = Field(..., max_length=255)
    advertiser_type: str = Field(
        ...,
        pattern="^(individual|business|enterprise|agency)$",
    )
    address_line_1: str = Field(..., max_length=255)
    address_line_2: Optional[str] = None
    city: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    postal_code: str = Field(..., max_length=20)
    country: str = Field(..., max_length=100)
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    timezone: str = Field(..., max_length=50)


class AdvertiserCreate(AdvertiserBase):
    """Create advertiser request."""

    contacts: List[ContactCreate] = Field(..., min_length=1)
    bank_accounts: List[BankAccountCreate] = Field(default_factory=list)


class AdvertiserUpdate(BaseModel):
    """Partial advertiser update."""

    advertiser_name: Optional[str] = Field(None, max_length=255)
    advertiser_type: Optional[str] = Field(None, pattern="^(individual|business|enterprise|agency)$")
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    timezone: Optional[str] = None
    contacts: Optional[List[ContactCreate]] = None
    bank_accounts: Optional[List[BankAccountCreate]] = None


class AdvertiserListItem(BaseModel):
    """Advertiser in list."""

    advertiser_id: UUID
    advertiser_name: str
    advertiser_type: str
    city: str
    country: str
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class AdvertiserDetail(AdvertiserBase):
    """Full advertiser detail."""

    advertiser_id: UUID
    contacts: List[ContactResponse] = []
    bank_accounts: List[BankAccountResponse] = []
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class PaginationMeta(BaseModel):
    """Pagination metadata."""

    page: int
    limit: int
    total: int
    total_pages: int


class AdvertiserListResponse(BaseModel):
    """Paginated advertiser list."""

    data: List[AdvertiserListItem]
    pagination: PaginationMeta
