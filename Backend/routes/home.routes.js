const express = require("express");
const router = express.Router();

const optionalAuth = require("../Middleware/optionalAuth");
const {
  getTags,
  getCategories,
  getProducts,
  getSellers,
} = require("../controllers/home.controllers");


router.get("/tags", getTags);

router.get("/categories", getCategories);

router.get("/products", optionalAuth, getProducts);

router.get("/sellers", getSellers);

module.exports = router;
