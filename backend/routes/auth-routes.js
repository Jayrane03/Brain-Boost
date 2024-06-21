const express = require("express");
const router = express.Router();
const authController = require("../controller/auth-cont");
const authenticateToken = require("../middleware/auth")

// Define routes
router.post("/api/register", authController.registerUser);
router.post("/" , authController.loginUser);
router.get('/api/home', authenticateToken, authController.getHome);

module.exports = router;
