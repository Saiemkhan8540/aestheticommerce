const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    console.log ("req",req.headers.authorization);
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded._id).select('-password');
      console.log('Decoded token:', decoded);
      console.log("Decoded id:", decoded.id); //added new by akshita
      console.log('User fetched:', req.user);

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();

    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
