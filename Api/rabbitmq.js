const amqp = require('amqplib');

// const RABBITMQ_URL = process.env.RABBITMQ_URL|| "amqp://localhost";
const QUEUE = "order_queue";
let channel;


//Connect to RabbitMQ
async function connectRabbitMQ(){
    const connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE,{durable:true});
    console.log("Connected to RabbitMQ, queue.");
}

//Publish message
async function publishOrderMessage(order) {
    if(!channel) await connectRabbitMQ();
    const message = JSON.stringify(order);
    channel.sendToQueue(QUEUE, Buffer.from(message),{persistent: true}); 
}

//close connection
async function closeRabbitMQ(){
    if (channel) await channel.close();
}

connectRabbitMQ();
module.exports = {
    publishOrderMessage,
    closeRabbitMQ
};
