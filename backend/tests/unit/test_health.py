"""Basic Health Endpoint Liveness & Readiness Tests"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient):
    response = await async_client.get("/healthz")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_readiness_check(async_client: AsyncClient):
    response = await async_client.get("/readyz")
    assert response.status_code == 200
    assert response.json()["status"] == "ready"
