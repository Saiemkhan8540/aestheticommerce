// routes/productInfo.routes.js
const express = require("express");
const Product = require("../models/product.model");
const {
  protectSeller,
} = require("../MiddlewareSellerPanel/sellerPanelauthMidWar");
const {
  myProductQuerySchema,
} = require("../validators/sellerPanelValidators/myProductQuery");
const {
  updateDetailSchema,
} = require("../validators/sellerPanelValidators/updateDetails");
const {
  updatePricingSchema,
} = require("../validators/sellerPanelValidators/updatePricing");
const zodValidate = require("../Middleware/zodValidate");
const Order = require("../models/order.model");
const multer = require("multer");
const uploadToS3 = require("../utils/s3Upload");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @desc Get all approved products for the logged-in seller
 * @route GET /api/products/my
 * @access Private (seller only)
 */
router.get(
  "/my",
  protectSeller,
  zodValidate(myProductQuerySchema, "query"),
  async (req, res) => {
    try {
      // ✅ The middleware sets req.user._id (not req.user.id)
      const sellerId = req.user._id;

      const {
        category,
        subcategory,
        minprice,
        maxprice,
        instock,
        minrating,
        tag,
        view,
      } = req.query;

      let filter = {
        sellerId,
        approvalStatus: "approved",
      };

      if (category) filter.category = category;
      if (subcategory) filter.subcategory = subcategory;

      if (minprice !== undefined || maxprice !== undefined) {
        filter.sellingPrice = {};
        if (minprice !== undefined) filter.sellingPrice.$gte = Number(minprice);
        if (maxprice !== undefined) filter.sellingPrice.$lte = Number(maxprice);
      }

      if (instock === "true") filter.inStock = { $gt: 0 };
      if (minrating !== undefined) {
        filter.rating = { $gte: minrating };
      }
      if (tag) {
        const tagArray = tag.split(",").map((t) => t.trim());
        filter.tags = { $in: tagArray };
      }

      if (view === "deleted") {
        filter.isDeleted = true;
      } else if (view === "all") {
        // show all products ( active + deleted )
      } else {
        filter.isDeleted = false;
      }

      console.log("filter:- ", filter);
      // ✅ Fetch only approved products belonging to this seller
      const products = await Product.find(filter).sort({ createdAt: -1 });
      console.log("products:- ", products);

      res.status(200).json({
        success: true,
        count: products.length,
        products,
      });
    } catch (error) {
      console.error("❌ Fetch seller products error:", error);
      res.status(500).json({
        success: false,
        message: "Server error fetching seller products",
        error: error.message,
      });
    }
  },
);

// @desc Get single product for update
// @route GET /api/productinfo/:id
// @access Private (seller only)
router.get("/:id", protectSeller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const productId = req.params.id;

    const product = await Product.findOne({
      _id: productId,
      sellerId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you are not the owner",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching product",
      error: error.message,
    });
  }
});

router.patch(
  "/:id/details",
  protectSeller,
  upload.fields([
    { name: "productVideo", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  zodValidate(updateDetailSchema),
  async (req, res) => {
    try {
      const sellerId = req.user._id;
      const ProductId = req.params.id;

      console.log("--- Product Details Update ---");
      console.log("Product ID:", ProductId);
      const videoFile = req.files?.productVideo?.[0];
      const imageFiles = req.files?.images || [];
      console.log("Video received:", videoFile ? videoFile.originalname : "None");
      console.log("Images received:", imageFiles.length);

      // Parse tags if they exist and are a string (JSON from FormData)
      if (req.body.tags && typeof req.body.tags === "string") {
        try {
          req.body.tags = JSON.parse(req.body.tags);
        } catch (e) {
          console.error("Failed to parse tags:", e);
        }
      }

      let updateData = { ...req.body };
      delete updateData.existingImages;

      // Handle video upload if file is present
      if (videoFile) {
        // Validation: format
        const allowedFormats = ["video/mp4", "video/webm", "video/quicktime"];
        if (!allowedFormats.includes(videoFile.mimetype)) {
          return res.status(400).json({
            success: false,
            message: "Invalid video format. Supported: mp4, webm, mov",
          });
        }

        // Validation: size (up to 20MB)
        const maxSize = 20 * 1024 * 1024;
        if (videoFile.size > maxSize) {
          return res.status(400).json({
            success: false,
            message: "Video size must be up to 20MB",
          });
        }

        console.log("Uploading updated video to S3...");
        const videoResult = await uploadToS3(videoFile.buffer, "SellerProducts", {
          contentType: videoFile.mimetype,
          originalName: videoFile.originalname,
        });
        updateData.productVideo = videoResult.secure_url;
      } else if (req.body.productVideo === "null" || req.body.productVideo === "") {
        updateData.productVideo = "";
      }

      // Handle image uploads
      if (imageFiles.length > 0) {
        if (imageFiles.length > 5) {
          return res.status(400).json({
            success: false,
            message: "Maximum 5 images allowed",
          });
        }

        const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        for (const file of imageFiles) {
          if (!allowedImageTypes.includes(file.mimetype)) {
            return res.status(400).json({
              success: false,
              message: "Invalid image format. Supported: jpeg, png, webp, gif",
            });
          }
        }

        const imageUrls = await Promise.all(
          imageFiles.map((file) =>
            uploadToS3(file.buffer, "SellerProducts", {
              contentType: file.mimetype,
              originalName: file.originalname,
            }),
          ),
        );
        updateData.images = imageUrls.map((r) => r.secure_url);
      } else if (req.body.existingImages !== undefined) {
        let keptImages = [];
        try {
          keptImages =
            typeof req.body.existingImages === "string"
              ? JSON.parse(req.body.existingImages)
              : req.body.existingImages;
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid existingImages format",
          });
        }

        if (!Array.isArray(keptImages)) {
          return res.status(400).json({
            success: false,
            message: "existingImages must be an array",
          });
        }

        if (keptImages.length > 5) {
          return res.status(400).json({
            success: false,
            message: "Maximum 5 images allowed",
          });
        }

        updateData.images = keptImages;
      }

      if (updateData.images !== undefined && updateData.images.length < 1) {
        return res.status(400).json({
          success: false,
          message: "At least one product image is required",
        });
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: ProductId, sellerId },
        { $set: updateData },
        { new: true, runValidators: true },
      );

      if (!updatedProduct) {
        return res.status(400).json({
          success: false,
          message: "Product not found or you are not the owner",
        });
      }

      res.status(200).json({
        success: true,
        message: "Details of Product are updated",
        product: updatedProduct,
      });
    } catch (err) {
      console.log("Error updating product", err);
      return res.status(500).json({
        success: false,
        message: "Server Error while updating product",
        error: err.message,
      });
    }
  },
);

router.patch(
  "/:id/pricing",
  protectSeller,
  zodValidate(updatePricingSchema),
  async (req, res) => {
    try {
      const sellerId = req.user._id;
      const productId = req.params.id;

      // verification if for seller product exist and taking out values like logistic fee and transaction fee
      // from db if exist
      const product = await Product.findOne({
        _id: productId,
        sellerId,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found or you are not the owner",
        });
      }

      const logisticsFee = product.logisticsFee || 0;
      const transactionFee = product.transactionFee || 0;

      const sellingPrice =
        req.body.sellingPrice !== undefined
          ? req.body.sellingPrice
          : product.sellingPrice;
      const discountPercentage =
        req.body.discountPercentage !== undefined
          ? req.body.discountPercentage
          : product.discountPercentage;
      const platformFee =
        req.body.platformFee !== undefined
          ? req.body.platformFee
          : product.platformFee;

      const calculatedPrice =
        sellingPrice + logisticsFee + transactionFee + platformFee;
      const discountAmount = (calculatedPrice * discountPercentage) / 100;
      const mrp = calculatedPrice + discountAmount;

      product.sellingPrice = sellingPrice;
      product.discountPercentage = discountPercentage;
      product.platformFee = platformFee;
      product.mrp = Math.round(mrp);

      await product.save();

      res.status(200).json({
        success: true,
        message: "Pricing updated successfully",
        pricing: {
          sellingPrice: product.sellingPrice,
          discountPercentage: product.discountPercentage,
          platformFee: product.platformFee,
          logisticsFee: product.logisticsFee,
          transactionFee: product.transactionFee,
          mrp: product.mrp,
        },
      });
    } catch (err) {
      console.error("Pricing update error:", err);
      res.status(500).json({
        success: false,
        message: "Server error while updating pricing",
        error: err.message,
      });
    }
  },
);

router.delete("/:id", protectSeller, async (req, res) => {
  try {
    const productId = req.params.id;
    const sellerId = req.user._id;
    console.log("product", productId);

    //product find
    const sellerProduct = await Product.findById(productId);

    //check product exist
    if (!sellerProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not Found",
      });
    }

    //check product ownership
    if (sellerProduct.sellerId.toString() !== sellerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this product",
      });
    }

    //check active orders
    const activeOrder = await Order.findOne({
      "products.product": productId,
      "products.status": {
        $in: [
          "Pending",
          "Dispatched",
          "Shipped",
          "Out for Delivery",
          "Delivered",
        ],
      },
    });

    if (activeOrder) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete product - it is currently part of active order",
      });
    }

    // No active orders → still soft delete for consistency
    ((sellerProduct.isDeleted = true), (sellerProduct.deletedAt = new Date()));
    await sellerProduct.save();

    console.log("Delete successfully", sellerProduct);
    res.status(200).json({
      success: true,
      message: "Product Deleted SuccessFully",
    });
  } catch (error) {
    console.log(`Delete Seller product error:- ${error}`);
    res.status(500).json({
      success: false,
      message: "Server error Delete seller products",
      error: error.message,
    });
  }
});

module.exports = router;
