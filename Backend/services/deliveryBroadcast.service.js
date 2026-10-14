const mongoose = require("mongoose");
const DeliveryPartnerModel = require("../models/deliveryPartner.model");
const DeliveryTaskModel = require("../models/deliveryTask.model");

const RADIUS_METERS = 5000;
const MAX_PARTNERS = 10;
const ASSIGNMENT_TIMEOUT_MS = 15000;

async function assignDefaultRider(taskId) {
  const task = await DeliveryTaskModel.findById(taskId);
  if (!task) {
    return;
  }

  if (task.status !== "Pending") {
    return;
  }

  const defaultPartner = await DeliveryPartnerModel.findOne({
    email: "delivery@test.com",
  });

  if (!defaultPartner) {
    return;
  }

  task.deliveryPartner = defaultPartner._id;
  task.status = "Assigned";

  task.attempts = task.attempts || [];
  task.attempts.push({
    deliveryPartner: defaultPartner._id,
    status: "Assigned",
    assignedBy: "System",
  });

  await task.save();
}

async function broadcastToNearbyRiders(deliveryTask) {
  if (!deliveryTask) return;

  const taskId = deliveryTask._id.toString();

  // If socket server is not initialized, fall back to default rider assignment
  if (!global.io || !global.riderToSocket) {
    console.warn(
      "Socket.io globals not available, assigning default rider for task:",
      taskId,
    );
    await assignDefaultRider(taskId);
    return;
  }

  const attempts = Array.isArray(deliveryTask.attempts)
    ? deliveryTask.attempts
    : [];
  const triedPartnerIds = attempts
    .map((t) => t.deliveryPartner)
    .filter(Boolean);

  const partners = await DeliveryPartnerModel.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: deliveryTask.pickupLocation.coordinates,
        },
        distanceField: "distance",
        maxDistance: RADIUS_METERS,
        spherical: true,
        query: {
          isActive: true,
          isAvailable: true,
          ...(triedPartnerIds.length
            ? {
                _id: {
                  $nin: triedPartnerIds.map(
                    (id) => new mongoose.Types.ObjectId(id),
                  ),
                },
              }
            : {}),
        },
      },
    },
    { $sort: { distance: 1 } },
    { $limit: MAX_PARTNERS },
  ]);

  if (!partners.length) {
    await assignDefaultRider(taskId);
    return;
  }

  partners.forEach((partner) => {
    const socketId = global.riderToSocket.get(partner._id.toString());
    if (socketId) {
      global.io.to(socketId).emit("newDeliveryRequest", {
        taskId,
        pickup: deliveryTask.pickupAddress,
        drop: deliveryTask.dropAddress,
      });
    }
  });

  setTimeout(async () => {
    await assignDefaultRider(taskId);
  }, ASSIGNMENT_TIMEOUT_MS);
}

module.exports = {
  broadcastToNearbyRiders,
  assignDefaultRider,
};

