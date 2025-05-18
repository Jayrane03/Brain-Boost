const express = require("express");
const router = express.Router();
const authController = require("../controller/auth-cont");
const authenticateToken = require("../middleware/auth")

// Define routes
router.post("/api/register", authController.registerUser);
router.post("/" , authController.loginUser);
router.get('/api/home', authenticateToken, authController.getHome);
// Backend GET /chat/:senderEmail/:recipientEmail
router.get("/chat/:senderEmail/:recipientEmail", async (req, res) => {
  const { senderEmail, recipientEmail } = req.params;

  const sender = await User.findOne({ email: senderEmail });
  const receiver = await User.findOne({ email: recipientEmail });

  const senderMessages =
    sender?.chats?.find((c) => c.with === recipientEmail)?.messages || [];
  const receiverMessages =
    receiver?.chats?.find((c) => c.with === senderEmail)?.messages || [];

  // Merge & sort
  const merged = [...senderMessages, ...receiverMessages].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  res.json(merged);
});

module.exports = router;
