from datetime import datetime, timezone
import logging

from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models import VoteCreate, PollInDB, PollResults
from app.exceptions import (
    PollNotFoundError,
    PollClosedError,
    AlreadyVotedError,
    InvalidOptionsError,
)
from app.websocket_manager import manager
from .poll_creation import _increment_global_stats
from .security import verify_turnstile

logger = logging.getLogger(__name__)


async def add_vote(poll_id: str, vote_data: VoteCreate, db: AsyncIOMotorDatabase):
    """
    Applies a vote to a poll after performing all necessary validation.
    Raises specific exceptions for different failure conditions.
    """

    # Fetch the poll
    poll_doc = await db.polls.find_one({"poll_id": poll_id})
    if not poll_doc:
        raise PollNotFoundError("This poll does not exist.")

    poll = PollInDB.model_validate(poll_doc)

    # Check if poll is active
    active_until_aware = poll.active_until.replace(tzinfo=timezone.utc)
    
    if datetime.now(timezone.utc) > active_until_aware:
        raise PollClosedError("This poll is no longer accepting votes.")

    # Check if the voter is legit using turnstile
    await verify_turnstile(vote_data.turnstile_token)

    # Check for duplicate voter
    if vote_data.voter_fingerprint in poll.voters:
        raise AlreadyVotedError("This browser has already voted on this poll.")

    # Validate submitted option IDs
    valid_option_ids = {opt.id for opt in poll.options}
    submitted_ids = set(vote_data.option_ids)

    if not submitted_ids.issubset(valid_option_ids):
        raise InvalidOptionsError(
            "One or more submitted option IDs are invalid for this poll."
        )

    # Enforce multiple choice option
    if not poll.allow_multiple_choices and len(submitted_ids) > 1:
        raise InvalidOptionsError("This poll does not allow multiple choices.")

    # If all checks pass, perform the database update ===

    # Use $inc to increment counts for each submitted option
    update_query = {"$inc": {f"votes.{opt_id}": 1 for opt_id in submitted_ids}}

    # Use $push to add the voter fingerprint to the list of voters
    update_query["$push"] = {"voters": vote_data.voter_fingerprint}

    await db.polls.update_one({"poll_id": poll.poll_id}, update_query)

    # Implement global stat for total votes cast
    await _increment_global_stats(db, "total_votes_cast")

    updated_poll_doc = await db.polls.find_one({"poll_id": poll.poll_id})
    if updated_poll_doc:

        # Pass it through the PollResults model and get JSON
        updated_results = PollResults.model_validate(updated_poll_doc)

        # Broadcast the results (in JSON)
        await manager.broadcast(poll.poll_id, updated_results.model_dump())

    logger.info(
        f"Vote successfully cast for poll '{poll_id}' by voter '{vote_data.voter_fingerprint[:8]}...'"
    )
    return
