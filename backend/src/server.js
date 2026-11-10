const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');

async function startServer() {
  await connectDB();

  const server = app.listen(env.port, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  Elrics Billing Engine API Server Running!`);
    console.log(`  Local URL:   http://localhost:${env.port}`);
    console.log(`  Network URL: http://0.0.0.0:${env.port}`);
    console.log(`  Port: ${env.port}`);
    console.log(`  GST Rate: ${env.gstRate}% | Shipping: ₹${env.shippingFee}`);
    console.log(`  Free Shipping Above: ₹${env.freeShipAbove}`);
    console.log(`====================================================`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
