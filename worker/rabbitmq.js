const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const QUEUE_NAME = 'order_queue';

let channel;

// Connect to RabbitMQ
async function connectRabbitMQ() {
  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  await channel.prefetch(1); // process one message at a time
  console.log(`Worker connected, listening on queue: ${QUEUE_NAME}`);
}

// Consume messages
async function consumeOrderMessages(processCallback) {
  if (!channel) await connectRabbitMQ();

  channel.consume(
    QUEUE_NAME,
    async (message) => {
      if (!message) return;
      try {
        const orderData = JSON.parse(message.content.toString());
        console.log(`Received order: ${orderData.orderId}`);

        await processCallback(orderData);

        channel.ack(message); // acknowledge after successful processing
        console.log(`Order acknowledged: ${orderData.orderId}`);
      } catch (err) {
        console.error('Error processing message:', err);
        channel.ack(message); // prevent infinite requeue loop
      }
    },
    { noAck: false }
  );
}

// Close connection
async function closeRabbitMQ() {
  if (channel) await channel.close();
}

module.exports = { consumeOrderMessages, closeRabbitMQ };