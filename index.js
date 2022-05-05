const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const tokenInfo = req.headers.authorization;

    if (!tokenInfo) {
        return res.status(401).send({ message: 'Unouthorize access' })
    }
    const token = tokenInfo.split(' ')[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        else {
            req.decoded = decoded;
            next();
        }
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ii6vt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {

    try {
        await client.connect();
        const inventoryCollection = client.db('inventory').collection('cars');

        // use jwt
        app.post('/login', (req, res) => {
            const email = req.body;
            const token = jwt.sign(email, process.env.SECRET_KEY)
            // console.log(email, token);
            res.send({ token });
        })

        // add inventory
        app.post('/inventory', verifyJWT, async (req, res) => {
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

        app.get('/myinventory', verifyJWT, async (req, res) => {
            const decodedEmail = req?.decoded?.email;
            const email = req?.query?.email;
            console.log(decodedEmail, email);
            if (email === decodedEmail) {
                const query = { userEmail: email };
                const cursor = inventoryCollection.find(query);
                const cars = await cursor.toArray();
                res.send(cars);
            }
            else {
                res.status(403).send({ message: 'Forbidden access' })
            }
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

// https://git.heroku.com/auto-shoroom.git