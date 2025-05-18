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

// === Setup allowed origins for CORS ===
const allowedOrigins = [
  "https://brain-boost-1.onrender.com",
  "http://localhost:5173"
];

// === CORS Middleware ===
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.options("*", cors());

// === Force correct MIME for CSS ===
app.get("*.css", (req, res, next) => {
  res.type("text/css");
  next();
});

// === Socket.IO Configuration ===
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }
});

// === Socket.IO Events ===
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
        { new: true, upsert: true }
      );

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

// === Body Parsing Middleware ===
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// === Serve Static Files ===
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// === Multer File Upload Setup ===
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

// === Chat REST API ===
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

// === Add Auth and Profile Routes ===
app.use(require("../routes/profile-routes"));
app.use(require("../routes/auth-routes"));

// === Serve React Frontend in Production ===
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "..", "public", "index.html"))
  );
}

// === Start Server & Connect to DB ===
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectDB(); // This should be defined in ../utils/db.js
});
