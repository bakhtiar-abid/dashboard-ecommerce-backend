const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");

const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xztta.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});

console.log(uri);

async function run() {
   try {
      await client.connect();
      console.log("Connected to MongoDB");
      const database = client.db("ecommerceDashboard");
      const productCollection = database.collection("productList");

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
