# Virtual Cosmos

## Overview

Virtual Cosmos is a 2D real-time virtual environment where users can move around and interact with each other based on proximity. When two users come close, a chat connection is automatically established. When they move apart, the chat disconnects.

This project simulates real-world spatial interaction in a shared virtual space using real-time communication.

---
## Live Demo

[Watch Demo Video](https://drive.google.com/file/d/1BWjLbHYB3tX9Z_ee8E4JPaN13SHJvxq-/view?usp=sharing)

## Features

* Real-time multiplayer using WebSockets
* 2D movement using keyboard controls (WASD / Arrow keys)
* Proximity-based chat system
* Automatic chat connect/disconnect
* Chat panel appears only when users are nearby
* Multiple users visible in real time
* Minimal and clean UI
* Image upload support via backend

---

## Tech Stack

### Frontend

* React (Vite + TypeScript)
* Tailwind CSS
* HTML5 Canvas

### Backend

* Node.js
* Express.js
* WebSocket (custom implementation)

---

## Folder Structure

```bash
Cosmos-Connect/
│
├── backend/
│   ├── node_modules/
│   ├── uploads/              # Uploaded images storage
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js             # Express + WebSocket server
│
├── frontend/
│   ├── dist/                 # Build output
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── hooks/            # Custom hooks
│   │   ├── integrations/     # External integrations
│   │   ├── lib/              # Utility functions
│   │   ├── pages/            # Page-level components
│   │   ├── test/             # Test files
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── App.css
│   │   └── index.css
│   │
│   ├── .env
│   ├── .gitignore
│   ├── bun.lock
│   ├── bun.lockb
│   ├── components.json
│   └── vite-env.d.ts
│
└── supabase/ (legacy, not used)
```

---

## Architecture

The system follows a real-time event-driven architecture:

* Client sends movement updates via WebSocket
* Server maintains user state in memory
* Server broadcasts updated positions
* Frontend renders users and calculates proximity
* Chat is enabled/disabled dynamically

---

## Data Flow

Client → WebSocket → Server → Broadcast → Client Render → Proximity Detection → Chat System

---

## Core Logic: Proximity Detection

Each user has an interaction radius (e.g., 100px).

Distance is calculated using:

distance = sqrt((x2 - x1)^2 + (y2 - y1)^2)

### Behavior

* If distance < radius → users connect → chat enabled
* If distance ≥ radius → users disconnect → chat disabled

---

## Real-Time Communication

### WebSocket Events

* `user_join` → Register user
* `move` → Update position
* `broadcast_positions` → Sync users
* `chat_message` → Send messages
* `disconnect` → Remove user

### Why WebSocket?

* Lightweight and fast
* Full control over communication
* No unnecessary abstraction

Trade-off:

* No built-in room management or reconnection

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/sanjanapatil01/Cosmos-Connect.git
cd Cosmos-Connect
```

---

### 2. Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs at:
http://localhost:4000

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open browser at:
http://localhost:8080 (or Vite default port)

---

## Usage

1. Open app in multiple tabs
2. Enter username
3. Move users using keyboard
4. When users come close → chat appears
5. Send messages
6. Move away → chat disappears

---

## State Management

### Backend

```js
users = {
  socketId: { x, y, username }
}
```

---

### Frontend

* User position state
* Nearby users detection
* Active chat state

---

## Performance Considerations

* Throttled movement updates
* Lightweight WebSocket messages
* Efficient rendering
* Client-side proximity detection

---

## Limitations

* No database (in-memory only)
* No authentication
* Limited scalability
* No reconnection handling

---

## Future Improvements

### Scalability

* Redis for distributed state
* Socket.IO for rooms & reconnection
* Load balancing

### Features

* Voice chat (WebRTC)
* Group chat
* Avatar customization
* Zoom & pan canvas
* Mobile support

### Performance

* QuadTree for efficient proximity detection
* Delta updates instead of full sync

---

## Engineering Decisions & Trade-offs

| Decision                 | Reason                 | Trade-off          |
| ------------------------ | ---------------------- | ------------------ |
| Custom WebSocket         | Lightweight & flexible | Manual handling    |
| In-memory state          | Fast & simple          | Not scalable       |
| Frontend proximity logic | Reduces server load    | Slight duplication |
| Minimal UI               | Focus on logic         | Less design polish |

---

## Demo Walkthrough

1. Open two tabs
2. Join with usernames
3. Move both users
4. Observe real-time updates
5. Move closer → chat appears
6. Send message
7. Move away → chat disappears

---

## Screenshots

<img width="1900" height="864" alt="image" src="https://github.com/user-attachments/assets/467935af-5be4-4a34-93c4-98d2ea45d163" />

<img width="1903" height="794" alt="image" src="https://github.com/user-attachments/assets/7c0a21f5-18b3-4183-ab6c-cf157d9043af" />


---



## Author

Sanjana M Patil

---

