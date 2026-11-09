const mongoose = require('mongoose');
const env = require('../config/env');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { initialProducts, initialCoupons } = require('./initialData');

async function seed() {
  console.log('[Seed] Connecting to MongoDB:', env.mongoUri);
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('[Seed] Connected. Clearing collections...');

    await Product.deleteMany({});
    await Coupon.deleteMany({});

    await Product.insertMany(initialProducts);
    console.log(`[Seed] Seeded ${initialProducts.length} products.`);

    await Coupon.insertMany(initialCoupons);
    console.log(`[Seed] Seeded ${initialCoupons.length} coupons.`);

    console.log('[Seed] Database seeding completed successfully.');
  } catch (err) {
    console.log('[Seed] MongoDB not reached:', err.message);
    console.log('[Seed] Note: Backend automatically uses pre-seeded in-memory store if MongoDB is offline.');
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

seed();

