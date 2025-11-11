<p align="center">
  <a href="https://socketpoll.pages.dev">
    <img width="85" src="frontend/public/icon.svg" alt="SocketPoll Logo" align="center">
  </a>
</p>
<h1 align="center"><i>SocketPoll</i></h1>

<p align="center">
  <img src="https://img.shields.io/badge/Python-000000?style=for-the-badge&logo=python" alt="Python Badge"> 
  <img src="https://img.shields.io/badge/FastAPI-000000?style=for-the-badge&logo=fastapi" alt="FastAPI Badge"> 
  <img src="https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react" alt="React Badge"> 
  <img src="https://img.shields.io/badge/MongoDB-000000?style=for-the-badge&logo=mongodb" alt="MongoDB Badge"> 
  <img src="https://img.shields.io/badge/Docker-000000?style=for-the-badge&logo=docker" alt="Docker Badge">
</p>

A minimal polling platform with a clean UI, real-time results, and bot/spam protection — create and share polls instantly with color themes, flexible voting windows, and multiple-choice support.&nbsp; **[Try&nbsp;it&nbsp;out&nbsp;➔](https://socketpoll.pages.dev)</a>**

<div align="center">

**[Features](#features) &nbsp;•&nbsp; [Tech Stack](#tech-stack) &nbsp;•&nbsp; [Getting Started](#getting-started) &nbsp;•&nbsp; [API](#api-endpoints)**

</div>

## Features

- Create polls with up to 10 options, configurable voting durations, and optional multiple-choice questions. Each poll gets a unique, human-readable URL and can be shared instantly via a QR code.
- Poll results update in real time via a WebSocket connection and can optionally be made public.
- Select a color theme during poll creation to customize the look of the voting and results pages.
- Polls are protected against bots and duplicate votes using Cloudflare Turnstile and browser fingerprinting.
- Polls stop accepting votes after the configured duration and are automatically deleted after a week.

## Tech Stack

The app consists of a static frontend and a containerized backend communicating via a RESTful API, with WebSocket connections for real-time result updates.

- **Frontend:**
    - Built with [React](https://github.com/facebook/react), using [Material UI](https://github.com/mui/material-ui) for pre-built components and theming.
    - API communication using [Axios](https://github.com/axios/axios) with schema-based response validation using [Zod](https://github.com/colinhacks/zod).

- **Backend:**
  - A dockerized [FastAPI](https://github.com/fastapi/fastapi) application using [Motor](https://github.com/mongodb/motor) for MongoDB access.
  - Python-based WebSocket manager for broadcasting real-time updates.
  
- **Security:**
  - Cloudflare Turnstile protection using [react-turnstile](https://github.com/marsidev/react-turnstile) for frontend verification and server-side token validation.
  - [Fingerprint.js](https://github.com/fingerprintjs/fingerprintjs/) for creating ID hashes to detect and block duplicate votes.

## Getting Started

The application can be run locally, with the backend in a Docker container and the frontend served via the Vite development server.

<details>
<summary><h3>Running with Docker (Recommended)</h3></summary>

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/farhanr22/socketpoll.git
    cd socketpoll
    ```
2.  **Configure Backend Environment:**
    Navigate to the `backend/` directory, copy the example environment file, and fill in your secrets.
    ```bash
    cd backend
    cp .env.example .env
    # Edit the .env file
    cd ..
    ```
3.  **Configure Frontend Environment:**
    Navigate to the `frontend/` directory, copy the example, and add your Cloudflare Site Key and backend host.
    ```bash
    cd frontend
    cp .env.example .env
    # Edit the .env file
    cd ..
    ```
4.  **Build and Run the Backend:**
    This command starts the FastAPI backend container.
    ```bash
    docker compose up --build
    ```
    The backend will be available at `http://localhost:8000`.

5.  **Run the Frontend:**
    In a **new terminal**, navigate to the `frontend/` directory and start the Vite server.
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

</details>

<details>
<summary><h3>Manual Local Setup</h3></summary>
    
**Backend:**
1. Navigate to `backend/`, create and activate a virtual environment (`python3 -m venv venv` and `source venv/bin/activate`).
2. Install dependencies: `pip install -r requirements.txt`.
3. Create and configure your `.env` file from `.env.example`.
4. Run the server: `uvicorn app.main:app --reload`.

**Frontend:**
1. Navigate to `frontend/`, install dependencies: `npm install`.
2. Create and configure your `.env` file from `.env.example`.
3. Run the dev server: `npm run dev`.

</details>

## API Endpoints

The backend provides the following RESTful and WebSocket endpoints under the `/api` prefix.

| Method     | Path                             | Description                                  |
| :--------- | :------------------------------- | :------------------------------------------- |
| `POST`     | `/polls`                         | Creates a new poll.                          |
| `GET`      | `/polls/{poll_id}`               | Fetches public data for a poll.              |
| `GET`      | `/polls/{poll_id}/results`       | Fetches results (requires key if private).   |
| `POST`     | `/polls/{poll_id}/vote`          | Submits a vote for a poll.                   |
| `DELETE`   | `/polls/{poll_id}`               | Deletes a poll (requires creator key).       |
| `WS`       | `/ws/polls/{poll_id}/results`    | Establishes a real-time results connection.  |


## License

This project is licensed under the [MIT License](LICENSE).