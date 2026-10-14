const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controllers");
const {protect} = require("../Middleware/authMiddleware")
const { body } = require("express-validator");
const multer = require("multer");
const path = require("path");


// I should remove this from here 

// ====== Multer Setup for Image Uploads ======
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // Folder to save uploaded images
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname); // Unique file name using timestamp
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 50 * 1024 * 1024 }, // Max size: 50MB
//   fileFilter: function (req, file, cb) {
//     const filetypes = /jpeg|jpg|png|webp/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);

//     if (extname && mimetype) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only images (jpeg, jpg, png, webp) are allowed"));
//     }
//   },
// });

// Memory storage for S3 uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
  fileFilter: (req, file, cb) => {
  const allowedMimetypes=[
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",    // iPhone photos
    "image/heif",    //iphoen photos
    ];
    if(allowedMimetypes.includes(file.mimetype)){
      cb(null,true);
    }else{
      cb(new Error(`Format not supported. Please upload JPG, PNG, or WEBP.`))
    }

  }

  
   
   

    
});

// ===== Routes =====

// Register route
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
  ],
  userController.registerUser
);

// Login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  userController.loginUser
);

// Get user profile
router.get('/profile', protect, userController.userProfile);


//forgot password route
router.post(
  "/forgot-password",
  [
    body("email").isEmail().withMessage("Invalid email"),
  ],
  userController.forgotPasswordController
);

//verify otp route
router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  ],
  userController.verifyOtpController
)

//reset password route
router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
  ],
  userController.resetPasswordController
)

//update avatar route
router.put('/avatar',protect ,upload.single('avatar'),userController.updateAvatar);

router.put('/update-profile',protect,userController.updateUserProfile);


module.exports = router;
