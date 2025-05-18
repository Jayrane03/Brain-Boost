require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const multer = require("multer");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const connectDB = require("../utils/db");
const RoomModel = require("../models/Room.js");

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://brain-boost-1.onrender.com"]
        : ["http://localhost:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// --- Socket.IO Logic ---
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("joinRoom", async ({ roomId, username, email }) => {
    let room = await RoomModel.findOne({ roomId });

    if (room) {
      if (email && !room.users.includes(email)) {
        room.users.push(email);
        await room.save();
      }
    } else {
      await RoomModel.create({ roomId, users: email ? [email] : [], messages: [] });
    }

    socket.join(roomId);
    console.log(`${username} joined room ${roomId}`);
  });

  socket.on("sendMessage", async ({ roomId, message }) => {
    try {
      const { username, text, fileUrl, fileType, date } = message;
      const newMsg = {
        sender: username,
        message: text,
        fileUrl: fileUrl || null,
        fileType: fileType || null,
        timestamp: date || new Date(),
      };

      await RoomModel.findOneAndUpdate(
        { roomId },
        { $push: { messages: newMsg } },
        { new: true, upsert: true }
      );

      // ✅ Broadcast to all users in the room (including sender)
      io.to(roomId).emit("receiveMessage", {
        username,
        text,
        fileUrl,
        fileType,
        date: newMsg.timestamp,
      });
    } catch (err) {
      console.error("❌ Error handling message:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// --- Middleware ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://brain-boost-1.onrender.com"]
    : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.post("/file_upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ fileUrl, fileType: req.file.mimetype });
});

// Chat history fetch
app.get("/chat/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await RoomModel.findOne({ roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });

    const formatted = room.messages.map((msg) => ({
      username: msg.sender,
      text: msg.message,
      fileUrl: msg.fileUrl || null,
      fileType: msg.fileType || null,
      date: msg.timestamp,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching messages:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Chat clear route
app.delete("/chat/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await RoomModel.findOneAndUpdate(
      { roomId },
      { $set: { messages: [] } },
      { new: true }
    );

    if (!room) return res.status(404).json({ error: "Room not found" });

    io.to(roomId).emit("clearMessages");

    res.status(200).json({ message: "Chat cleared successfully" });
  } catch (err) {
    console.error("Error clearing chat:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Other routes
app.use(require("../routes/profile-routes"));
app.use(require("../routes/auth-routes"));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "..", "public", "index.html"))
  );
}

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectDB();
});
