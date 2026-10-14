const Coupon = require("../models/coupon.model");
const CouponUsage = require("../models/couponUsage.model");
const { GST_PERCENT, GST_RATE } = require("./pricingConstants");

function extractDiscountCode(req) {
  return (
    req.body.discountCode ||
    req.body.pricingBreakdown?.discountCode ||
    req.body.orderData?.discountCode ||
    req.body.orderData?.pricingBreakdown?.discountCode ||
    null
  );
}

async function resolveOrderPricing(req, items) {
  const subtotal = Number(
    items.reduce((sum, it) => sum + it.price * it.quantity, 0).toFixed(2),
  );
  const deliveryCharge = 0;
  const shippingCharge = 0;
  const gstAmount = Number((subtotal * GST_RATE).toFixed(2));
  let discountAmount = 0;
  let discountCode = null;
  let discountType = null;
  let discountValue = 0;

  const code = extractDiscountCode(req);
  let appliedCoupon = null;

  if (code) {
    appliedCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });
  }

  if (appliedCoupon) {
    const isExpired =
      appliedCoupon.expiresAt && new Date() > appliedCoupon.expiresAt;
    const isLimitReached =
      appliedCoupon.maxUsesTotal &&
      appliedCoupon.usedCount >= appliedCoupon.maxUsesTotal;
    const userUsageCount = await CouponUsage.countDocuments({
      couponId: appliedCoupon._id,
      userId: req.user._id,
    });
    const isUserLimitReached =
      userUsageCount >= appliedCoupon.maxUsesPerUser;

    if (!isExpired && !isLimitReached && !isUserLimitReached) {
      discountCode = appliedCoupon.code;
      discountType = appliedCoupon.type;
      discountValue = appliedCoupon.value;
      discountAmount =
        appliedCoupon.type === "flat"
          ? appliedCoupon.value
          : (subtotal * appliedCoupon.value) / 100;
      discountAmount = Math.min(discountAmount, subtotal);
    }
  }

  const totalAmount = Number(
    (
      subtotal +
      gstAmount +
      shippingCharge +
      deliveryCharge -
      discountAmount
    ).toFixed(2),
  );

  return {
    subtotal,
    gstAmount,
    gstPercent: GST_PERCENT,
    deliveryCharge,
    shippingCharge,
    discountAmount,
    discountCode,
    discountType,
    discountValue,
    totalAmount,
  };
}

module.exports = {
  resolveOrderPricing,
  extractDiscountCode,
};
