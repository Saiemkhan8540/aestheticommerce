const dotenv = require('dotenv');
dotenv.config({ path: '../.env' }); // updated
const mongoose = require("mongoose");
const Product = require("../models/product.model");
const mockData = require("../../FrontEnd/src/data/mockData.json");


// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  await Product.deleteMany(); 
  await Product.insertMany(mockData);
  console.log("✅ Product data seeded successfully!");
  process.exit();
})
.catch((err) => {
  console.error("❌ Failed to seed data:", err);
  process.exit(1);
});
