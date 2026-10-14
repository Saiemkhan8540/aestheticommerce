const express=require("express");
const router= express.Router();
const { protect } = require('../Middleware/authMiddleware');
const {validateCoupon}=require("../controllers/coupon.controller")
router.post('/coupons/validate',protect,validateCoupon);
module.exports = router;