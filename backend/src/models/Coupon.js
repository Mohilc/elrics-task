const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['percentage', 'flat', 'shipping', 'buy2get1']
    },
    value: { type: Number, default: 0 },
    minPurchase: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null },
    expiresAt: { type: Date, required: true },
    active: { type: Boolean, default: true },
    description: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

