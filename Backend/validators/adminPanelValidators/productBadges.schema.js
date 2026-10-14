const { z } = require("zod");

const allowedProductBadges = [
  "bestSeller",
  "trending",
  "featured",
  "newArrival",
  "mostPopular",
  "topRated",
  "onSale",
  "limitedStock",
];

const productBadgeFlagsSchema = z
  .object(
    allowedProductBadges.reduce((shape, badge) => {
      shape[badge] = z.boolean().optional();
      return shape;
    }, {}),
  )
  .strict()
  .refine((badges) => Object.keys(badges).length > 0, {
    message: "At least one badge must be provided",
  });

const updateProductBadgesSchema = z.object({
  badges: productBadgeFlagsSchema,
});

module.exports = {
  allowedProductBadges,
  updateProductBadgesSchema,
};
