"""Advertiser, contact, and bank account models."""

import uuid
from decimal import Decimal
from sqlalchemy import Column, DateTime, ForeignKey, String, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import Numeric

from app.database import Base


class Advertiser(Base):
    """Advertiser/business."""

    __tablename__ = "advertisers"

    advertiser_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    advertiser_name = Column(String(255), nullable=False)
    advertiser_type = Column(String(50), nullable=False)
    address_line_1 = Column(String(255), nullable=False)
    address_line_2 = Column(String(255))
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), nullable=False)
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    timezone = Column(String(50), nullable=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    created_by_user = relationship("User", back_populates="advertisers_created", foreign_keys=[created_by_id])
    contacts = relationship("AdvertiserContact", back_populates="advertiser", cascade="all, delete-orphan")
    bank_accounts = relationship(
        "AdvertiserBankAccount",
        back_populates="advertiser",
        cascade="all, delete-orphan",
    )


class AdvertiserContact(Base):
    """Contact for an advertiser."""

    __tablename__ = "advertiser_contacts"

    contact_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    advertiser_id = Column(
        UUID(as_uuid=True),
        ForeignKey("advertisers.advertiser_id", ondelete="CASCADE"),
        nullable=False,
    )
    contact_name = Column(String(200), nullable=False)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(50), nullable=False)
    contact_address = Column(String(255))
    contact_city = Column(String(100))
    contact_state = Column(String(100))
    contact_postal_code = Column(String(20))
    contact_country = Column(String(100))
    is_point_of_contact = Column(Boolean, default=False)
    contact_type = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    advertiser = relationship("Advertiser", back_populates="contacts")


class AdvertiserBankAccount(Base):
    """Bank account for an advertiser (encrypted)."""

    __tablename__ = "advertiser_bank_accounts"

    bank_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    advertiser_id = Column(
        UUID(as_uuid=True),
        ForeignKey("advertisers.advertiser_id", ondelete="CASCADE"),
        nullable=False,
    )
    bank_name = Column(String(255), nullable=False)
    bank_account_number_encrypted = Column(Text, nullable=False)
    bank_account_name = Column(String(255), nullable=False)
    bank_account_routing_number = Column(String(50))
    bank_account_swift_code = Column(String(20))
    bank_account_iban = Column(String(50))
    bank_account_bic = Column(String(20))
    bank_account_currency = Column(String(3), nullable=False)
    is_default = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    is_sepa_compliant = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    advertiser = relationship("Advertiser", back_populates="bank_accounts")
