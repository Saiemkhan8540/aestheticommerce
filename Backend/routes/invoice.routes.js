const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/order.model.js");
const { streamInvoicePDF } = require("../utils/invoiceGenerator.js");
const { streamShippingLabelPDF } = require("../utils/shippingLabelGenerator.js");

const router = express.Router();

const formatAddress = (addr) => {
  if (!addr) return "N/A";
  if (typeof addr === "string") return addr;
  const parts = [
    addr.fullName,
    addr.street,
    addr.locality,
    addr.city,
    addr.state,
    addr.pincode,
    addr.country,
    addr.phone ? `Phone: ${addr.phone}` : null,
  ].filter(Boolean);
  return parts.join(", ");
};

const findOrder = async (orderId) => {
  console.log("Finding order with ID:", orderId);
  return Order.findById(orderId)
    .populate({ path: "products.product", select: "name sku" })
    .populate({ path: "user", select: "name email phone" })
    .lean();
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get("/invoice/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log("Invoice endpoint hit for order:", orderId);

    if (!isValidObjectId(orderId)) {
      console.log("Invalid ObjectId:", orderId);
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await findOrder(orderId);
    if (!order) {
      console.log("Order not found for ID:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Order found:", order._id);

    const safeOrder = {
      ...order,
      shippingAddressText: formatAddress(order.shippingAddress),
      orderDateText: new Date(order.createdAt).toLocaleDateString(),
      items: (order.products || []).map((p) => ({
        name: p?.product?.name ?? "Product",
        sku: p?.product?.sku ?? "-",
        price: p?.price ?? 0,
        quantity: p?.quantity ?? 1,
      })),
      totalAmount:
        typeof order.totalAmount === "number"
          ? order.totalPrice
          : (order.products || []).reduce(
              (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
              0
            ),
    };

    console.log("Prepared safeOrder object:", safeOrder);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice_${orderId}.pdf"`
    );

    console.log("Calling streamInvoicePDF...");
    await streamInvoicePDF(safeOrder, res);
    console.log("Invoice PDF streamed successfully.");
  } catch (err) {
    console.error("Invoice error:", err);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
});

router.get("/label/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log("Label endpoint hit for order:", orderId);

    if (!isValidObjectId(orderId)) {
      console.log("Invalid ObjectId:", orderId);
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await findOrder(orderId);
    if (!order) {
      console.log("Order not found for ID:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Order found:", order._id);

    const safeOrder = {
      ...order,
      shippingAddressText: formatAddress(order.shippingAddress),
      recipientName:
        order.shippingAddress?.fullName || order.user?.name || "Customer",
      recipientPhone:
        order.shippingAddress?.phone || order.user?.phone || "N/A",
    };

    console.log("Prepared safeOrder for label:", safeOrder);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="label_${orderId}.pdf"`
    );

    console.log("Calling streamShippingLabelPDF...");
    await streamShippingLabelPDF(safeOrder, res);
    console.log("Label PDF streamed successfully.");
  } catch (err) {
    console.error("Label error:", err);
    res.status(500).json({ message: "Failed to generate shipping label" });
  }
});

module.exports = router;
