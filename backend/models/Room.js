const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: String,
  message: String,
  fileUrl: String,
  fileType: String,
  timestamp: Date,
}, { timestamps: true });

const roomSchema = new mongoose.Schema({
  roomId: String,
  users: [String],  // user emails
  messages: [messageSchema],
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);
