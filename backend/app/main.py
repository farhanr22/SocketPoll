from fastapi import FastAPI
from contextlib import asynccontextmanager
from .database import connect_to_mongo, close_mongo_connection
from .api import polls as polls_router

# Lifespan event handler to manage startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs on startup
    await connect_to_mongo()
    yield
    # Runs on shutdown
    await close_mongo_connection()

# FastAPI app instance
app = FastAPI(
    title="Quick Poll API",
    description="An API for creating and managing real-time polls.",
    version="0.1.0",
    lifespan=lifespan  # Register the lifespan handler
)

# Regiser the router for poll related routes
app.include_router(polls_router.router, prefix="/api", tags=["Polls"])

@app.get("/")
def read_root():
    """Check if API is working."""

    return {"message": "Welcome to the Poll API"}