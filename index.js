const express =require('express')
const cors= require('cors')
const app=express()
const mongoose=require('mongoose')
const products=require('./products')
const register=require('./routes/register')
const login=require('./routes/login')
const stripe =require('./routes/stripe')
const productRoute=require('./routes/products')
const  bodyParser = require('body-parser');
const users=require('./routes/users')
const orders=require('./routes/order')
require("dotenv").config()
// Add headers before the routes are defined
app.use(express.json({ limit: '50mb' }));
// app.use(express.json())
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
app.use(cors());
app.use("/api/register",register)
app.use("/api/login",login)
app.use('/api/stripe',stripe)
app.use("/api/products",productRoute)

app.use("/api/users",users)
app.use("/api/orders",orders)

app.get("/",async(req,res)=>{
res.send("welcome to our online shop API...!")
})

app.get("/products",async (req,res)=>{
    res.send(products)
})

const port=process.env.PORT || 5000
const uri=process.env.DB_URI
app.listen(port,console.log(`Server running on ${port}...`))


const MongoClient = require("mongodb").MongoClient;



const client = new MongoClient(uri, { useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  collection.insertOne({device: "mobile"}, {w: "majority"}, (err, res) => {
    console.log("Document inserted with write concern 'majority'");
    client.close();
  });
});


mongoose.connect(uri,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=> console.log("Mongodb Connected sucessfully....")).catch((err)=> console.log("Mongodb connection failed",err.message))