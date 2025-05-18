module.exports = (io) => {
  const express = require("express");
  const router = express.Router();
  const authController = require("../controller/auth-cont");
  const authenticateToken = require("../middleware/auth");
  const Room = require("../models/Room.js");

  router.post("/api/register", authController.registerUser);
  router.post("/", authController.loginUser);
  router.get("/api/home", authenticateToken, authController.getHome);

  // Get all messages for a room
  router.get("/:roomId", async (req, res) => {
    try {
      const room = await Room.findOne({ roomId: req.params.roomId });
      if (!room) return res.json([]);
      res.json(room.messages);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Post a message and emit it
  router.post("/:roomId", async (req, res) => {
    const { username, text, fileUrl, fileType } = req.body;

    try {
      const message = {
        username,
        text,
        fileUrl,
        fileType,
        date: new Date(),
      };

      const room = await Room.findOneAndUpdate(
        { roomId: req.params.roomId },
        { $push: { messages: message } },
        { new: true, upsert: true }
      );

      const newMessage = room.messages.at(-1);

      // ✅ Emit message via socket.io (so all clients receive it in real-time)
      io.to(req.params.roomId).emit("new_message", newMessage);

      res.status(201).json(newMessage); // Sender gets it as response
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
