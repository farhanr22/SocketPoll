from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models import PollInDB

async def get_poll_by_id(poll_id: str, db: AsyncIOMotorDatabase) -> PollInDB | None:
    """
    Retrieves a single poll document from the database by its public ID.
    Returns the full PollInDB object or None if not found.
    """
    
    poll_document = await db.polls.find_one({"poll_id": poll_id})
    
    if poll_document:
        return PollInDB.model_validate(poll_document)
    
    return None