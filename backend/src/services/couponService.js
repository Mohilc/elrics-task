const CouponModel = require('../models/Coupon');
const { isMongo, getInMemoryStore } = require('../config/db');
const { calculateBilling } = require('./billingEngine');

class CouponService {
  async getAllCoupons() {
    if (isMongo()) {
      return await CouponModel.find().lean();
    } else {
      return getInMemoryStore().coupons;
    }
  }

  async getCouponByCode(code) {
    if (!code || typeof code !== 'string') return null;
    const clean = code.trim().toUpperCase();
    if (isMongo()) {
      return await CouponModel.findOne({ code: clean }).lean();
    } else {
      const store = getInMemoryStore();
      return store.coupons.find(c => c.code.toUpperCase() === clean) || null;
    }
  }

  async validateCoupon(code, items = []) {
    const clean = (code || '').trim().toUpperCase();
    if (!clean) {
      throw new Error('Please enter a coupon code.');
    }

    const coupon = await this.getCouponByCode(clean);
    if (!coupon) {
      throw new Error(`Invalid coupon code: "${clean}". Please enter a valid coupon.`);
    }

    // Run pure calculation to test rules
    const billing = calculateBilling(items, coupon);
    return {
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount,
        description: coupon.description
      },
      discount: billing.discount,
      billing
    };
  }
}

module.exports = new CouponService();

