const ProductModel = require('../models/Product');
const { isMongo, getInMemoryStore } = require('../config/db');

class ProductService {
  async getAllProducts(filters = {}) {
    if (isMongo()) {
      const query = {};
      if (filters.category && filters.category !== 'All') {
        query.category = filters.category;
      }
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }
      return await ProductModel.find(query).lean();
    } else {
      let prods = getInMemoryStore().products;
      if (filters.category && filters.category !== 'All') {
        prods = prods.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
      }
      if (filters.search) {
        const s = filters.search.toLowerCase();
        prods = prods.filter(p => p.name.toLowerCase().includes(s) || (p.description && p.description.toLowerCase().includes(s)));
      }
      return prods;
    }
  }

  async getProductById(id) {
    if (isMongo()) {
      return await ProductModel.findOne({ id }).lean() || await ProductModel.findById(id).lean();
    } else {
      const store = getInMemoryStore();
      return store.products.find(p => p.id === id || p._id === id) || null;
    }
  }

  async decrementStock(items) {
    // items: array of { productId, quantity }
    if (isMongo()) {
      for (const item of items) {
        const prod = await ProductModel.findOne({ id: item.productId });
        if (!prod) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        if (prod.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${item.quantity}`);
        }
        prod.stock -= item.quantity;
        await prod.save();
      }
    } else {
      const store = getInMemoryStore();
      // First check all stocks
      for (const item of items) {
        const prod = store.products.find(p => p.id === item.productId || p._id === item.productId);
        if (!prod) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        if (prod.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${item.quantity}`);
        }
      }
      // Then decrement
      for (const item of items) {
        const prod = store.products.find(p => p.id === item.productId || p._id === item.productId);
        prod.stock -= item.quantity;
      }
    }
    return true;
  }
}

module.exports = new ProductService();

