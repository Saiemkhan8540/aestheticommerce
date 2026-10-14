const express = require("express");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const Seller = require("../models/seller.model");

const router = express.Router();

// Get seller stats
router.get("/stats/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Check if seller exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Count total products
    const totalProducts = await Product.countDocuments({ sellerId });

    // Get orders & populate products
    const orders = await Order.find({}).populate("products.product");

    let totalRevenue = 0;
    let totalOrders = 0;
    const customerSet = new Set();

    orders.forEach((order) => {
      let hasSellerProduct = false;

      order.products.forEach((item) => {
        if (item.product?.sellerId?.toString() === sellerId) {
          hasSellerProduct = true;
          totalRevenue += item.price * item.quantity;
        }
      });

      if (hasSellerProduct) {
        totalOrders++;
        customerSet.add(order.user.toString());
      }
    });

    const totalCustomers = customerSet.size;

    // Include seller info
    res.json({
      sellerId: seller._id,
      sellerName: seller.sellerName,
      storeName: seller.storeName,
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
    });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    res.status(500).json({
      message: "Error fetching stats",
      error: error.message,
    });
  }
});

// 🔹 NEW ROUTE: Get orders for a specific seller
router.get("/orders/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Verify seller exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Find all orders and populate necessary fields
    const allOrders = await Order.find({})
      .populate("user", "fullname email phone")
      .populate("products.product", "name price images")
      .sort({ createdAt: -1 }); // Most recent first

    // Filter orders that contain this seller's products
    const sellerOrders = allOrders
      .map((order) => {
        // Filter products that belong to this seller
        const sellerProducts = order.products.filter(
          (item) => item.sellerId?.toString() === sellerId
        );

        // If no products from this seller, skip this order
        if (sellerProducts.length === 0) return null;

        // Calculate total for seller's products only
        const sellerTotal = sellerProducts.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // Return modified order with only seller's products
        return {
          _id: order._id,
          orderId: order.orderId,
          user: order.user,
          products: sellerProducts,
          totalPrice: sellerTotal, // Only seller's portion
          shippingAddress: order.shippingAddress,
          paymentStatus: order.paymentStatus,
          deliveryStatus: order.deliveryStatus,
          status: order.deliveryStatus, // For compatibility with your frontend
          createdAt: order.createdAt,
          paymentId: order.paymentId || "N/A",
        };
      })
      .filter(Boolean); // Remove null entries

    res.json(sellerOrders);
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
});

module.exports = router;