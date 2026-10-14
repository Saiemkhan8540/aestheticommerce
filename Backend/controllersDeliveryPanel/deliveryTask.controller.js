const { default: mongoose } = require("mongoose");
const DeliveryPartnerModel = require("../models/deliveryPartner.model");
const DeliveryTaskModel = require("../models/deliveryTask.model");
const orderModel = require("../models/order.model");
const sellerModel = require("../models/seller.model");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  broadcastToNearbyRiders,
} = require("../services/deliveryBroadcast.service");

const MAX_ASSIGNMENT_ATTEMPTS = 3;


module.exports.createDeliveryTask = asyncHandler(async (req, res, next) => {
  const { orderId, pickupLocation, dropLocation } = req.body;
  const sellerId = req.user._id;
  const existOrder = await orderModel.findById(orderId);
  const seller = await sellerModel.findById(sellerId);
  if (!existOrder || !seller) {
    return next(new AppError("Order/seller not found", 404));
  }
  const dropAddress = existOrder.shippingAddress;
  const pickupAddress = seller.businessAddress;
  const pickupContact = {
    name: seller.storeName || seller.sellerName,
    phone: seller.phone,
  };
  const dropContact = {
    name: existOrder.shippingAddress.fullName,
    phone: existOrder.shippingAddress.phone,
  }
  const existDeliveryTask = await DeliveryTaskModel.findOne({ order: orderId , status: { $ne: "Cancelled" } });
  if (existDeliveryTask) {
    return next(
      new AppError("Delivery task already exists for this order", 400)
    );
  }

  const payload = {
    order: orderId,
    seller : sellerId,
    pickupLocation: {
      type: "Point",
      coordinates: pickupLocation.coordinates,
    },
    dropLocation: {
      type: "Point",
      coordinates: dropLocation.coordinates,
    },
    status: "Pending",
    dropContact ,
    pickupContact,
    dropAddress,
    pickupAddress
  };

  const deliveryTask = await DeliveryTaskModel.create(payload);

  // await assignNearestPartnerBySystem(deliveryTask);

  res.status(201).json({
    success: true,
    message: "Delivery task created successfully",
    data: deliveryTask,
  });
});

module.exports.acceptDeliveryTask = asyncHandler(async(req,res,next)=>{
  const { deliveryTaskId } = req.params;
  const deliveryPartnerId = req.user._id;

  if(!deliveryTaskId){
    return next(AppError("Delivery task not found",404))
  }
  
  const deliveryTask = await DeliveryTaskModel.findById(deliveryTaskId);
  if(!deliveryTask){
    return next(AppError("Invalid Delivery Task Id",400))
  } 
  
  if(!deliveryTask.deliveryPartner || deliveryTask.deliveryPartner.toString() !== deliveryPartnerId.toString()){
    return next(AppError("Not authorized to accept this task",403))
  }

  deliveryTask.status = "Accepted";

  const lastAttempts = deliveryTask.attempts[deliveryTask.attempts.length - 1];
  if(lastAttempts){
    lastAttempts.status = "Accepted" 
  }

  await deliveryTask.save();

  await DeliveryPartnerModel.findByIdAndUpdate(deliveryPartnerId,{
    isAvailable: false
  })

  res.status(200).json({
    message: "Delivery task Accepted",
    success: true
  })

});

module.exports.rejectDeliveryTask = asyncHandler(async(req,res,next)=>{
  const { deliveryTaskId } = req.params;
  const deliveryPartnerId = req.user._id;

  if(!deliveryTaskId){
    return next(AppError("Delivery task not found",404))
  }
  
  const deliveryTask = await DeliveryTaskModel.findById(deliveryTaskId);
  if(!deliveryTask){
    return next(AppError("Invalid Delivery Task Id",400))
  } 

  if(!deliveryTask.deliveryPartner || deliveryTask.deliveryPartner.toString() !== deliveryPartnerId.toString()){
    return next(AppError("Not authorized to accept this task",403))
  }


  const lastAttempts = deliveryTask.attempts[deliveryTask.attempts.length - 1];
  if(lastAttempts){
    lastAttempts.status = "Cancelled",
    lastAttempts.reason = "Rejected by delivery partner"
  }

  deliveryTask.deliveryPartner = null;
  deliveryTask.status = "Pending";
  await deliveryTask.save();

  if(lastAttempts?.assignedBy === "System"){
    const newPartner = await assignNearestPartnerBySystem(deliveryTask);
    if (!newPartner) {
      deliveryTask.status = "Failed";
      await deliveryTask.save();
      return res.status(200).json({
        success: false,
        message: "No delivery partner available. Task marked as Failed",
      });
    }
  
    res.status(200).json({
      message: "Delivery task rejected. Reassigning new partner",
      success: true
    })
  }

  res.status(200).json({
    message: "Delivery task rejected",
    success: true
  })

})


module.exports.sendDeliveryRequest = asyncHandler(async(req,res,next)=>{
  const { deliveryTaskId } = req.params;
  if(!deliveryTaskId){
    throw new AppError("Delivery task not found",404);
  }

  const deliveryTask = await DeliveryTaskModel.findById(deliveryTaskId)
  if(!deliveryTask){
    throw new AppError("Invalid Delivery Task Id",400);
  } 

  if(deliveryTask.status !== "Pending"){
    throw new AppError("Delivery task already assign",400);
  }
   
  await broadcastToNearbyRiders(deliveryTask);
  res.status(200).json({
    success: true,
    message: "Delivery request sent to riders",
  });

}) 