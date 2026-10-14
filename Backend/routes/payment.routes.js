const express = require('express');
const dotenv = require("dotenv");
const router = express.Router();
const crypto = require('crypto');
const { protect } = require('../Middleware/authMiddleware');
const razorpayInstance = require('../config/razorpay');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const Cart = require('../models/cart.model');
const Notification = require('../models/notification.model');
const {
  createDeliveryTasksForOrder,
} = require("../services/deliveryTask.service");
const sendEmail = require('../utilsSellerPanel/sendEmail');
const { userPaymentFailed } = require('../utils/userPaymentFailed');
const Coupon = require("../models/coupon.model");
const CouponUsage = require("../models/couponUsage.model");
const { orderWithClientProducts } = require('../utils/orderWithClientProducts');
const {
  buildPaymentOrderItems,
  PRODUCT_SELECT_FOR_OFFERED_PRICE,
} = require('../utils/buildPaymentOrderItems');
const { resolveOrderPricing } = require('../utils/resolveOrderPricing');

dotenv.config();

const ORDER_PRODUCT_POPULATE_SELECT =
  'name images ' + PRODUCT_SELECT_FOR_OFFERED_PRICE;

/** Apply coupon usage once per order when pricingBreakdown includes a discount code. */
async function applyCouponUsageIfNeeded(order) {
  const code = order.pricingBreakdown?.discountCode;
  if (!code) return;
  const existing = await CouponUsage.findOne({ orderId: order._id });
  if (existing) return;
  const coupon = await Coupon.findOne({
    code: String(code).toUpperCase(),
    isActive: true,
  });
  if (!coupon) return;
  await CouponUsage.create({
    couponId: coupon._id,
    userId: order.user,
    orderId: order._id,
  });
  await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
}

/** @returns {Promise<boolean>} true if payment status transitioned to Paid */
async function markRazorpayOrderPaid(order, razorpayPaymentId) {
  if (order.paymentStatus === 'Paid') return false;
  order.paymentStatus = 'Paid';
  order.razorpayPaymentId = razorpayPaymentId;
  order.expireAt = undefined;
  await order.save();
  await applyCouponUsageIfNeeded(order);
  return true;
}

async function notifySellersNewOrder(orderId) {
  const populatedOrder = await Order.findById(orderId)
    .populate({
      path: 'products.product',
      select: ORDER_PRODUCT_POPULATE_SELECT,
    })
    .populate('products.sellerId', 'name email');
  if (!populatedOrder) return;

  const sellerNotifications = {};
  populatedOrder.products.forEach((item) => {
    if (item.sellerId) {
      const sellerId = item.sellerId._id
        ? item.sellerId._id.toString()
        : item.sellerId.toString();
      if (!sellerNotifications[sellerId]) {
        sellerNotifications[sellerId] = {
          recipient: sellerId,
          recipientModel: 'Seller',
          message: `You have a new order! Order ID: ${populatedOrder.orderId}`,
          link: `/seller/orders/${populatedOrder._id}`,
        };
      }
    }
  });

  const notificationsArray = Object.values(sellerNotifications);
  if (notificationsArray.length > 0) {
    await Notification.insertMany(notificationsArray);
  }
}

async function resolvePricingAndCoupon(req, items) {
  return resolveOrderPricing(req, items);
}

router.post('/create-order', protect, async (req, res) => {
  try {
    if (!razorpayInstance) {
      return res.status(503).json({ message: 'Razorpay is not configured' });
    }

    const items = await buildPaymentOrderItems(req);
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No Product to create order' });
    }

    const pricing = await resolvePricingAndCoupon(req, items);
    const amountPaise = Math.round(pricing.totalAmount * 100);

    const options = {
      amount: amountPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    const shippingAddress =
      req.body.shippingAddress ||
      req.body.orderData?.shippingAddress ||
      {};

    const pricingBreakdown = {
      subtotal: pricing.subtotal,
      gstPercent: pricing.gstPercent,
      gstAmount: pricing.gstAmount,
      shippingCharge: pricing.shippingCharge,
      deliveryCharge: pricing.deliveryCharge,
      discountCode: pricing.discountCode,
      discountType: pricing.discountType,
      discountValue: pricing.discountValue,
      discountAmount: pricing.discountAmount,
    };

    await Order.create({
      user: req.user._id,
      products: items,
      totalAmount: pricing.totalAmount,
      pricingBreakdown,
      paymentMethode: 'Online',
      paymentStatus: 'Pending',
      deliveryStatus: 'Pending',
      shippingAddress,
      razorpayOrderId: razorpayOrder.id,
      expireAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    res.status(200).json({
      orderId: razorpayOrder.id,
      key_id: process.env.RAZORPAY_KEY_ID,
      amount: amountPaise,
      currency: 'INR',
      discountCode: pricing.discountCode,
      discountAmount: pricing.discountAmount,
    });
  } catch (err) {
    console.error('Razorpay create order error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to create payment order',
    });
  }
});

router.delete('/cancel-pending/:razorpayOrderId', protect, async (req, res) => {
  try {
    const result = await Order.deleteOne({
      user: req.user._id,
      razorpayOrderId: req.params.razorpayOrderId,
      paymentStatus: 'Pending',
    });
    return res.status(200).json({
      success: true,
      deleted: result.deletedCount > 0,
    });
  } catch (err) {
    console.error('Cancel pending Razorpay order error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to cancel pending order',
    });
  }
});

router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } =
      req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification data' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(503).json({ message: 'Razorpay is not configured' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (order?.paymentStatus === 'Paid') {
      const populatedOrder = await Order.findById(order._id)
        .populate({
          path: 'products.product',
          select: ORDER_PRODUCT_POPULATE_SELECT,
        })
        .populate('products.sellerId', 'name email');
      return res.status(200).json(orderWithClientProducts(populatedOrder));
    }

    let transitionedToPaid = false;

    if (!order) {
      const items = await buildPaymentOrderItems(req);
      if (!items?.length) {
        return res.status(400).json({ message: 'No products for this order' });
      }

      const pricing = await resolvePricingAndCoupon(req, items);

      const newOrder = new Order({
        user: req.user._id,
        products: items,
        totalAmount: pricing.totalAmount,
        pricingBreakdown: {
          subtotal: pricing.subtotal,
          gstPercent: pricing.gstPercent,
          gstAmount: pricing.gstAmount,
          shippingCharge: pricing.shippingCharge,
          deliveryCharge: pricing.deliveryCharge,
          discountCode: pricing.discountCode,
          discountType: pricing.discountType,
          discountValue: pricing.discountValue,
          discountAmount: pricing.discountAmount,
        },
        paymentMethode: 'Online',
        paymentStatus: 'Paid',
        deliveryStatus: 'Pending',
        shippingAddress:
          orderData?.shippingAddress || req.user.defaultAddress || {},
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });
      await newOrder.save();
      order = newOrder;
      await applyCouponUsageIfNeeded(order);
      transitionedToPaid = true;

      if (
        !Array.isArray(req.body.orderData?.products) ||
        req.body.orderData?.products.length === 0
      ) {
        await Cart.findOneAndUpdate(
          { user: req.user._id },
          { items: [] },
          { new: true },
        );
      }
    } else {
      transitionedToPaid = await markRazorpayOrderPaid(
        order,
        razorpay_payment_id,
      );
      if (transitionedToPaid) {
        if (
          !Array.isArray(orderData?.products) ||
          orderData.products.length === 0
        ) {
          await Cart.findOneAndUpdate(
            { user: req.user._id },
            { items: [] },
            { new: true },
          );
        }
      }
    }

    if (transitionedToPaid) {
      await createDeliveryTasksForOrder(order);
      await notifySellersNewOrder(order._id);

      const populatedOrder = await Order.findById(order._id)
        .populate({
          path: 'products.product',
          select: ORDER_PRODUCT_POPULATE_SELECT,
        })
        .populate('products.sellerId', 'name email');

      return res.status(201).json(orderWithClientProducts(populatedOrder));
    }

    const refreshed = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });
    if (refreshed?.paymentStatus === 'Paid') {
      const populatedOrder = await Order.findById(refreshed._id)
        .populate({
          path: 'products.product',
          select: ORDER_PRODUCT_POPULATE_SELECT,
        })
        .populate('products.sellerId', 'name email');
      return res.status(200).json(orderWithClientProducts(populatedOrder));
    }

    return res.status(500).json({
      success: false,
      error: 'Order could not be finalized',
    });
  } catch (err) {
    console.error('Payment verify / create order error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Verification failed',
    });
  }
});

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers["x-razorpay-signature"];

      if (!signature) {
        return res.status(400).send("Missing Webhook Signature");
      }

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(req.body)
        .digest("hex");

      if (expectedSignature !== signature) {
        return res.status(400).send("Invalid webhook signature");
      }

      const event = JSON.parse(req.body);
      console.log(`Webhook Received Event: ${event.event}`);

      // Webhook can mark a pending Mongo order Paid when /verify never runs (e.g. client closed).
      // Raw body + skipping global JSON in app.js for this URL is required for valid HMAC.
      if (event.event === "payment.captured") {
        const payment = event.payload.payment.entity;
        const razorpay_order_id = payment.order_id;

        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

        if (order && order.paymentStatus !== 'Paid') {
          const transitioned = await markRazorpayOrderPaid(order, payment.id);
          await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

          try {
            await createDeliveryTasksForOrder(order);
          } catch (err) {
            console.error("Webhook delivery task creation error:", err.message);
          }
          if (transitioned) {
            try {
              await notifySellersNewOrder(order._id);
            } catch (err) {
              console.error("Webhook seller notification error:", err.message);
            }
          }
        }
      } else if (event.event === "payment.failed") {
        const payment = event.payload.payment.entity;
        const razorpay_order_id = payment.order_id;

        const order = await Order.findOne({
          razorpayOrderId: razorpay_order_id,
        }).populate("user", "email fullname");

        if (order) {
          const userData = order.user;
          await sendEmail({
            to: userData.email,
            subject: "Payment Failed",
            html: userPaymentFailed({
              name: userData.fullname?.firstname || "User",
              orderId: order._id,
            }),
          });
        }
      }

      return res.status(200).json({ status: "ok" });
    } catch (err) {
      console.error("Webhook error:", err);
      return res.status(500).send("Webhook error");
    }
  },
);

module.exports = router;
