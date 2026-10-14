const userModel = require('../models/user.model');
const userService = require('../services/user.services');
const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utilsSellerPanel/sendEmail');
const { forgotPasswordTemplet } = require('../utils/forgotPasswordTemplet');
const AppError = require('../utilsSellerPanel/AppError');
const uploadToS3 = require("../utils/s3Upload");
const { default: mongoose } = require('mongoose');

//handle User registration 
module.exports.registerUser = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(404).json({ errors: error.array() });
  }

  console.log(req.body); // remove this later email , first name , password 
  const { fullname, email, password } = req.body;

  if (!fullname || !fullname.firstname || !fullname.lastname) {
    return res.status(400).json({ message: 'Fullname fields are required' });
  }

  const { firstname, lastname } = fullname;
  const hashedPassword = await userModel.hashPassword(password); //Hashing Password
  console.log(hashedPassword);//just to check by akshita 

  const user = await userService.createUser({
    firstname,
    lastname,
    email,
    password: hashedPassword,
  });

  const token = await user.generateAuthToken(); //Token genration
  res.status(201).json({ token, user });
};

//handle User login
module.exports.loginUser = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(404).json({ errors: error.array() });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await userModel.findOne({ email }).select('+password'); 

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isMatch = await user.comparePassword(password); // comparing password // doubt how it is calling usermodel -- c
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = await user.generateAuthToken(); // Genrating token -- session problem in website 
  console.log(token)//changes made by akshita  
  res.status(200).json({ token, user });
};

//handle User profile
module.exports.userProfile = (req, res) => {
  if (!req.user) {
    return res.status(404).json({ success: false, user: null });
  }
  res.status(200).json({
    success: true,
    user: req.user
  });
};

module.exports.forgotPasswordController = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if(!email){
    return next(new AppError("Please provide your registered email",400));
  }

  const user = await userModel.findOne({ email });

  if(!user){
    return next(new AppError("User with this email does not exist",404));
  }

  // Generate OTP and send email logic here
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6 digit OTP
  const expireTime = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

  const update = await userModel.findByIdAndUpdate(user._id, {
    forgot_password_otp: otp,
    forgot_password_expiry: expireTime
  },
  { new: true });

  
  await sendEmail({
    to: user.email,
    subject: "Password Reset OTP",
    html: forgotPasswordTemplet({
      name: user.fullname.firstname,
      otp: otp
    })
  })
  
  // await update.save(); // Save the OTP and expiry to the database
  res.status(200).json({
    message: "OTP sent to your email",
    user: update,
    success: true,
  })

});

module.exports.verifyOtpController = asyncHandler(async(req,res,next)=>{
  const { email, otp } = req.body;
  
  if(!email || !otp){
    return next(new AppError("Email and OTP are required",400));
  }

  const user = await userModel.findOne({ email });

  if(!user){
    return next(new AppError("User with this email does not exist",404));
  }

  if(user.forgot_password_otp !==otp || user.forgot_password_expiry < Date.now()){
    return next(new AppError("Invalid or expired OTP",400));
  }

  const updateUser = await userModel.findByIdAndUpdate(user._id,{
    forgot_password_otp: null,
    forgot_password_expiry: null,
  },
  { new: true }
);

  // await updateUser.save(); // Clear OTP and expiry from database
  const token = await user.generateAuthToken(); // Genrating token for password reset session
  console.log("Token generated after OTP verification:- ", token);

  return res.status(200).json({
    message: "OTP verified successfully",
    success: true,
    token,
    user: updateUser,
  })

})

module.exports.resetPasswordController = asyncHandler(async(req,res,next)=>{
  const { email,newPassword,confirmPassword } = req.body;
  
  if(newPassword !== confirmPassword){
    return next(new AppError("New password and confirm password do not match",400));
  }

  if(!email || !newPassword){
    return next(new AppError("Email and new password are required",400));
  }

  const user = await userModel.findOne({ email });

  if(!user){
    return next(new AppError("User with this email does not exist",404));
  }

  const hashPassword = await userModel.hashPassword(newPassword);

  const updateUser = await userModel.findByIdAndUpdate(user._id, {
    password: hashPassword,
    forgot_password_otp: null,
    forgot_password_expiry: null,
  })

  res.status(200).json({
    message: "Password reset successful",
    success: true,
  })
});
module.exports.updateAvatar = asyncHandler(async (req, res, next) => {
  console.log("req file",req.file);
  console.log("req.user",req.user);
  if (!req.user) {
    return next(new AppError("User not found", 404));
  }

  if (!req.file) {
    return next(new AppError("No file uploaded", 400));
  }

  try {
    const result = await uploadToS3(req.file.buffer, "avatars", {
      contentType: req.file.mimetype,
      originalName: req.file.originalname,
    });

    // Update user avatar in DB
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      avatar: updatedUser.avatar
    });

  } catch (error) {
      console.log("S3 upload error:", error);
    next(new AppError("Failed to upload avatar", 500));
  }
});

//To update user details 

module.exports.updateUserProfile= asyncHandler(async(req,res,next)=>{
   if(!req.user){
    return next(new AppError("User not found",404));
   }
   const {firstname,lastname,email,phone,country, city, postalCode}=req.body;
   const updateData={};
   if(firstname) updateData["fullname.firstname"]=firstname;
   if(lastname) updateData["fullname.lastname"]=lastname;
   if(email) updateData.email=email;
  if (phone) updateData.phone = phone;
  if (country) updateData["address.country"] = country;
  if (city) updateData["address.city"] = city;
  if (postalCode) updateData["address.postalCode"] = postalCode;

  const updateUser= await userModel.findByIdAndUpdate(
    req.user._id,
    updateData,
    {new :true}
  );
   res.status(200).json({
     success: true,
    message: "Profile updated successfully",
    user: updateUser
   })


})
