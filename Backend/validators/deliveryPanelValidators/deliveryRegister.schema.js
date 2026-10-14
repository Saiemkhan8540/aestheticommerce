const { z } = require("zod");

module.exports = z.object({
  name: z.string().min(3 ,"Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6,"Password must be at least 6 characters"),
  phone: z.string().min(10 ,"Phone number must be exactly 10 digits"),
  currentCity: z.string().min(2 , "City must be at least 2 characters"),
});