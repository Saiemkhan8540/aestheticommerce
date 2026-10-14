const DeliveryTask = require("../models/deliveryTask.model");
const AppError = require("../utils/AppError");
const Order = require("../models/order.model");
const mongoose = require("mongoose");

module.exports.markAsPickedUp = async (req, res, next) => {
    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const { taskId } = req.body;

        const task = await DeliveryTask.findOne({
            _id: taskId,
            seller: req.user._id,
        }).session(session);

        if (!task) {
            throw new AppError("Task not found", 404);
        }
        if (task.status !== "Assigned") {
            throw new AppError("Task must be assigned to mark Pickedup", 400);
        }

        task.status = "PickedUp";
        await task.save({ session });

        await Order.findByIdAndUpdate(
            task.order,
            { deliveryStatus: "Out for Delivery" },
            { session }
        );

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: "Marked as PickedUp",
        })
    } catch (err) {
        if (session) await session.abortTransaction();
        next(err);
    } finally {
        if (session) session.endSession();
    }
};

module.exports.getActiveDeliveries = async (req, res, next) => {
  try {
    const deliveries = await DeliveryTask.find({
      seller: req.user._id,
      status: { 
        $in: ["Pending", "Assigned", "PickedUp", "OutForDelivery","Delivered"] 
      },
    })
      .populate("deliveryPartner", "name phone")
      .populate("order", "orderId shippingAddress deliveryStatus")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries,
    });

  } catch (err) {
    next(err);
  }
};