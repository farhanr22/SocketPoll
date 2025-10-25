from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models import VoteCreate, PollInDB
from app.exceptions import (
    PollNotFoundError,
    PollClosedError,
    AlreadyVotedError,
    InvalidOptionsError,
)
from .poll_creation import _increment_global_stats


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
    if datetime.utcnow() > poll.active_until:
        raise PollClosedError("This poll is no longer accepting votes.")

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

    return
