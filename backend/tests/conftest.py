# backend/tests/conftest.py

import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from motor.motor_asyncio import AsyncIOMotorClient

from app.main import app
from app.config import settings
from app.database import get_db_dependency

# This is the correct fixture for creating an async test client.
@pytest_asyncio.fixture(scope="function")
async def async_client():
    """Provides a client that talks to the app through an ASGI transport."""
    # The transport allows httpx to call our app directly without a running server.
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

# This fixture handles the database setup and dependency override.
@pytest_asyncio.fixture(scope="function")
async def test_db():
    """Provides a clean database and handles dependency override for a test."""
    test_db_name = "quickpoll_test_db"
    db_url_parts = settings.MONGO_CONNECTION_STRING.rsplit('/', 1)
    test_mongo_url = f"{db_url_parts[0]}/{test_db_name}"
    
    client = AsyncIOMotorClient(test_mongo_url)
    db = client.get_database(test_db_name)
    
    # Override the dependency before the test runs.
    app.dependency_overrides[get_db_dependency] = lambda: db
    
    yield db

    # Teardown: clean up the database and the override after the test.
    await client.drop_database(test_db_name)
    client.close()
    app.dependency_overrides.clear()