const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ status: 'Error', message: 'Access Denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, 'secret23');
    req.user = verified;
    next();
  } catch (error) {
    console.error('Invalid Token:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'Error', message: 'Token expired. Please log in again.' });
    }
    res.status(401).json({ status: 'Error', message: 'Invalid Token' });
  }
};

module.exports = authenticateToken;
