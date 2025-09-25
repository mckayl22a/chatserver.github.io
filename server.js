import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// In-memory storage (replace with a database for production)
let users = [];
let channels = [{ id: "general", name: "General" }];
let messages = { general: [] };

// REST endpoints
app.get("/channels", (req, res) => res.json(channels));
app.get("/messages/:channelId", (req, res) => {
  const { channelId } = req.params;
  res.json(messages[channelId] || []);
});
app.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });
  users.push(username);
  res.json({ success: true, username });
});

// WebSocket for real-time chat
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("joinChannel", (channelId) => {
    socket.join(channelId);
  });

  socket.on("sendMessage", ({ channelId, username, message }) => {
    const msg = { username, message, timestamp: new Date() };
    if (!messages[channelId]) messages[channelId] = [];
    messages[channelId].push(msg);
    io.to(channelId).emit("receiveMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
