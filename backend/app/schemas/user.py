"""User request/response schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Shared user fields."""

    username: str = Field(..., max_length=100)
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserUpdate(BaseModel):
    """Partial user update (admin or self)."""

    username: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None
    role_id: Optional[UUID] = None


class UserListItem(BaseModel):
    """User in list (admin)."""

    user_id: UUID
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role_id: Optional[UUID] = None
    is_active: bool
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class UserDetail(BaseModel):
    """User detail (admin or self)."""

    user_id: UUID
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role_id: Optional[UUID] = None
    is_active: bool
    is_verified: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    role_name: Optional[str] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class PaginationMeta(BaseModel):
    """Pagination metadata."""

    page: int
    limit: int
    total: int
    total_pages: int


class UserListResponse(BaseModel):
    """Paginated user list."""

    data: list[UserListItem]
    pagination: PaginationMeta
