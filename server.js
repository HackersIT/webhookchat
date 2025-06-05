const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for Socket.IO
    methods: ["GET", "POST"]
  }
});

const messages = []; // In-memory message store

app.use(cors()); // Enable CORS for all HTTP routes
app.use(bodyParser.json());
app.use(express.static("public"));

// Webhook endpoint
app.post("/webhook", (req, res) => {
  const { message, sender } = req.body;
  const msg = {
    sender: sender || "Anonymous",
    message,
    timestamp: new Date().toISOString()
  };
  messages.push(msg);
  io.emit("new-message", msg);
  res.json({ status: "received" });
});

// Send existing messages to new clients
io.on("connection", (socket) => {
  socket.emit("init", messages);
});

// Clear all messages
app.get("/clear", (req, res) => {
  messages.length = 0; // Clear the array
  io.emit("clear-messages"); // Optionally notify clients
  res.json({ status: "cleared" });
});
const PORT = 3000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
