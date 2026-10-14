const {
  getPopularTagsAggregation,
  getTopCategoriesAggregation,
  getPersonalisedProducts,
  getPopularProducts,
  getTopSellers,
} = require("../services/home.services");

/** @param {string|undefined} raw @param {number} def @param {number} max */
const clampLimit = (raw, def, max) => {
  const n = parseInt(raw, 10);
  return Math.min(max, Math.max(1, Number.isFinite(n) ? n : def));
};

const getTags = async (req, res) => {
  try {
    const limit = clampLimit(req.query.limit, 30, 50);
    const tags = await getPopularTagsAggregation(limit);

    return res.status(200).json({ success: true, tags });
  } catch (error) {
    console.error("[home/tags] Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const getCategories = async (req, res) => {
  try {
    const limit = clampLimit(req.query.limit, 10, 30);
    const categories = await getTopCategoriesAggregation(limit);

    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("[home/categories] Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const getProducts = async (req, res) => {
  try {
    const userId = req.user?._id;
    const limit = clampLimit(req.query.limit, 20, 50);

    let products = null;
    let mode = "popular";

    if (userId) {
      products = await getPersonalisedProducts(userId, limit);
      if (products) mode = "recommended";
    }

    if (!products) {
      products = await getPopularProducts(limit);
    }

    return res.status(200).json({ success: true, mode, products });
  } catch (error) {
    console.error("[home/products] Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getSellers = async (req, res) => {
  try {
    const limit = clampLimit(req.query.limit, 10, 30);
    const sellers = await getTopSellers(limit);

    return res.status(200).json({ success: true, sellers });
  } catch (error) {
    console.error("[home/sellers] Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getTags,
  getCategories,
  getProducts,
  getSellers,
};
