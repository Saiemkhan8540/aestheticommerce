const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getSubcategories
} = require("../controllersSellerPanel/categoryController");

// Get ALL categories
router.get("/", getAllCategories);

// Get subcategories of a specific category
router.get("/:categoryName/subcategories", getSubcategories);

module.exports = router;