"""
Job360 - AI-Powered Career Platform
FastAPI Application Entry Point & Core Middleware Configuration
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.common.responses import standard_error_response
from app.api.v1.router import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for backend services."""
    setup_logging()
    logger.info("Initializing Job360 backend application services...")
    yield
    logger.info("Shutting down Job360 backend application services...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Enterprise AI-Powered Job Search and Career Assistance Platform",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/openapi.json",
)

# CORS Middleware Configuration (credentials allowed per specification)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API V1 Modular Routes
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/healthz", tags=["System Telemetry"])
async def health_check():
    """Liveness probe endpoint."""
    return {"status": "ok", "service": settings.PROJECT_NAME}


@app.get("/readyz", tags=["System Telemetry"])
async def readiness_check():
    """Readiness probe endpoint for container orchestrators."""
    return {"status": "ready", "service": settings.PROJECT_NAME}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler adhering to Section 9.1 JSON Error Envelope."""
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=standard_error_response(
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected server error occurred.",
            details={"path": request.url.path},
        ),
    )
