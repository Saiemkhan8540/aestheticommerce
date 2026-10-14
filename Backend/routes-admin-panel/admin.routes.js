const express = require("express");
const router = express.Router();

const {
  loginAdmin,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getAllSellers,
  getSellerProducts,
  deleteProduct,
  verifyToken,
  getSalesAnalytics,
  getUserAnalytics,
  getWeeklyActiveUsers,
  deleteSeller,
  blockSeller,
  getSellerById,
  getCategoryStats,
  getPendingRiders,
  getAllActiveRiders,
  updateRiderStatus,
  updateProductBadges,
} = require("../controllersAdminPanel/admin.controller.js");
const { protectAdmin } = require("../MiddlewareAdminPanel/Adminauth.middleware.js");
const zodValidate = require("../Middleware/zodValidate.js");
const { updateRiderStatusSchema } = require("../validators/adminPanelValidators/upateRiderStatus.schema.js");
const { updateProductBadgesSchema } = require("../validators/adminPanelValidators/productBadges.schema.js");

// Admin routes
router.post("/login", loginAdmin);
router.get("/products", protectAdmin, getPendingProducts);
router.put("/products/:productId/approve", protectAdmin, approveProduct);
router.put("/products/:productId/reject", protectAdmin, rejectProduct);
router.put(
  "/products/:productId/badges",
  protectAdmin,
  zodValidate(updateProductBadgesSchema),
  updateProductBadges,
);
router.get("/sellers", protectAdmin, getAllSellers);
router.get("/sellers/:sellerId/products", protectAdmin, getSellerProducts);
router.delete("/products/:productId", protectAdmin, deleteProduct);
router.get("/verify", protectAdmin, verifyToken);

// Analytics routes
router.get("/analytics/sales", protectAdmin, getSalesAnalytics);
router.get("/analytics/users", protectAdmin, getUserAnalytics);
router.get("/analytics/weekly-active-users", protectAdmin, getWeeklyActiveUsers);

// Seller management routes
router.delete("/sellers/:sellerId", protectAdmin, deleteSeller);
router.put("/sellers/:sellerId/block", protectAdmin, blockSeller);
router.get("/sellers/:sellerId", protectAdmin, getSellerById);

// Category-wise analytics
router.get("/stats/category-stats", protectAdmin, getCategoryStats);

// right now bypassing protectAdmin middleware 
router.get("/riders/pending", getPendingRiders);
router.get("/riders/active",getAllActiveRiders);
router.patch("/riders/:id/status",zodValidate(updateRiderStatusSchema),updateRiderStatus);
module.exports = router;
