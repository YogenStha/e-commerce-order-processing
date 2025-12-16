const { consumeOrderMessages } = require('./rabbitmq.js');
const { setOrderCache, setOrderStatus } = require('./redis.js');

console.log('Order Worker starting...');

// Process order
async function processOrder(order) {
  try {
    console.log(`Processing order: ${order.orderId}`);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add basic metadata
    const processedOrder = {
      ...order,
      status: 'processed',
      processedAt: new Date().toISOString(),
      totalAmount: order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };

    // Save to Redis
    await setOrderCache(order.orderId, processedOrder, 7200);
    await setOrderStatus(order.orderId, 'processed', 7200);

    console.log(`Order processed: ${order.orderId}`);
  } catch (error) {
    console.error(`Error processing order ${order.orderId}:`, error);

    const failedOrder = { ...order, status: 'failed', error: error.message };
    await setOrderCache(order.orderId, failedOrder);
    await setOrderStatus(order.orderId, 'failed');
  }
}

// Start worker
async function startWorker() {
  console.log('Listening for orders...');
  await consumeOrderMessages(processOrder);
}

startWorker();

// Graceful shutdown
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));