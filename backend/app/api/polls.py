from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Header
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db_dependency
from app.models import (
    PollCreate,
    PollCreatedResponse,
    PollPublic,
    PollResults,
    VoteCreate,
    VoteSuccessResponse,
)
from app.services import create_poll, get_poll_by_id, add_vote
from app.exceptions import (
    PollCreationError,
    PollNotFoundError,
    PollClosedError,
    AlreadyVotedError,
    InvalidOptionsError,
)

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
            poll_id=new_poll.poll_id,
            creator_key=new_poll.creator_key
        )

    # This catches errors explicitly raised from the creation function
    # instead of blanket returning 500 for any error.
    except PollCreationError as e: 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while creating the poll: {e}"
        )


@router.get(
    "/polls/{poll_id}",
    response_model=PollPublic,
    summary="Get public poll data for voting",
)
async def get_poll_for_voting_endpoint(
    poll_id: str, db: AsyncIOMotorDatabase = Depends(get_db_dependency)
):
    """
    Fetches the public data for a poll, allowing users to vote.
    Does not include results or other metadata.
    """

    poll = await get_poll_by_id(poll_id, db)
    if not poll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Poll not found."
        )
    return poll


@router.get(
    "/polls/{poll_id}/results", response_model=PollResults, summary="Get poll results"
)
async def get_poll_results_endpoint(
    poll_id: str,
    creator_key: Annotated[str | None, Header(alias="X-Creator-Key")] = None,
    db: AsyncIOMotorDatabase = Depends(get_db_dependency),
):
    """
    Fetches the results for a poll, including vote counts.

    If the poll's results are not set to be public,
    a valid `X-Creator-Key` header must be provided.
    """

    poll = await get_poll_by_id(poll_id, db)
    if not poll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Poll not found."
        )

    # Check for authorization if results are not public
    if not poll.public_results:
        if not creator_key or creator_key != poll.creator_key:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view these results.",
            )

    return poll


@router.post(
    "/polls/{poll_id}/vote",
    response_model=VoteSuccessResponse,
    summary="Cast a vote on a poll",
)
async def cast_vote_endpoint(
    poll_id: str,
    vote_data: VoteCreate,
    db: AsyncIOMotorDatabase = Depends(get_db_dependency),
):
    """
    Submits a vote for a given poll.
    Performs validation, security checks, and updates vote counts.
    """
    
    try:
        await add_vote(poll_id, vote_data, db)
        return VoteSuccessResponse()
    except PollNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PollClosedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except AlreadyVotedError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except InvalidOptionsError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
