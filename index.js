const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
const cors = require("cors");


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://team-156:team-156@cluster0.kyk6k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db("blog");
    const usersCollection = database.collection("users");
    const postCollection = database.collection("posts");

    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    app.put("/user", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const option = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, option);
      res.json(result);
    });

    app.put("/user/makeadmin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let IsAdmin = false;
      if (user?.role === "admin") {
        IsAdmin = true;
      }
      res.json({ admin: IsAdmin });
    });

    app.post("/addpost", async (req, res) => {
      const ride = req.body;
      const result = await postCollection.insertOne(ride);
      res.json(result);
    });

    app.get("/userposts/:email", async (req, res) => {
      const email = req.params.email;
      const result = postCollection.find({ userEmail: email });
      const post = await result.toArray();
      res.json(post);
    });

    app.get("/allapprovedpost", async (req, res) => {
      const result = postCollection.find({ status:2} );
      const post = await result.toArray();
      res.json(post);
    });
    
    app.get("/allposts", async (req, res) => {
      const cursor = postCollection.find({});
      const post = await cursor.toArray();
      res.json(post);
    });
    
    app.delete("/post/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await postCollection.deleteOne(query);
      res.json(result);
    });

    app.put("/post/status", async (req, res) => {
      const post = req.body;
      const filter = { _id: ObjectId(post.id) };
      const updateDoc = { $set: { status: 2 } };
      const result = await postCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log("server started in ", port);
});