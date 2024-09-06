require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const profileRoutes = require('../routes/profile-routes');
const authRoutes = require('../routes/auth-routes');
const connectDB = require('../utils/db');

// Load environment variables from .env file

const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configure CORS
// const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
//   ? process.env.CORS_ALLOWED_ORIGINS.split(',')
//   : [];

app.use(cors({
  // origin: allowedOrigins,
  // origin: 'http://localhost:5173,
  origin: 'https://brain-boost-1.onrender.com',
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Route handling
app.use(profileRoutes);
app.use(authRoutes);

// Connect to MongoDB and start the server
const port = process.env.PORT || 5001;
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);


connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});
