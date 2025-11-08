from typing import Annotated
import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Header,
    Response,
    WebSocket,
    WebSocketDisconnect,
)
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
from app.services import create_poll, get_poll_by_id, add_vote, delete_poll
from app.exceptions import (
    PollAccessDeniedError,
    PollCreationError,
    PollNotFoundError,
    PollClosedError,
    AlreadyVotedError,
    InvalidOptionsError,
)

from app.websocket_manager import manager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/polls",
    response_model=PollCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new poll",
    responses={500: {"description": "Internal server error during poll creation"}},
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
            creator_key=new_poll.creator_key,
            question=new_poll.question,
            active_until=new_poll.active_until,
            expire_at=new_poll.expire_at,
        )

    # This catches errors explicitly raised from the creation function
    # instead of blanket returning 500 for any error.
    except PollCreationError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while creating the poll: {e}",
        )


@router.get(
    "/polls/{poll_id}",
    response_model=PollPublic,
    summary="Get public poll data for voting",
    responses={404: {"description": "Poll with the specified ID was not found"}},
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
            status_code=status.HTTP_404_NOT_FOUND, detail="Poll not found :("
        )
    return poll


@router.get(
    "/polls/{poll_id}/results",
    response_model=PollResults,
    summary="Get poll results",
    responses={
        404: {"description": "Poll with the specified ID was not found"},
        403: {"description": "Permission denied to view results for a private poll"},
    },
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
            status_code=status.HTTP_404_NOT_FOUND, detail="Poll not found :("
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
    responses={
        400: {"description": "Invalid options provided in the vote"},
        403: {"description": "Voting on this poll has closed"},
        404: {"description": "Poll with the specified ID was not found"},
        409: {"description": "This browser has already voted on this poll"},
    },
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


@router.delete(
    "/polls/{poll_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a poll",
    responses={
        204: {"description": "Poll deleted successfully. No content returned."},
        403: {
            "description": "Permission denied. The provided X-Creator-Key is invalid or missing."
        },
    },
)
async def delete_poll_endpoint(
    poll_id: str,
    creator_key: Annotated[str, Header(alias="X-Creator-Key")],
    db: AsyncIOMotorDatabase = Depends(get_db_dependency),
):
    """
    Deletes a poll, identified by its ID.
    Requires a valid `X-Creator-Key` header for authorization.
    """
    try:
        await delete_poll(poll_id, creator_key, db)
        # On success, return a 204 response with no body
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    except PollAccessDeniedError as e:
        # Reject the attempt
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.websocket("/ws/polls/{poll_id}/results")
async def websocket_endpoint(
    websocket: WebSocket,
    poll_id: str,
    creator_key: str | None = None,  # Query Parameter
    db: AsyncIOMotorDatabase = Depends(get_db_dependency),
):
    """
    WebSocket endpoint for broadcasting poll result updates.
    For private polls, a `creator_key` query parameter must be provided.
    """

    # Check if the poll exists
    poll = await get_poll_by_id(poll_id, db)
    if not poll:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION, reason="Poll not found :("
        )
        return

    # If poll is private, validate creator key
    if not poll.public_results:
        if not creator_key or creator_key != poll.creator_key:
            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION, reason="Authentication failed"
            )
            return

    await manager.connect(poll_id, websocket)
    logger.info(f"Client connected to WebSocket for poll '{poll_id}'")

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(poll_id, websocket)
        logger.info(f"Client disconnected from WebSocket for poll '{poll_id}'")
