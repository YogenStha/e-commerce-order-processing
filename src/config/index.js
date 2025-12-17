require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'order_exchange',
    queue: process.env.RABBITMQ_QUEUE || 'order_queue',
    routingKey: process.env.RABBITMQ_ROUTING_KEY || 'order.created'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || 'redis123'
  },
  pubsub: {
    channel: process.env.REDIS_PUBSUB_CHANNEL || 'order:status'
  }
};

