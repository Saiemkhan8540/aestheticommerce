// Middleware/sellerPanelauthMidWar.js
const jwt = require('jsonwebtoken');
const Seller = require('../models/seller.model');

const protectSeller = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - No token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get seller from token (excluding password)
      const seller = await Seller.findById(decoded.id).select('-password');

      if (!seller) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized - Seller not found'
        });
      }

      // Check if seller is blocked
      if (seller.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been blocked. Please contact support.'
        });
      }

      // Attach seller info to request
      req.user = seller;

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

module.exports =  { protectSeller }