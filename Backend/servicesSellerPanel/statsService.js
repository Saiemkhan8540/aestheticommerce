const Order = require("../models/order.model");
const Product = require("../models/product.model");
const { getDateRange } = require("../utilsSellerPanel/dateUtils");
const mongoose = require("mongoose");

// ===============================
// 📊 INVENTORY MANAGEMENT
// ===============================
async function getInventoryManagement(sellerId) {
  try {
    const products = await Product.find({ sellerId, approvalStatus: "approved" })
      .select("name category subcategory sellingPrice inStock images createdAt")
      .lean();

    const salesData = await Order.aggregate([
      { $unwind: "$products" },
      {
        $match: {
          "products.sellerId": new mongoose.Types.ObjectId(sellerId),
        },
      },
      {
        $group: {
          _id: "$products.product",
          totalSold: { $sum: "$products.quantity" },
          totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
        },
      },
    ]);

    const salesMap = {};
    salesData.forEach((item) => {
      salesMap[item._id.toString()] = {
        sold: item.totalSold,
        revenue: item.totalRevenue,
      };
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaySales = await Order.aggregate([
      { $unwind: "$products" },
      {
        $match: {
          "products.sellerId": new mongoose.Types.ObjectId(sellerId),
          createdAt: { $gte: todayStart },
        },
      },
      {
        $group: {
          _id: "$products.product",
          soldToday: { $sum: "$products.quantity" },
        },
      },
      { $sort: { soldToday: -1 } },
      { $limit: 1 },
    ]);

    const processedProducts = products.map((product) => {
      const sales = salesMap[product._id.toString()] || { sold: 0, revenue: 0 };

      let status;
      if (product.inStock === 0) status = "Out of Stock";
      else if (product.inStock <= 10) status = "Low Stock";
      else status = "In Stock";

      return {
        id: product._id,
        name: product.name,
        category: product.category,
        subcategory: product.subcategory || "N/A",
        stock: product.inStock,
        price: product.sellingPrice ?? 0,
        status,
        image: product.images?.[0] || null,
        totalSold: sales.sold,
        revenue: sales.revenue,
        createdAt: product.createdAt,
      };
    });

    const totalStockValue = processedProducts.reduce(
      (sum, p) => sum + p.stock * p.price,
      0
    );

    const lowStockProducts = processedProducts.filter((p) => p.status === "Low Stock");
    const outOfStockProducts = processedProducts.filter((p) => p.status === "Out of Stock");

    let highDemandProduct = null;
    let highDemandCount = 0;

    if (todaySales.length > 0) {
      const topProductId = todaySales[0]._id.toString();
      highDemandProduct = processedProducts.find((p) => p.id.toString() === topProductId);
      highDemandCount = todaySales[0].soldToday;
    }

    const alertCards = [
      {
        title: "Total Stock Value",
        count: `$${totalStockValue.toFixed(2)}`,
        type: "value",
      },
      {
        title: "High Demand",
        product: highDemandProduct ? highDemandProduct.name : "No sales today",
        count: highDemandProduct ? `${highDemandCount} sold today` : "0 sold today",
        type: "demand",
        productId: highDemandProduct ? highDemandProduct.id : null,
      },
      {
        title: "Low Stock Alert",
        product: lowStockProducts.length > 0 ? lowStockProducts[0].name : "All stocked well",
        count: lowStockProducts.length > 0 ? `${lowStockProducts[0].stock} left` : "No alerts",
        type: "low-stock",
        productId: lowStockProducts.length > 0 ? lowStockProducts[0].id : null,
        totalLowStock: lowStockProducts.length,
      },
      {
        title: "Out of Stock",
        product: outOfStockProducts.length > 0 ? outOfStockProducts[0].name : "All products available",
        count: outOfStockProducts.length > 0 ? "Restock needed" : "No issues",
        type: "out-of-stock",
        productId: outOfStockProducts.length > 0 ? outOfStockProducts[0].id : null,
        totalOutOfStock: outOfStockProducts.length,
      },
    ];

    const sortedProducts = processedProducts.sort((a, b) => {
      const statusOrder = { "Out of Stock": 0, "Low Stock": 1, "In Stock": 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    return {
      alertCards,
      products: sortedProducts,
      summary: {
        totalProducts: processedProducts.length,
        inStock: processedProducts.filter((p) => p.status === "In Stock").length,
        lowStock: lowStockProducts.length,
        outOfStock: outOfStockProducts.length,
        totalStockValue,
      },
    };
  } catch (error) {
    console.error("Error in getInventoryManagement:", error);
    throw error;
  }
}

// ===============================
// 📈 SELLER DASHBOARD ANALYTICS
// ===============================
async function getSellerStats(sellerId, filter = "month") {
  const { start, end } = getDateRange(filter);

  const orders = await Order.find({
    "products.sellerId": sellerId,
    createdAt: { $gte: start, $lte: end },
  });

  let totalOrders = 0;
  let totalRevenue = 0;
  const productSales = {};
  const uniqueCustomers = new Set();

  for (const order of orders) {
    uniqueCustomers.add(order.user.toString());
    for (const item of order.products) {
      if (String(item.sellerId) === String(sellerId)) {
        totalOrders++;
        totalRevenue += item.price * item.quantity;
        productSales[item.product] = (productSales[item.product] || 0) + item.quantity;
      }
    }
  }

  const totalProducts = await Product.countDocuments({ sellerId, approvalStatus: "approved" });

  const productIds = Object.keys(productSales);
  const products = await Product.find({ _id: { $in: productIds }, approvalStatus: "approved" }).select("name images");

  const topProducts = products
    .map((p) => ({
      _id: p._id,
      name: p.name,
      image: p.images[0],
      sold: productSales[p._id] || 0,
    }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  return {
    totalOrders,
    totalRevenue,
    totalProducts,
    totalCustomers: uniqueCustomers.size,
    topProducts,
    timeFilter: filter,
  };
}

async function getSalesOverTime(sellerId, filter = "month") {
  const { start, end } = getDateRange(filter);

  const results = await Order.aggregate([
    { $unwind: "$products" },
    {
      $match: {
        "products.sellerId": new mongoose.Types.ObjectId(sellerId),
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalSales: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return results.map((r) => ({
    date: r._id,
    totalSales: r.totalSales,
  }));
}

async function getOrderStatusDistribution(sellerId, filter = "month") {
  const { start, end } = getDateRange(filter);

  const results = await Order.aggregate([
    { $unwind: "$products" },
    {
      $match: {
        "products.sellerId": new mongoose.Types.ObjectId(sellerId),
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$products.status",
        count: { $sum: 1 },
      },
    },
  ]);

  const allStatuses = ["Pending", "Dispatched", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
  const resultMap = results.reduce((acc, r) => {
    acc[r._id] = r.count;
    return acc;
  }, {});

  return allStatuses.map((status) => ({
    status,
    count: resultMap[status] || 0,
  }));
}

async function getOrdersByCategory(sellerId, filter = "month") {
  const { start, end } = getDateRange(filter);

  const results = await Order.aggregate([
    { $unwind: "$products" },
    {
      $match: {
        "products.sellerId": new mongoose.Types.ObjectId(sellerId),
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "products.product",
        foreignField: "_id",
        as: "prod",
      },
    },
    { $unwind: "$prod" },
    { $match: { "prod.approvalStatus": "approved" } },
    {
      $group: {
        _id: {
          category: "$prod.category",
          subcategory: "$prod.subcategory",
        },
        revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
        unitsSold: { $sum: "$products.quantity" },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  return results.map((r) => ({
    category: r._id.category,
    subcategory: r._id.subcategory,
    revenue: r.revenue,
    unitsSold: r.unitsSold,
  }));
}

async function getInventoryMetrics(sellerId) {
  const products = await Product.find({ sellerId, approvalStatus: "approved" }).select(
    "name price inStock category subcategory"
  );

  let totalStockCount = 0;
  let totalStockValue = 0;
  const outOfStock = [];
  const salesCounts = {};

  for (const p of products) {
    totalStockCount += p.inStock;
    totalStockValue += p.inStock * p.price;
    if (p.inStock === 0) {
      outOfStock.push({
        _id: p._id,
        name: p.name,
        category: p.category,
        subcategory: p.subcategory,
      });
    }
    salesCounts[p._id] = 0;
  }

  const orderSales = await Order.aggregate([
    { $unwind: "$products" },
    {
      $match: {
        "products.sellerId": new mongoose.Types.ObjectId(sellerId),
      },
    },
    {
      $group: {
        _id: "$products.product",
        unitsSold: { $sum: "$products.quantity" },
      },
    },
  ]);

  for (const os of orderSales) {
    salesCounts[os._id] = os.unitsSold;
  }

  const salesArray = products.map((p) => ({
    _id: p._id,
    name: p.name,
    unitsSold: salesCounts[p._id] || 0,
    category: p.category,
    subcategory: p.subcategory,
  }));

  const sortedBySold = salesArray.sort((a, b) => b.unitsSold - a.unitsSold);
  const topSelling = sortedBySold[0];
  const lowestSelling = sortedBySold[sortedBySold.length - 1];

  return {
    totalStockCount,
    totalStockValue,
    outOfStock,
    topSelling,
    lowestSelling,
  };
}

module.exports = {
  getSellerStats,
  getSalesOverTime,
  getOrderStatusDistribution,
  getOrdersByCategory,
  getInventoryMetrics,
  getInventoryManagement,
};
