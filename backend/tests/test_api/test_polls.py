import pytest
from httpx import AsyncClient
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid

# Mark all tests in this file as async
pytestmark = pytest.mark.asyncio


# Helper function for creating a test
async def create_test_poll(
    async_client: AsyncClient,
    question: str = "Default Test Question",
    options: list = None,
    public_results: bool = True,
    allow_multiple_choices: bool = False,
) -> dict:
    """Helper to create a poll via the API and return its JSON response."""
    if options is None:
        options = ["Option A", "Option B"]

    poll_data = {
        "question": question,
        "options": options,
        "turnstile_token": "test_token",
        "duration_hours": 1,
        "public_results": public_results,
        "allow_multiple_choices": allow_multiple_choices,
    }
    response = await async_client.post("/api/polls", json=poll_data)
    assert response.status_code == 201, f"Failed to create poll: {response.text}"
    return response.json()  # Returns {"poll_id": "...", "creator_key": "..."}


# TEST CASES START ===


async def test_create_poll_success(
    async_client: AsyncClient, test_db: AsyncIOMotorDatabase
):
    """Test poll creation by calling the helper and verifying in the DB state."""
    created_poll_data = await create_test_poll(
        async_client, question="Is the helper function working?"
    )

    # Verify the poll was actually saved to the database
    poll_in_db = await test_db.polls.find_one({"poll_id": created_poll_data["poll_id"]})
    assert poll_in_db is not None
    assert poll_in_db["question"] == "Is the helper function working?"
    assert poll_in_db["public_results"] is True


async def test_create_poll_validation_error(
    async_client: AsyncClient, test_db: AsyncIOMotorDatabase
):
    """Tests that creating a poll with invalid data (e.g., one option) is rejected."""
    invalid_poll_data = {
        "question": "Will this fail?",
        "options": ["Only one option"],
        "turnstile_token": "test_token",
    }

    response = await async_client.post("/api/polls", json=invalid_poll_data)

    assert response.status_code == 422  # 422 Unprocessable Entity


async def test_vote_success(async_client: AsyncClient, test_db: AsyncIOMotorDatabase):
    """Test that a valid vote is successfully cast and the count is incremented."""

    # Setup: Create a poll to vote on
    created_poll = await create_test_poll(async_client)
    poll_id = created_poll["poll_id"]

    # Get the ID of the first option to vote for
    poll_in_db = await test_db.polls.find_one({"poll_id": poll_id})
    option_id_to_vote = poll_in_db["options"][0]["id"]

    vote_data = {
        "option_ids": [option_id_to_vote],
        "voter_fingerprint": uuid.uuid4().hex,
        "turnstile_token": "test_token",
    }

    # Cast the vote
    response = await async_client.post(f"/api/polls/{poll_id}/vote", json=vote_data)

    assert response.status_code == 200

    # Verify the vote count was incremented in the database
    updated_poll = await test_db.polls.find_one({"poll_id": poll_id})
    assert updated_poll["votes"][option_id_to_vote] == 1


async def test_vote_duplicate_fingerprint_fails(
    async_client: AsyncClient, test_db: AsyncIOMotorDatabase
):
    """Test that a user cannot vote twice on the same poll with the same fingerprint."""

    # Create a poll and cast one successful vote
    created_poll = await create_test_poll(async_client)
    poll_id = created_poll["poll_id"]

    poll_in_db = await test_db.polls.find_one({"poll_id": poll_id})
    option_id = poll_in_db["options"][0]["id"]
    voter_fingerprint = uuid.uuid4().hex

    vote_data = {
        "option_ids": [option_id],
        "voter_fingerprint": voter_fingerprint,
        "turnstile_token": "test_token",
    }
    first_response = await async_client.post(
        f"/api/polls/{poll_id}/vote", json=vote_data
    )
    assert first_response.status_code == 200

    # Attempt to cast a second vote with the same fingerprint
    second_response = await async_client.post(
        f"/api/polls/{poll_id}/vote", json=vote_data
    )

    # The second attempt should be rejected
    assert second_response.status_code == 409  # 409 Conflict


async def test_get_private_results_fails_without_key(
    async_client: AsyncClient, test_db: AsyncIOMotorDatabase
):
    """Tests that accessing results for a private poll fails without the creator key."""
    # Create a private poll
    created_poll = await create_test_poll(async_client, public_results=False)
    poll_id = created_poll["poll_id"]

    # Try to get the results
    response = await async_client.get(f"/api/polls/{poll_id}/results")

    assert response.status_code == 403  # 403 Forbidden


async def test_get_private_results_succeeds_with_key(
    async_client: AsyncClient, test_db: AsyncIOMotorDatabase
):
    """Tests that accessing results for a private poll SUCCEEDS when the correct
    creator key is provided in the header."""

    # Create a private poll
    created_poll = await create_test_poll(async_client, public_results=False)
    poll_id = created_poll["poll_id"]
    creator_key = created_poll["creator_key"]

    # Try to get the results with the correct key in the header
    headers = {"X-Creator-Key": creator_key}
    response = await async_client.get(f"/api/polls/{poll_id}/results", headers=headers)

    # Check the response
    assert response.status_code == 200
    response_json = response.json()
    assert "votes" in response_json


async def test_delete_poll_fails_without_key(
    async_client: AsyncClient, test_db: AsyncIOMotorDatabase
):
    """Tests that deleting a poll fails if the creator key is missing or wrong."""
    # Create a poll
    created_poll = await create_test_poll(async_client)
    poll_id = created_poll["poll_id"]

    # Attempt to delete the poll with a fake header
    headers = {"X-Creator-Key": "this-is-a-fake-key"}
    response = await async_client.delete(f"/api/polls/{poll_id}", headers=headers)

    # Check response
    assert response.status_code == 403  # Forbidden

    # Check that the poll is still in the database
    poll_in_db = await test_db.polls.find_one({"poll_id": poll_id})
    assert poll_in_db is not None


async def test_delete_poll_succeeds_with_key(
    async_client: AsyncClient, test_db: AsyncIOMotorDatabase
):
    """Tests that a poll is successfully deleted when the correct creator key is provided."""
    
    # Create a poll
    created_poll = await create_test_poll(async_client)
    poll_id = created_poll["poll_id"]
    creator_key = created_poll["creator_key"]

    # Delete the poll with the correct key
    headers = {"X-Creator-Key": creator_key}
    response = await async_client.delete(f"/api/polls/{poll_id}", headers=headers)

    # Check response
    assert response.status_code == 204  # No Content

    # Check that the poll is now gone from the database
    poll_in_db = await test_db.polls.find_one({"poll_id": poll_id})
    assert poll_in_db is None
