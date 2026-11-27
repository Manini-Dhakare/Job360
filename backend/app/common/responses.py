"""
Standard API Response Envelopes
Strictly conforming to Architectural Specification Section 9.1
"""
from datetime import datetime, timezone
from typing import Any, Dict, Optional
import uuid


def generate_request_id() -> str:
    """Generate unique request identifier for telemetry tracing."""
    return f"req_{uuid.uuid4().hex[:8]}"


def standard_success_response(data: Any, request_id: Optional[str] = None) -> Dict[str, Any]:
    """Generates Section 9.1 compliant standard success response envelope."""
    return {
        "success": True,
        "data": data,
        "meta": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_id": request_id or generate_request_id(),
        },
    }


def standard_error_response(
    code: str,
    message: str,
    details: Optional[Dict[str, Any]] = None,
    request_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Generates Section 9.1 compliant standard error response envelope."""
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or {},
        },
        "meta": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_id": request_id or generate_request_id(),
        },
    }
