const Product = require("../models/product.model");
const Cart = require("../models/cart.model");
const Seller = require("../models/seller.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");

const ACTIVE_PRODUCT_FILTER = {
  approvalStatus: "approved",
  isDeleted: false,
  inStock: { $gt: 0 },
};

const SAFE_SELLER_PROJECTION = {
  password: 0,
  bankDetails: 0,
  aadharNumber: 0,
  panNumber: 0,
  aadharFile: 0,
  panFile: 0,
  emailOtp: 0,
  otpExpiresAt: 0,
  governmentIdProof: 0,
  addressProof: 0,
};

/** In-memory TTL cache for anonymous home aggregates (per process). */
const responseCache = new Map();

const CACHE_TTL_MS = {
  tags: 180_000,
  categories: 180_000,
  sellers: 300_000,
  popularProducts: 120_000,
};

async function withTtlCache(key, ttlMs, fetcher) {
  const now = Date.now();
  const hit = responseCache.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value;
  }
  const value = await fetcher();
  responseCache.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

const normalizeTag = (tag) => (tag || "").toLowerCase().trim();

const collectUniqueTags = (tagArrays) =>
  [...new Set(tagArrays.flat().map(normalizeTag).filter(Boolean))];

const runPopularTagsAggregation = async (limit = 30) =>
  Product.aggregate([
    { $match: ACTIVE_PRODUCT_FILTER },
    { $sort: { rating: -1 } },
    { $limit: 200 }, // cap the working set
    { $unwind: "$tags" },
    {
      $group: {
        _id: { $toLower: { $trim: { input: "$tags" } } },
        avgRating: { $avg: "$rating" },
        image: { $first: { $arrayElemAt: ["$images", 0] } },
        productCount: { $sum: 1 },
      },
    },
    { $match: { _id: { $nin: [null, ""] } } },
    { $sort: { avgRating: -1, productCount: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        tag: "$_id",
        avgRating: { $round: ["$avgRating", 2] },
        image: 1,
        productCount: 1,
      },
    },
  ]);

const getPopularTagsAggregation = async (limit = 30) =>
  withTtlCache(`tags:${limit}`, CACHE_TTL_MS.tags, () =>
    runPopularTagsAggregation(limit)
  );

const runTopCategoriesAggregation = async (limit = 10) =>
  Product.aggregate([
    { $match: ACTIVE_PRODUCT_FILTER },
    { $sort: { rating: -1 } },
    {
      $group: {
        _id: { $toLower: { $trim: { input: "$category" } } },
        avgRating: { $avg: "$rating" },
        productCount: { $sum: 1 },
        // $first is safe here because we sorted by rating desc above —
        // the first document in each group is the highest-rated product
        image: { $first: { $arrayElemAt: ["$images", 0] } },
        featuredProduct: {
          $first: {
            name: "$name",
            sellingPrice: "$sellingPrice",
            mrp: "$mrp",
            discountPercentage: "$discountPercentage",
          },
        },
      },
    },
    { $match: { _id: { $nin: [null, ""] } } },
    { $sort: { avgRating: -1, productCount: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        category: "$_id",
        avgRating: { $round: ["$avgRating", 2] },
        productCount: 1,
        image: 1,
        featuredProduct: 1,
      },
    },
  ]);

const getTopCategoriesAggregation = async (limit = 10) =>
  withTtlCache(`categories:${limit}`, CACHE_TTL_MS.categories, () =>
    runTopCategoriesAggregation(limit)
  );

const WEIGHTS = {
  WISHLIST: 1.2,
  ORDER: 1.0,
  CART: 0.8,
};

const getOrderSignals = async (userId) => {
  const orders = await Order.find({
    user: userId,
    paymentStatus: "Paid",
  })
    .populate("products.product", "tags sellingPrice")
    .lean();

  const tags = [];
  const prices = [];
  const productIds = [];
  const seenProductIds = new Set();

  orders.forEach((order) => {
    (order.products || []).forEach((item) => {
      if (!item || item.status === "Cancelled") return;
      const { product } = item;
      if (!product) return;
      if (product.tags) tags.push(...product.tags);
      if (product.sellingPrice) prices.push(product.sellingPrice);
      const pid = product._id;
      if (pid && !seenProductIds.has(String(pid))) {
        seenProductIds.add(String(pid));
        productIds.push(pid);
      }
    });
  });

  const avgPrice =
    prices.length > 0
      ? prices.reduce((a, b) => a + b, 0) / prices.length
      : null;

  return { tags, avgPrice, productIds };
};

const getCartSignals = async (userId) => {
  const cart = await Cart.findOne({ user: userId })
    .populate("items.product", "tags")
    .lean();

  if (!cart?.items?.length) return { tags: [], productIds: [] };

  const tags = [];
  const productIds = [];

  cart.items.forEach(({ product }) => {
    if (!product) return;
    if (product.tags) tags.push(...product.tags);
    productIds.push(product._id);
  });

  return { tags, productIds };
};

const getWishlistSignals = async (userId) => {
  const user = await User.findById(userId)
    .populate("favorites", "tags")
    .lean();

  if (!user?.favorites?.length) {
    return { tags: [] };
  }
  const tags = user.favorites.flatMap((p) => p?.tags || []);
  return { tags };
};

const buildTagScoreMap = (sources) => {
  const scoreMap = new Map();

  sources.forEach(({ tags, weight, multiplier = 1 }) => {
    tags.forEach((raw) => {
      const tag = normalizeTag(raw);
      if (!tag) return;
      const current = scoreMap.get(tag) || 0;
      scoreMap.set(tag, current + weight * multiplier);
    });
  });

  return scoreMap;
};

const topTagsByScore = (scoreMap, n = 20) =>
  [...scoreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([tag]) => tag);

const mergeExcludeProductIds = (cartIds, orderIds) => {
  const seen = new Set();
  const out = [];
  for (const id of [...(cartIds || []), ...(orderIds || [])]) {
    if (!id) continue;
    const s = String(id);
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(id);
  }
  return out;
};

const getPersonalisedProducts = async (userId, limit) => {
  const [wishlistSignals, orderSignals, cartSignals] = await Promise.all([
    getWishlistSignals(userId),
    getOrderSignals(userId),
    getCartSignals(userId),
  ]);

  const scoreMap = buildTagScoreMap([
    { tags: wishlistSignals.tags, weight: WEIGHTS.WISHLIST, multiplier: 1.2 },
    { tags: orderSignals.tags, weight: WEIGHTS.ORDER },
    { tags: cartSignals.tags, weight: WEIGHTS.CART },
  ]);

  const rankedTags = topTagsByScore(scoreMap);

  if (!rankedTags.length) return null;

  const priceFilter = orderSignals.avgPrice
    ? { sellingPrice: { $lte: orderSignals.avgPrice * 2 } }
    : {};

  const excludeIds = mergeExcludeProductIds(
    cartSignals.productIds,
    orderSignals.productIds
  );

  const products = await Product.find({
    ...ACTIVE_PRODUCT_FILTER,
    ...priceFilter,
    ...(excludeIds.length ? { _id: { $nin: excludeIds } } : {}),
    tags: { $in: rankedTags },
  })
    .sort({ rating: -1 })
    .limit(limit)
    .populate("sellerId", "storeName ratings")
    .lean();

  return products.length ? products : null;
};

const runPopularProducts = async (limit) =>
  Product.find(ACTIVE_PRODUCT_FILTER)
    .sort({ rating: -1 })
    .limit(limit)
    .populate("sellerId", "storeName ratings")
    .lean();

const getPopularProducts = async (limit) =>
  withTtlCache(`popularProducts:${limit}`, CACHE_TTL_MS.popularProducts, () =>
    runPopularProducts(limit)
  );

const runTopSellers = async (limit = 10) => {
  const topProducts = await Product.aggregate([
    {
      $match: {
        approvalStatus: "approved",
        isDeleted: false,
        inStock: { $gt: 0 },
      },
    },
    { $sort: { sellerId: 1, rating: -1, createdAt: -1 } },
    {
      $group: {
        _id: "$sellerId",
        topProductImage: { $first: { $arrayElemAt: ["$images", 0] } },
        productCount: { $sum: 1 },
      },
    },
    { $sort: { productCount: -1 } },
    { $limit: limit },
  ]);

  if (!topProducts.length) return [];

  const sellerIds = topProducts.map((item) => item._id);

  const sellers = await Seller.find(
    {
      _id: { $in: sellerIds },
      isBlocked: false,
    },
    SAFE_SELLER_PROJECTION
  ).lean();

  const sellerMap = new Map(sellers.map((s) => [String(s._id), s]));

  const result = [];
  for (const tp of topProducts) {
    const seller = sellerMap.get(String(tp._id));
    if (seller) {
      result.push({
        ...seller,
        topProductImage: tp.topProductImage || null,
        productCount: tp.productCount,
      });
    }
  }

  return result;
};

const getTopSellers = async (limit = 10) =>
  withTtlCache(`sellers:${limit}`, CACHE_TTL_MS.sellers, () =>
    runTopSellers(limit)
  );

module.exports = {
  getPopularTagsAggregation,
  getTopCategoriesAggregation,
  getPersonalisedProducts,
  getPopularProducts,
  getTopSellers,
  normalizeTag,
  collectUniqueTags,
  buildTagScoreMap,
  topTagsByScore,
};
