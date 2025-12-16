const redisService = require('../services/redis.service');

class OrderRepository {
  constructor() {
    this.prefix = 'order';
    this.statusPrefix = 'order:status';
  }

  async save(orderId, orderData, ttl = 7200) {
    const key = `${this.prefix}:${orderId}`;
    return await redisService.set(key, orderData, ttl);
  }

  async findById(orderId) {
    const key = `${this.prefix}:${orderId}`;
    return await redisService.get(key);
  }

  async delete(orderId) {
    const key = `${this.prefix}:${orderId}`;
    return await redisService.delete(key);
  }

  async exists(orderId) {
    const key = `${this.prefix}:${orderId}`;
    return await redisService.exists(key);
  }

  async setStatus(orderId, status, ttl = 7200) {
    const key = `${this.statusPrefix}:${orderId}`;
    return await redisService.set(key, { status, updatedAt: new Date().toISOString() }, ttl);
  }

  async getStatus(orderId) {
    const key = `${this.statusPrefix}:${orderId}`;
    return await redisService.get(key);
  }

  async incrementProcessedCount() {
    return await redisService.increment('orders:processed:count');
  }

  async getProcessedCount() {
    return await redisService.getCounter('orders:processed:count');
  }
}

module.exports = new OrderRepository();

