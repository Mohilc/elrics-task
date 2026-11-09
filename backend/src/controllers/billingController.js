const { calculateBilling } = require('../services/billingEngine');
const couponService = require('../services/couponService');
const productService = require('../services/productService');

exports.calculate = async (req, res, next) => {
  try {
    const { items = [], couponCode = null } = req.body;

    // Resolve products to get latest price and isAccessory status
    const resolvedItems = [];
    for (const item of items) {
      const prodId = item.productId || item.id || (item.product && (item.product.id || item.product._id));
      const qty = parseInt(item.quantity, 10);
      if (!prodId || isNaN(qty) || qty <= 0) continue;

      const product = await productService.getProductById(prodId);
      if (product) {
        resolvedItems.push({
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            isAccessory: product.isAccessory,
            stock: product.stock
          },
          quantity: qty
        });
      }
    }

    let coupon = null;
    let couponError = null;

    if (couponCode) {
      try {
        coupon = await couponService.getCouponByCode(couponCode);
        if (!coupon) {
          couponError = `Coupon "${couponCode}" is invalid.`;
        }
      } catch (err) {
        couponError = err.message;
      }
    }

    let billing;
    if (coupon && !couponError) {
      try {
        billing = calculateBilling(resolvedItems, coupon);
      } catch (err) {
        // Coupon rule failed (e.g. min purchase not met after item removal)
        couponError = err.message;
        // Fall back to billing without coupon
        billing = calculateBilling(resolvedItems, null);
      }
    } else {
      billing = calculateBilling(resolvedItems, null);
    }

    res.json({
      success: true,
      data: {
        ...billing,
        couponWarning: couponError
      }
    });
  } catch (err) {
    next(err);
  }
};

