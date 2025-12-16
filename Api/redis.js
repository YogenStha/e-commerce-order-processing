const Redis = require('ioredis');

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  password: undefined
});

redis.on('connect', () => console.log('Connected to Redis'));
redis.on('error', (err) => console.error(' Redis error:', err));

// Cache order with TTL
async function setOrderCache(orderId, orderData, ttl = 3600) {
  const key = `order:${orderId}`;
  await redis.setex(key, ttl, JSON.stringify(orderData));
}

// Get order from cache
async function getOrderCache(orderId) {
  const data = await redis.get(`order:${orderId}`);
  return data ? JSON.parse(data) : null;
}

// Delete order from cache
async function deleteOrderCache(orderId) {
  await redis.del(`order:${orderId}`);
}

// Get order status
async function getOrderStatus(orderId) {
  return await redis.get(`order_status:${orderId}`);
}

// Set order status with TTL
async function setOrderStatus(orderId, status, ttl = 3600) {
  await redis.setex(`order_status:${orderId}`, ttl, status);
}

// Close Redis connection
async function closeRedis() {
  await redis.quit();
}

module.exports = {
  setOrderCache,
  getOrderCache,
  deleteOrderCache,
  getOrderStatus,
  setOrderStatus,
  closeRedis
};