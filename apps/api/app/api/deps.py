from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.enums import RoleName
from app.repositories.user_repository import UserRepository


@dataclass
class CurrentUser:
    user_id: int
    role: RoleName


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    x_user_id: Annotated[int | None, Header(alias="x-user-id")] = None,
) -> CurrentUser:
    users = UserRepository(db)

    if x_user_id is None:
        if not settings.disable_auth:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
            )

        fallback_user = users.get_first_user()
        if fallback_user is None:
            raise HTTPException(status_code=401, detail="No users available")

        return CurrentUser(
            user_id=fallback_user.id,
            role=RoleName(fallback_user.role.name),
        )

    user = users.get_user_by_id(x_user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return CurrentUser(user_id=user.id, role=RoleName(user.role.name))


def require_role(user: CurrentUser, allowed: set[RoleName]) -> None:
    if user.role not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role {user.role.value} is not allowed for this action",
        )
