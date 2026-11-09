const orderService = require('../services/orderService');

exports.createOrder = async (req, res, next) => {
  try {
    const { items, couponCode, customer } = req.body;
    const order = await orderService.createOrder({ items, couponCode, customer });
    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

