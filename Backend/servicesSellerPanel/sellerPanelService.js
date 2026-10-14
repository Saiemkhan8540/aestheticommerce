// services/sellerPanelService.js
const Seller = require("../models/seller.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");
const Notification = require("../models/notification.model");
const sendEmail = require("../utilsSellerPanel/sendEmail");
const AppError = require("../utilsSellerPanel/AppError");
const { sellerVerifyTemplate } = require("../utilsSellerPanel/sellerVerifyTemplate");
const asyncHandler = require("../utils/asyncHandler");
const { forgotPasswordTemplet } = require("../utils/forgotPasswordTemplet");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

//---------REGISTER USER ---------
const registerSellerService = async (sellerData) => {
  const { email, password } = sellerData;
  const phone = sellerData.phone.trim();
  if (!phone || !email || !password)
    throw new AppError("all fields are required", 400);

  //phone number validation
  if (!/^\d{10}$/.test(phone)) {
    throw new AppError("Phone number must be 10 digits", 400);
  }

  //existing seller
  const existedEmail = await Seller.findOne({
    email: email.trim().toLowerCase(),
  });
  if (existedEmail) {
    throw new AppError("Seller already exists with this email", 409);
  }

  const existedPhone = await Seller.findOne({ phone: phone.trim() });
  console.log("alreday existing phone");
  if (existedPhone) {
    throw new AppError("Seller already exists with this phone", 409);
  }

  //hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  //otp generation
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const seller = await Seller.create({
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    phone,
    emailOtp: otp,
    otpExpiresAt: Date.now() + 5 * 60 * 1000, // valid for 5 minutes
  });
  console.log(otp);

  //send email to user
  await sendEmail({
    to: email,
    subject: "Seller Account Verification Code",
    //   html: `
    //   <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
    //     <h2 style="color: #4CAF50;">Your One-Time Password (OTP)</h2>
    //     <p>Hi there,</p>
    //     <p>Use the following OTP to verify your email address. This OTP is valid for <strong>5 minutes</strong> only.</p>
    //     <h3 style="background: #f2f2f2; padding: 10px; display: inline-block; letter-spacing: 3px;">${otp}</h3>
    //     <p>If you did not request this, please ignore this email.</p>
    //     <br>
    //     <p>Thanks,<br><strong>Aestheticommerce</strong></p>
    //   </div>
    // `,
    html: sellerVerifyTemplate({ otp }),
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  });

  return {
    sellerId: seller._id,
    message: "OTP sent to email",
  };
};

//--------------VERIFY OTP ----------------
const verifyOtpSellerService = async ({ sellerId, emailOtp }) => {
  if (!sellerId || !emailOtp)
    throw new AppError("SellerId and EmailOtp required", 400);

  const seller = await Seller.findById(sellerId).select("+emailOtp +otpExpiresAt");

  if (!seller) throw new AppError("Seller does not exist", 404);

  if (!seller.emailOtp || !seller.otpExpiresAt) {
    throw new AppError("OTP not found or already verified", 409);
  }

  if (seller.otpExpiresAt < Date.now())
    throw new AppError("OTP Expired", 403);
  //verify otp
  if (seller.emailOtp !== emailOtp.trim())
    throw new AppError("Invalid OTP", 400);

  seller.isEmailVerified = true;
  seller.emailOtp = null;
  seller.otpExpiresAt = null;
  const token = generateToken(seller._id);

  await seller.save();

  return {
    message: "Email verified successfully",
    isEmailVerified: true,
    token,
  };
};

//--------------FORGOT PASSWORD----------------
const forgotPasswordSellerService = async ({ email }) => {
  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const seller = await Seller.findOne({ email: email.trim().toLowerCase() });
  if (!seller) {
    throw new AppError("Seller with this email does not exist", 404);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expireTime = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

  const update = await Seller.findByIdAndUpdate(seller._id, {
    emailOtp: otp,
    otpExpiresAt: expireTime,
  },
    { new: true }
  );
  await sendEmail({
    to: seller.email,
    subject: "Password Reset OTP",
    html: forgotPasswordTemplet({ name: seller.sellerName, otp }),
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`
  })
  console.log("Forgot Password OTP:- ", update);
  return {
    message: "OTP sent to email",
    seller: update,
  }

}

const verifyOtpService = async ({ email, otp }) => {
  if (!email || !otp) {
    throw new AppError("Email and OTP are required", 400);
  }

  const seller = await Seller.findOne({ email: email.trim().toLowerCase() }).select("+emailOtp +otpExpiresAt");;
  if (!seller) {
    throw new AppError("Seller with this email does not exist", 404);
  }

  if (seller.emailOtp !== otp.trim() || seller.otpExpiresAt < Date.now()) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  const updateSeller = await Seller.findByIdAndUpdate(seller._id, {
    emailOtp: null,
    // Keep otpExpiresAt intact so the reset password window remains open
  },
    { new: true }
  );

  const token = await generateToken(updateSeller._id);

  console.log("Verify OTP result:- ", updateSeller, " | token:- ", token);

  return {
    message: "OTP verified successfully",
    seller: updateSeller,
    token,
  }

}

const resetPasswordSellerService = async ({ email, newPassword }) => {
  if (!email || !newPassword) {
    throw new AppError("Email and newPassword are required", 400);
  }

  const seller = await Seller.findOne({ email: email.trim().toLowerCase() }).select("+emailOtp +otpExpiresAt");
  if (!seller) {
    throw new AppError("Seller with this email does not exist", 404);
  }

  // Require that OTP has been verified (emailOtp should be null)
  if (seller.emailOtp !== null) {
    throw new AppError("OTP verification required before password reset", 403);
  }

  // Require that the reset window is still valid
  if (!seller.otpExpiresAt || Number(seller.otpExpiresAt) < Date.now()) {
    throw new AppError(
      "Password reset session expired. Please request a new OTP.",
      400
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  seller.password = hashedPassword;
  seller.otpExpiresAt = null; // Close the reset window
  await seller.save();

  return {
    message: "Password reset successfully",
  }
}


//-----------------------Step 2 ONBOARDING ------------
const onboardingCompletedSellerService = async (sellerId, sellerData) => {
  console.log("hello");
  const seller = await Seller.findById(sellerId);
  console.log(seller.sellerId);
  if (!seller) throw new AppError("Seller does not Exist", 404);

  if (!seller.isEmailVerified) throw new AppError("Email not verified", 403);

  if (seller.isBlocked) throw new AppError("Seller is Blocked ", 403);

  if (seller.onboardingCompleted)
    throw new AppError("Onboarding is already done", 409);
  if (!sellerData.sellerName || !sellerData.storeName) {
    throw new AppError("Seller name and Store name are required", 400);
  }

  //Handle aadhar details  of  seller
  const aadharNumber = sellerData.aadharNumber?.trim()
    ? sellerData.aadharNumber
    : "NOT PROVIDED";
  const aadharFile = sellerData.aadharFile?.trim()
    ? sellerData.aadharFile
    : null;

  //Handle pan details of seller
  const panNumber = sellerData.panNumber?.trim()
    ? sellerData.panNumber
    : "NOT PROVIDED";
  const panFile = sellerData.panFile?.trim() ? sellerData.panFile : null;

  //------basic information
  console.log("sellerData in onboarding service:- ", sellerData);
  seller.sellerName = sellerData.sellerName?.trim();
  seller.storeName = sellerData.storeName?.trim();
  seller.bio = sellerData.bio?.trim();
  seller.role = sellerData.role || "seller";
  seller.status = "pending"; //admin approval required

  // Business details
  seller.businessType = sellerData.businessType || "individual";
  seller.gstNumber = sellerData.gstNumber || "";
  seller.registrationNumber = sellerData.registrationNumber || "";
  seller.businessAddress = {
    street: sellerData.street || "",
    city: sellerData.city || "",
    state: sellerData.state || "",
    country: sellerData.country || "",
    postalCode: sellerData.postalCode || "",
  };

  //--bank details
  seller.bankDetails = {
    ...seller.bankDetails,
    accountNumber: sellerData.accountNumber || "",
    accountHolderName: sellerData.accountHolderName || "",
    ifscCode: sellerData.ifscCode || "",
    upiId: sellerData.upiId || "",
  };

  //--verification

  ((seller.aadharNumber = aadharNumber),
    (seller.aadharFile = aadharFile),
    (seller.panNumber = panNumber),
    (seller.panFile = panFile),
    (seller.addressProof = sellerData.addressProof || ""),
    (seller.verificationStatus = "pending"));

  // -------- Onboarding Flags
  seller.onboardingCompleted = true;

  await seller.save();

  // Notify all admins
  const admins = await Admin.find({});
  const notifications = admins.map((admin) => ({
    recipient: admin._id,
    recipientModel: "Admin",
    message: `New seller registered: ${seller.sellerName || seller.email}`,
    link: `/admin/sellers/${seller._id}`,
  }));
  await Notification.insertMany(notifications);

  // const token = generateToken(seller._id);

  return {
    message: "Onboarding completed successfully. Awaiting admin approval.",
    sellerId: seller._id,
  };
};

// --------------- RESEND OTP FEATURE----------------------------------
const resentOtpService = async ({ email }) => {
  if (!email) throw new AppError("Email is required", 400);

  const seller = await Seller.findOne({ email });
  if (!seller) throw new AppError("Seller not found", 404);

  if (seller.isEmailVerified)
    throw new AppError("Email is already verified", 409);

  const otpExpiry = Number(seller.otpExpiresAt);

  if (otpExpiry && otpExpiry >= Date.now()) {
    throw new AppError("Please wait before requesting another OTP", 400);
  }

  const otp = Math.floor(Math.random() * 900000 + 100000);
  seller.emailOtp = otp.toString();
  seller.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await seller.save();
  await sendEmail({
    to: seller.email,
    subject: "Your new OTP code",
    html: `
      <div style="font-family: Arial;">
        <h2>New OTP</h2>
        <p>Your new OTP is:</p>
        <h3>${otp}</h3>
        <p>Valid for 5 minutes.</p>
      </div>
    `,
    text: `Your OTP is ${otp}. Valid for 5 minutes.`,
  });
  return {
    message: "OTP resent successfully",
  };
};

// LOGIN

const loginSellerService = async ({ email, password }) => {
  // Validate input
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Find seller by email
  const seller = await Seller.findOne({ email: { $eq: email } }).select(
    "+password",
  );
  if (!seller) {
    throw new Error("Invalid email or password");
  }

  //if user is not verified so can not logged in
  // TODO: Uncomment this when email verification is implemented
  // if(!seller.isEmailVerified) throw new Error("Email not verified. Please verify OTP first.");

  // Check password
  const isMatch = await bcrypt.compare(password, seller.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Remove password from response
  console.log("Seller login successful, generating token...", seller);
  const sellerResponse = seller.toObject();
  delete sellerResponse.password;
  console.log("Seller login successful, generating token...", sellerResponse);

  return {
    seller: sellerResponse,
    token: generateToken(seller._id),
    onboardingCompleted: seller.onboardingCompleted || false,
  };
};

// GET PROFILE
const getSellerProfileService = async (sellerId) => {
  console.log("Getting seller profile for ID:", sellerId);

  if (!sellerId) {
    throw new Error("Seller ID is required");
  }

  const seller = await Seller.findById(sellerId).select("-password");
  if (!seller) {
    throw new Error("Seller not found");
  }

  return seller;
};

// UPDATE PROFILE
const updateSellerProfileService = async (sellerId, updateData) => {
  if (!sellerId) {
    throw new Error("Seller ID is required");
  }

  // Find seller
  const seller = await Seller.findById(sellerId);
  if (!seller) {
    throw new Error("Seller not found");
  }

  // Update fields - handle nested objects properly
  if (updateData.sellerName) {
    seller.sellerName = updateData.sellerName;
  }
  if (updateData.email) {
    seller.email = updateData.email;
  }
  if (updateData.phone) {
    seller.phone = updateData.phone;
  }
  if (updateData.bio !== undefined) {
    seller.bio = updateData.bio;
  }
  if (updateData.gstNumber !== undefined) {
    seller.gstNumber = updateData.gstNumber;
  }

  // Update business address (merge with existing)
  if (updateData.businessAddress) {
    seller.businessAddress = {
      ...seller.businessAddress,
      ...updateData.businessAddress,
    };
  }

  // Update bank details (merge with existing)
  if (updateData.bankDetails) {
    seller.bankDetails = {
      ...seller.bankDetails,
      ...updateData.bankDetails,
    };
  }

  // Save the updated seller
  const updatedSeller = await seller.save();

  // Remove password from response
  const sellerResponse = updatedSeller.toObject();
  delete sellerResponse.password;

  return sellerResponse;
};

module.exports = {
  registerSellerService,
  verifyOtpSellerService,
  onboardingCompletedSellerService,
  loginSellerService,
  getSellerProfileService,
  updateSellerProfileService,
  resentOtpService,
  forgotPasswordSellerService,
  verifyOtpService,
  resetPasswordSellerService,
};
