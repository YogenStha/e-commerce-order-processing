const rabbitmqService = require('../services/rabbitmq.service');
const pubsubService = require('../services/pubsub.service');
const orderProcessor = require('./processor');
const config = require('../config');

class Worker {
  async start() {
    try {
      console.log('Order worker starting...');

      await rabbitmqService.connect();

      await pubsubService.subscribe(config.pubsub.channel, (message) => {
        console.log('Status update received:', message);
      });

      await rabbitmqService.consume(async (orderData) => {
        await orderProcessor.process(orderData);
      });

      console.log('Worker is listening for orders...');
    } catch (error) {
      console.error('Failed to start worker:', error);
      process.exit(1);
    }
  }

  async stop() {
    await rabbitmqService.close();
    await pubsubService.close();
  }
}

const worker = new Worker();

worker.start();

process.on('SIGINT', async () => {
  console.log('Shutting down worker gracefully...');
  await worker.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down worker gracefully...');
  await worker.stop();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

