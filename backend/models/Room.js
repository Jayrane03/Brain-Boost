// models/Room.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: String,
  message: String,
  fileUrl: String,
  fileType: String,
  timestamp: { type: Date, default: Date.now },
});

const roomSchema = new mongoose.Schema({
  roomId: String,
  users: [String],
  messages: [messageSchema],
});

module.exports = mongoose.model("Room", roomSchema);
