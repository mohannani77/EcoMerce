const express=require('express')
const Stripe=require('stripe');
const { Order } = require('../Models/order');
require("dotenv").config()
const stripe=Stripe(process.env.STRIPE_KEY)

const router=express.Router();


router.post('/create-checkout-session', async (req, res) => {
    const customer=await stripe.customers.create({
        metadata:{
            userId:req.body.userId,
        }
    })
let line_items=req.body.cartItems.map((x)=>{
    return {
        price_data:{
            currency:"inr",
            product_data:{
                name:x.name,
                images:[x.image.url],
                description:x.desc,
                metadata:{
                    id:x.id,
                }
            },
            unit_amount:x.price*100
        },
        quantity:x.cartQuantity,
    }
})
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
  shipping_address_collection: {allowed_countries: ['US', 'IN']},
  shipping_options: [
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {amount: 0, currency: 'inr'},
        display_name: 'Free shipping',
        delivery_estimate: {
          minimum: {unit: 'business_day', value: 5},
          maximum: {unit: 'business_day', value: 7},
        },
      },
    },
  ],
      line_items,
      phone_number_collection: {
        enabled: true,
      },
      customer:customer.id,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout-sucess`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    });
  
    res.send({url:session.url});
  });



const createOrder= async(customer,data,lineItems)=>{
    const newOrder=new Order({
        userId:customer.metadata.userId,
        customerid:data.customer,
        paymentIntent:data.payment_intent,
        products:lineItems.data,
        subtotal:data.amount_subtotal,
        Total:data.amount_total,
        shipping:data.customer_details,
        payment_status:data.payment_status
    })
    try {
        const savedOrder=await newOrder.save()
        // console.log("processed order is : ", savedOrder)
        
    } catch (err) {
        console.log(err.message)
    }
}

let endpointSecret 
// endpointSecret= "whsec_6f2b13c22ab5a13f695fcf13448923e5f002e6fc65cebdecc9bcdc6eb30337d4";
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let data;
  let eventtype;

  if(endpointSecret){
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        // console.log("webhook verified : ",event)
      } catch (err) {
        console.log(`Webhook Error: ${err.message}`)
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      data=event.data.object;
      eventtype=event.type;
      
  }else{
    data=req.body.data.object;
    eventtype=req.body.type
  }

  

  // Handle the event

  if(eventtype==='checkout.session.completed'){
        stripe.customers.retrieve(data.customer).then((customer)=>{
          stripe.checkout.sessions.listLineItems(
            data.id,
            {},
            function(err,lineItems){
              createOrder(customer,data,lineItems)
            }
          )
        }).catch(err => console.log(err.message))
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send().end();
});

module.exports=router
