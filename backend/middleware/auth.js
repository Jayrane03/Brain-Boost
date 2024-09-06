require('dotenv').config();
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Extract token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ status: 'Error', message: 'Access Denied. No token provided.' });
  }

  try {
    // Verify the token using the SECRET_KEY from environment variables
    const verified = jwt.verify(token, process.env.SECRET_KEY || 'secret23');
    req.user = verified;  // Attach verified user to the request
    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Token verification failed:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'Error', message: 'Token expired. Please log in again.' });
    }

    return res.status(401).json({ status: 'Error', message: 'Invalid Token' });
  }
};

module.exports = authenticateToken;
