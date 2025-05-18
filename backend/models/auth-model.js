const mongoose = require('mongoose');

// Single message in a chat thread
const singleMessageSchema = new mongoose.Schema({
  from: [{ type: String, required: true }], // Array of sender emails
  to: [{ type: String, required: true }],   // Array of receiver emails
  message: { type: String },
  fileUrl: { type: String },
  fileType: { type: String },
  date: { type: Date, default: Date.now }
});


// Chat thread with another user
const chatThreadSchema = new mongoose.Schema({
  with: { type: String, required: true },      // The other user's email
  messages: { type: [singleMessageSchema], default: [] }
});

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: function() { return this.isModified('password'); } 
  },
  phone: { type: String },                     // Allows leading zeros
  profilePhoto: { type: String },
  skills: [{ type: String }],
  gender: { type: String },
  courses: [{ 
    courseName: { type: String, required: true },
    coursePrice: { type: Number, required: true }
  }],
  // chats: { type: [chatThreadSchema], default: [] }, // 🟢 Replaces `messages`
  lastLogin: { type: Date, default: Date.now }
});

const UserModel = mongoose.model('Students', userSchema);

module.exports = UserModel;
