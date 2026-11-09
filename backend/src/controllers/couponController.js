const couponService = require('../services/couponService');

exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await couponService.getAllCoupons();
    res.json({
      success: true,
      data: coupons
    });
  } catch (err) {
    next(err);
  }
};

exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, items } = req.body;
    const result = await couponService.validateCoupon(code, items);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

