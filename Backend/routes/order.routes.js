const express = require("express");
const router = express.Router();
const mongoose = require("mongoose"); // ADDED: Import mongoose
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Seller = require("../models/seller.model");
const Cart = require("../models/cart.model");
const multer = require("multer");
const path = require("path");
const { protect } = require("../Middleware/authMiddleware");
const Coupon = require('../models/coupon.model');
const CouponUsage = require('../models/couponUsage.model');
const {
  protectSeller,
} = require("../MiddlewareSellerPanel/sellerPanelauthMidWar");
const Notification = require("../models/notification.model");
const DeliveryTask = require("../models/deliveryTask.model");
const DeliveryPartner = require("../models/deliveryPartner.model");
const { toClientProduct } = require("../utils/productForClient");
const {
  createDeliveryTasksForOrder,
} = require("../services/deliveryTask.service");
const { sendOrderEmails } = require("../servicesSellerPanel/orderEmailService");
const { orderWithClientProducts } = require("../utils/orderWithClientProducts");
const { resolveOrderPricing } = require("../utils/resolveOrderPricing");

const PRODUCT_SELECT_FOR_OFFERED_PRICE =
  "name sellingPrice sellerId sellerName storeName platformFee logisticsFee transactionFee discountPercentage";
// Populate product with fields needed for toClientProduct + name/images for response
const ORDER_PRODUCT_POPULATE_SELECT =
  "name images " + PRODUCT_SELECT_FOR_OFFERED_PRICE;

// -------------------- ID helpers (same logic as model) --------------------
function generateBaseNumericId() {
  const timestampPart = Date.now().toString();
  const randomPart = String(Math.floor(10000 + Math.random() * 90000));
  return `${timestampPart}${randomPart}`;
}

function ensureOrderIds(order) {
  let changed = false;
  if (!order.orderId) {
    const base = generateBaseNumericId();
    order.orderId = `OD${base}`;
    changed = true;
  }
  const baseForItems = String(order.orderId).startsWith("OD")
    ? String(order.orderId).slice(2)
    : generateBaseNumericId();
  if (Array.isArray(order.products)) {
    order.products.forEach((p, idx) => {
      if (!p.itemId) {
        try {
          const itemId = String(BigInt(baseForItems) + BigInt(idx));
          p.itemId = itemId;
          changed = true;
        } catch (_) {
          p.itemId = `${baseForItems}${idx}`;
          changed = true;
        }
      }
    });
  }
  return changed;
}

// -------------------- Create a new order (COD / non-Razorpay) --------------------
router.post("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const sellerMetaCache = new Map();
    const ensureSellerMeta = async (sellerId) => {
      if (!sellerId) {
        return { sellerName: "Unknown Seller", storeName: "Marketplace" };
      }
      const key = sellerId.toString();
      if (sellerMetaCache.has(key)) return sellerMetaCache.get(key);

      const sellerDoc = await Seller.findById(sellerId).select(
        "sellerName storeName",
      );
      const meta = {
        sellerName: sellerDoc?.sellerName || "Unknown Seller",
        storeName: sellerDoc?.storeName || "Marketplace",
      };
      sellerMetaCache.set(key, meta);
      return meta;
    };
    console.log("check1");

    // Build items array
    let items = [];
    if (Array.isArray(req.body.products) && req.body.products.length > 0) {
      // Use provided products but validate & enrich using Product model; price = offeredPrice (customer-facing)
      for (const p of req.body.products) {
        if (!p.product) continue;
        const prod = await Product.findById(p.product).select(
          PRODUCT_SELECT_FOR_OFFERED_PRICE,
        );
        if (!prod) continue;
        const clientProduct = toClientProduct(prod);
        const sellerMeta = await ensureSellerMeta(prod.sellerId);
        items.push({
          product: prod._id,
          productName: prod.name,
          sellerId: prod.sellerId,
          sellerName: prod.sellerName || sellerMeta.sellerName,
          storeName: prod.storeName || sellerMeta.storeName,
          quantity: p.quantity || 1,
          price: clientProduct.offeredPrice,
        });
      }
    } else {
      // Build from Cart model (when no products in body); price = offeredPrice (customer-facing)
      const cart = await Cart.findOne({ user: req.user._id }).populate({
        path: "items.product",
        select: PRODUCT_SELECT_FOR_OFFERED_PRICE,
      });
      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      items = await Promise.all(
        cart.items.map(async (c) => {
          const productRef = c.product?._id
            ? c.product
            : await Product.findById(c.product).select(
                PRODUCT_SELECT_FOR_OFFERED_PRICE,
              );
          if (!productRef) return null;
          const clientProduct = toClientProduct(productRef);
          const sellerMeta = await ensureSellerMeta(
            productRef.sellerId || c.sellerId,
          );
          return {
            product: productRef._id,
            productName: productRef.name,
            sellerId: productRef.sellerId || c.sellerId,
            sellerName:
              productRef.sellerName || c.sellerName || sellerMeta.sellerName,
            storeName:
              productRef.storeName || c.storeName || sellerMeta.storeName,
            quantity: c.quantity,
            price: clientProduct.offeredPrice,
          };
        }),
      );
      items = items.filter(Boolean);
    }
    console.log("check2");

    if (items.length === 0) {
      return res.status(400).json({ message: "No products to create order" });
    }

    
    console.log("check3");
    const pricing = await resolveOrderPricing(req, items);
    const {
      subtotal,
      gstAmount,
      gstPercent,
      shippingCharge,
      deliveryCharge,
      discountAmount,
      discountCode,
      discountType,
      discountValue,
      totalAmount,
    } = pricing;

    const payload = {
      user: user._id,
      products: items,
      totalAmount,
      pricingBreakdown: {
         subtotal,
         gstPercent,
         gstAmount,
        shippingCharge,
        deliveryCharge,
         discountCode,       
        discountType,
        discountValue,
        discountAmount
      },
      // For non-Razorpay flow, default to COD unless explicitly overridden in body
      paymentMethode: req.body.paymentMethode || "COD",
      paymentStatus: req.body.paymentStatus || "Pending",
      deliveryStatus: req.body.deliveryStatus || "Pending",
      shippingAddress:
        req.body.shippingAddress || req.user.defaultAddress || {},
    };
    console.log("check4 ", payload);

    const newOrder = new Order(payload);
    console.log("check4.1:- ", newOrder);
    const saved = await newOrder.save();

    if (discountCode) {
  const coupon = await Coupon.findOne({ code: discountCode });
  if (coupon) {
    await CouponUsage.create({
      couponId: coupon._id,
      userId: req.user._id,
      orderId: saved._id
    });
    await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
  }
}

    await createDeliveryTasksForOrder(saved);
    sendOrderEmails(saved,user);
    console.log("check4.2");

    console.log("check4Product:- ", req.body.products);
    // Clear Cart model if order was created from cart (no products in body)
    if (!Array.isArray(req.body.products) || req.body.products.length === 0) {
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { items: [] },
        { new: true },
      );
    }
    console.log("check5");

    // populate products.product for response (select includes fields for toClientProduct)
    const populatedOrder = await Order.findById(saved._id)
      .populate({
        path: "products.product",
        select: ORDER_PRODUCT_POPULATE_SELECT,
      })
      .populate("products.sellerId", "name email");

    // Create notifications for sellers
    const sellerNotifications = {};
    populatedOrder.products.forEach((item) => {
      // const sellerId = item.sellerId._id.toString();
      // if (!sellerNotifications[sellerId]) {
      //   sellerNotifications[sellerId] = {
      //     recipient: sellerId,
      //     recipientModel: "Seller",
      //     message: `You have a new order! Order ID: ${populatedOrder.orderId}`,
      //     link: `/seller/orders/${populatedOrder._id}`,
      //   };
      // }
      if (item.sellerId && item.sellerId._id) {
        const sellerIdStr = item.sellerId._id.toString();
        if (!sellerNotifications[sellerIdStr]) {
          sellerNotifications[sellerIdStr] = {
            recipient: sellerIdStr,
            recipientModel: "Seller",
            message: `You have a new order! Order ID: ${populatedOrder.orderId}`,
            link: `/seller/orders/${populatedOrder._id}`,
          };
        }
      }
    });
    console.log("check6");

    await Notification.insertMany(Object.values(sellerNotifications));
    console.log("check6");
    res.status(201).json(orderWithClientProducts(populatedOrder));
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Get orders for currently logged-in user --------------------
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ 
      user: req.user._id,
      $or: [{ paymentMethode: 'COD' }, { paymentStatus: 'Paid' }]
    })
      .populate({
        path: "products.product",
        select: ORDER_PRODUCT_POPULATE_SELECT,
      })
      .populate("products.sellerId", "name email")
      .sort({ createdAt: -1 });

    for (const o of orders) {
      const changed = ensureOrderIds(o);
      if (changed) await o.save();
    }
    res.status(200).json(orderWithClientProducts(orders));
  } catch (err) {
    console.error("Get my orders error:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Get orders for a seller (seller panel) --------------------
router.get("/seller/orders", protect, async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Aggregate orders containing items for this seller
    const orders = await Order.aggregate([
      {
        $match: {
          "products.sellerId": mongoose.Types.ObjectId(String(sellerId)),
          $or: [{ paymentMethode: 'COD' }, { paymentStatus: 'Paid' }]
        },
      },
      {
        $addFields: {
          sellerProducts: {
            $filter: {
              input: "$products",
              as: "p",
              cond: {
                $eq: [
                  "$$p.sellerId",
                  mongoose.Types.ObjectId(String(sellerId)),
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          orderId: 1,
          user: 1,
          totalAmount: 1,
          paymentStatus: 1,
          deliveryStatus: 1,
          shippingAddress: 1,
          cancelledAt: 1,
          createdAt: 1,
          sellerProducts: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json(orders);
  } catch (err) {
    console.error("Seller orders error:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Get orders by user ID (admin) --------------------
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ 
      user: req.params.userId,
      $or: [{ paymentMethode: 'COD' }, { paymentStatus: 'Paid' }] 
    })
      .populate({
        path: "products.product",
        select: ORDER_PRODUCT_POPULATE_SELECT,
      })
      .populate("products.sellerId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(orderWithClientProducts(orders));
  } catch (err) {
    console.error("Get user orders error:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Get single order by order ID or mongo id --------------------
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const productPopulate = {
      path: "products.product",
      select: ORDER_PRODUCT_POPULATE_SELECT,
    };
    let order = null;
    if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderId)
        .populate(productPopulate)
        .populate("products.sellerId", "name email");
    }
    if (!order) {
      order = await Order.findOne({ orderId })
        .populate(productPopulate)
        .populate("products.sellerId", "name email");
    }
    if (!order) return res.status(404).json({ message: "Order not found" });

    const changed = ensureOrderIds(order);
    if (changed) {
      await order.save();
      order = await Order.findById(order._id)
        .populate(productPopulate)
        .populate("products.sellerId", "name email");
    }
    res.status(200).json(orderWithClientProducts(order));
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Cancel order (user) --------------------
router.patch("/:orderId/cancel", protect, async (req, res) => {
  try {
    const { cancelReason } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    // if any item has advanced status, reject full-cancel
    const blocked = order.products.some((p) =>
      ["Shipped", "Out for Delivery", "Delivered"].includes(p.status),
    );
    if (blocked) {
      return res
        .status(400)
        .json({
          message: "Order (or some items) cannot be cancelled at this stage",
        });
    }

    order.deliveryStatus = "Cancelled";
    order.cancelledAt = new Date();

    // mark each item cancelled with reason and who cancelled
    order.products = order.products.map((p) => ({
      ...(p.toObject ? p.toObject() : p),
      status: "Cancelled",
      cancelReason: cancelReason || "",
      cancelledBy: "user",
    }));

    const updatedOrder = await order.save();
    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate({
        path: "products.product",
        select: ORDER_PRODUCT_POPULATE_SELECT,
      })
      .populate("products.sellerId", "name email");

    res.status(200).json(orderWithClientProducts(populatedOrder));
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Multer for rating images --------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error("Only images are allowed"));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

// -------------------- Check review eligibility for a product --------------------
router.get("/eligibility/review/:productId", protect, async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if this user has any order where that product exists and that product's status is Delivered
    const order = await Order.findOne({
      user: req.user._id,
      "products.product": productId,
      "products.status": "Delivered",
    });

    res.json({ eligible: Boolean(order) });
  } catch (err) {
    console.error("Eligibility error:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Submit rating for an order (supports images) --------------------
router.post(
  "/:orderId/rating",
  protect,
  upload.array("photos", 6),
  async (req, res) => {
    try {
      const { stars, text } = req.body;
      const order = await Order.findById(req.params.orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });

      if (order.user.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to rate this order" });
      }

      // require that all items are delivered before order-level rating
      const allDelivered = order.products.every(
        (p) => p.status === "Delivered",
      );
      if (!allDelivered) {
        return res
          .status(400)
          .json({
            message: "Can only rate orders where all items are delivered",
          });
      }

      if (order.rating && order.rating.stars) {
        return res.status(400).json({ message: "Order already rated" });
      }

      const photoUrls = (req.files || []).map((f) => `/uploads/${f.filename}`);

      order.rating = {
        stars: Number(stars),
        text: text || "",
        photos: photoUrls,
        submittedAt: new Date(),
      };

      const updatedOrder = await order.save();
      const populatedOrder = await Order.findById(updatedOrder._id)
        .populate({
          path: "products.product",
          select: ORDER_PRODUCT_POPULATE_SELECT,
        })
        .populate("products.sellerId", "name email");

      // Create product-level review(s)
      if (order.products && order.products.length > 0) {
        const ProductModel = require("../models/product.model");
        const firstProd = await ProductModel.findById(
          order.products[0].product,
        );
        if (firstProd) {
          const alreadyReviewed = (firstProd.reviews || []).some(
            (r) => r.user?.toString() === req.user._id.toString(),
          );
          if (!alreadyReviewed) {
            firstProd.reviews.push({
              user: req.user._id,
              stars: Number(stars),
              text: text || "",
              photos: photoUrls,
              createdAt: new Date(),
            });
            const total = firstProd.reviews.reduce((s, r) => s + r.stars, 0);
            firstProd.rating =
              firstProd.reviews.length > 0
                ? Number((total / firstProd.reviews.length).toFixed(1))
                : 0;
            await firstProd.save();
          }
        }
      }

      res.status(200).json(orderWithClientProducts(populatedOrder));
    } catch (err) {
      console.error("Rating error:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

// -------------------- Get all orders (admin) --------------------
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentMethode: 'COD' }, { paymentStatus: 'Paid' }]
    })
      .populate({
        path: "products.product",
        select: ORDER_PRODUCT_POPULATE_SELECT,
      })
      .populate("products.sellerId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(orderWithClientProducts(orders));
  } catch (err) {
    console.error("Get all orders error:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Update item status (seller) --------------------
router.put("/seller/item-status", protectSeller, async (req, res) => {
  try {
    const { orderId, itemId, status } = req.body;
    const sellerId = req.user._id;

    console.log("=== Update Item Status Request ===");
    console.log("Body:", { orderId, itemId, status });
    console.log("Seller ID:", sellerId);

    // Validate required fields
    if (!orderId || !itemId || !status) {
      return res
        .status(400)
        .json({ message: "orderId, itemId, and status are required" });
    }

    // Validate status value
    const validStatuses = [
      "Dispatched",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find the order
    const order = await Order.findOne({ orderId });
    console.log("Order found:", order ? "Yes" : "No");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Products in order:", order.products.length);
    console.log("Looking for itemId:", itemId);

    // Find the specific item and verify seller ownership
    const item = order.products.find(
      (p) =>
        (p.itemId === itemId || p._id.toString() === itemId) &&
        p.sellerId.toString() === sellerId.toString(),
    );

    console.log("Item found:", item ? "Yes" : "No");

    if (!item) {
      return res.status(404).json({
        message:
          "Item not found or you don't have permission to update this item",
      });
    }

    // Update the item status
    console.log("Updating status from", item.status, "to", status);
    item.status = status;
    item.trackingInfo = item.trackingInfo || {};
    item.trackingInfo.updatedAt = new Date();

    // Save the order
    await order.save();
    console.log("Order saved successfully");

    // When seller marks as Dispatched, create delivery task for this order+seller (if not already created)
    if (status === "Dispatched") {
      // try {
      //   await createDeliveryTaskForSeller(order, sellerId);
      // } catch (taskErr) {
      //   console.error('Delivery task creation on dispatch:', taskErr);
      //   // Don't fail the request; item status was already updated
      // }
    }

    // Return the updated order (product in client form: offeredPrice only)
    const updatedOrder = await Order.findById(order._id)
      .populate({
        path: "products.product",
        select: ORDER_PRODUCT_POPULATE_SELECT,
      })
      .populate("user", "name email phone");

    res.status(200).json({
      message: "Item status updated successfully",
      order: orderWithClientProducts(updatedOrder),
    });
  } catch (err) {
    console.error("Update item status error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
