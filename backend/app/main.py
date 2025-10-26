import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from .database import connect_to_mongo, close_mongo_connection, setup_database_indexes
from .api import polls as polls_router

# Set up logging
logger = logging.getLogger()  # Root Logger
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s", "%Y-%m-%d %H:%M:%S"
)
handler.setFormatter(formatter)
logger.addHandler(handler)


# Lifespan event handler to manage startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs on startup
    await connect_to_mongo()
    await setup_database_indexes()
    yield
    # Runs on shutdown
    await close_mongo_connection()


# FastAPI app instance
app = FastAPI(
    title="Quick Poll API",
    description="An API for creating and managing real-time polls.",
    version="0.1.0",
    lifespan=lifespan,  # Register the lifespan handler
    docs_url="/docs" if settings.ENABLE_DOCS else None,
    redoc_url="/redoc" if settings.ENABLE_DOCS else None,
)


# Log unhandled errors
@app.middleware("http")
async def log_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        # Log the exception with traceback
        logger.error("Unhandled exception caught", exc_info=True)
        # Return a generic 500 response
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"},
        )


# Setup CORS
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Regiser the router for poll related routes
app.include_router(polls_router.router, prefix="/api", tags=["Polls"])


@app.get("/")
def read_root():
    """Check if API is working."""

    return {"message": "Welcome to the Poll API"}
