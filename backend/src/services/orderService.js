const OrderModel = require('../models/Order');
const productService = require('./productService');
const couponService = require('./couponService');
const { calculateBilling } = require('./billingEngine');
const { isMongo, getInMemoryStore } = require('../config/db');

class OrderService {
  async createOrder({ items = [], couponCode = null, customer = {} }) {
    // 1. Validate empty cart
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Cannot place an order with an empty cart.');
    }

    // 2. Validate customer details
    if (!customer.name || !customer.email || !customer.address) {
      throw new Error('Please provide complete customer details (Name, Email, Address).');
    }

    // 3. Resolve each product from database/store to ensure authentic pricing and stock
    const enrichedItems = [];
    const stockCheckItems = [];

    for (const item of items) {
      const prodId = item.productId || item.id || (item.product && (item.product.id || item.product._id));
      const qty = parseInt(item.quantity, 10);

      if (!prodId) {
        throw new Error('Invalid cart item: missing product identifier.');
      }
      if (isNaN(qty) || qty <= 0) {
        throw new Error(`Invalid quantity for item ${prodId}: must be greater than 0.`);
      }

      const product = await productService.getProductById(prodId);
      if (!product) {
        throw new Error(`Product "${prodId}" does not exist.`);
      }

      if (product.stock < qty) {
        throw new Error(`Cannot place order: "${product.name}" only has ${product.stock} units in stock (requested ${qty}).`);
      }

      enrichedItems.push({
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          image: product.image,
          isAccessory: product.isAccessory
        },
        quantity: qty
      });

      stockCheckItems.push({
        productId: product.id,
        quantity: qty
      });
    }

    // 4. Validate coupon if provided
    let coupon = null;
    if (couponCode) {
      coupon = await couponService.getCouponByCode(couponCode);
      if (!coupon) {
        throw new Error(`Coupon "${couponCode}" is invalid.`);
      }
    }

    // 5. Compute billing with exact engine
    const billing = calculateBilling(enrichedItems, coupon);

    // 6. Atomically decrement stock
    await productService.decrementStock(stockCheckItems);

    // 7. Generate unique Order ID
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderId = `ELR-${Date.now().toString().slice(-6)}-${randomHex}`;

    const orderData = {
      orderId,
      items: billing.itemsBreakdown.map(i => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        isAccessory: i.isAccessory,
        itemTotal: i.itemTotal
      })),
      subtotal: billing.subtotal,
      discount: billing.discount,
      taxableAmount: billing.taxableAmount,
      gstRate: billing.gstRate,
      gst: billing.gst,
      shipping: billing.shippingFee,
      total: billing.total,
      coupon: billing.appliedCoupon,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone ? customer.phone.trim() : '',
        address: customer.address.trim(),
        city: customer.city ? customer.city.trim() : '',
        postalCode: customer.postalCode ? customer.postalCode.trim() : ''
      },
      status: 'Confirmed',
      createdAt: new Date()
    };

    if (isMongo()) {
      const saved = await OrderModel.create(orderData);
      return saved.toObject();
    } else {
      const store = getInMemoryStore();
      store.orders.unshift(orderData);
      return orderData;
    }
  }

  async getAllOrders() {
    if (isMongo()) {
      return await OrderModel.find().sort({ createdAt: -1 }).lean();
    } else {
      return getInMemoryStore().orders;
    }
  }

  async getOrderById(orderId) {
    if (isMongo()) {
      return await OrderModel.findOne({ orderId }).lean();
    } else {
      const store = getInMemoryStore();
      return store.orders.find(o => o.orderId === orderId) || null;
    }
  }
}

module.exports = new OrderService();

