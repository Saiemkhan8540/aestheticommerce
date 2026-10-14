const { z } = require("zod");
const fields = require("./productValidator");

const updateDetailSchema = z
  .object({
    name: fields.name.optional(),
    description: fields.description.optional(),
    category: fields.category.optional(),
    subcategory: fields.subcategory.optional(),
    tags: fields.tags.optional(),
    rating: fields.rating.optional(),
    inStock: fields.inStock.optional(),
    productVideo: z.string().optional()
  })
  .refine(
    data => Object.keys(data).length > 0,
    { message: "At least one field must be provided for update" }
  );

module.exports = { updateDetailSchema };
