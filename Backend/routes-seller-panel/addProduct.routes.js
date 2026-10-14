const express = require("express");
const multer = require("multer");
const uploadToS3 = require("../utils/s3Upload");
const Product = require("../models/product.model");
const Category = require("../models/category.model"); // added
const { protectSeller } = require("../MiddlewareSellerPanel/sellerPanelauthMidWar");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/products - protected
router.post("/", protectSeller, upload.fields([
  { name: "images", maxCount: 5 },
  { name: "productVideo", maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("--- New Product Submission ---");
    console.log("Body:", req.body);
    console.log("Files received:", Object.keys(req.files || {}));
    if (req.files && req.files.images) {
      console.log(`Images count: ${req.files.images.length}`);
    }
    if (req.files && req.files.productVideo) {
      console.log("Video received:", {
        originalname: req.files.productVideo[0].originalname,
        mimetype: req.files.productVideo[0].mimetype,
        size: req.files.productVideo[0].size
      });
    } else {
      console.log("No video received in this request.");
    }

    const {
      name,
      description,
      sellingPrice,
      discountPercentage,
      tags,
      rating,
      inStock,
      platformFee, // optional from frontend
    } = req.body;

    // Add the trimmed category and subcategory right here:
    const category = req.body.category?.trim();
    const subcategory = req.body.subcategory?.trim();

    const sellerId = req.user._id;

    // Fees defaults
    const logisticsFee = 60;
    const transactionFee = 10;
    const platformFeeNum = Number(platformFee || 0);
    const sellingPriceNum = Number(sellingPrice || 0);
    const discountNum = Number(discountPercentage || 0);

    // CALCULATE MRP
    const calculatedPrice = sellingPriceNum + logisticsFee + transactionFee + platformFeeNum;
    const discountAmount = (calculatedPrice * discountNum) / 100;
    const mrp = calculatedPrice + discountAmount;

    // Upload images
    let imageUrls = [];
    if (req.files && req.files.images) {
      console.log("Uploading images to S3...");
      imageUrls = await Promise.all(
        req.files.images.map(async (file) => {
          const result = await uploadToS3(file.buffer, "SellerProducts", {
            contentType: file.mimetype,
            originalName: file.originalname,
          });
          return result.secure_url;
        })
      );
    }

    // Upload video
    let videoUrl = "";
    if (req.files && req.files.productVideo) {
      const videoFile = req.files.productVideo[0];
      
      // Validation: format
      const allowedFormats = ["video/mp4", "video/webm", "video/quicktime"]; // quicktime is .mov
      if (!allowedFormats.includes(videoFile.mimetype)) {
        return res.status(400).json({ message: "Invalid video format. Supported: mp4, webm, mov" });
      }

      // Validation: size (up to 20MB)
      const minSize = 0;
      const maxSize = 20 * 1024 * 1024;
      if (videoFile.size < minSize || videoFile.size > maxSize) {
        console.log(`Video size validation failed: ${videoFile.size} bytes. Required: 0-${maxSize}`);
        return res.status(400).json({ message: "Video size must be up to 20MB" });
      }

      console.log("Uploading video to S3...");
      const videoResult = await uploadToS3(videoFile.buffer, "SellerProducts", {
        contentType: videoFile.mimetype,
        originalName: videoFile.originalname,
      });
      videoUrl = videoResult.secure_url;
      console.log("Video uploaded successfully. URL:", videoUrl);
    }

    // Parse tags
    let parsedTags = [];
    try {
      parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
    } catch {
      parsedTags = Array.isArray(tags) ? tags : [];
    }

    // Process Category, Subcategory, and Tags dynamically
    if (category) {
      // Find or create category
      let catDoc = await Category.findOne({ name: category });
      if (!catDoc) {
        catDoc = new Category({ name: category, subcategories: [] });
      }

      if (subcategory) {
        // Find or create subcategory
        let subcatDoc = catDoc.subcategories.find(
          (s) => s.name === subcategory
        );
        if (!subcatDoc) {
          catDoc.subcategories.push({
            name: subcategory,
            keywords: parsedTags || [],
          });
        } else {
          // Merge new tags into existing subcategory keywords
          if (Array.isArray(parsedTags)) {
            const currentKeywords = new Set(subcatDoc.keywords || []);
            parsedTags.forEach((tag) => currentKeywords.add(tag));
            subcatDoc.keywords = Array.from(currentKeywords);
            catDoc.markModified("subcategories");
          }
        }
      }

      // Save the dynamically created/updated category record
      await catDoc.save();
    }

    // Create product
    const newProduct = new Product({
      name,
      description,
      sellingPrice: sellingPriceNum,
      discountPercentage: discountNum,
      mrp,
      platformFee: platformFeeNum,
      logisticsFee,
      transactionFee,
      category,
      subcategory: subcategory || "",
      tags: parsedTags,
      rating: parseInt(rating) || 1,
      inStock: parseInt(inStock) || 0,
      sellerId,
      images: imageUrls,
      productVideo: videoUrl,
    });

    console.log("Saving product to DB:", newProduct);
    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Product uploaded successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: "Server error during product upload",
      error: error.message,
    });
  }
});

module.exports = router;