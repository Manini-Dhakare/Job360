"""Job Schemas (Section 9.2)"""
from typing import List, Optional
from pydantic import BaseModel


class JobSearchParams(BaseModel):
    query: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    remote_only: Optional[bool] = False
    min_score: Optional[float] = None
    page: int = 1
    page_size: int = 20
