const Product = require("../models/product.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

/**
 * Automatically updates product badges based on sales, ratings, stock, and age.
 * Preserved 'featured' status if set manually by admin.
 */
async function runBadgeAutomation() {
  console.log(`[${new Date().toISOString()}] Starting Badge Automation...`);

  try {
    // 1. Fetch all active (approved & not deleted) products
    const products = await Product.find({
      approvalStatus: "approved",
      isDeleted: false,
    });

    if (products.length === 0) {
      console.log("No active products found for badge update.");
      return;
    }

    // 2. Aggregate Sales Data (Bestseller & Trending)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get units sold in last 90 days (BestSeller & New Arrival qualification signal)
    // Business Rule: ONLY count 'Delivered' items.
    const sales90Days = await Order.aggregate([
      { $match: { createdAt: { $gte: ninetyDaysAgo } } },
      { $unwind: "$products" },
      { $match: { "products.status": "Delivered" } },
      { $group: { _id: "$products.product", unitsSold: { $sum: "$products.quantity" } } }
    ]);

    // Get units sold in last 7 days (Trending signal)
    // Business Rule: Using 'Delivered' for consistency in "successful sales"
    const sales7Days = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $unwind: "$products" },
      { $match: { "products.status": "Delivered" } },
      { $group: { _id: "$products.product", unitsSold: { $sum: "$products.quantity" } } }
    ]);

    // 3. Aggregate Favorites Data (Most Popular)
    const favoriteStats = await User.aggregate([
      { $unwind: "$favorites" },
      { $group: { _id: "$favorites", favoriteCount: { $sum: 1 } } }
    ]);

    // Create maps for efficient lookup
    const sales90Map = sales90Days.reduce((acc, item) => ({ ...acc, [item._id]: item.unitsSold }), {});
    const sales7Map = sales7Days.reduce((acc, item) => ({ ...acc, [item._id]: item.unitsSold }), {});
    const favMap = favoriteStats.reduce((acc, item) => ({ ...acc, [item._id]: item.favoriteCount }), {});

    // Thresholds
    const BESTSELLER_THRESHOLD = 15; //for 90-day window 
    const TRENDING_THRESHOLD = 3;   
    const POPULAR_THRESHOLD = 2;    
    
    // NEW ARRIVAL Lifecycle Constants
    const NEW_ARRIVAL_OBSERVATION_DAYS = 15;
    const NEW_ARRIVAL_MAX_AGE_DAYS = 30;

    // Logging Counters
    let observationCount = 0;
    let newArrivalQualifiedCount = 0;
    let newArrivalExpiredCount = 0;
    let bestsellerCount = 0;

    const bulkOps = products.map((product) => {
      const productId = product._id.toString();
      const unitsSold90 = sales90Map[productId] || 0;
      const unitsSold7 = sales7Map[productId] || 0;
      
      const isBestSeller = unitsSold90 >= BESTSELLER_THRESHOLD;
      if (isBestSeller) bestsellerCount++;

      const isTrending = unitsSold7 >= TRENDING_THRESHOLD;
      const isMostPopular = (favMap[productId] || 0) >= POPULAR_THRESHOLD;
      
      // NEW ARRIVAL Logic
      const ageInDays = (new Date() - product.createdAt) / (1000 * 60 * 60 * 24);
      let isNewArrival = false;

      if (ageInDays <= NEW_ARRIVAL_OBSERVATION_DAYS) {
        // Phase 1: Observation Period
        observationCount++;
        isNewArrival = false;
      } else if (ageInDays <= NEW_ARRIVAL_MAX_AGE_DAYS) {
        // Phase 2: Qualification Check
        // Must have at least one delivered order
        if (unitsSold90 > 0) {
          isNewArrival = true;
          newArrivalQualifiedCount++;
        }
      } else {
        // Phase 3: Expiry
        if (product.badges && product.badges.newArrival) {
          newArrivalExpiredCount++;
        }
        isNewArrival = false;
      }

      const isTopRated = product.rating >= 4.5 && (product.reviews ? product.reviews.length >= 3 : false);
      const isOnSale = product.discountPercentage > 0 || (product.mrp > product.sellingPrice);
      const isLimitedStock = product.inStock > 0 && product.inStock <= 10;

      return {
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              "badges.bestSeller": isBestSeller,
              "badges.trending": isTrending,
              "badges.newArrival": isNewArrival,
              "badges.mostPopular": isMostPopular,
              "badges.topRated": isTopRated,
              "badges.onSale": isOnSale,
              "badges.limitedStock": isLimitedStock,
            },
          },
        },
      };
    });

    console.log(`[Badge Analytics Summary]`);
    console.log(`- Products in Observation (0-15d): ${observationCount}`);
    console.log(`- Products Qualified for New Arrival (16-30d + Sales): ${newArrivalQualifiedCount}`);
    console.log(`- Products Expiring New Arrival (>30d): ${newArrivalExpiredCount}`);
    console.log(`- Products Qualifying for BestSeller (90d + ${BESTSELLER_THRESHOLD} sales): ${bestsellerCount}`);

    if (bulkOps.length > 0) {
      const result = await Product.bulkWrite(bulkOps);
      console.log(`Badge Automation complete. Modified: ${result.modifiedCount} products.`);
    }

  } catch (error) {
    console.error("Critical Error in Badge Automation:", error);
  }
}

module.exports = { runBadgeAutomation };
