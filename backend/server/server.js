require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://brain-boost-1.onrender.com']
      : ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

const rooms = {}; // Tracks users in each room
const roomMessages = {}; // Tracks message history for each room

// Helper function to broadcast user list
const broadcastUsers = (roomId) => {
  if (rooms[roomId]) {
    io.to(roomId).emit('updateUsers', rooms[roomId]);
  }
};

// // Helper function to broadcast messages
// const broadcastMessages = (socket, roomId, message) => {
//   if (rooms[roomId]) {
//     socket.to(roomId).emit('receiveMessage', message); // Broadcast the message to the room excluding the sender
//     console.log(`Message sent to room ${roomId}:`, message);
//   }
// };

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle a user joining a room
  socket.on('joinRoom', ({ roomId, username }) => {
    if (!roomId || !username) return;

    // Initialize room and message storage if not already present
    if (!rooms[roomId]) rooms[roomId] = [];
    if (!roomMessages[roomId]) roomMessages[roomId] = [];

    // Add the user to the room
    rooms[roomId].push({ socketId: socket.id, username });
    socket.join(roomId);

    console.log(`User ${username} joined room ${roomId}`);

    // Send chat history to the newly joined user
    socket.emit('previousMessages', roomMessages[roomId]);

    // Broadcast the updated user list to the room
    broadcastUsers(roomId);
  });

  // Handle sending a message
  socket.on('sendMessage', ({ roomId, message }) => {
    if (!roomId || !message) return;
  
    // Ensure the room has a message history
    if (!roomMessages[roomId]) roomMessages[roomId] = [];
  
    // Add the message to the room's message history
    roomMessages[roomId].push(message);
    console.log("Room Messages", roomMessages);
  
    // Broadcast the message to all users except the sender
    socket.to(roomId).emit('receiveMessage', message); // Send message to everyone except sender
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      // Remove the disconnected user from the room
      rooms[roomId] = rooms[roomId].filter((user) => user.socketId !== socket.id);

      // Delete the room if it's empty
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
        delete roomMessages[roomId]; // Optionally delete message history for empty rooms
      } else {
        broadcastUsers(roomId); // Broadcast updated user list
      }
    }
    console.log('A user disconnected:', socket.id);
  });
});

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configure CORS
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://brain-boost-1.onrender.com']
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Route handling
app.use(require('../routes/profile-routes'));
app.use(require('../routes/auth-routes'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'public')));
}

// Connect to MongoDB and start the server
const port = process.env.PORT || 5001;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
