const { z } = require("zod");

module.exports = z.object({
  orderId: z.string({ required_error: "Order ID is required" }),

  pickupLocation: z.object({
    coordinates: z
      .array(z.number(), { required_error: "Pickup coordinates are required" })
      .length(2, "Pickup coordinates must be [longitude, latitude]"),
  }),

  dropLocation: z.object({
    coordinates: z
      .array(z.number(), { required_error: "Drop coordinates are required" })
      .length(2, "Drop coordinates must be [longitude, latitude]"),
  }),  
});
