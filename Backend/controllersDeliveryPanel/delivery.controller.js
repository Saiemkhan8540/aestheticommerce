const DeliveryPartner = require("../models/deliveryPartner.model");
const DeliveryTask = require("../models/deliveryTask.model");
const Order = require("../models/order.model");
const Seller = require("../models/seller.model");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const { getEstimatedDelivery } = require("../utils/deliveryEta");
const mongoose = require("mongoose");
// Generate JWT
const generateToken = (partner) => {
    return jwt.sign(
        { 
        id : partner.id , role: "delivery"}, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// Delivery partner login
const loginDelivery = async (req, res,next) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        const partner = await DeliveryPartner.findOne({ email }).select("+password");
        if(!partner){
            return next(new AppError("Invalid email or password",401));
        }
        if(!partner.isActive){
            return next(new AppError("Delivery partner account is deactivated/not approved by admin",403));
        }
        console.log('User found:', !!partner);
        const isMatch = await partner.matchPassword(password);
        if(!isMatch){
            return next(new AppError("Invalid email or password",401));
        }
        
        const activeTask = await DeliveryTask.findOne({
          deliveryPartner: partner._id,
          status: { $in: ["Assigned", "Accepted", "PickedUp", "OutForDelivery"] }
        });

        partner.isAvailable = true;
        await partner.save();
        
        const token = generateToken(partner);

        res.status(200).json({
            success: true,
            token,
            partner: {
                id: partner._id,
                name: partner.name,
                email: partner.email,
                phone: partner.phone,
                isAvailable: partner.isAvailable,
            },
        });

    } catch (err) {
        next(err);
    }
};

const registerPartner = async(req,res,next) =>{
    try{
        console.log("request came");
        const existing = await DeliveryPartner.findOne(
            {
                $or : [
                    {email : req.body.email},
                    {phone : req.body.phone}
                ]
            });
        if(existing){
            if(existing.email === req.body.email) return next(new AppError("Rider already exists with this email",409));
            if(existing.phone === req.body.phone) return next(new AppError("Rider already exists with this phone",409));
        }

        const rider = await DeliveryPartner.create({
            ...req.body,
            isActive: false,
            isAvailable: false,
        })
        console.log("everything fine");
        res.status(201).json({
            success: true,
            message: "Rider registered successfully. Please upload documents for approval.",
            riderId: rider._id,
        });
    }catch(err){
        console.log("not fine");
        next(err);
    }
}

const getProfile = async (req, res, next) => {
  try {
    const rider = await DeliveryPartner.findById(req.user._id)
      .select("-password -documents.aadhar.number -documents.drivingLicense.number -documents.vehiclePapers.number -bankDetails.accountNumber -bankDetails.ifscCode");

    if (!rider) {
      return next(new AppError("Rider not found", 404));
    }

    res.status(200).json({
      success: true,
      data: rider,
    });

  } catch (err) {
    next(err);
  }
};

const getMyActiveTask = async (req, res, next) => {
  try {
    // const task = await DeliveryTask.findOne({
    const task = await DeliveryTask.find({
      deliveryPartner: req.user._id,
      status: { $in: ["Assigned", "Accepted", "PickedUp", "OutForDelivery"] }
    }).populate("order");
    
    console.log("getMyActiveTask_deliveryPartner:- ",req.user._id)
    console.log("getMyActiveTask:- ",task)

    res.status(200).json({
      success: true,
      data: task
    });

  } catch (err) {
    next(err);
  }
};

const PLACEHOLDER_COORDS = [77.209, 28.613];
const updateLocation = async(req ,res,next) =>{
    try{
        let {lng , lat} = req.body;
        const rider = req.user ;
        if (!lng || !lat) {
          [lng, lat] = PLACEHOLDER_COORDS;
        }
        rider.currentLocation = {
            type : "Point",
            coordinates:[lng , lat],
            updatedAt : new Date()
        }

        const activeTask = await DeliveryTask.findOne({
        deliveryPartner: rider._id,
        status: { $in: ["Assigned", "Accepted", "PickedUp", "OutForDelivery"] }
        });

       rider.isAvailable = !activeTask;

        await rider.save();

        res.status(200).json({
            success : true , 
            message : "Location updated Successfully"
        });
    }catch(err){
        next(err);
    }
}

const updateAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;

    const rider = await DeliveryPartner.findById(req.user._id);

    if (!rider) {
      return next(new AppError("Rider not found", 404));
    }

    rider.isAvailable = isAvailable;

    await rider.save();

    res.status(200).json({
      success: true,
      message: `Rider is now ${isAvailable ? "Online" : "Offline"}`
    });

  } catch (err) {
    next(err);
  }
};

const getNearByDeliveries = async(req,res,next) =>{
    try{
        const rider = req.user;
        if (!rider.currentLocation?.coordinates) {
            return next(new AppError("Update Location First", 400));
        }

        const deliveries = await DeliveryTask.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: rider.currentLocation.coordinates,
                    },
                    distanceField: "distance",
                    key:"pickupLocation",
                    maxDistance: 5000, // 5km radius
                    spherical: true,
                    query: { status: "Pending" },
                },
            },
            { $limit: 20 },
        ]);

        console.log("NearDelivery:- ",deliveries);
        console.log("NearDeliveryItems:- ",deliveries.items);

        res.status(200).json({
            success: true,
            count: deliveries.length,
            data: deliveries,
        });
    }catch(err){
        next(err);
    }
}

const acceptTask = async(req,res,next) =>{
    let session ;
    try{
        session = await mongoose.startSession();
        session.startTransaction();

        const { taskId } = req.body ;
        const rider = req.user ;
        
        const lockedRider = await DeliveryPartner.findOneAndUpdate(
            { _id: rider._id, isAvailable: true },
            { isAvailable: false },
            { new: true, session }
        );

        if (!lockedRider) {
            throw new AppError("You already have an active delivery", 400);
        }

        const task = await DeliveryTask.findOneAndUpdate(
            {
                _id: taskId,
                status: "Pending",
            },
            {
                status: "Accepted",     //Assigned
                deliveryPartner: req.user._id,
                $push: {
                    attempts: {
                        deliveryPartner: req.user._id,
                        status: "Accepted",     //Assigned
                    },
                },
            },
            { new: true , session}
        );
        
        if (!task) {
            throw new AppError("Task already assigned or not available", 400);
        } 

        await session.commitTransaction();
        res.status(200).json({
            success: true,
            message: "Task accepted successfully",
            data: task,
        });
    }catch(err){
        if(session) await session.abortTransaction();
        next(err);
    }finally{
        if(session) await session.endSession();
    }
}

// Sync order: set items for this task's seller to itemStatus, then recompute order.deliveryStatus from all items
async function syncOrderStatusFromTask(orderId, sellerId, itemStatus, session) {
  const order = await Order.findById(orderId).session(session);
  if (!order || !order.products) return;

  const sellerIdStr = sellerId.toString();
  for (const p of order.products) {
    if ((p.sellerId && p.sellerId.toString()) === sellerIdStr) {
      p.status = itemStatus;
      if (p.trackingInfo) p.trackingInfo.updatedAt = new Date();
      else p.trackingInfo = { updatedAt: new Date() };
    }
  }

  // Recompute order-level deliveryStatus from all item statuses
  const statuses = order.products.map((p) => p.status);
  if (statuses.every((s) => s === "Delivered")) {
    order.deliveryStatus = "Delivered";
  } else if (statuses.some((s) => s === "Out for Delivery")) {
    order.deliveryStatus = "Out for Delivery";
  } else if (statuses.some((s) => s === "Shipped")) {
    order.deliveryStatus = "Shipped";
  } else if (statuses.some((s) => s === "Dispatched")) {
    order.deliveryStatus = "Dispatched";
  } else if (statuses.every((s) => s === "Cancelled")) {
    order.deliveryStatus = "Cancelled";
  } else {
    order.deliveryStatus = statuses.some((s) => s === "Pending") ? "Pending" : "Dispatched";
  }
  await order.save({ session });
}

const updateTaskStatus = async (req, res, next) => {
    let session ; 
    try {
        session = await mongoose.startSession();
        session.startTransaction();
    const { taskId, status } = req.body;

    const task = await DeliveryTask.findOne({
      _id: taskId,
      deliveryPartner: req.user._id,
    }).session(session);

    if (!task) {
      throw new AppError("Task not found", 404);
    }
    
    const allowedTransitions = {
      Assigned: ["PickedUp"],
      Accepted: ["PickedUp"],
      PickedUp: ["OutForDelivery"],
      OutForDelivery: ["Delivered"],
    };

    if (allowedTransitions[task.status] && !allowedTransitions[task.status].includes(status)
    ) {
      throw new AppError("Invalid status transition", 400);
    }

    task.status = status;
    
    if (status === "PickedUp") {
      await syncOrderStatusFromTask(task.order, task.seller, "Out for Delivery", session);
    }

    if (status === "Delivered") {
      await syncOrderStatusFromTask(task.order, task.seller, "Delivered", session);

      await DeliveryPartner.findByIdAndUpdate(
        req.user._id,
        {
          isAvailable: true,
          $inc: { "stats.totalDeliveries": 1 },
        },
        { session }
      );
    }

    await task.save({session});
    await session.commitTransaction();
    res.status(200).json({
      success: true,
      message: "Status updated",
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
     session.endSession();
  }
};

const cancelTask = async (req, res, next) => {
  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const { taskId, reason } = req.body;

    const task = await DeliveryTask.findOne({
      _id: taskId,
      deliveryPartner: req.user._id,
    }).session(session);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    if (!["Assigned", "PickedUp"].includes(task.status)) {
      throw new AppError("Task cannot be cancelled at this stage", 400);
    }

    const wasPickedUp = task.status === "PickedUp";
    task.status = "Cancelled";
    task.cancelledBy = "delivery_partner";
    task.cancelReason = reason;

    await task.save({ session });

    await DeliveryPartner.findByIdAndUpdate(
      req.user._id,
      {
        isAvailable: true,
        $inc: { "stats.cancelledDeliveries": 1 },
      },
      { session }
    );

    if (wasPickedUp) {
      await syncOrderStatusFromTask(task.order, task.seller, "Shipped", session);
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Task cancelled successfully",
    });

  } catch (err) {
    if (session) await session.abortTransaction();
    next(err);
  } finally {
    if (session) session.endSession();
  }
};

const rejectTask = async (req, res, next) => {
  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const { taskId, reason } = req.body;
    const riderId = req.user._id;

    const task = await DeliveryTask.findOne({
      _id: taskId,
      status: "Pending",
    }).session(session);

    if (!task) {
      throw new AppError("Task not available for rejection", 400);
    }

    // Log attempt
    task.attempts.push({
      deliveryPartner: riderId,
      status: "Cancelled",
      reason: reason || "Rejected by rider",
    });

    await task.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Task rejected successfully",
    });

  } catch (err) {
    if (session) await session.abortTransaction();
    next(err);
  } finally {
    if (session) session.endSession();
  }
};

// Map DeliveryTask status to dashboard display status
function taskStatusToDisplayStatus(status) {
  if (!status) return "Dispatched";
  if (["Pending", "Assigned", "Accepted"].includes(status)) return "Dispatched";
  if (status === "PickedUp") return "Shipped";
  if (status === "OutForDelivery") return "Out for Delivery";
  if (status === "Delivered") return "Delivered";
  if (["Cancelled", "Failed"].includes(status)) return "Cancelled";
  return status;
}

// Build dashboard list/detail shape from a populated DeliveryTask
// function taskToDashboardShape(task) {
//   const order = task.order;
//   const seller = task.seller;
//   const sellerIdStr = (task.seller?._id || task.seller)?.toString();
//   const productsForSeller = order?.products?.filter(
//     (p) => (p.sellerId?._id || p.sellerId)?.toString() === sellerIdStr
//   ) || [];
//   const firstProduct = productsForSeller[0]?.product || order?.products?.[0]?.product;
//   const quantity = productsForSeller.reduce((sum, p) => sum + (p.quantity || 0), 0) || order?.products?.[0]?.quantity || 1;
//   const price = order?.products?.[0]?.price || 0;

//   return {
//     taskId: task._id,
//     orderId: order?.orderId || "",
//     itemId: task._id.toString(),
//     productTitle: firstProduct?.name || `Order ${order?.orderId || ""}`,
//     productImage: firstProduct?.images?.[0] || "",
//     address: task.dropAddress || order?.shippingAddress || {},
//     status: taskStatusToDisplayStatus(task.status),
//     taskStatus: task.status,
//     customerName: task.dropContact?.name || order?.shippingAddress?.fullName || "Unknown Customer",
//     customerPhone: task.dropContact?.phone || order?.shippingAddress?.phone || "N/A",
//     customerEmail: order?.user?.email || "N/A",
//     sellerName: seller?.sellerName || seller?.storeName || task.pickupContact?.name || "N/A",
//     sellerEmail: seller?.email || "N/A",
//     sellerPhone: seller?.phone || task.pickupContact?.phone || "N/A",
//     orderDate: order?.createdAt,
//     estimatedDelivery: order?.createdAt
//       ? new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000)
//       : null,
//     quantity,
//     price,
//     cancelReason: task.cancelReason,
//     cancelledBy: task.cancelledBy,
//   };
// }


// Build dashboard list/detail shape from a populated DeliveryTask
function taskToDashboardShape(task) {
  const order = task.order;
  const seller = task.seller;
  const sellerIdStr = (task.seller?._id || task.seller)?.toString();
  
  const productsForSeller = order?.products?.filter(
    (p) => (p.sellerId?._id || p.sellerId)?.toString() === sellerIdStr
  ) || [];

  // NEW: Create an array of all items for this specific delivery task
  const allItems = productsForSeller.map(p => ({
    name: p.product?.name || "Unknown Product",
    image: p.product?.images?.[0] || "",
    quantity: p.quantity || 1,
    price: p.price || 0
  }));

  const quantity = productsForSeller.reduce((sum, p) => sum + (p.quantity || 0), 0) || order?.products?.[0]?.quantity || 1;
  const price = order?.products?.[0]?.price || 0;

  return {
    taskId: task._id,
    orderId: order?.orderId || "",
    itemId: task._id.toString(),
    items: allItems, // <-- Send the array of items to the frontend!
    productTitle: allItems[0]?.name || `Order ${order?.orderId || ""}`, // Keep for fallback
    productImage: allItems[0]?.image || "", // Keep for fallback
    address: task.dropAddress || order?.shippingAddress || {},
    status: taskStatusToDisplayStatus(task.status),
    taskStatus: task.status,
    customerName: task.dropContact?.name || order?.shippingAddress?.fullName || "Unknown Customer",
    customerPhone: task.dropContact?.phone || order?.shippingAddress?.phone || "N/A",
    customerEmail: order?.user?.email || "N/A",
    sellerName: seller?.sellerName || seller?.storeName || task.pickupContact?.name || "N/A",
    sellerEmail: seller?.email || "N/A",
    sellerPhone: seller?.phone || task.pickupContact?.phone || "N/A",
    orderDate: order?.createdAt,
    estimatedDelivery: order?.createdAt
      ? getEstimatedDelivery(order.createdAt)
      : null,
    quantity,
    totalPrice: price, 
    cancelReason: task.cancelReason,
    cancelledBy: task.cancelledBy,
  };
}

// GET my tasks (list for delivery dashboard)
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await DeliveryTask.find({ deliveryPartner: req.user._id })
      .populate({
        path: "order",
        populate: [
          { path: "products.product", select: "name images" },
          { path: "user", select: "email" },
        ],
      })
      .populate("seller", "sellerName storeName email phone")
      .sort({ createdAt: -1 })
      .lean();

    const list = tasks.map((t) => taskToDashboardShape(t));
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};

// GET single task by id (detail for delivery dashboard)
const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await DeliveryTask.findOne({
      _id: taskId,
      deliveryPartner: req.user._id,
    })
      .populate({
        path: "order",
        populate: [
          { path: "products.product", select: "name images" },
          { path: "user", select: "email" },
        ],
      })
      .populate("seller", "sellerName storeName email phone")
      .lean();

    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    res.status(200).json(taskToDashboardShape(task));
  } catch (err) {
    next(err);
  }
};

// Get all orders for delivery dashboard
// const getDeliveryOrders = async (req, res ,next) => {
//     try {
//         // Fetch all orders with populated product details, user info, and seller info
//         const orders = await Order.find({})
//             .populate('products.product', 'name images')
//             .populate('products.sellerId', 'email phone sellerName') // Populate seller details
//             .populate('user', 'email') // Populate user email
//             .sort({ createdAt: -1 });

//         // Flatten orders to item level for delivery dashboard
//         const flattenedOrders = [];

//         orders.forEach(order => {
//             if (order.products && Array.isArray(order.products)) {
//                 order.products.forEach(item => {
//                     // Filter: Show Dispatched, Shipped, Out for Delivery, Delivered, and Cancelled orders
//                     const validStatuses = ['Dispatched', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
//                     if (validStatuses.includes(item.status)) {
//                         // Create a flattened object for each item
//                         flattenedOrders.push({
//                             orderId: order.orderId,
//                             itemId: item.itemId || `${order.orderId}-${item._id}`, // Fallback if itemId missing
//                             productTitle: item.product?.name || 'Unknown Product',
//                             productImage: item.product?.images?.[0] || '', // Use first image
//                             address: order.shippingAddress, // Pass the full address object
//                             status: item.status, // Item level status
//                             customerName: order.shippingAddress?.fullName || 'Unknown Customer',
//                             customerEmail: order.user?.email || 'N/A', // Get email from populated user
//                             customerPhone: order.shippingAddress?.phone || 'N/A', // Get phone from shipping address
//                             sellerName: item.sellerId?.sellerName || item.sellerName || 'N/A', // Seller name from populated sellerId or item
//                             sellerEmail: item.sellerId?.email || 'N/A', // Seller email from populated sellerId
//                             sellerPhone: item.sellerId?.phone || 'N/A', // Seller phone from populated sellerId
//                             orderDate: order.createdAt,
//                             estimatedDelivery: new Date(new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 7)), // Mock est delivery
//                             quantity: item.quantity,
//                             price: item.price
//                         });
//                     }
//                 });
//             }
//         });

//         res.status(200).json(flattenedOrders);
//     } catch (error) {
//         console.error('Get delivery orders error:', error);
//         res.status(500).json({ message: "Error fetching orders", error });
//     }
// };

// Update order status
// const updateOrderStatus = async (req, res,next) => {
//     const { orderId, itemId, status, cancelReason } = req.body;

//     try {
//         const order = await Order.findOne({ orderId });
//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         const itemIndex = order.products.findIndex(p =>
//             (p.itemId && p.itemId === itemId) ||
//             (!p.itemId && `${order.orderId}-${p._id}` === itemId)
//         );

//         if (itemIndex === -1) {
//             return res.status(404).json({ message: "Item not found in order" });
//         }

//         // Update item status
//         order.products[itemIndex].status = status;

//         // If status is Cancelled, add cancellation details
//         if (status === 'Cancelled') {
//             order.products[itemIndex].cancelReason = cancelReason || '';
//             order.products[itemIndex].cancelledBy = 'delivery_partner';
//         }

//         // Update tracking info
//         if (!order.products[itemIndex].trackingInfo) {
//             order.products[itemIndex].trackingInfo = {};
//         }
//         order.products[itemIndex].trackingInfo.updatedAt = new Date();

//         // Update overall order delivery status if all items are the same status
//         const allSameStatus = order.products.every(p => p.status === status);
//         if (allSameStatus) {
//             order.deliveryStatus = status;
//         } else {
//             // If mixed statuses, keep it as Dispatched or update to latest significant status
//             // For simplicity, we'll leave deliveryStatus as is or set to 'Processing' if not all completed
//             // But better to reflect the most advanced status or 'Partial'
//             if (status === 'Delivered' && order.deliveryStatus !== 'Delivered') {
//                 // Check if all are delivered
//                 const allDelivered = order.products.every(p => p.status === 'Delivered');
//                 if (allDelivered) order.deliveryStatus = 'Delivered';
//             }
//         }

//         await order.save();

//         res.status(200).json({ message: "Order status updated successfully" });
//     } catch (error) {
//         console.error('Update order status error:', error);
//         res.status(500).json({ message: "Error updating status", error });
//     }
// };

// Verify token
const verifyToken = (req, res,next) => {
    res.status(200).json({ message: "Token is valid" });
};

module.exports = {
    loginDelivery,
    getMyTasks,
    getTaskById,
    updateTaskStatus,
    acceptTask,
    updateLocation,
    getNearByDeliveries,
    verifyToken,
    registerPartner,
    getProfile,
    getMyActiveTask,
    cancelTask,
    rejectTask,
    updateAvailability
};
