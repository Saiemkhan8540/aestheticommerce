const express = require("express");
const router = express.Router();

const {
  getOverviewStats,
  getSalesGraph,
  getOrderStatus,
  getCategoryStats,
  getInventory,
  getInventoryManagement,
} = require("../controllersSellerPanel/statsController");

const { protectSeller } = require("../MiddlewareSellerPanel/sellerPanelauthMidWar");

// Dashboard Overview Stats
router.get("/overview", protectSeller, getOverviewStats);

// Sales graph data
router.get("/sales-graph", protectSeller, getSalesGraph);

// Order status distribution
router.get("/order-status", protectSeller, getOrderStatus);

// Category-wise analytics
router.get("/category-stats", protectSeller, getCategoryStats);

// Basic inventory metrics
router.get("/inventory", protectSeller, getInventory);

// Comprehensive inventory management
router.get("/inventory-management", protectSeller, getInventoryManagement);

module.exports = router;
