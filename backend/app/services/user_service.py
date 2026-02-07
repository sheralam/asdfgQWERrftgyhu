"""User management service."""

from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserUpdate


def list_users(
    db: Session,
    *,
    page: int = 1,
    limit: int = 20,
    role: Optional[str] = None,
    search: Optional[str] = None,
) -> tuple[List[User], int]:
    """List users with pagination. Returns (items, total)."""
    q = db.query(User)
    if role:
        from app.models.role import Role
        q = q.join(Role, User.role_id == Role.role_id).filter(Role.role_name == role)
    if search:
        q = q.filter(
            User.username.ilike(f"%{search}%") | User.email.ilike(f"%{search}%")
        )
    total = q.count()
    q = q.order_by(User.username).offset((page - 1) * limit).limit(limit)
    return q.all(), total


def get_user(db: Session, user_id: UUID) -> Optional[User]:
    """Get user by id."""
    return db.query(User).filter(User.user_id == user_id).first()


def update_user(db: Session, user_id: UUID, data: UserUpdate) -> Optional[User]:
    """Update user (partial)."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return None
    update = data.model_dump(exclude_unset=True)
    for k, v in update.items():
        setattr(user, k, v)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: UUID) -> bool:
    """Delete user."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True
