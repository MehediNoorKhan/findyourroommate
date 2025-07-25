require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    },
});
async function run() {
    try {
        // await client.connect();

        const database = client.db("roommate_finder");
        const userCollection = database.collection("users");
        const postCollection = database.collection("posts");
        const testimonialCollection = database.collection("testimonials");

        app.post("/users", async (req, res) => {
            const users = req.body;
            const result = await userCollection.insertOne(users);
            res.send(result);
        });

        app.get("/users", async (req, res) => {
            const users = req.body;
            const result = await userCollection.find().toArray();
            res.send(result);
        });
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            if (!user) {
                res.status(404).send({ message: "User not found" });
                return;
            }
            res.send(user);
        });

        app.post("/listings", async (req, res) => {
            const post = req.body;
            const result = await postCollection.insertOne(post);

            res.send(result);
        });
        app.get("/listings", async (req, res) => {
            const listing = req.body;
            const result = await postCollection.find().toArray();
            res.send(result);
        });

        // Get a listing by ID
        app.get('/listings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const post = await postCollection.findOne(query);
            res.send(post);
        });

        app.get("/listings/user/:email", async (req, res) => {
            const email = req.params.email;
            const result = await postCollection.find({ userEmail: email }).toArray();
            res.send(result);
        });

        app.delete("/listings/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await postCollection.deleteOne(query);
            res.send(result);
        });


        // Update a listing
        app.put('/listings/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;

            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    title: updatedData.title,
                    location: updatedData.location,
                    rent: updatedData.rent,
                    roomType: updatedData.roomType,
                    lifestyle: updatedData.lifestyle,
                    description: updatedData.description,
                    contact: updatedData.contact,
                    availability: updatedData.availability,
                },
            };

            const result = await postCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        app.post("/testimonials", async (req, res) => {
            const { name, location, message, image } = req.body;
            if (!name || !location || !message || !image) {
                return res.status(400).send({ error: "All fields are required" });
            }
            const review = { name, location, message, image };
            const result = await testimonialCollection.insertOne(review);
            res.send(result);
        });

        app.get("/testimonials", async (req, res) => {
            const reviews = await testimonialCollection.find().toArray();
            res.send(reviews);
        });

        app.patch("/listings/like/:id", async (req, res) => {
            const id = req.params.id;
            const { email } = req.body;

            try {
                const filter = { _id: new ObjectId(id) };

                const update = {
                    $inc: { likes: 1 },
                    $addToSet: { likedBy: email },
                };

                await postCollection.updateOne(filter, update);

                const updatedPost = await postCollection.findOne(filter);
                res.send({ likes: updatedPost.likes });
            } catch (err) {
                console.error(err);
                res.status(500).send({ error: "Failed to update likes" });
            }
        });


        // await client.db("admin");

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Roommate finder");
});

app.listen(port, (req, res) => {
    console.log("Who is there?");
});
