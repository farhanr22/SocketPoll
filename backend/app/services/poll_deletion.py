from motor.motor_asyncio import AsyncIOMotorDatabase
from app.exceptions import PollAccessDeniedError


async def delete_poll(poll_id: str, creator_key: str, db: AsyncIOMotorDatabase):
    """
    Deletes a poll from the database only if the creator_key is valid.
    Raises PollAccessDeniedError if the poll is not found or the key is incorrect.
    """

    # Search for a document with both the specificed poll ID and creator_key
    delete_result = await db.polls.delete_one(
        {"poll_id": poll_id, "creator_key": creator_key}
    )

    # If the return object has a count of 1, the creator key was correct and doc was deleted
    # Otherwise either Poll doesn't exist or an incorrect creator key was given
    if delete_result.deleted_count == 0:
        raise PollAccessDeniedError("Poll not found or access denied.")
