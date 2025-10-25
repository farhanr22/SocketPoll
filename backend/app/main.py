from fastapi import FastAPI

# FastAPI app instance
app = FastAPI(
    title="Quick Poll API",
    description="An API for creating and managing real-time polls.",
    version="0.1.0"
)

@app.get("/")
def read_root():
    """Check if API is working."""

    return {"message": "Welcome to the Poll API"}