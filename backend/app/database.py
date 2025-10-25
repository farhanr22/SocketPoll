from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

mongodb = MongoDB()

async def connect_to_mongo():
    print("Connecting to MongoDB...")
    mongodb.client = AsyncIOMotorClient(settings.MONGO_CONNECTION_STRING)
    # The database name can be taken from the connection string
    # Or be set explicitly like this : mongodb.client["db_name"]
    mongodb.db = mongodb.client.get_default_database() 
    print("Successfully connected to MongoDB!")

async def close_mongo_connection():
    print("Closing MongoDB connection...")
    mongodb.client.close()
    print("MongoDB connection closed.")

# For getting the db instance
def get_database() -> AsyncIOMotorDatabase:
    return mongodb.db