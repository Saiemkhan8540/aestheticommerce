const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("../models/category.model.js");
const categoriesData = require("../data/categories.json");

dotenv.config();

const MONGO = process.env.DB_CONNECT;

if (!MONGO) {
  console.error(" DB_CONNECT is missing from .env");
  process.exit(1);
}

async function seedCategories() {
  try {
    await mongoose.connect(MONGO);
    console.log("Connected to Database");

    // Step 1: Clear old categories
    await Category.deleteMany({});
    console.log(" Old categories removed");

    // Step 2: Insert updated categories (directly from JSON)
    await Category.insertMany(categoriesData);
    console.log(" New categories inserted");

    console.log(" Seeding Completed Successfully");
  } catch (err) {
    console.error(" Seeding Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log(" Disconnected from DB");
  }
}

seedCategories();