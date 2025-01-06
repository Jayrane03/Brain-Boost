require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const profileRoutes = require('../routes/profile-routes');
const authRoutes = require('../routes/auth-routes');
const connectDB = require('../utils/db');
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

// Store room details
// Store users in rooms
const rooms = {};

// Helper function to broadcast user list
const broadcastUsers = (roomId) => {
  if (rooms[roomId]) {
    io.to(roomId).emit('updateUsers', rooms[roomId]);
  }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // User joins a room
  socket.on('joinRoom', ({ roomId, username }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    // Add the user to the room
    rooms[roomId].push({ socketId: socket.id, username });

    // Join the socket.io room
    socket.join(roomId);

    // Broadcast updated user list
    broadcastUsers(roomId);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((user) => user.socketId !== socket.id);

      // Broadcast updated user list to the room
      broadcastUsers(roomId);

      // Cleanup empty rooms
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
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
app.use(profileRoutes);
app.use(authRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'public')));
}

// Connect to MongoDB and start the server
const port = process.env.PORT || 5001;

connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });
