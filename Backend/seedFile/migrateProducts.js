const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/product.model');

// Load environment variables
// If running from Backend root, path should resolve correctly
dotenv.config({ path: path.join(__dirname, '../.env') });

const migrate = async () => {
    try {
        const mongoUri = process.env.DB_CONNECT || process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('DB_CONNECT is not defined in .env');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Access raw collection to see fields not in current schema
        const products = await mongoose.connection.collection('products').find({}).toArray();
        console.log(`Found ${products.length} products to check.`);

        let updatedCount = 0;

        for (const p of products) {
            const updates = {};
            const unsets = {};
            let needsUpdate = false;

            // 1. Migrate Price -> sellingPrice
            // If sellingPrice missing, take price.
            const currentSellingPrice = p.sellingPrice !== undefined ? p.sellingPrice : p.price;

            if (p.sellingPrice === undefined && p.price !== undefined) {
                updates.sellingPrice = p.price;
                unsets.price = "";
                needsUpdate = true;
            }

            // 2. Migrate originalPrice -> mrp
            // If mrp missing, take originalPrice/price.
            const currentMrp = p.mrp !== undefined ? p.mrp : (p.originalPrice !== undefined ? p.originalPrice : currentSellingPrice);

            if (p.mrp === undefined) {
                updates.mrp = currentMrp;
                if (p.originalPrice !== undefined) unsets.originalPrice = "";
                needsUpdate = true;
            } else if (p.originalPrice !== undefined) {
                // mrp exists, just removing garbage
                unsets.originalPrice = "";
                needsUpdate = true;
            }

            // 3. Set missing fees
            if (p.logisticsFee === undefined) {
                updates.logisticsFee = 60;
                needsUpdate = true;
            }
            if (p.transactionFee === undefined) {
                updates.transactionFee = 10;
                needsUpdate = true;
            }
            if (p.platformFee === undefined) {
                updates.platformFee = 0;
                needsUpdate = true;
            }

            // 4. Ensure discountPercentage
            if (p.discountPercentage === undefined) {
                if (currentMrp > currentSellingPrice && currentMrp > 0) {
                    const disc = ((currentMrp - currentSellingPrice) / currentMrp) * 100;
                    updates.discountPercentage = Math.round(disc);
                } else {
                    updates.discountPercentage = 0;
                }
                needsUpdate = true;
            }

            // 5. Ensure inStock (some old data might miss it)
            if (p.inStock === undefined) {
                updates.inStock = 0;
                needsUpdate = true;
            }

            if (needsUpdate) {
                const updateOps = {};
                if (Object.keys(updates).length > 0) updateOps.$set = updates;
                if (Object.keys(unsets).length > 0) updateOps.$unset = unsets;

                await mongoose.connection.collection('products').updateOne(
                    { _id: p._id },
                    updateOps
                );
                updatedCount++;
                console.log(`Updated product: ${p.name}`);
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} products.`);
        process.exit(0);

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
