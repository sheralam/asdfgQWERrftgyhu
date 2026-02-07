"""User management endpoints (admin)."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.user import (
    UserUpdate,
    UserListItem,
    UserDetail,
    UserListResponse,
    PaginationMeta,
)
from app.services.user_service import list_users, get_user, update_user, delete_user

router = APIRouter()

ADMIN_ROLES = ["app_admin", "system_admin"]
SYSTEM_ADMIN_ONLY = ["system_admin"]


@router.get("", response_model=UserListResponse)
def user_list(
    page: int = 1,
    limit: int = 20,
    role: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(ADMIN_ROLES)),
):
    """List users (admin only)."""
    if limit > 100:
        limit = 100
    items, total = list_users(db, page=page, limit=limit, role=role, search=search)
    total_pages = (total + limit - 1) // limit if total else 0
    return UserListResponse(
        data=[
            UserListItem(
                user_id=u.user_id,
                username=u.username,
                email=u.email,
                first_name=u.first_name,
                last_name=u.last_name,
                role_id=u.role_id,
                is_active=u.is_active,
                created_at=u.created_at,
            )
            for u in items
        ],
        pagination=PaginationMeta(
            page=page,
            limit=limit,
            total=total,
            total_pages=total_pages,
        ),
    )


@router.get("/{user_id}", response_model=UserDetail)
def user_get(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user (admin or self)."""
    if str(current_user.user_id) != str(user_id):
        if not current_user.role or current_user.role.role_name not in ADMIN_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    role_name = user.role.role_name if user.role else None
    return UserDetail(
        user_id=user.user_id,
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role_id=user.role_id,
        is_active=user.is_active,
        is_verified=user.is_verified,
        last_login=user.last_login,
        created_at=user.created_at,
        updated_at=user.updated_at,
        role_name=role_name,
    )


@router.put("/{user_id}", response_model=UserDetail)
def user_update(
    user_id: UUID,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update user (admin or self; role_id only for admin)."""
    if str(current_user.user_id) != str(user_id):
        if not current_user.role or current_user.role.role_name not in ADMIN_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
    else:
        # Self: don't allow changing role_id
        d = data.model_dump(exclude_unset=True)
        d.pop("role_id", None)
        data = UserUpdate(**d)

    user = update_user(db, user_id, data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user_get(user_id, db, current_user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def user_delete(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(SYSTEM_ADMIN_ONLY)),
):
    """Delete user (system_admin only)."""
    if not delete_user(db, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
