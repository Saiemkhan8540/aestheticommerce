const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next();
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.log("Verify failed");
    return next();
  }

  if (!decoded?._id) {
    console.log("No id available");
    return next();
  }
  try {
    const user = await User.findById(decoded._id).select("_id").lean();
    if (user) {
      req.user = user;
    }
  } catch {
    console.log("DB error");
  }

  next();
};
