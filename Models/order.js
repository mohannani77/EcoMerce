const { object } = require('joi')
const mongoose =require('mongoose')
const orderSchema=new mongoose.Schema({
    userId:{type:String,required:true},
    customerid:{type:String,required:true},
    paymentIntent:{type:String},
    products:[],
    subtotal:{type:Number,required:true},
    Total:{type:Number,required:true},
    shipping:{
        type:Object,required:true
    },
    delivary_status:{type:String,default:'pending'},
    payment_status:{type:String,required:true}
},
{timestamps:true})

const Order=mongoose.model("Order",orderSchema)
exports.Order=Order