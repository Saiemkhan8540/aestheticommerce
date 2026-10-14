const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
  //---------------basic information----------------------
  sellerName: { type: String, trim: true },
  storeName: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, required: true, unique: true, trim: true },
  bio: { type: String, trim: true },
  role: { type: String, default: "seller" },
  status: { type: String, enum: ["pending", "approved", "suspended", "rejected"], default: "pending" },
  isBlocked: { type: Boolean, default: false },

  //------------Business Details--------------------------
  businessType: {
    type: String,
    enum: ["individual", "partnership", "private_limited", "other"],
    default: "individual",
  },
  gstNumber: {
    type: String,
  },
  registrationNumber: {
    type: String,
  },
  businessAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },

  //-----------------Banking and payment details-------
  bankDetails: {
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
    accountHolderName: { type: String, trim: true },
    upiId: { type: String, trim: true }
  },

  //------------Verification--------------------

  governmentIdProof: String,
  aadharNumber: { type: String, trim: true },
  aadharFile: { type: String, trim: true }, // S3 / CloudFront URL
  panNumber: { type: String, trim: true },
  panFile: { type: String, trim: true }, // S3 / CloudFront URL
  addressProof: { type: String, trim: true },
  verificationStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },


  // ---------------- Tracking ----------------------
  totalProducts: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  ratings: { type: Number, default: 0 },

  // step 1 , Otp+ email verified status
  isEmailVerified: { type: Boolean, default: false },
  emailOtp: { type: String, default: null, select: false },
  otpExpiresAt: { type: Date, default: null },

  // Link back to Orders
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],




  // Step 2: Onboarding Tracking
  onboardingCompleted: { type: Boolean, default: false },

  // Date joined
  dateJoined: { type: Date, default: Date.now },


},

);
module.exports = mongoose.model("Seller", sellerSchema);


