const Product = require('../models/product.model');

async function getProductsByCategory() {
  const results = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return results.map((r) => ({
    category: r._id,
    count: r.count,
  }));
}

module.exports = {
  getProductsByCategory,
};