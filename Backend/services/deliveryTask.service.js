const DeliveryTask = require("../models/deliveryTask.model");
const Seller = require("../models/seller.model");
const { broadcastToNearbyRiders } = require("./deliveryBroadcast.service");

const PLACEHOLDER_COORDS = [77.209, 28.613];

async function createDeliveryTaskForSeller(order, sellerId) {
  const existing = await DeliveryTask.findOne({
    order: order._id,
    seller: sellerId,
    status: { $ne: "Cancelled" },
  });
  if (existing) return;

  const seller = await Seller.findById(sellerId)
    .select("businessAddress storeName sellerName phone")
    .lean();
  if (!seller) return;

  const pickupStreet = seller.businessAddress?.street
    ? [
        seller.businessAddress.street,
        seller.businessAddress.city,
        seller.businessAddress.state,
      ]
        .filter(Boolean)
        .join(", ")
    : (seller.businessAddress?.city || "") +
      (seller.businessAddress?.state ? `, ${seller.businessAddress.state}` : "");

  const pickupAddress = {
    fullName: seller.storeName || seller.sellerName || "Seller",
    street: pickupStreet || "Address TBD",
    city: seller.businessAddress?.city || "",
    state: seller.businessAddress?.state || "",
    pincode: seller.businessAddress?.postalCode || "",
  };
  const dropAddress = {
    fullName: order.shippingAddress?.fullName || "",
    street: order.shippingAddress?.street || "",
    city: order.shippingAddress?.city || "",
    state: order.shippingAddress?.state || "",
    pincode: order.shippingAddress?.pincode || "",
  };
  const pickupContact = {
    name: seller.storeName || seller.sellerName || "Seller",
    phone: seller.phone || "",
  };
  const dropContact = {
    name: order.shippingAddress?.fullName || "",
    phone: order.shippingAddress?.phone || "",
  };

  const sellerItems = (order.products || []).filter(
    (p) => p.sellerId.toString() === sellerId.toString(),
  );

  const taskItems = sellerItems.map((item) => ({
    itemId: item.itemId,
    product: item.product,
    name: item.productName,
    quantity: item.quantity,
    price: item.price,
    status: "Pending",
  }));

  const taskPayload = {
    order: order._id,
    seller: sellerId,
    items: taskItems,
    pickupLocation: { type: "Point", coordinates: PLACEHOLDER_COORDS },
    dropLocation: { type: "Point", coordinates: PLACEHOLDER_COORDS },
    pickupAddress,
    dropAddress,
    pickupContact,
    dropContact,
    status: "Pending",
  };

  const task = await DeliveryTask.create(taskPayload);

  try {
    await broadcastToNearbyRiders(task);
  } catch (err) {
    console.error(
      "Error broadcasting delivery task to nearby riders:",
      err.message || err,
    );
  }
}

async function createDeliveryTasksForOrder(order) {
  if (!order || !Array.isArray(order.products)) return;

  const sellerGroups = {};
  order.products.forEach((item) => {
    const SID = item.sellerId.toString();
    if (!sellerGroups[SID]) sellerGroups[SID] = true;
  });

  for (const sellerId of Object.keys(sellerGroups)) {
    try {
      await createDeliveryTaskForSeller(order, sellerId);
    } catch (err) {
      console.error(
        "Delivery task creation error for online order:",
        order._id,
        "seller:",
        sellerId,
        "error:",
        err.message || err,
      );
    }
  }
}

module.exports = {
  createDeliveryTasksForOrder,
  createDeliveryTaskForSeller,
};

