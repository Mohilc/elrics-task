const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
  category: { type: String, default: '' },
  isAccessory: { type: Boolean, default: false },
  itemTotal: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    taxableAmount: { type: Number, required: true },
    gstRate: { type: Number, default: 18 },
    gst: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    coupon: {
      code: { type: String },
      type: { type: String },
      discount: { type: Number }
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true }
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Processing', 'Shipped', 'Delivered'],
      default: 'Confirmed'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);

