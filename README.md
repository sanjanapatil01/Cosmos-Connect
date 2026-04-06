# Virtual Cosmos – Assignment

Repository: https://github.com/sanjanapatil01/Cosmos-Connect

## Overview

Virtual Cosmos is a 2D real-time virtual environment where users move around and interact based on proximity. When two users come close, chat connects automatically. When they move apart, chat disconnects. This simulates real-world proximity-based interaction in a shared virtual space.

## Core Features

- **Real-time multiplayer** using WebSockets
- **2D user movement** with keyboard controls
- **Proximity detection** that automatically enables/disables chat
- **Chat panel** only visible when users are within range
- **Minimal UI/UX** with active connections and user presence
- **Image upload support** via backend file upload endpoint

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + WebSocket server
- **Real-time engine**: Custom WebSocket implementation for position and chat syncing

## Folder Structure

- `frontend/` – React application source, UI components, hooks, and canvas logic
- `backend/` – Express server, WebSocket server, and file upload API
- `supabase/` – legacy folder retained for reference only

## Setup Instructions

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Run the backend

```bash
cd backend
npm start
```

The backend starts at `http://localhost:4000`.

### 4. Run the frontend

```bash
cd frontend
npm run dev
```

Open the provided Vite URL in your browser, typically `http://localhost:8080` or `http://localhost:8081`.

## Usage

1. Open the app in multiple browser windows or devices.
2. Enter a username and join the cosmos.
3. Move around using keyboard controls.
4. When users move within proximity, the chat panel appears and chat is enabled.
5. Move apart to disconnect chat automatically.

## Notes

- The current backend uses a simple WebSocket server and Express for file uploads.
- The frontend uses a proximity-based model to determine nearby users and active chat.
- This implementation is designed for local development and demonstration.

## Recommended Improvements

- Add Socket.IO support if you want richer room and reconnection behavior.
- Add MongoDB for persistent user/session state.
- Enhance the canvas rendering with PixiJS for smoother animations.

## Assessment Goals

This project demonstrates:

- Frontend skills in building interactive movement and UI
- Real-time logic for proximity detection and state syncing
- Backend fundamentals with sockets and user state management
- System design thinking for a multiplayer proximity chat experience

---
