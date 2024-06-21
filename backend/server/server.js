const express = require('express');
const profileRoutes = require('../routes/profile-routes');
const bodyParser = require('body-parser');
const authRoutes =  require('../routes/auth-routes')
const path = require('path'); // Import the path module
const connectDB = require('../utils/db')
const app = express();
const cors = require('cors');
const PORT = 5001;
// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// app.use(cors({
//   origin: 'https://boostmybrain.netlify.app/',
//   methods: ['GET', 'POST', 'PUT'], 
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use(profileRoutes);
app.use(authRoutes);

// Connect to MongoDB

// Start the server

connectDB().then(() => {
  app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
  });
});

