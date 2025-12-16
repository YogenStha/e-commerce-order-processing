const Redis = require('ioredis');

const redis = new Redis({
  host:'localhost',
  port:6379,
  password: undefined
});

redis.on('connect', () => console.log('Connected to Redis'));
redis.on('error', (err) => console.error('Redis error:', err));

// Cache order with TTL
async function setOrderCache(orderId, orderData, ttl = 7200) {
  await redis.setex(`order:${orderId}`, ttl, JSON.stringify(orderData));
}

// Get order from cache
async function getOrderCache(orderId) {
  const data = await redis.get(`order:${orderId}`);
  return data ? JSON.parse(data) : null;
}

// Set order status with TTL
async function setOrderStatus(orderId, status, ttl = 7200) {
  await redis.setex(`order_status:${orderId}`, ttl, status);
}

// Get order status
async function getOrderStatus(orderId) {
  return await redis.get(`order_status:${orderId}`);
}

// Increment processed orders counter
async function incrementProcessedCount() {
  return await redis.incr('processed_orders_count');
}

// Get processed orders count
async function getProcessedCount() {
  const count = await redis.get('processed_orders_count');
  return parseInt(count) || 0;
}

// Close Redis connection
async function closeRedis() {
  await redis.quit();
}

module.exports = {
  setOrderCache,
  getOrderCache,
  setOrderStatus,
  getOrderStatus,
  incrementProcessedCount,
  getProcessedCount,
  closeRedis
};