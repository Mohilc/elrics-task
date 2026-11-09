const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');

const productRoutes = require('./routes/productRoutes');
const couponRoutes = require('./routes/couponRoutes');
const billingRoutes = require('./routes/billingRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Elrics Billing Engine API' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;

