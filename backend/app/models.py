import uuid
from datetime import datetime, timedelta
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List, Dict

# Helper Models ===


class Option(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    text: str


# API Models ===


class PollCreate(BaseModel):
    """Model for data received when creating a poll."""

    question: str = Field(..., min_length=1, max_length=280)
    options: List[str] = Field(..., min_length=2, max_length=10)
    turnstile_token: str = Field(..., max_length=1024)
    duration_hours: int = Field(24, gt=0)  # Poll active duration in hours
    allow_multiple_choices: bool = False
    theme: str = "default"
    public_results: bool = True

    @field_validator("options")
    @classmethod
    def validate_options(cls, opts: List[str]) -> List[str]:
        # Ensure no option is empty or just whitespace
        if any(not opt or not opt.strip() for opt in opts):
            raise ValueError("Options cannot be empty or just whitespace.")

        # Ensure there are no duplicate options (case-insensitive)
        if len(set(opt.lower() for opt in opts)) != len(opts):
            raise ValueError("Duplicate options are not allowed.")

        return opts


class PollCreatedResponse(BaseModel):
    """Model for the response sent after a poll is created."""

    poll_id: str
    creator_key: str
    question: str
    active_until: datetime
    expire_at: datetime


class PollPublic(BaseModel):
    """Public-facing model for a poll, can be shown to any voter."""

    poll_id: str
    question: str
    options: List[Option]
    allow_multiple_choices: bool
    theme: str
    active_until: datetime


class PollResults(PollPublic):
    """Public details + vote counts. (inherits from PollPublic)"""

    votes: Dict[str, int]


class VoteCreate(BaseModel):
    """Model for a vote submission."""

    option_ids: List[str] = Field(
        ..., min_length=1, max_length=10
    )  # Max 10 choices per vote
    turnstile_token: str = Field(..., max_length=1024)
    voter_fingerprint: str = Field(..., min_length=32, max_length=32)


class VoteSuccessResponse(BaseModel):
    """Response for a successful vote."""

    message: str = "Vote cast successfully."


# Database Models ===


class PollInDB(BaseModel):
    """Model representing the poll document in MongoDB."""

    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")

    # "index" and "unique" are not for Pydantic validation, so they are treated separately
    poll_id: str = Field(..., json_schema_extra={"index": True, "unique": True})
    creator_key: str = Field(..., json_schema_extra={"index": True})

    question: str
    options: List[Option]
    allow_multiple_choices: bool
    votes: Dict[str, int] = Field(default_factory=dict)
    voters: List[str] = Field(default_factory=list)  # List of voter fingerprints

    # Lifecycle fields
    theme: str
    public_results: bool
    created_at: datetime = Field(default_factory=datetime.utcnow)
    active_until: datetime
    expire_at: datetime  # For the TTL index
