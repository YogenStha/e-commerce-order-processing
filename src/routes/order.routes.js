const express = require('express');
const orderController = require('../controllers/order.controller');

const router = express.Router();

router.get('/health', orderController.healthCheck.bind(orderController));
router.post('/orders', orderController.createOrder.bind(orderController));
router.get('/orders/:id', orderController.getOrder.bind(orderController));
router.get('/orders/:id/status', orderController.getOrderStatus.bind(orderController));
router.get('/stats', orderController.getStats.bind(orderController));

module.exports = router;

