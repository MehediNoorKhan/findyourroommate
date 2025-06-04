const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);
const app = express();
const port = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());

//username: roommate_finder
//password: LKEtQadh8I7LnSvH

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9u7caon.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
        tls: true,
    }
});
async function run() {
    try {

        await client.connect();

        const database = client.db("roommate_finder");
        const userCollection = database.collection("users");

        app.post('/users', async (req, res) => {
            const users = req.body;
            const result = await userCollection.insertOne(users);
            res.send(result);
        });
        app.get('/users', async (req, res) => {
            const users = req.body;
            const result = await userCollection.find().toArray();
            res.send(result);
        });
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            if (!user) {
                res.status(404).send({ message: 'User not found' });
                return;
            }
            res.send(user);
        });




        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Roommate finder');
});

app.listen(port, (req, res) => {
    console.log('Who is there?');
})

