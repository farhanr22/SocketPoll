import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import settings

logger = logging.getLogger(__name__)


class MongoDB:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


mongodb = MongoDB()


async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    mongodb.client = AsyncIOMotorClient(settings.MONGO_CONNECTION_STRING)
    # The database name can be taken from the connection string
    # Or be set explicitly like this : mongodb.client["db_name"]
    mongodb.db = mongodb.client.get_default_database()
    logger.info("Successfully connected to MongoDB!")


async def setup_database_indexes():
    """Create necessary indexes in MongoDB if they don't already exist."""

    logger.info("Attempting to set up database indexes...")
    db = get_database()

    # Unique index on poll_id for fast lookups and to prevent duplicates
    await db.polls.create_index("poll_id", unique=True)

    # Index on creator_key for fetch    ing user-created polls
    await db.polls.create_index("creator_key")

    # TTL index for automatic document deletion
    # Documents will be deleted 0 seconds after the time specified in 'expire_at'
    await db.polls.create_index("expire_at", expireAfterSeconds=0)

    logger.info("Database indexes are configured.")


async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    mongodb.client.close()
    logger.info("MongoDB connection closed.")


# For getting the db instance
def get_database() -> AsyncIOMotorDatabase:
    return mongodb.db


async def get_db_dependency() -> AsyncIOMotorDatabase:
    """FastAPI dependency that provides a database session."""
    return get_database()
