const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const UPLOAD_DIR = path.resolve(__dirname, "uploads");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Map();

function broadcast(message, excludedSocket = null) {
  const payload = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN && client !== excludedSocket) {
      client.send(payload);
    }
  });
}

function sendPresence() {
  const users = Array.from(clients.values()).map((entry) => entry.user);
  broadcast({ type: "presence", users });
}

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  return res.json({ url });
});

wss.on("connection", (socket) => {
  socket.on("message", (rawData) => {
    let data;

    try {
      data = JSON.parse(rawData.toString());
    } catch (error) {
      console.error("Invalid message received:", rawData.toString());
      return;
    }

    switch (data.type) {
      case "join": {
        const user = data.user;
        if (!user || !user.id) return;
        clients.set(user.id, { user, socket });
        sendPresence();
        break;
      }
      case "position": {
        const user = data.user;
        if (!user || !user.id) return;
        const existing = clients.get(user.id);
        clients.set(user.id, { user, socket: existing?.socket ?? socket });
        sendPresence();
        break;
      }
      case "chat": {
        const msg = data.payload;
        if (!msg || !msg.id) return;
        broadcast({ type: "chat", payload: msg }, socket);
        break;
      }
      case "action": {
        const action = data.payload;
        if (!action || !action.type) return;
        broadcast({ type: "action", payload: action }, socket);
        break;
      }
      case "leave": {
        const userId = data.userId;
        if (userId) {
          clients.delete(userId);
          sendPresence();
        }
        break;
      }
      default:
        break;
    }
  });

  socket.on("close", () => {
    for (const [id, entry] of clients.entries()) {
      if (entry.socket === socket) {
        clients.delete(id);
      }
    }
    sendPresence();
  });
});

server.listen(PORT, () => {
  console.log(`Close Orbit Chat backend running at http://localhost:${PORT}`);
});
