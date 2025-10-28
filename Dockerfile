# Builder Stage ---

FROM python:3.12-slim AS builder

# Set the working directory in the container.
WORKDIR /app

# Create a non-root user 
RUN useradd --create-home appuser

# Create a venv
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copy and install requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# Final Stage --
FROM python:3.12-slim AS final

# Set working directory
WORKDIR /app

# Create the same user
RUN useradd --create-home appuser

# Copy over the venv
COPY --from=builder /opt/venv /opt/venv

# Copy over application code
COPY --chown=appuser:appuser backend/app ./app

# Switch to the new user
USER appuser

# Activate the venv
ENV PATH="/opt/venv/bin:$PATH"

# Expose the port the app will run on
EXPOSE 8000

# Run the app using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]