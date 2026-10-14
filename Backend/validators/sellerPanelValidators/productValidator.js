const { z } = require("zod");

const name = z.string().min(2).max(100);
const description = z.string().min(5);
const category = z.string().min(2);
const subcategory = z.string().min(2);
const tags = z.preprocess((val) => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  }
  return val;
}, z.array(z.string()));
const rating = z.coerce.number().min(1).max(5);
const inStock = z.coerce.number().int().min(0);

const sellingPrice = z.coerce.number().positive();
const discountPercentage = z.coerce.number().min(0).max(100);
const platformFee = z.coerce.number().min(0);

module.exports = {
    name , description,category, subcategory , tags , rating , inStock ,
    sellingPrice , discountPercentage , platformFee
}