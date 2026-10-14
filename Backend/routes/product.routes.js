// routes/product.routes.js
// Updated by Tushar - only show approved products on website

const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/product.model");
const { protect } = require("../Middleware/authMiddleware");
const Order = require("../models/order.model");
const multer = require("multer");
const path = require("path");
const uploadToS3 = require("../utils/s3Upload");

const { toClientProduct } = require("../utils/productForClient");

const router = express.Router();

// Helper: escape regex special chars to avoid ReDoS
function escapeRegex(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Match URL slugs / query phrases to human-readable category & subcategory strings.
 * Hyphens and "+" become spaces; between word segments allow spaces, hyphens, "&", "/", or "and".
 * e.g. "calligraphy typography" matches "Calligraphy & Typography".
 */
function categoryOrSubSlugToRegex(slugOrPhrase) {
  if (typeof slugOrPhrase !== "string") return null;
  const normalized = slugOrPhrase
    .replace(/\+/g, " ")
    .replace(/-/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  if (!normalized) return null;
  const parts = normalized.split(" ").filter(Boolean);
  if (parts.length === 0) return null;
  const between = "(?:\\s+and\\s+|[\\s\\-&/]+)";
  const body = parts.map((p) => escapeRegex(p)).join(between);
  return new RegExp(`^${body}$`, "i");
}

// Map sort param to MongoDB sort object (field -> 1|-1). Use offeredPrice for price sort.
function getSortObject(sortParam) {
  const map = {
    price_asc: { offeredPrice: 1 },
    price_desc: { offeredPrice: -1 },
    rating_desc: { rating: -1 },
    createdAt_desc: { createdAt: -1 },
    default: {},
  };
  return map[sortParam] || map.default;
}

// ✅ GET all products (only approved) with server-side filter, sort, pagination
router.get("/", async (req, res) => {
  try {
    const {
      category,
      subcategory,
      tag,
      tags,
      store,
      minPrice,
      maxPrice,
      inStock,
      minDiscount,
      minRating,
      sort,
      page = 1,
      limit = 15,
    } = req.query;

    const filter = { approvalStatus: "approved", isDeleted: { $ne: true } };

    // Category (normalize: replace - with space, case-insensitive, support multiple via comma)
    // if (category && typeof category === "string") {
    //   const categories = category.split(",").map(c => c.trim().replace(/-/g, " ")).filter(c => c);
    //   if (categories.length > 0) {
    //     filter.category = {
    //       $in: categories.map(c => new RegExp(`^${escapeRegex(c)}$`, "i")),
    //     };
    //   }
    // }

    // Category (bulletproof logic for both strings and arrays)
    if (category) {
      let categoryArray = [];
      if (typeof category === "string") {
        categoryArray = category.split(",");
      } else if (Array.isArray(category)) {
        categoryArray = category;
      }

      const cleanedCategories = categoryArray
        .map((c) => String(c).trim())
        .filter(Boolean);

      const categoryRegexes = cleanedCategories
        .map((c) => categoryOrSubSlugToRegex(c))
        .filter(Boolean);

      if (categoryRegexes.length > 0) {
        filter.category = { $in: categoryRegexes };
      }
    }
    
    // // Subcategory (support multiple via comma)
    // if (subcategory && typeof subcategory === "string") {
    //   const subcategories = subcategory.split(",").map(s => s.trim().replace(/-/g, " ")).filter(s => s);
    //   if (subcategories.length > 0) {
    //     filter.subcategory = {
    //       $in: subcategories.map(s => new RegExp(`^${escapeRegex(s)}$`, "i")),
    //     };
    //   }
    // }

    // Subcategory (bulletproof logic for both strings and arrays)
    if (subcategory) {
      let subcategoryArray = [];
      if (typeof subcategory === "string") {
        subcategoryArray = subcategory.split(",");
      } else if (Array.isArray(subcategory)) {
        subcategoryArray = subcategory;
      }

      const cleanedSubcategories = subcategoryArray
        .map((s) => String(s).trim())
        .filter(Boolean);

      const subRegexes = cleanedSubcategories
        .map((s) => categoryOrSubSlugToRegex(s))
        .filter(Boolean);

      if (subRegexes.length > 0) {
        filter.subcategory = { $in: subRegexes };
      }
    }

    // Tags: tokenize on comma, +, and whitespace; each token must match some tag (substring, case-insensitive)
    const tagTokens = [];
    const tagSeen = new Set();
    const pushTagToken = (t) => {
      const tok = String(t).trim().toLowerCase();
      if (!tok || tagSeen.has(tok)) return;
      tagSeen.add(tok);
      tagTokens.push(tok);
    };
    if (tag && typeof tag === "string") {
      tag.replace(/\+/g, " ")
        .split(/[,\s]+/)
        .forEach((piece) => pushTagToken(piece));
    }
    if (tags && typeof tags === "string") {
      tags.replace(/\+/g, " ")
        .split(",")
        .forEach((segment) => {
          segment.split(/[,\s]+/).forEach((piece) => pushTagToken(piece));
        });
    }
    if (Array.isArray(tags)) {
      tags.forEach((segment) => {
        if (typeof segment !== "string") return;
        segment.replace(/\+/g, " ")
          .split(/[,\s]+/)
          .forEach((piece) => pushTagToken(piece));
      });
    }
    if (tagTokens.length > 0) {
      const tagConds = tagTokens.map((tok) => ({
        tags: new RegExp(escapeRegex(tok), "i"),
      }));
      filter.$and = [...(filter.$and || []), ...tagConds];
    }

    // Price range: applied after computing offeredPrice in aggregation (below)
    const minP = minPrice != null && minPrice !== "" ? Number(minPrice) : null;
    const maxP = maxPrice != null && maxPrice !== "" ? Number(maxPrice) : null;
    const hasPriceFilter =
      (typeof minP === "number" && !Number.isNaN(minP)) ||
      (typeof maxP === "number" && !Number.isNaN(maxP));

    // In stock (model uses Number; treat inStock > 0 as in stock)
    if (inStock === "true" || inStock === true) {
      filter.inStock = { $gt: 0 };
    }

    // Min discount (sale)
    const minD =
      minDiscount != null && minDiscount !== "" ? Number(minDiscount) : null;
    if (typeof minD === "number" && !Number.isNaN(minD)) {
      filter.discountPercentage = { $gte: minD };
    }

    const minR =
  minRating != null && minRating !== ""
    ? Number(minRating)
    : null;

if (typeof minR === "number" && !Number.isNaN(minR)) {
  filter.rating = { $gte: minR };
}

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;
    const sortParam =
      sort && typeof sort === "string" ? sort.trim() : "default";
    const sortObj = getSortObject(sortParam);
    

    const rawOfferedPriceExpr = {
      $round: [
        {
          $multiply: [
            {
              $add: [
                "$sellingPrice",
                { $ifNull: ["$platformFee", 0] },
                { $ifNull: ["$logisticsFee", 0] },
                { $ifNull: ["$transactionFee", 0] },
              ],
            },
            {
              $subtract: [
                1,
                { $divide: [{ $ifNull: ["$discountPercentage", 0] }, 100] },
              ],
            },
          ],
        },
        0,
      ],
    };

    const addRawOfferedPrice = {
      $addFields: { rawOfferedPrice: rawOfferedPriceExpr },
    };
    const addBase = {
      $addFields: {
        base: {
          $multiply: [{ $floor: { $divide: ["$rawOfferedPrice", 10] } }, 10],
        },
      },
    };
    const addOfferedPriceEnding9 = {
      $addFields: {
        offeredPrice: {
          $cond: {
            if: {
              $lte: [
                {
                  $subtract: ["$rawOfferedPrice", { $subtract: ["$base", 1] }],
                },
                { $subtract: [{ $add: ["$base", 9] }, "$rawOfferedPrice"] },
              ],
            },
            then: { $subtract: ["$base", 1] },
            else: { $add: ["$base", 9] },
          },
        },
      },
    };
    const projectOutFeesAndTemp = {
      $project: {
        sellingPrice: 0,
        platformFee: 0,
        logisticsFee: 0,
        transactionFee: 0,
        rawOfferedPrice: 0,
        base: 0,
      },
    };
    const priceMatch = hasPriceFilter
      ? {
          $match: {
            offeredPrice: {
              ...(typeof minP === "number" &&
                !Number.isNaN(minP) && { $gte: minP }),
              ...(typeof maxP === "number" &&
                !Number.isNaN(maxP) && { $lte: maxP }),
            },
          },
        }
      : null;
    const sortStage = {
      $sort: Object.keys(sortObj).length ? sortObj : { createdAt: -1 },
    };
    const facetStage = {
      $facet: {
        count: [{ $count: "total" }],
        products: [
          sortStage,
          { $skip: skip },
          { $limit: limitNum },
          projectOutFeesAndTemp,
        ],
      },
    };

    let products;
    let totalCount;

    if (store && typeof store === "string") {
      // Normalize: trim, treat + as space (query-string encoding), then trim again
      const storeNormalized = store.replace(/\+/g, " ").trim();
      if (!storeNormalized) {
        products = [];
        totalCount = 0;
      } else {
        const storeLower = storeNormalized.toLowerCase();
        const pipeline = [
          { $match: filter },
          {
            $lookup: {
              from: "sellers",
              localField: "sellerId",
              foreignField: "_id",
              as: "sellerDoc",
            },
          },
          { $unwind: { path: "$sellerDoc", preserveNullAndEmptyArrays: false } },
          {
            $addFields: {
              storeName: "$sellerDoc.storeName",
              sellerName: "$sellerDoc.sellerName",
            },
          },
          // Match by trimmed, case-insensitive store name so trailing space or + in URL still match
          {
            $match: {
              $expr: {
                $eq: [
                  { $toLower: { $trim: { input: { $ifNull: ["$sellerDoc.storeName", ""] } } } },
                  storeLower,
                ],
              },
            },
          },
          { $project: { sellerDoc: 0 } },
        addRawOfferedPrice,
        addBase,
        addOfferedPriceEnding9,
        ...(priceMatch ? [priceMatch] : []),
        facetStage,
        ];
        const [result] = await Product.aggregate(pipeline);
        totalCount = result?.count?.[0]?.total ?? 0;
        products = result?.products ?? [];
      }
    } else {
      const pipeline = [
        { $match: filter },
        {
          $lookup: {
            from: "sellers",
            localField: "sellerId",
            foreignField: "_id",
            as: "sellerDoc",
          },
        },
        {
          $unwind: {
            path: "$sellerDoc",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            storeName: "$sellerDoc.storeName",
            sellerName: "$sellerDoc.sellerName",
          },
        },
        { $project: { sellerDoc: 0 } },
        addRawOfferedPrice,
        addBase,
        addOfferedPriceEnding9,
        ...(priceMatch ? [priceMatch] : []),
        facetStage,
      ];
      const [result] = await Product.aggregate(pipeline);
      totalCount = result?.count?.[0]?.total ?? 0;
      products = result?.products ?? [];
    }
    res.json({ products, totalCount });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET products by seller/store ID (only approved)
router.get("/store/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: "Valid seller ID is required" });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    const products = await Product.aggregate([
      {
        $match: {
          sellerId: sellerObjectId,
          approvalStatus: "approved",
          isDeleted: { $ne: true },
        },
      },
      {
        $lookup: {
          from: "sellers",
          localField: "sellerId",
          foreignField: "_id",
          as: "sellerDoc",
        },
      },
      {
        $unwind: {
          path: "$sellerDoc",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          storeName: "$sellerDoc.storeName",
          sellerName: "$sellerDoc.sellerName",
        },
      },
      {
        $project: {
          sellerDoc: 0,
        },
      },
    ]);

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No approved products found for this store" });
    }

    const forClient = products.map((p) => toClientProduct(p));
    res.json(forClient);
  } catch (err) {
    console.error("Error fetching store products:", err);
    res.status(500).json({ error: "Server error fetching store products" });
  }
});

router.get("/shops", async (req, res) => {
  try {
    const shops = await Product.aggregate([
      {
        $match: {
          approvalStatus: "approved",
          isDeleted: { $ne: true },
        },
      },
      {
        $lookup: {
          from: "sellers",
          localField: "sellerId",
          foreignField: "_id",
          as: "sellerDoc",
        },
      },
      {
        $unwind: {
          path: "$sellerDoc",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: {
            storeName: "$sellerDoc.storeName",
            sellerId: "$sellerDoc._id",
            sellerName: "$sellerDoc.sellerName",
          },
          productCount: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          firstProduct: { $first: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          storeName: "$_id.storeName",
          sellerId: "$_id.sellerId",
          sellerName: "$_id.sellerName",
          products: "$productCount",
          rating: {
            $round: [{ $ifNull: ["$avgRating", 4.5] }, 1],
          },
          img: {
            $ifNull: [
              { $arrayElemAt: ["$firstProduct.images", 0] },
              "https://images.pexels.com/photos/3735644/pexels-photo-3735644.jpeg?auto=compress&cs=tinysrgb&w=200",
            ],
          },
        },
      },
      // Only return shops with a non-empty store name
      {
        $match: {
          $expr: {
            $gt: [
              { $strLenCP: { $trim: { input: { $ifNull: ["$storeName", ""] } } } },
              0,
            ],
          },
        },
      },
      {
        $sort: { products: -1 },
      },
    ]);

    res.json(shops);
  } catch (err) {
    console.error("Error fetching shops:", err);
    res.status(500).json({ error: "Server error fetching shops" });
  }
});

// Trending product tags (for homepage search / nav); must be registered before "/:id"
router.get("/navigation/trending-tags", async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 24);
    const rows = await Product.aggregate([
      {
        $match: {
          approvalStatus: "approved",
          isDeleted: { $ne: true },
          "tags.0": { $exists: true },
        },
      },
      { $unwind: "$tags" },
      {
        $group: {
          _id: { $toLower: { $trim: { input: "$tags" } } },
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $nin: [null, ""] } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
    const tags = rows.map((r) => r._id).filter(Boolean);
    res.json({ tags });
  } catch (err) {
    console.error("Error fetching trending tags:", err);
    res.status(500).json({ error: "Failed to fetch trending tags" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      approvalStatus: "approved",
    });

    if (!product)
      return res
        .status(404)
        .json({ error: "Product not found or not approved" });

    const forClient = toClientProduct(product);
    res.json(forClient);
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

module.exports = router;

// -------------------- Reviews Section --------------------

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error("Only images are allowed"));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

// ✅ POST: Add review for an approved product
router.post(
  "/:id/reviews",
  protect,
  upload.array("photos", 6),
  async (req, res) => {
    try {
      const { stars, text } = req.body;
      const product = await Product.findOne({
        _id: req.params.id,
        approvalStatus: "approved",
      });

      if (!product)
        return res
          .status(404)
          .json({ error: "Product not found or not approved" });

      const alreadyReviewed = (product.reviews || []).some(
        (r) => r.user?.toString() === req.user._id.toString(),
      );
      if (alreadyReviewed) {
        return res
          .status(400)
          .json({ error: "You have already reviewed this product" });
      }

      const hasPurchased = await Order.exists({
        user: req.user._id,
        "products.product": product._id,
      });
      if (!hasPurchased) {
        return res.status(403).json({
          error: "Only customers who purchased this product can review",
        });
      }

      let photos = [];
      if (req.files && req.files.length > 0) {
        photos = await Promise.all(
          req.files.map(async (file) => {
            const result = await uploadToS3(file.buffer, "ProductReviews", {
              contentType: file.mimetype,
              originalName: file.originalname,
            });
            return result.secure_url;
          }),
        );
      }

      product.reviews.push({
        user: req.user._id,
        stars: Number(stars),
        text: text || "",
        photos,
        createdAt: new Date(),
      });

      const total = product.reviews.reduce((sum, r) => sum + r.stars, 0);
      product.rating =
        product.reviews.length > 0
          ? Number((total / product.reviews.length).toFixed(1))
          : 0;

      await product.save();

      const order = await Order.findOne({
        user: req.user._id,
        deliveryStatus: "Delivered",
        "products.product": product._id,
      });

      if (order && !order.rating) {
        order.rating = {
          stars: Number(stars),
          text: text || "",
          photos,
          submittedAt: new Date(),
        };
        await order.save();
      }

      res.json(product);
    } catch (err) {
      console.error("Error creating review:", err);
      res.status(500).json({ error: "Failed to create review" });
    }
  },
);

// ✅ GET: list reviews for approved product
router.get("/:id/reviews", async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      approvalStatus: "approved",
    }).populate("reviews.user", "fullname email");

    if (!product)
      return res
        .status(404)
        .json({ error: "Product not found or not approved" });

    res.json(product.reviews || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// ✅ POST: Mark a review as helpful
router.post(
  "/:productId/reviews/:reviewId/helpful",
  protect,
  async (req, res) => {
    try {
      const { productId, reviewId } = req.params;
      const product = await Product.findOne({
        _id: productId,
        approvalStatus: "approved",
      });

      if (!product)
        return res
          .status(404)
          .json({ error: "Product not found or not approved" });

      const review = (product.reviews || []).find(
        (r) => r._id.toString() === reviewId,
      );
      if (!review) return res.status(404).json({ error: "Review not found" });

      const userId = req.user._id.toString();
      const alreadyVoted = (review.helpfulVoters || []).some(
        (u) => u.toString() === userId,
      );

      if (!alreadyVoted) {
        review.helpfulVoters = review.helpfulVoters || [];
        review.helpfulVoters.push(req.user._id);
        review.helpfulCount =
          typeof review.helpfulCount === "number" ? review.helpfulCount + 1 : 1;
        await product.save();
      }

      return res.json({ reviewId, helpfulCount: review.helpfulCount });
    } catch (err) {
      console.error("Error updating helpful count:", err);
      res.status(500).json({ error: "Failed to update helpful count" });
    }
  },
);

module.exports = router;
