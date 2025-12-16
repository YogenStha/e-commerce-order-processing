const express = require('express');
const config = require('../config');
const orderRoutes = require('../routes/order.routes');
const rabbitmqService = require('../services/rabbitmq.service');

class Server {
  constructor() {
    this.app = express();
    this.port = config.server.port;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    this.app.get('/', (req, res) => {
      res.json({ message: 'E-Commerce Order Processing API' });
    });

    this.app.use('/api', orderRoutes);

    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Route not found',
        path: req.path
      });
    });

    this.app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: err.message
      });
    });
  }

  async start() {
    try {
      await rabbitmqService.connect();

      this.server = this.app.listen(this.port, () => {
        console.log(`Order API running on port ${this.port}`);
        console.log(`Health check: http://localhost:${this.port}/api/health`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  async stop() {
    if (this.server) {
      this.server.close();
    }
    await rabbitmqService.close();
  }
}

module.exports = Server;

