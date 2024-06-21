const mongoose = require('mongoose');

// Message Schema
const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
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
  phone: { type: Number },
  profilePhoto: { type: String },
  skills: [{ type: String }],
  gender: { type: String },
  courses: [{ 
    courseName: { type: String, required: true },
    coursePrice: { type: Number, required: true }
  }],
  messages: [messageSchema] // New field for messages
});

const UserModel = mongoose.model('Students', userSchema);

module.exports = UserModel;
