const express = require("express");
const multer = require("multer");
const uploadToS3 = require("../utils/s3Upload");
const { registerSeller, loginSeller, getSellerProfile, updateSellerProfile, verifyOtp,
  completeSellerOnboarding, } = require("../controllersSellerPanel/sellerPanelController");
const { protectSeller } = require("../MiddlewareSellerPanel/sellerPanelauthMidWar");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

//step 1 register seller 
router.post('/register',registerSeller);

// verify seller otp
router.post('/verify-otp',verifyOtp);

//step 2 , onboarding 
router.post('/onboarding',
  
  upload.fields[{
    name:"aadharFile",maxCount:1
  },
  {name:"panFile",maxCount:1}
],
completeSellerOnboarding);



// POST /api/seller/login
router.post("/login", loginSeller);

// GET /api/seller/profile - Protected
router.get("/profile", protectSeller, getSellerProfile);

// PUT /api/seller/profile - Protected with optional file uploads
router.put("/profile", protectSeller, upload.fields([
  { name: "aadharFile", maxCount: 1 },
  { name: "panFile", maxCount: 1 }
]), async (req, res) => {
  try {
    if (req.files?.aadharFile && req.files.aadharFile[0]) {
      const file = req.files.aadharFile[0];
      const aadharResult = await uploadToS3(file.buffer, "SellerVerification/Aadhar", {
        contentType: file.mimetype,
        originalName: file.originalname,
      });
      req.body.aadharFile = aadharResult.secure_url;
    }

    if (req.files?.panFile && req.files.panFile[0]) {
      const file = req.files.panFile[0];
      const panResult = await uploadToS3(file.buffer, "SellerVerification/PAN", {
        contentType: file.mimetype,
        originalName: file.originalname,
      });
      req.body.panFile = panResult.secure_url;
    }

    await updateSellerProfile(req, res);
  } catch (error) {
    console.error("Update profile route error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Update failed",
    });
  }
});

module.exports = router;