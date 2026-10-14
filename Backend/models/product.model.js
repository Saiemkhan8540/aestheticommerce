const mongoose = require("mongoose");

/** Lowercase, trim, dedupe tags for consistent matching (e.g. home recommendations). */
function normalizeTagsArray(tags) {
  if (!Array.isArray(tags)) return [];
  const seen = new Set();
  const out = [];
  for (const t of tags) {
    const n = String(t ?? "").toLowerCase().trim();
    if (n && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

function normalizeTagsInPlainUpdate(update) {
  if (!update || typeof update !== "object") return;
  if (Array.isArray(update.tags)) {
    update.tags = normalizeTagsArray(update.tags);
  }
  if (update.$set && Array.isArray(update.$set.tags)) {
    update.$set.tags = normalizeTagsArray(update.$set.tags);
  }
}

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  sellingPrice: {
    type: Number,
    required: true,
  },

  platformFee: {
    type: Number,
    default: 0, // can be calculated in backend based on rules
  },

  logisticsFee: {
    type: Number,
    default: 60, // pre-filled ₹60
  },

  transactionFee: {
    type: Number,
    default: 10, // pre-filled ₹10
  },

  discountPercentage: {
    type: Number,
    default: 0,
  },

  mrp: {
    type: Number,
    required: true,
  },

  images: {
    type: [String],
    validate: [arrayLimit, "{PATH} exceeds the limit of 5"],
  },

  productVideo: {
    type: String,
    default: "",
  },

  category: {
    type: String,
    required: true,
  },

  subcategory: {
    type: String,
  },

  tags: {
    type: [String],
    set: normalizeTagsArray,
  },

  badges: {
    bestSeller: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    mostPopular: { type: Boolean, default: false },
    topRated: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false },
    limitedStock: { type: Boolean, default: false },
  },

  rating: {
    type: Number,
    default: 1,
  },

  inStock: {
    type: Number,
    required: true,
    default: 0,
  },

  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      stars: { type: Number, min: 1, max: 5, required: true },
      text: { type: String, default: "" },
      photos: [{ type: String }],
      helpfulCount: { type: Number, default: 1 },
      helpfulVoters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      createdAt: { type: Date, default: Date.now },
    },
  ],

  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },

  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  adminNotes: {
    type: String,
    default: "",
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  deletedAt: {
    type: Date,
    default: null,
  },
});

// Limit images array to 5
function arrayLimit(val) {
  return val.length <= 5;
}

productSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
  try {
    const update = this.getUpdate();
    normalizeTagsInPlainUpdate(update);
  } catch (e) {
    return next(e);
  }
  next();
});

productSchema.index({
  approvalStatus: 1,
  isDeleted: 1,
  inStock: 1,
  rating: -1,
});
productSchema.index({ sellerId: 1, rating: -1, createdAt: -1 });
productSchema.index({ tags: 1 });

module.exports = mongoose.model("Product", productSchema);
