const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
require("dotenv").config();
const { MongoClient } = require("mongodb");

const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5001;

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
   credential: admin.credential.cert(serviceAccount),
});
// middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xztta.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});

async function verifyToken(req, res, next) {
   if (req.headers?.authorization?.startsWith("Bearer ")) {
      const token = req.headers.authorization.split(" ")[1];

      try {
         const decodedUser = await admin.auth().verifyIdToken(token);
         req.decodedEmail = decodedUser.email;
      } catch {}
   }
   next();
}

async function run() {
   try {
      await client.connect();
      console.log("Connected to MongoDB");
      const database = client.db("ecommerceDashboard");
      const productCollection = database.collection("productList");
      const ordersCollection = database.collection("orderList");
      const usersCollection = database.collection("users");

      //GET PRODUCTS API
      app.get("/products", async (req, res) => {
         const cursor = productCollection.find({});
         const result = await cursor.toArray();
         res.json(result);
      });

      //GET Single Item API
      app.get("/productDetail/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const productDetail = await productCollection.findOne(query);
         res.json(productDetail);
      });

      //POST PLACE ORDER API
      app.post("/placeorder", async (req, res) => {
         const orderData = req.body;
         console.log("orderData", orderData);
         const result = await ordersCollection.insertOne(orderData);
         res.json(result);
      });

      //PUT User Information
      app.put("/users", async (req, res) => {
         const user = req.body;
         const filter = { email: user.email };
         const options = { upsert: true };
         const updateDoc = { $set: user };
         const result = await usersCollection.updateOne(
            filter,
            updateDoc,
            options
         );
         res.json(result);
      });

      //GET ADMIN API
      app.get("/users/:email", async (req, res) => {
         const email = req.params.email;
         const query = { email: email };
         const user = await usersCollection.findOne(query);
         let isAdmin = false;
         if (user?.role === "admin") {
            isAdmin = true;
         }
         res.json({ admin: isAdmin });
      });

      //GET USERs INFO API
       app.get("/users", async (req, res) => {
          const cursor = usersCollection.find({});
          const result = await cursor.toArray();
          res.json(result);
       });
   } finally {
      // await client.close();
   }
}

run().catch(console.dir);

app.get("/", (req, res) => {
   res.send("ecommerce Server is running!");
});

app.listen(port, () => {
   console.log(`listening at ${port}`);
});
