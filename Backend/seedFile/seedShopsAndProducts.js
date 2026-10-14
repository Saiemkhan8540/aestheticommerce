const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Seller = require("../models/seller.model");
const Product = require("../models/product.model");

const SEED_TAG = "seeded";

const sellers = [
  {
    sellerName: "Aarav Mehta",
    storeName: "Little Things",
    email: "seed.littlethings@example.com",
    phone: "9000000001",
  },
  {
    sellerName: "Isha Rao",
    storeName: "Model Project",
    email: "seed.modelproject@example.com",
    phone: "9000000002",
  },
  {
    sellerName: "Kabir Shah",
    storeName: "Shaba's Art",
    email: "seed.shabasart@example.com",
    phone: "9000000003",
  },
];

const productTemplates = [
  {
    name: "Handwoven Tote",
    description: "A handcrafted tote bag woven with eco-friendly fiber.",
    sellingPrice: 1299,
    mrp: 1599,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    ],
    category: "Home Decor",
    subcategory: "Accessories",
    tags: ["handmade", "bag", SEED_TAG],
    rating: 4.6,
    inStock: 25,
  },
  {
    name: "Ceramic Minimal Vase",
    description: "Minimal ceramic vase for modern interiors.",
    sellingPrice: 899,
    mrp: 1199,
    images: [
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=800",
    ],
    category: "Home Decor",
    subcategory: "Vase",
    tags: ["ceramic", "decor", SEED_TAG],
    rating: 4.4,
    inStock: 18,
  },
  {
    name: "Cozy Throw",
    description: "Soft knit throw for a warm and cozy setup.",
    sellingPrice: 1599,
    mrp: 1999,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800",
    ],
    category: "Home Decor",
    subcategory: "Textiles",
    tags: ["textile", "cozy", SEED_TAG],
    rating: 4.7,
    inStock: 12,
  },
  {
    name: "Handcrafted Earrings",
    description: "Lightweight statement earrings for daily wear.",
    sellingPrice: 499,
    mrp: 699,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    ],
    category: "Jewelry",
    subcategory: "Earrings",
    tags: ["jewelry", "earrings", SEED_TAG],
    rating: 4.2,
    inStock: 35,
  },
  {
    name: "Candle Holder Set",
    description: "A pair of hand-painted candle holders.",
    sellingPrice: 799,
    mrp: 999,
    images: [
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=800",
    ],
    category: "Home Decor",
    subcategory: "Candle Holder",
    tags: ["decor", "candle", SEED_TAG],
    rating: 4.5,
    inStock: 22,
  },
  {
    name: "Macrame Wall Art",
    description: "Boho macrame wall hanging for living rooms.",
    sellingPrice: 1799,
    mrp: 2199,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800",
    ],
    category: "Home Decor",
    subcategory: "Wall Art",
    tags: ["wall", "macrame", SEED_TAG],
    rating: 4.8,
    inStock: 8,
  },
];

const productVariants = [
  {
    label: "Classic",
    sellingPriceDelta: 0,
    mrpDelta: 0,
    discountPercentage: 8,
    stockMultiplier: 1,
    stockOffset: 4,
    ratingDelta: 0,
  },
  {
    label: "Studio",
    sellingPriceDelta: 180,
    mrpDelta: 260,
    discountPercentage: 18,
    stockMultiplier: 1,
    stockOffset: -3,
    ratingDelta: 0.1,
  },
  {
    label: "Festive",
    sellingPriceDelta: 320,
    mrpDelta: 420,
    discountPercentage: 42,
    stockMultiplier: 1,
    stockOffset: -8,
    ratingDelta: 0.2,
  },
];

const normalizeStock = (value) => Math.max(0, value);
const normalizeRating = (value) => Math.min(5, Number(value.toFixed(1)));

async function seed() {
  await mongoose.connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Remove previous seeded products only (safe to re-run)
  await Product.deleteMany({ tags: SEED_TAG });

  const createdSellers = [];

  for (const seller of sellers) {
    const existing = await Seller.findOne({ email: seller.email });
    if (existing) {
      await Seller.updateOne(
        { _id: existing._id },
        {
          $set: {
            sellerName: seller.sellerName,
            storeName: seller.storeName,
            status: "approved",
            isEmailVerified: true,
            onboardingCompleted: true,
            verificationStatus: "verified",
          },
        },
      );
      createdSellers.push(existing);
      continue;
    }

    const created = await Seller.create({
      ...seller,
      password: "seeded-password",
      status: "approved",
      isEmailVerified: true,
      onboardingCompleted: true,
      verificationStatus: "verified",
      businessType: "individual",
    });
    createdSellers.push(created);
  }

  const productsToInsert = [];
  createdSellers.forEach((seller) => {
    productTemplates.forEach((template, templateIndex) => {
      productVariants.forEach((variant, variantIndex) => {
        const computedStock = normalizeStock(
          template.inStock * variant.stockMultiplier + variant.stockOffset,
        );

        productsToInsert.push({
          ...template,
          name: `${template.name} ${variant.label} ${templateIndex + 1}-${variantIndex + 1}`,
          description: `${template.description} ${variant.label} edition for seeded shop browsing tests.`,
          sellingPrice: template.sellingPrice + variant.sellingPriceDelta,
          mrp: template.mrp + variant.mrpDelta,
          discountPercentage: variant.discountPercentage,
          rating: normalizeRating(template.rating + variant.ratingDelta),
          inStock: computedStock,
          tags: [...template.tags, variant.label.toLowerCase(), `page-${variantIndex + 1}`],
          sellerId: seller._id,
          approvalStatus: "approved",
        });
      });
    });
  });

  await Product.insertMany(productsToInsert);

  console.log(`✅ Seeded ${createdSellers.length} sellers and ${productsToInsert.length} products`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
