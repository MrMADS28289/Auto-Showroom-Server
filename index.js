const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ii6vt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {

    try {
        await client.connect();
        const inventoryCollection = client.db('inventory').collection('cars');

        // add inventory
        app.post('/inventory', async (req, res) => {
            const newInventory = req.body;
            const result = await inventoryCollection.insertOne(newInventory);
            res.send(result);
        })

        // get inventory from db
        app.get('/cars', async (req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const cars = await cursor.toArray();
            res.send(cars);
        })

        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const car = await inventoryCollection.findOne(query);
            res.send(car);
        })

        app.get('/myinventory', async (req, res) => {
            const email = req.query.email;
            const query = { userEmail: email };
            const cursor = inventoryCollection.find(query);
            const cars = await cursor.toArray();
            res.send(cars);
        })

        // update car
        app.put('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const updateCar = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateCar.name,
                    suplier: updateCar.suplier,
                    price: updateCar.price,
                    quantity: updateCar.quantity,
                    description: updateCar.description,
                    image: updateCar.image
                }
            }
            const result = await inventoryCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.send(result)
        })

        // DELETE
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result)
        })

    }
    finally {
        // client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello mads World!');
});

app.listen(port, () => {
    console.log('Auto showroom server running in port', port);
})