"""Billing Schemas (Section 9.2)"""
from typing import Literal
from pydantic import BaseModel


class CheckoutSessionRequest(BaseModel):
    price_id: str
    mode: Literal["payment", "subscription"]
