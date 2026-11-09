const env = require('../config/env');

/**
 * Rounds a number to two decimal places
 */
function round2(val) {
  return Math.round((Number(val) + Number.EPSILON) * 100) / 100;
}

/**
 * Pure Billing Calculation Engine
 * 
 * Order of computation:
 * 1. Subtotal = sum of (item.price * item.quantity)
 * 2. Coupon Discount = evaluated strictly according to coupon rules
 * 3. GST = (Subtotal - Discount) * gstRate%
 * 4. Shipping = standard fee (₹49), free if (Subtotal - Discount) >= threshold (₹999) OR FREESHIP coupon
 * 5. Total = (Subtotal - Discount) + GST + Shipping
 * 
 * @param {Array} items - Array of { product: { id, price, isAccessory, ... }, quantity }
 * @param {Object|null} coupon - Coupon object or null
 * @param {Object} options - Override rates { gstRate, shippingFee, freeShipAbove }
 */
function calculateBilling(items = [], coupon = null, options = {}) {
  const gstRate = options.gstRate !== undefined ? Number(options.gstRate) : env.gstRate;
  const shippingFee = options.shippingFee !== undefined ? Number(options.shippingFee) : env.shippingFee;
  const freeShipAbove = options.freeShipAbove !== undefined ? Number(options.freeShipAbove) : env.freeShipAbove;

  // 1. Validate items
  if (!Array.isArray(items) || items.length === 0) {
    return {
      subtotal: 0,
      itemCount: 0,
      discount: 0,
      taxableAmount: 0,
      gstRate,
      gst: 0,
      shippingFee: 0,
      isFreeShipping: false,
      shippingReason: 'No items in cart',
      total: 0,
      appliedCoupon: null,
      savings: 0,
      freeShipThreshold: freeShipAbove,
      amountNeededForFreeShipping: freeShipAbove,
      itemsBreakdown: []
    };
  }

  // Calculate items breakdown & subtotal
  let subtotal = 0;
  let itemCount = 0;
  const itemsBreakdown = [];
  const accessoryUnits = [];

  for (const item of items) {
    const product = item.product || item;
    const qty = Number(item.quantity);

    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Invalid item quantity: ${item.quantity}. Quantity must be at least 1.`);
    }

    const price = Number(product.price);
    if (isNaN(price) || price < 0) {
      throw new Error(`Invalid product price for ${product.name || product.id || 'item'}`);
    }

    const itemTotal = round2(price * qty);
    subtotal += itemTotal;
    itemCount += qty;

    const isAccessory = Boolean(
      product.isAccessory ||
      (product.category && product.category.toLowerCase() === 'accessories')
    );

    if (isAccessory) {
      for (let i = 0; i < qty; i++) {
        accessoryUnits.push({
          productId: product.id || product._id,
          name: product.name,
          price
        });
      }
    }

    itemsBreakdown.push({
      productId: product.id || product._id,
      name: product.name,
      price,
      quantity: qty,
      isAccessory,
      itemTotal
    });
  }

  subtotal = round2(subtotal);

  // 2. Coupon Discount Calculation
  let discount = 0;
  let appliedCoupon = null;
  let isFreeShipCoupon = false;

  if (coupon) {
    const code = (coupon.code || '').trim().toUpperCase();

    // Check active
    if (coupon.active === false) {
      throw new Error(`Coupon "${code}" is currently disabled or inactive.`);
    }

    // Check expiration
    if (coupon.expiresAt) {
      const expDate = new Date(coupon.expiresAt);
      if (!isNaN(expDate.getTime()) && expDate < new Date()) {
        throw new Error(`Coupon "${code}" has expired on ${expDate.toISOString().split('T')[0]}.`);
      }
    }

    // Check minimum purchase condition
    const minPurchase = Number(coupon.minPurchase) || 0;
    if (minPurchase > 0 && subtotal < minPurchase) {
      const diff = round2(minPurchase - subtotal);
      throw new Error(`Coupon "${code}" requires a minimum purchase of ₹${minPurchase.toLocaleString('en-IN')}. Add ₹${diff.toLocaleString('en-IN')} more to your cart.`);
    }

    const type = (coupon.type || '').toLowerCase();

    switch (type) {
      case 'percentage': {
        const pct = Number(coupon.value) || 0;
        let calculated = (subtotal * pct) / 100;
        if (coupon.maxDiscount && Number(coupon.maxDiscount) > 0) {
          calculated = Math.min(calculated, Number(coupon.maxDiscount));
        }
        discount = round2(calculated);
        break;
      }

      case 'flat': {
        const flatVal = Number(coupon.value) || 0;
        discount = round2(Math.min(flatVal, subtotal));
        break;
      }

      case 'shipping': {
        // Waives shipping charges in Step 4
        isFreeShipCoupon = true;
        discount = 0;
        break;
      }

      case 'buy2get1': {
        // Rule: Buy 2 Get 1 — 3 eligible accessories required. Cheapest eligible accessory unit is free.
        if (accessoryUnits.length < 3) {
          throw new Error(`Coupon "BUY2GET1" requires at least 3 eligible accessories in your cart. You currently have ${accessoryUnits.length}.`);
        }

        // Sort accessories by unit price ascending to find the cheapest unit
        accessoryUnits.sort((a, b) => a.price - b.price);
        const freeItem = accessoryUnits[0];
        discount = round2(freeItem.price);
        break;
      }

      default:
        throw new Error(`Unknown coupon type: "${coupon.type}" for coupon "${code}".`);
    }

    // Discount cannot exceed subtotal
    discount = Math.min(discount, subtotal);

    appliedCoupon = {
      code,
      type,
      discount,
      description: coupon.description || ''
    };
  }

  // 3. Tax / GST Calculation: 18% on (Subtotal - Coupon Discount). Shipping is not taxed.
  const taxableAmount = round2(Math.max(0, subtotal - discount));
  const gst = round2((taxableAmount * gstRate) / 100);

  // 4. Shipping Charges Calculation
  let finalShipping = 0;
  let isFreeShipping = false;
  let shippingReason = '';

  if (isFreeShipCoupon || (coupon && coupon.code === 'FREESHIP')) {
    finalShipping = 0;
    isFreeShipping = true;
    shippingReason = 'FREESHIP coupon applied';
  } else if (taxableAmount >= freeShipAbove) {
    finalShipping = 0;
    isFreeShipping = true;
    shippingReason = `Free shipping unlocked (Order value above ₹${freeShipAbove})`;
  } else {
    finalShipping = round2(shippingFee);
    isFreeShipping = false;
    shippingReason = `Standard shipping charge (Add ₹${round2(freeShipAbove - taxableAmount)} for free delivery)`;
  }

  // 5. Final Payable Amount
  const total = round2(taxableAmount + gst + finalShipping);

  // Total savings
  const regularShipping = taxableAmount < freeShipAbove ? shippingFee : 0;
  const shippingSavings = (isFreeShipping && regularShipping > 0) ? regularShipping : 0;
  const totalSavings = round2(discount + shippingSavings);

  return {
    subtotal,
    itemCount,
    discount,
    taxableAmount,
    gstRate,
    gst,
    shippingFee: finalShipping,
    isFreeShipping,
    shippingReason,
    total,
    appliedCoupon,
    savings: totalSavings,
    freeShipThreshold: freeShipAbove,
    amountNeededForFreeShipping: Math.max(0, round2(freeShipAbove - taxableAmount)),
    itemsBreakdown
  };
}

module.exports = {
  calculateBilling,
  round2
};

