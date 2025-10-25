from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db_dependency
from app.models import PollCreate, PollCreatedResponse
from app.services import create_poll

router = APIRouter()


@router.post(
    "/polls",
    response_model=PollCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new poll",
)
async def create_poll_endpoint(
    poll_data: PollCreate, db: AsyncIOMotorDatabase = Depends(get_db_dependency)
):
    """
    Handles the creation of a new poll.

    - Receives poll data in the request body.
    - Validates the data using the `PollCreate` model.
    - Calls the `create_poll` to perform the creation logic.
    - Returns the new poll's ID and a secret creator key.
    """

    try:
        new_poll = await create_poll(poll_data, db)
        return PollCreatedResponse(
            poll_id=new_poll.poll_id, creator_key=new_poll.creator_key
        )
    except Exception as e:
        # Return a generic error message
        # if there's been an issue other than validation error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while creating the poll.",
        )
