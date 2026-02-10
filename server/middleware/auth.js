const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Validate that the user still exists in the DB
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
        return res.status(401).json({ message: 'User no longer exists. Please login again.' });
    }

    req.user = user; // Now req.user is the full user object, not just decoded payload
    next();
  } catch (err) {
    console.error('Auth Error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
