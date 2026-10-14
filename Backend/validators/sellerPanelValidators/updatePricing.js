const { z } = require("zod");
const fields = require("./productValidator");

const updatePricingSchema = z
  .object({
    sellingPrice: fields.sellingPrice.optional(),
    discountPercentage: fields.discountPercentage.optional(),
    platformFee: fields.platformFee.optional()
  })
  .refine(
    data => Object.keys(data).length > 0,
    { message: "At least one pricing field is required" }
  );

module.exports = { updatePricingSchema };
