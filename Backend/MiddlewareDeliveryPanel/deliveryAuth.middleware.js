const jwt = require("jsonwebtoken");
const DeliveryPartner = require("../models/deliveryPartner.model");
const AppError = require("../utils/AppError");

const protectDelivery = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Not authorized, token missing", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "delivery") {
      return next(new AppError("Invalid token role", 403));
    }

    const deliveryPartner = await DeliveryPartner
      .findById(decoded.id)
      .select("-password");

    if (!deliveryPartner) {
      return next(new AppError("Delivery partner not found", 401));
    }

    if (!deliveryPartner.isActive) {
      return next(new AppError("Delivery partner account is deactivated", 403));
    }

    req.user = deliveryPartner;
    next();

  } catch (err) {
    next(err);
  }
};

module.exports = { protectDelivery };
