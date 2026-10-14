const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controllers");
const {protect} = require("../Middleware/authMiddleware")
const { body } = require("express-validator");
const multer = require("multer");
const path = require("path");

// === Multer Setup for Image Uploads (buffer for S3)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // Max size: 15MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images (jpeg, jpg, png, webp) are allowed"));
    }
  },
});


// Routes

// Create blog (with image upload)
router.post(
  "/blog",
  upload.single("image"),
  [
    body("title").isLength({ min: 3 }).withMessage("Title must be at least 3 characters long"),
    body("content").isLength({ min: 3 }).withMessage("Content must be at least 3 characters long"),
    body("author").isLength({ min: 3 }).withMessage("Author must be at least 3 characters long"),
  ],
  blogController.createBlog
);

// Get all blogs
router.get("/blogs", blogController.getBlogs);

// Get blog by ID
router.get("/blogs/:id", blogController.getBlog);

module.exports = router;