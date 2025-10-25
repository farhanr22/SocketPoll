from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Header
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db_dependency
from app.models import PollCreate, PollCreatedResponse, PollPublic, PollResults
from app.services import create_poll, get_poll_by_id

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


@router.get(
    "/polls/{poll_id}",
    response_model=PollPublic,
    summary="Get public poll data for voting"
)
async def get_poll_for_voting_endpoint(
    poll_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db_dependency)
):
    """
    Fetches the public data for a poll, allowing users to vote.
    Does not include results or other metadata.
    """

    poll = await get_poll_by_id(poll_id, db)
    if not poll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poll not found."
        )
    return poll


@router.get(
    "/polls/{poll_id}/results",
    response_model=PollResults,
    summary="Get poll results"
)
async def get_poll_results_endpoint(
    poll_id: str,
    creator_key: Annotated[str | None, Header(alias="X-Creator-Key")] = None,
    db: AsyncIOMotorDatabase = Depends(get_db_dependency)
):
    """
    Fetches the results for a poll, including vote counts.
    
    If the poll's results are not set to be public, 
    a valid `X-Creator-Key` header must be provided.
    """

    poll = await get_poll_by_id(poll_id, db)
    if not poll:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Poll not found.")

    # Check for authorization if results are not public
    if not poll.public_results:
        if not creator_key or creator_key != poll.creator_key:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view these results."
            )
            
    return poll 