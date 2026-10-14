const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    keywords: { type: [String], default: [] }
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    subcategories: {
      type: [subcategorySchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);