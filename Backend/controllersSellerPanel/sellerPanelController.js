// controllers/sellerPanelController.js
const {
  registerSellerService,
  onboardingCompletedSellerService,
  loginSellerService,
  getSellerProfileService,
  updateSellerProfileService,
  resentOtpService,
  forgotPasswordSellerService,
  verifyOtpService,
  verifyOtpSellerService,
  resetPasswordSellerService,
} = require("../servicesSellerPanel/sellerPanelService");

const Seller = require("../models/seller.model");

//---------REGISTER WITH OTP----------

const registerSeller = async (req, res, next) => {
  try {
    const result = await registerSellerService(req.body);
    res.status(201).json({
      success: true,
      ...result, //can use spread here but not sure Akshita
    });
  } catch (error) {
    next(error);
  }
};
//--verify otp----

const verifyOtp = async (req, res, next) => {
  try {
    const result = await verifyOtpSellerService(req.body);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

//-----forgot password seller-----
const forgotPasswordSeller = async (req, res, next) => {
  try {
    const result = await forgotPasswordSellerService(req.body);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

//-----verify otp-----
const verifyPasswordOtp = async (req, res, next) => {
  try {
    const result = await verifyOtpService(req.body);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

//-----reset password seller-----
const resetPasswordSeller = async (req, res, next) => {
  try {
    const result = await resetPasswordSellerService(req.body);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

//-----seller onboarding-----
const completeSellerOnboarding = async (req, res, next) => {
  try {
    const sellerId = req.user.id; // get sellerId from token
    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "SellerId is required",
      });
    }

    // Pass req.files for file handling
    const result = await onboardingCompletedSellerService(
      sellerId,
      req.body,
      req.files,
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// resent otp

const resentOtp = async (req, res, next) => {
  try {
    const result = await resentOtpService(req.body);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
const loginSeller = async (req, res) => {
  try {
    console.debug("This is the login seller controller");
    const result = await loginSellerService(req.body);
    console.debug(result); //added by akshita to debug
    res.status(200).json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET PROFILE (Protected)
const getSellerProfile = async (req, res) => {
  try {
    // Debug log (optional)
    // console.log("req.user:", req.user);

    // Authentication check
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated. Please login first.",
      });
    }

    const sellerId = req.user._id;

    const result = await getSellerProfileService(sellerId);

    res.status(200).json({
      success: true,
      seller: result,
    });
  } catch (error) {
    console.error("Error in getSellerProfile:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE PROFILE (Protected)
const updateSellerProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated. Please login first.",
      });
    }

    const sellerId = req.user._id;
    const updateData = { ...req.body };

    // Parse nested JSON strings if present
    if (
      typeof updateData.businessAddress === "string" &&
      updateData.businessAddress
    ) {
      try {
        updateData.businessAddress = JSON.parse(updateData.businessAddress);
      } catch (e) {
        // ignore
      }
    }
    if (typeof updateData.bankDetails === "string" && updateData.bankDetails) {
      try {
        updateData.bankDetails = JSON.parse(updateData.bankDetails);
      } catch (e) {
        // ignore
      }
    }

    // Fetch existing seller to preserve fields not being updated
    const existingSeller = await Seller.findById(sellerId);
    if (!existingSeller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Handle Aadhar: prefer sent value, fall back to existing
    if (!updateData.aadharNumber && !updateData.aadharFile) {
      updateData.aadharNumber = existingSeller.aadharNumber || "NOT PROVIDED";
      updateData.aadharFile = existingSeller.aadharFile || null;
    }

    // Handle PAN: prefer sent value, fall back to existing
    if (!updateData.panNumber && !updateData.panFile) {
      updateData.panNumber = existingSeller.panNumber || "NOT PROVIDED";
      updateData.panFile = existingSeller.panFile || null;
    }

    if (updateData.storeName !== undefined) {
      updateData.storeName = String(updateData.storeName).trim();
      if (!updateData.storeName) {
        return res.status(400).json({
          success: false,
          message: "Store name is required",
        });
      }

      const duplicateStore = await Seller.findOne({
        storeName: updateData.storeName,
        _id: { $ne: sellerId },
      });
      if (duplicateStore) {
        return res.status(400).json({
          success: false,
          message: "Store name is already taken",
        });
      }
    }

    // Perform direct DB update
    const updatedSeller = await Seller.findByIdAndUpdate(
      sellerId,
      { $set: updateData },
      { new: true, runValidators: false }, // disable validators to allow "NOT PROVIDED"
    );

    res.status(200).json({
      success: true,
      seller: updatedSeller,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error in updateSellerProfile:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
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
};
