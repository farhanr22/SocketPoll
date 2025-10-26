import random
import secrets
import logging
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models import PollCreate, PollInDB, Option
from .security import verify_turnstile

logger = logging.getLogger(__name__)

# Word lists for 3-word human-readable IDs
ATTR1 = [
    "sleepy",
    "spicy",
    "aggressive",
    "awkward",
    "chaotic",
    "sparkly",
    "dramatic",
    "slow",
    "loud",
    "tiny",
    "brave",
    "happy",
    "messy",
    "angry",
    "funny",
]

ATTR2 = [
    "blue",
    "noisy",
    "invisible",
    "annoying",
    "miniature",
    "lazy",
    "electric",
    "bored",
    "shiny",
    "quiet",
    "green",
    "purple",
    "fuzzy",
    "tired",
    "weird",
]

THINGS = [
    "toaster",
    "duck",
    "cactus",
    "robot",
    "llama",
    "potato",
    "turtle",
    "cloud",
    "octopus",
    "penguin",
    "fridge",
    "banana",
    "squirrel",
    "chair",
    "bread",
]


async def _generate_human_readable_id(db: AsyncIOMotorDatabase) -> str:
    """Generates a 3-word ID and ensured it's not already in use."""

    while True:
        adj = random.choice(ATTR1)
        color = random.choice(ATTR2)
        thing = random.choice(THINGS)
        poll_id = f"{adj}-{color}-{thing}"

        # Check if this ID already exists in the database
        if not await db.polls.find_one({"poll_id": poll_id}):
            return poll_id


async def _increment_global_stats(db: AsyncIOMotorDatabase, field: str):
    """Increment a field in the global stats document."""

    await db.stats.find_one_and_update(
        {"_id": "global_counters"},
        {"$inc": {field: 1}},
        upsert=True,  # Create the document if it doesn't exist
    )


async def create_poll(poll_data: PollCreate, db: AsyncIOMotorDatabase) -> PollInDB:
    """Creates a new poll, saves it, and updates global stats, after verifying Turnstile token."""

    await verify_turnstile(poll_data.turnstile_token)

    # Generate unique identifiers for the poll
    poll_id = await _generate_human_readable_id(db)
    creator_key = secrets.token_urlsafe(32)

    # Calculate lifecycle timestamps
    created_at = datetime.now(timezone.utc)
    active_until = created_at + timedelta(hours=poll_data.duration_hours)
    expire_at = created_at + timedelta(days=7)  # Hardcoded 7-day lifetime

    # Transform input option strings into Option models
    # (so that they get unique IDs)
    options = [Option(text=opt_text) for opt_text in poll_data.options]

    # Assemble the full poll document
    new_poll = PollInDB(
        _id=secrets.token_hex(12),
        poll_id=poll_id,
        creator_key=creator_key,
        question=poll_data.question,
        options=options,
        allow_multiple_choices=poll_data.allow_multiple_choices,
        theme=poll_data.theme,
        public_results=poll_data.public_results,
        created_at=created_at,
        active_until=active_until,
        expire_at=expire_at,
    )

    # Insert the new poll document into the 'polls' collection
    await db.polls.insert_one(new_poll.model_dump(by_alias=True))

    # Increment the global counter for total polls created
    await _increment_global_stats(db, "total_polls_created")

    logger.info(f"New poll created with ID: {new_poll.poll_id}")
    return new_poll
