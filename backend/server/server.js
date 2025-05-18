require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { Server } = require("socket.io");

const connectDB = require("../utils/db");
const UserModel = require("../models/auth-model");
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

// Track users per room (optional)
const rooms = {};

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

 socket.on("joinRoom", async ({ roomId, username, email }) => {
  let room = await RoomModel.findOne({ roomId });

  if (room) {
    if (email && !room.users.includes(email)) {
      room.users.push(email);
    }
    await room.save();
  } else {
    await RoomModel.create({
      roomId,
      users: email ? [email] : [],
      messages: [],
    });
  }

  socket.join(roomId);

  // 👇 Emit proper user structure
  const clientsInRoom = await io.in(roomId).fetchSockets();
  const users = clientsInRoom.map((s) => ({
    username: s.handshake.query.username || "Guest",
    socketId: s.id,
  }));

  io.to(roomId).emit("updateUsers", users);
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
        { new: true }
      );

      io.to(roomId).emit("receiveMessage", newMsg);
    } catch (err) {
      console.error("❌ Error handling message:", err.message);
    }
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((u) => u.socketId !== socket.id);
      io.to(roomId).emit("updateUsers", rooms[roomId]);
    }
  });
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS setup
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://brain-boost-1.onrender.com"]
    : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.post("/file_upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ fileUrl, fileType: req.file.mimetype });
});

// Chat REST API
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

app.post("/chat/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { username, text, fileUrl, fileType } = req.body;

    if (!username || (!text && !fileUrl)) {
      return res.status(400).json({ error: "Invalid message data" });
    }

    const message = {
      sender: username,
      message: text,
      fileUrl: fileUrl || null,
      fileType: fileType || null,
      timestamp: new Date(),
    };

    const room = await RoomModel.findOneAndUpdate(
      { roomId },
      { $push: { messages: message } },
      { new: true, upsert: true }
    );

    const newMsg = {
      username,
      text,
      fileUrl,
      fileType,
      date: message.timestamp,
    };

    io.to(roomId).emit("receiveMessage", newMsg); // Real-time emit

    res.status(200).json(newMsg);
  } catch (err) {
    console.error("Error saving message:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Routes
app.use(require("../routes/profile-routes"));
app.use(require("../routes/auth-routes"));

// Serve static frontend (production)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "..", "public", "index.html"))
  );
}

// Connect DB & Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectDB();
});
