const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/elrics-billing',
  gstRate: parseFloat(process.env.GST_RATE) || 18,
  shippingFee: parseFloat(process.env.SHIPPING_FEE) || 49,
  freeShipAbove: parseFloat(process.env.FREE_SHIP_ABOVE) || 999,
  nodeEnv: process.env.NODE_ENV || 'development',
  nvidiaReasoningKey: process.env.NVIDIA_REASONING_KEY || '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',
  nvidiaReasoningModel: process.env.NVIDIA_REASONING_MODEL || 'nvidia/nemotron-3-super-120b-a12b',
  nvidiaGeneralKey: process.env.NVIDIA_GENERAL_KEY || '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',
  nvidiaGeneralModel: process.env.NVIDIA_GENERAL_MODEL || 'google/diffusiongemma-26b-a4b-it'
};
