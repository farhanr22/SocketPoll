import logging

import httpx
from fastapi import HTTPException, status
from app.config import settings

logger = logging.getLogger(__name__)

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


async def verify_turnstile(token: str) -> bool:
    """
    Verifies a Cloudflare Turnstile token by making a server-side request.
    Returns True if the token is valid, otherwise raises an HTTPException.
    """

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                TURNSTILE_VERIFY_URL,
                json={
                    "secret": settings.CLOUDFLARE_TURNSTILE_SECRET_KEY,
                    "response": token,
                },
            )
            response.raise_for_status()  # Raise an exception for 4xx or 5xx status codes
        except httpx.RequestError as e:
            # Handle any other errors
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Could not verify Turnstile token: {e}",
            )

    result = response.json()
    if not result.get("success"):
        # Log the error codes from Cloudflare for debugging
        error_codes = result.get("error-codes", [])
        logger.warning(f"Turnstile verification failed with error codes: {error_codes}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Turnstile token provided.",
        )

    return True
