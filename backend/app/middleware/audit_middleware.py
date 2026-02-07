"""Audit middleware for tracking user actions."""

import json
from datetime import datetime
from typing import Callable
from uuid import UUID

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.audit_log import AuditLog


class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware to log user actions for audit purposes."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request and log audit trail."""
        # Skip audit for health checks and docs
        if request.url.path in ["/api/health", "/", "/api/docs", "/api/redoc", "/api/openapi.json"]:
            return await call_next(request)

        # Only log write operations (POST, PUT, DELETE)
        if request.method not in ["POST", "PUT", "DELETE"]:
            return await call_next(request)

        # Get user info from request state (set by auth dependency)
        user_id = None
        if hasattr(request.state, "user"):
            user_id = request.state.user.user_id

        # Process request
        response = await call_next(request)

        # Log successful write operations
        if 200 <= response.status_code < 300:
            try:
                db = SessionLocal()
                
                # Determine action and resource type from path and method
                path_parts = request.url.path.split("/")
                resource_type = path_parts[2] if len(path_parts) > 2 else "unknown"
                
                action = self._get_action(request.method)
                
                # Extract resource ID if present
                resource_id = None
                if len(path_parts) > 3:
                    try:
                        resource_id = UUID(path_parts[3])
                    except (ValueError, IndexError):
                        pass

                # Create audit log entry
                audit_entry = AuditLog(
                    user_id=user_id,
                    action=action,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    ip_address=request.client.host if request.client else None,
                    user_agent=request.headers.get("user-agent"),
                )

                db.add(audit_entry)
                db.commit()
                db.close()
            except Exception as e:
                # Don't fail the request if audit logging fails
                print(f"Audit logging error: {e}")

        return response

    @staticmethod
    def _get_action(method: str) -> str:
        """Map HTTP method to action."""
        action_map = {
            "POST": "create",
            "PUT": "update",
            "PATCH": "update",
            "DELETE": "delete",
        }
        return action_map.get(method, "unknown")
