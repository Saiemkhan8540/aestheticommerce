const { z } = require("zod");
const fields = require("./productValidator");
const { toNumber } = require("./helper");

const myProductQuerySchema = z.object({
    category: fields.category.optional(),
    subcategory: fields.subcategory.optional(),
    minprice: toNumber.refine(val => val >= 0 ,{
        message : "Minprice should be positive"
    }).optional(),
    maxprice: toNumber.refine(val => val >= 0, {
        message : "maxprice should be positive "
    }).optional(),
    instock: z.enum(["true", "false"]).optional(),
    minrating: toNumber.refine(v => v >= 0 && v <= 5).optional(),
    tag: z.string().optional()
})

module.exports = { myProductQuerySchema };