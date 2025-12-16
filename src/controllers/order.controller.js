const Order = require('../models/order.model');
const orderRepository = require('../repositories/order.repository');
const rabbitmqService = require('../services/rabbitmq.service');
const config = require('../config');

class OrderController {
  async createOrder(req, res) {
    try {
      const order = new Order(req.body);
      
      const validation = order.validate();
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }

      await orderRepository.save(order.orderId, order.toJSON());

      await rabbitmqService.publish(config.rabbitmq.routingKey, order.toJSON());

      console.log(`Order created: ${order.orderId}`);

      return res.status(201).json({
        message: 'Order created successfully',
        orderId: order.orderId,
        status: order.status
      });
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({
        error: 'Failed to create order',
        message: error.message
      });
    }
  }

  async getOrder(req, res) {
    try {
      const { id } = req.params;

      const order = await orderRepository.findById(id);

      if (!order) {
        return res.status(404).json({
          error: 'Order not found'
        });
      }

      console.log(`Order retrieved: ${id}`);

      return res.json({
        order
      });
    } catch (error) {
      console.error('Error retrieving order:', error);
      return res.status(500).json({
        error: 'Failed to retrieve order',
        message: error.message
      });
    }
  }

  async getOrderStatus(req, res) {
    try {
      const { id } = req.params;

      const status = await orderRepository.getStatus(id);

      if (!status) {
        return res.status(404).json({
          error: 'Order status not found'
        });
      }

      return res.json({
        orderId: id,
        ...status
      });
    } catch (error) {
      console.error('Error retrieving order status:', error);
      return res.status(500).json({
        error: 'Failed to retrieve order status',
        message: error.message
      });
    }
  }

  async getStats(req, res) {
    try {
      const processedCount = await orderRepository.getProcessedCount();

      return res.json({
        processedOrders: processedCount,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error retrieving stats:', error);
      return res.status(500).json({
        error: 'Failed to retrieve stats',
        message: error.message
      });
    }
  }

  healthCheck(req, res) {
    return res.json({
      status: 'live',
      service: 'order-api',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new OrderController();

