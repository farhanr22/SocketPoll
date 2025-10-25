import asyncio
from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    """In-memory manager for Websocket connection objects and related tasks.

       - Stores a list of connected websocket objects for each poll
         *for each poll that has at least one client listening
       - Handles adding and removing websocket objects for dis/connects
       - Forwards message to all clients concurrently when broadcast function is called 
    """

    def __init__(self):
        # This dictionary will hold active connections for each poll
        # Key: poll_id (str), Value: List of active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, poll_id: str, websocket: WebSocket):
        """Accept a new WebSocket connection and add it to the poll's list."""

        await websocket.accept()
        if poll_id not in self.active_connections:
            self.active_connections[poll_id] = []
        self.active_connections[poll_id].append(websocket)

    def disconnect(self, poll_id: str, websocket: WebSocket):
        """Remove a WebSocket connection from the list."""

        if poll_id in self.active_connections:
            self.active_connections[poll_id].remove(websocket)

            # If a poll has no more listeners, we can remove the entry
            if not self.active_connections[poll_id]:
                del self.active_connections[poll_id]

    async def broadcast(self, poll_id: str, message: dict):
        """Send a JSON message to all connected clients for a specific poll."""

        if poll_id in self.active_connections:
            # We create a list of tasks for sending the message
            tasks = [
                connection.send_json(message)
                for connection in self.active_connections[poll_id]
            ]

            # Run all send tasks concurrently
            await asyncio.gather(*tasks, return_exceptions=False)


# Global ConnectionManager instance
manager = ConnectionManager()
