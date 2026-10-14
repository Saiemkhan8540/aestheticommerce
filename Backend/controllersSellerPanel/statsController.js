const statsService = require("../servicesSellerPanel/statsService");

//  Dashboard Overview Stats
const getOverviewStats = async (req, res) => {
  try {
    const { filter } = req.query;
    const sellerId = req.user._id; 

    const stats = await statsService.getSellerStats(sellerId, filter, "approved");
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

//  Sales Graph
const getSalesGraph = async (req, res) => {
  try {
    const { filter } = req.query;
    const sellerId = req.user._id;

    const graphData = await statsService.getSalesOverTime(sellerId, filter, "approved");
    res.status(200).json({ success: true, data: graphData });
  } catch (err) {
    console.error("Error fetching graph data:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

//  Order Status Distribution
const getOrderStatus = async (req, res) => {
  try {
    const sellerId = req.user._id; 
    const { filter = "month" } = req.query;

    const data = await statsService.getOrderStatusDistribution(sellerId, filter, "approved");

    res.status(200).json({
      success: true,
      message: "Order status distribution fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getOrderStatus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order status",
      error: error.message,
    });
  }
};

//  Category Stats
const getCategoryStats = async (req, res) => {
  try {
    const { filter } = req.query;
    const sellerId = req.user._id;

    const categoryData = await statsService.getOrdersByCategory(sellerId, filter, "approved");
    res.status(200).json({ success: true, data: categoryData });
  } catch (err) {
    console.error("Error fetching category stats:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

//  Inventory Metrics
const getInventory = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const inventoryData = await statsService.getInventoryMetrics(sellerId, "approved");
    res.status(200).json({ success: true, data: inventoryData });
  } catch (err) {
    console.error("Error fetching inventory metrics:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

//  Comprehensive Inventory Management
const getInventoryManagement = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const inventoryData = await statsService.getInventoryManagement(sellerId, "approved");
    res.status(200).json({ success: true, data: inventoryData });
  } catch (err) {
    console.error("Error fetching inventory management data:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = {
  getOverviewStats,
  getSalesGraph,
  getOrderStatus,
  getCategoryStats,
  getInventory,
  getInventoryManagement,
};
