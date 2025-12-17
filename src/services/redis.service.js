const Redis = require('ioredis');
const config = require('../config');

class RedisService {
  constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.client.on('connect', () => {
      console.log('Redis connected successfully');
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }

  async set(key, value, ttl = 3600) {
    const serialized = JSON.stringify(value);
    if (ttl) {
      return await this.client.setex(key, ttl, serialized);
    }
    return await this.client.set(key, serialized);
  }

  async get(key) {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async delete(key) {
    return await this.client.del(key);
  }

  async exists(key) {
    return await this.client.exists(key);
  }

  async increment(key) {
    return await this.client.incr(key);
  }

  async getCounter(key) {
    const count = await this.client.get(key);
    return parseInt(count) || 0;
  }

  async close() {
    await this.client.quit();
  }
}

module.exports = new RedisService();

