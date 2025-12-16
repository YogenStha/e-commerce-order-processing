const express = require("express");
const {v4: uuidv4} = require('uuid');
const PORT = process.env.PORT|| 5000;
const {publishOrderMessage } = require("./rabbitmq.js");
const {setOrderCache, getOrderCache } = require("./redis.js");

const app = express();


//middleware 
app.use(express.json());



//check endpoint
app.get("/test", (req,res)=>{
    res.json({
        status:"Live",
        service: "order API",
        timestamp: new Date().toISOString()
    });
});

//create a new order
app.post("/orders", async(req, res)=>{
    try{
        const {customerName,items, totalAmount} = req.body;

        if(!customerName|| !items || items.length === 0){
            return res.status(400).json({
                error:"invalid order data."
            });
        }

        //generate unique id
         const orderId = uuidv4();

        //Create order
        const order ={
            orderId,
            customerName,
            items,
            totalAmount: totalAmount || items.reduce((sum, item)=> sum + (item.price * item.quantity), 0),
            status : "pending",
            createdAt: new Date().toISOString()
        };

        //order in redis
        await setOrderCache(orderId, order);

        //publish order to rabbitMQ for processing
        await publishOrderMessage(order);
        
        console.log(`order created:${orderId}`);
        res.status(201).json({
            message:"order created successfully",
            orderId,
            satus: "pending"
        });

    } catch (error){
        console.eeror("Error creating order: ", error);
        res.status(500).json({
            error: 'Failed to create order'
        });
    }
});

app.get("/orders/:id", async(req, res)=>{
    try{
        const {id} = req.params;

        const cachedOrder = await getOrderCache(id);

        if(!cachedOrder){
            return res.status(404).json({
                error: "order not found"
            })
        }
        console.log(`order retrieved from cache: ${id}`);
  res.json({ order: cachedOrder });
} catch (error) {
  res.status(500).json({ error: 'Failed to retrieve order' });
}

})


app.get('/orders', (req, res) => {
  res.json({
    message: 'Use GET /orders/:id to retrieve a specific order'
  });
});


app.listen(PORT,()=>{
    console.log(`Order API running on port ${PORT}`);
});