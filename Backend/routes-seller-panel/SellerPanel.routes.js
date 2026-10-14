const express = require("express");
const multer = require("multer");
const uploadToS3 = require("../utils/s3Upload");
const Product = require("../models/product.model");
const { body } = require("express-validator");

const {
  registerSeller,
  loginSeller,
  getSellerProfile,
  updateSellerProfile,
  verifyOtp,
  completeSellerOnboarding,
  resentOtp,
  forgotPasswordSeller,
  verifyPasswordOtp,
  resetPasswordSeller,
} = require("../controllersSellerPanel/sellerPanelController");

const {protectSeller}  = require("../MiddlewareSellerPanel/sellerPanelauthMidWar");

const router = express.Router();

/* ========== MULTER SETUP ========== */
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ========== STEP 1: REGISTER SELLER ========== */
router.post("/register", registerSeller);

/* ========== VERIFY OTP ========== */
router.post("/verify-otp", verifyOtp);

/* ========== STEP 2: ONBOARDING (FILES + DATA) ========== */
router.post(
  "/onboarding",
  protectSeller,
  
  upload.fields([
    { name: "aadharFile", maxCount: 1 },
    { name: "panFile", maxCount: 1 },
  ]),
  async (req, res,next) => {
    try {
      if (req.files?.aadharFile?.[0]) {
        const file = req.files.aadharFile[0];
        const result = await uploadToS3(file.buffer, "SellerVerification/Aadhar", {
          contentType: file.mimetype,
          originalName: file.originalname,
        });
        req.body.aadharFile = result.secure_url;
      }

      if (req.files?.panFile?.[0]) {
        const file = req.files.panFile[0];
        const result = await uploadToS3(file.buffer, "SellerVerification/PAN", {
          contentType: file.mimetype,
          originalName: file.originalname,
        });
        req.body.panFile = result.secure_url;
      }

      await completeSellerOnboarding(req, res,next);
    } catch (error) {
      next(error);
    }
  }
);
/* ========== RESENT OTP ========== */
router.post('/resent-otp',resentOtp)

/* ========== LOGIN ========== */
router.post("/login", loginSeller);

/* ========== GET PROFILE ========== */
router.get("/profile", protectSeller, getSellerProfile);

/* ========== UPDATE PROFILE (OPTIONAL FILES) ========== */
router.put(
  "/profile",
  protectSeller,
  upload.fields([
    { name: "aadharFile", maxCount: 1 },
    { name: "panFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (req.files?.aadharFile?.[0]) {
        const file = req.files.aadharFile[0];
        const result = await uploadToS3(file.buffer, "SellerVerification/Aadhar", {
          contentType: file.mimetype,
          originalName: file.originalname,
        });
        req.body.aadharFile = result.secure_url;
      }

      if (req.files?.panFile?.[0]) {
        const file = req.files.panFile[0];
        const result = await uploadToS3(file.buffer, "SellerVerification/PAN", {
          contentType: file.mimetype,
          originalName: file.originalname,
        });
        req.body.panFile = result.secure_url;
      }

      await updateSellerProfile(req, res);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* ========== SELLER PRODUCTS ========== */
router.get("/products", protectSeller, async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ========== SELLER FORGOT PASSWORD ========== */
router.post("/forgot-password",
  [
    body("email").isEmail().withMessage("Invalid email"),
  ],
  forgotPasswordSeller
)

router.post("/verify-password-otp",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  ],
  verifyPasswordOtp
)

router.post("/reset-password",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  resetPasswordSeller
)


module.exports = router;
