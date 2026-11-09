const { getDatabaseStatus, resetInMemoryStore } = require('../config/db');
const { initialProducts, initialCoupons } = require('../seed/initialData');
const ProductModel = require('../models/Product');
const CouponModel = require('../models/Coupon');
const OrderModel = require('../models/Order');
const { isMongo } = require('../config/db');

exports.getSystemStatus = async (req, res) => {
  res.json({
    success: true,
    status: 'online',
    database: getDatabaseStatus(),
    version: '0.1.0',
    timestamp: new Date()
  });
};

exports.resetData = async (req, res, next) => {
  try {
    if (isMongo()) {
      await ProductModel.deleteMany({});
      await CouponModel.deleteMany({});
      await OrderModel.deleteMany({});
      await ProductModel.insertMany(initialProducts);
      await CouponModel.insertMany(initialCoupons);
    } else {
      resetInMemoryStore();
    }
    res.json({
      success: true,
      message: 'System data reset to initial seed state successfully.'
    });
  } catch (err) {
    next(err);
  }
};

