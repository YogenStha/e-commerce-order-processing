const Order = require('../models/order.model');
const orderRepository = require('../repositories/order.repository');
const pubsubService = require('../services/pubsub.service');
const config = require('../config');

class OrderProcessor {
  async process(orderData) {
    try {
      console.log(`Processing order: ${orderData.orderId}`);

      await this.simulateProcessing();

      const order = new Order({
        ...orderData,
        status: 'processed',
        processedAt: new Date().toISOString()
      });

      await orderRepository.save(order.orderId, order.toJSON(), 7200);
      await orderRepository.setStatus(order.orderId, 'processed', 7200);
      await orderRepository.incrementProcessedCount();

      await pubsubService.publish(config.pubsub.channel, {
        orderId: order.orderId,
        status: 'processed',
        timestamp: new Date().toISOString()
      });

      console.log(`Order processed successfully: ${order.orderId}`);
    } catch (error) {
      console.error(`Error processing order ${orderData.orderId}:`, error);
      await this.handleFailure(orderData, error);
    }
  }

  async handleFailure(orderData, error) {
    try {
      const failedOrder = new Order({
        ...orderData,
        status: 'failed',
        processedAt: new Date().toISOString(),
        error: error.message
      });

      await orderRepository.save(failedOrder.orderId, failedOrder.toJSON());
      await orderRepository.setStatus(failedOrder.orderId, 'failed');

      await pubsubService.publish(config.pubsub.channel, {
        orderId: failedOrder.orderId,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error handling failure:', err);
    }
  }

  async simulateProcessing() {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
}

module.exports = new OrderProcessor();

