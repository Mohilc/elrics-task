const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    isAccessory: { type: Boolean, default: false },
    rating: { type: Number, default: 4.5 },
    reviewsCount: { type: Number, default: 0 },
    badge: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);

