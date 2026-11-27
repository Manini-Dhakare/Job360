"""Custom Application Exceptions & Domain Error Hierarchy"""
from typing import Any, Dict, Optional
from fastapi import HTTPException


class AppException(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(status_code=status_code, detail=message)
        self.code = code
        self.message = message
        self.details = details or {}


class InsufficientCreditsException(AppException):
    def __init__(self, current_balance: int = 0, required: int = 1):
        super().__init__(
            status_code=402,
            code="INSUFFICIENT_CREDITS",
            message="User has insufficient credits to complete this action.",
            details={"current_balance": current_balance, "required": required},
        )


class ResourceNotFoundException(AppException):
    def __init__(self, resource: str, identifier: str):
        super().__init__(
            status_code=404,
            code="RESOURCE_NOT_FOUND",
            message=f"{resource} '{identifier}' not found.",
            details={"resource": resource, "identifier": identifier},
        )
