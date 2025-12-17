const amqp = require('amqplib');
const config = require('../config');

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertExchange(config.rabbitmq.exchange, 'topic', { durable: true });
      await this.channel.assertQueue(config.rabbitmq.queue, { durable: true });
      await this.channel.bindQueue(
        config.rabbitmq.queue,
        config.rabbitmq.exchange,
        config.rabbitmq.routingKey
      );

      this.isConnected = true;

      this.connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err);
        this.isConnected = false;
      });

      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed');
        this.isConnected = false;
        setTimeout(() => this.connect(), 5000);
      });

      console.log('RabbitMQ connected successfully');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      setTimeout(() => this.connect(), 5000);
      throw error;
    }
  }

  async publish(routingKey, message) {
    if (!this.isConnected) {
      await this.connect();
    }

    const messageBuffer = Buffer.from(JSON.stringify(message));
    return this.channel.publish(
      config.rabbitmq.exchange,
      routingKey,
      messageBuffer,
      { persistent: true, contentType: 'application/json' }
    );
  }

  async consume(callback) {
    if (!this.isConnected) {
      await this.connect();
    }

    await this.channel.prefetch(1);

    return this.channel.consume(
      config.rabbitmq.queue,
      async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content, msg);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          this.channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.isConnected = false;
  }
}

module.exports = new RabbitMQService();

