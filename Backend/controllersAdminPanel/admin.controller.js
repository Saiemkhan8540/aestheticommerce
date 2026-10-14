const Product = require("../models/product.model");
const Admin = require("../models/admin.model");
const Seller = require("../models/seller.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const Notification = require("../models/notification.model");
const statsService = require("../services/statsService");
const DeliveryPartner = require("../models/deliveryPartner.model");
const {
  allowedProductBadges,
} = require("../validators/adminPanelValidators/productBadges.schema");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Admin login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    console.log({ admin });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        email: admin.email,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get products by status
const getPendingProducts = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status === "pending") {
      query = {
        $or: [
          { approvalStatus: "pending" },
          { approvalStatus: { $exists: false } },
          { approvalStatus: null },
        ],
      };
    } else if (status) {
      query = { approvalStatus: status };
    } else {
      // Default to pending if no status is provided
      query = {
        $or: [
          { approvalStatus: "pending" },
          { approvalStatus: { $exists: false } },
          { approvalStatus: null },
        ],
      };
    }

    const products = await Product.find(query).populate({
      path: "sellerId",
      select: "sellerName storeName email phone",
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending products", error });
  }
};

// Approve a product
const approveProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { approvalStatus: "approved" },
      { new: true },
    ).populate("sellerId");

    // Create notification for the seller
    if (updatedProduct && updatedProduct.sellerId) {
      await Notification.create({
        recipient: updatedProduct.sellerId._id,
        recipientModel: "Seller",
        message: `Your product "${updatedProduct.name}" has been approved.`,
        link: `/seller/products/${updatedProduct._id}`,
      });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error approving product", error });
  }
};

// Reject a product
const rejectProduct = async (req, res) => {
  const { productId } = req.params;
  const { adminNotes } = req.body; // Optional notes from admin
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { approvalStatus: "rejected", adminNotes },
      { new: true },
    ).populate("sellerId");

    // Create notification for the seller
    if (updatedProduct && updatedProduct.sellerId) {
      await Notification.create({
        recipient: updatedProduct.sellerId._id,
        recipientModel: "Seller",
        message: `Your product "${updatedProduct.name}" has been rejected.`,
        link: `/seller/products/${updatedProduct._id}`,
      });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error rejecting product", error });
  }
};

// Get all sellers
const getAllSellers = async (req, res) => {
  try {
    console.log("Fetching sellers with approved product counts...");

    // First, let's get basic seller info
    const sellers = await Seller.find({}).select("-password");
    console.log("Found sellers:", sellers.length);

    // Now let's get approved product counts for each seller
    const sellersWithCounts = await Promise.all(
      sellers.map(async (seller) => {
        const productCount = await Product.countDocuments({
          sellerId: seller._id,
          approvalStatus: "approved",
        });

        const base = seller.toObject();

        const normalizedSeller = {
          ...base,
          sellerName: typeof base.sellerName === "string" ? base.sellerName : "",
          storeName: typeof base.storeName === "string" ? base.storeName : "",
          email: typeof base.email === "string" ? base.email : "",
          phone: typeof base.phone === "string" ? base.phone : "",
        };

        console.log(
          `Seller ${normalizedSeller.sellerName} (${seller._id}) has ${productCount} approved products`,
        );

        return {
          ...normalizedSeller,
          productCount,
        };
      }),
    );

    console.log("Returning sellers with approved product counts");
    res.status(200).json(sellersWithCounts);
  } catch (error) {
    console.error("Error in getAllSellers:", error);
    res.status(500).json({ message: "Error fetching sellers", error });
  }
};

// Get all products for a specific seller
const getSellerProducts = async (req, res) => {
  const { sellerId } = req.params;
  try {
    const products = await Product.find({ sellerId }).populate({
      path: "sellerId",
      select: "sellerName storeName email phone",
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching seller products", error });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

const updateProductBadges = async (req, res) => {
  const { productId } = req.params;
  const { badges } = req.body;

  try {
    const badgeUpdates = {};
    allowedProductBadges.forEach((badge) => {
      if (Object.prototype.hasOwnProperty.call(badges, badge)) {
        badgeUpdates[`badges.${badge}`] = badges[badge];
      }
    });

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: badgeUpdates },
      { new: true, runValidators: true },
    ).populate({
      path: "sellerId",
      select: "sellerName storeName email phone",
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product badges", error });
  }
};

const verifyToken = (req, res) => {
  res.status(200).json({ message: "Token is valid" });
};

// Get sales analytics data
const getSalesAnalytics = async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Create a map of all months with 0 as default sales
    const monthData = {};
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize all months with 0 sales
    monthNames.forEach((month, index) => {
      monthData[index + 1] = 0; // Month numbers are 1-12
    });

    // Update with actual data
    salesData.forEach((item) => {
      monthData[item._id] = item.totalSales;
    });

    // Convert to array format expected by the frontend
    const formattedSalesData = Object.entries(monthData).map(
      ([monthNum, totalSales]) => ({
        name: monthNames[parseInt(monthNum) - 1],
        sales: totalSales,
        monthNum: parseInt(monthNum), // For proper sorting
      }),
    );

    // Sort by month number to ensure correct order
    formattedSalesData.sort((a, b) => a.monthNum - b.monthNum);

    // Remove monthNum before sending to frontend
    const result = formattedSalesData.map(({ monthNum, ...rest }) => rest);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getSalesAnalytics:", error);
    res
      .status(500)
      .json({
        message: "Error fetching sales analytics",
        error: error.message,
      });
  }
};

// Get user analytics data
const getUserAnalytics = async (req, res) => {
  try {
    const userData = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          userCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Create a map of all months with 0 as default count
    const monthData = {};
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize all months with 0 count
    monthNames.forEach((month, index) => {
      monthData[index + 1] = 0; // Month numbers are 1-12
    });

    // Update with actual data
    userData.forEach((item) => {
      monthData[item._id] = item.userCount;
    });

    // Convert to array format expected by the frontend
    const formattedUserData = Object.entries(monthData).map(
      ([monthNum, count]) => ({
        name: monthNames[parseInt(monthNum) - 1],
        users: count,
        monthNum: parseInt(monthNum), // For proper sorting
      }),
    );

    // Sort by month number to ensure correct order
    formattedUserData.sort((a, b) => a.monthNum - b.monthNum);

    // Remove monthNum before sending to frontend
    const result = formattedUserData.map(({ monthNum, ...rest }) => rest);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getUserAnalytics:", error);
    res
      .status(500)
      .json({ message: "Error fetching user analytics", error: error.message });
  }
};

// Delete a seller
const deleteSeller = async (req, res) => {
  const { sellerId } = req.params;
  try {
    const seller = await Seller.findByIdAndDelete(sellerId);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.status(200).json({ message: "Seller removed" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting seller", error });
  }
};

// Block/unblock a seller
const blockSeller = async (req, res) => {
  const { sellerId } = req.params;
  const { isBlocked } = req.body;

  try {
    const updatedSeller = await Seller.findByIdAndUpdate(
      sellerId,
      { isBlocked },
      { new: true },
    );
    res.status(200).json(updatedSeller);
  } catch (error) {
    res.status(500).json({ message: "Error updating seller status", error });
  }
};

// Get a single seller by ID
const getSellerById = async (req, res) => {
  console.log(
    `[DEBUG] Attempting to fetch seller with ID: ${req.params.sellerId}`,
  );
  const { sellerId } = req.params;
  try {
    const seller = await Seller.findById(sellerId)
      .select("-password")
      .populate("products"); // Assuming you have a 'products' field in your seller model

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.status(200).json(seller);
  } catch (error) {
    res.status(500).json({ message: "Error fetching seller details", error });
  }
};

const getCategoryStats = async (req, res) => {
  try {
    const categoryData = await statsService.getProductsByCategory();
    res.status(200).json({ success: true, data: categoryData });
  } catch (err) {
    console.error("Error fetching category stats:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

const getWeeklyActiveUsers = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const userData = await User.aggregate([
      {
        $match: {
          lastLogin: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$lastLogin" },
          userCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const formattedUserData = userData.map((item) => ({
      name: dayNames[item._id - 1],
      users: item.userCount,
    }));

    res.status(200).json(formattedUserData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user analytics", error });
  }
};

const getPendingRiders = async (req, res, next) => {
  try {
    const riders = await DeliveryPartner.find({ isActive: false }).select(
      "-password",
    );
    res.status(200).json({
      success: true,
      count: riders.length,
      data: riders,
    });
  } catch (err) {
    next(err);
  }
};

const updateRiderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const rider = await DeliveryPartner.findById(id);
    if (!rider) return next(new AppError("Rider not found", 404));

    rider.isActive = isActive;
    await rider.save();

    res.status(200).json({
      success: true,
      message: `Rider ${isActive ? "activated" : "deactivated"} sucessfully`,
    });
  } catch (err) {
    next(err);
  }
};

const getAllActiveRiders = async (req, res, next) => {
  try {
    const riders = await DeliveryPartner.find({ isActive: true });
    res.status(200).json({
      success: true,
      count: riders.length,
      data: riders,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  loginAdmin,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getAllSellers,
  getSellerProducts,
  deleteProduct,
  updateProductBadges,
  verifyToken,
  getSalesAnalytics,
  getUserAnalytics,
  deleteSeller,
  blockSeller,
  getSellerById,
  getWeeklyActiveUsers,
  getCategoryStats,
  getAllActiveRiders,
  getPendingRiders,
  updateRiderStatus,
};
