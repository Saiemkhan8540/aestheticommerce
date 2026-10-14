const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors"); // Allow cross-origin requests
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const userRoutes = require("./routes/user.routes");
const blogRoutes = require("./routes/blogs.routes");
const shipAddRoutes = require("./routes/shipAddress.routes");
const favortiesRoutes = require("./routes/favorites.routes");
const cartRoutes = require("./routes/cart.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const addressRoutes = require("./routes/address.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const contactRoutes = require("./routes/contactRoutes");
const paymentRoutes = require('./routes/payment.routes');
const homeRoutes = require("./routes/home.routes");
const couponRoutes=require("./routes/coupon.routes");
const bannerRoutes = require("./routes/banner.routes");

// const sellerRoutes = require('./routes/seller.routes');

//SELLER PANEL ROUTES
const sellerPanelRoutes = require("./routes-seller-panel/SellerPanel.routes");
const addProductRoutes = require("./routes-seller-panel/addProduct.routes");
const dashboardRoutes = require("./routes-seller-panel/dashboard.routes");
const productInfoRoutes = require("./routes-seller-panel/productInfo.routes");
const statsRoutes = require("./routes-seller-panel/stats.routes");
const categoryRoutes = require("./routes-seller-panel/category.routes");
const sellerDelivery = require("./routes-seller-panel/delivery.routes");
//ADMIN PANEL ROUTES
const adminRoutes = require("./routes-admin-panel/admin.routes");
const notificationRoutes = require("./routes-admin-panel/notification.routes");
const adminBannerRoutes = require("./routes-admin-panel/banner.routes");

//DELIVERY PANEL ROUTES
const deliveryRoutes = require("./routes-delivery-panel/delivery.routes");

//DELIVERY TASK PANEL ROUTES
const deliveryTaskRouter = require("./routes-delivery-panel/deliveryTask.router");

//SITEMAP ROUTE
const sitemapRoute = require("./routes/sitemap");

//CONTACT US ROUTES
const contactusRoute = require("./routes/contactUs.routes");
const nlSubsRoute = require("./routes/NLSubs.routes");

const connectDB = require("./db/db");
const globalErrorHandler = require("./Middleware/globalErrorHandler");
// connectDB() is now handled in server.js to ensure it's awaited before the server starts

app.use(cors());

// ==========================================
// 🔴 CRITICAL FIX FOR RAZORPAY WEBHOOK 🔴
// Bypass the JSON parser ONLY for the webhook route
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payment/webhook') {
    next(); // Skip JSON parsing, let the payment route handle the raw body
  } else {
    express.json()(req, res, next); // Parse JSON normally for everything else
  }
});
// ==========================================

// app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

app.use(express.static('public'));



app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/check", (req, res) => {
  res.send("Hello World!");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Cart routes first so POST/GET /users/cart hit Cart model only (not User)
app.use("/users", cartRoutes);
app.use("/users", userRoutes);
app.use("/users", shipAddRoutes);
app.use("/users", blogRoutes);
app.use("/users", favortiesRoutes);
app.use("/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/home", homeRoutes);
app.use("/api/banners", bannerRoutes);

//DOCUMENTS
app.get("/api/document", (req, res) => {
  res.send("Hello document!");
});
app.use("/api/document", invoiceRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api", contactRoutes);

// app.use('/seller', sellerRoutes);

// Seller Panel Routes
app.use("/api/products", addProductRoutes);
app.use("/api/seller", sellerPanelRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/productinfo", productInfoRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/seller/delivery", sellerDelivery);

// Admin Panel Routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin/banners", adminBannerRoutes);
app.use("/api/notifications", notificationRoutes);

// Delivery Panel Routes
app.use("/api/delivery", deliveryRoutes);

// Delivery Task Panel Routes
app.use("/api/deliverytask", deliveryTaskRouter);


// Delivery partner Panel Routes
app.get("/api/server-status", (req, res) => {
  res.status(200).json({ bootTime: process.uptime() });
});

//sitemap route
app.use('/', sitemapRoute);

app.use('/api', contactusRoute);
app.use('/api', nlSubsRoute);
//coupon verify route
app.use('/api',couponRoutes);




app.use(globalErrorHandler);
module.exports = app;
