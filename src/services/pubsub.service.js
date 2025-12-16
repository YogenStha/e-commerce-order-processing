const Redis = require('ioredis');
const config = require('../config');

class PubSubService {
  constructor() {
    this.publisher = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password
    });

    this.subscriber = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password
    });

    this.publisher.on('connect', () => {
      console.log('Redis publisher connected');
    });

    this.subscriber.on('connect', () => {
      console.log('Redis subscriber connected');
    });

    this.publisher.on('error', (err) => {
      console.error('Redis publisher error:', err);
    });

    this.subscriber.on('error', (err) => {
      console.error('Redis subscriber error:', err);
    });
  }

  async publish(channel, message) {
    const payload = JSON.stringify(message);
    return await this.publisher.publish(channel, payload);
  }

  async subscribe(channel, callback) {
    await this.subscriber.subscribe(channel);
    
    this.subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        try {
          const parsed = JSON.parse(message);
          callback(parsed);
        } catch (error) {
          console.error('Error parsing pubsub message:', error);
        }
      }
    });
  }

  async unsubscribe(channel) {
    return await this.subscriber.unsubscribe(channel);
  }

  async close() {
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}

module.exports = new PubSubService();

