const mongoose = require('mongoose');
const env = require('./env');
const { initialProducts, initialCoupons } = require('../seed/initialData');

let isConnectedToMongo = false;
let inMemoryStore = {
  products: JSON.parse(JSON.stringify(initialProducts)),
  coupons: JSON.parse(JSON.stringify(initialCoupons)),
  orders: [],
  cart: { items: [], couponCode: null }
};

async function connectDB() {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });
    isConnectedToMongo = true;
    console.log(`[Database] Connected to MongoDB: ${conn.connection.host}`);
    return true;
  } catch (err) {
    isConnectedToMongo = false;
    console.log(`[Database] Notice: MongoDB (${env.mongoUri}) not available: ${err.message}`);
    console.log(`[Database] Switched seamlessly to High-Performance In-Memory Data Store.`);
    return false;
  }
}

function getDatabaseStatus() {
  return {
    type: isConnectedToMongo ? 'mongodb' : 'in-memory',
    uri: isConnectedToMongo ? env.mongoUri : 'memory://local',
    connected: true
  };
}

function getInMemoryStore() {
  return inMemoryStore;
}

function resetInMemoryStore() {
  inMemoryStore = {
    products: JSON.parse(JSON.stringify(initialProducts)),
    coupons: JSON.parse(JSON.stringify(initialCoupons)),
    orders: [],
    cart: { items: [], couponCode: null }
  };
  return inMemoryStore;
}

module.exports = {
  connectDB,
  getDatabaseStatus,
  getInMemoryStore,
  resetInMemoryStore,
  isMongo: () => isConnectedToMongo
};

