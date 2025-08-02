require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const multer = require("multer");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth-routes.js");
const profileRoutes = require("./routes/profile-routes.js");
const connectDB = require("./utils/db.js");
const RoomModel = require("./models/Room.js");

// ----- Express & Server Setup -----
const app = express();
const server = http.createServer(app);

// ---- CORS ORIGINS ----
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? "https://brain-boost-1.onrender.com"
    : "http://localhost:5173";

// --- Middleware: CORS should come before routes ---
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// app.options("*", cors());

// --- Middleware: Body Parsing ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- API Routes ---
app.use(authRoutes);
app.use(profileRoutes);

// --- Static uploads route (MUST exist physically) ---
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use(express.static(path.join(__dirname, 'dist')));
// --- Multer for file upload ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// --- File upload endpoint ---
app.post("/file_upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ fileUrl, fileType: req.file.mimetype });
});

// --- Chat message history endpoint ---
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

// --- Clear chat route ---
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

// --- SocketIO Setup (AFTER app and CORS) ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

// --- SocketIO Logic ---
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

// --- Serve FE build in production ---
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "..", "public", "index.html"))
  );
}

// --- Health check route ---
app.get("/", (req, res) => {
  res.send("✅ API is working!");
});

// --- DB and Server start ---
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
  });
