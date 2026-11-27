"""
Base Pydantic Schemas & Shared DTOs
"""
from datetime import datetime
from typing import Any, Dict, Generic, Optional, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class BaseResponseMeta(BaseModel):
    timestamp: str
    request_id: str


class BaseResponseEnvelope(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    meta: BaseResponseMeta


class BaseErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None


class BaseErrorEnvelope(BaseModel):
    success: bool = False
    error: BaseErrorDetail
    meta: BaseResponseMeta


class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 20
    model_config = ConfigDict(extra="ignore")
