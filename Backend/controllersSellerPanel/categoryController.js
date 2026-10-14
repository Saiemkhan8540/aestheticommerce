const Category = require("../models/category.model");

// 1. GET ALL CATEGORIES
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    console.log("categories:-",categories);
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. GET SUBCATEGORIES FOR ONE CATEGORY
exports.getSubcategories = async (req, res) => {
  try {
    const { categoryName } = req.params;

    const category = await Category.findOne({ name: categoryName });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category.subcategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};