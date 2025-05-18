const express = require("express");
const router = express.Router();
const authController = require("../controller/auth-cont");
const authenticateToken = require("../middleware/auth")
const Room = require("../models/Room.js");
// Define routes
router.post("/api/register", authController.registerUser);
router.post("/" , authController.loginUser);
router.get('/api/home', authenticateToken, authController.getHome);
// Backend GET /chat/:senderEmail/:recipientEmail
// GET all messages from a room
router.get("/:roomId", async (req, res) => {
  try {
    let room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.json([]);
    res.json(room.messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new message to the room
router.post("/:roomId", async (req, res) => {
  const { username, text, fileUrl, fileType } = req.body;
  try {
    let room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId },
      {
        $push: {
          messages: {
            username,
            text,
            fileUrl,
            fileType,
            date: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );
    res.status(201).json(room.messages.at(-1)); // Return the last message
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
