
const {auth,isAdmin} =require('../middleware/auth')
const moment=require('moment');
const {Order} =require('../Models/order')
const router=require('express').Router();


// Get orders

router.get("/",async(req,res)=>{
    const querry=req.query.new
    try {
        const orders= querry? await Order.find().sort({_id:-1}).limit(4):await Order.find().sort({_id:-1})
        res.status(200).send(orders)
    } catch (error) {
        console.log(error.message)
        res.status(500).send(error)
    }
})



// update order

router.put("/:id",isAdmin,async(req,res)=>{
    try {
        const updateorder=await Order.findByIdAndUpdate(
            req.params.id,
            {
                $set:req.body,
            },
            {new:true}
        )
        res.status(200).send(updateorder)
    } catch (error) {
        res.status(500).send(error)
    }
})

//Get An Order

router.get("/findOne/:id",auth,async(req,res)=>{
    try {
  
        const order=await Order.findById(req.params.id)
    //  console.log(req.user.user.id)
        if(req.user.user.id !== order.userId || !req.user.user.isAdmin){
            return res.status(403).send("Access denied Not authorized....")
        }
        // console.log(order)
        res.status(200).send(order)
        
    } catch (error) {
        res.status(500).send(error)
    }
})


///// findBy UserId

router.get("/profile/:id",async(req,res)=>{
    try {
  console.log(req.params.id)
        const order=await Order.find({"userId":req.params.id})
    //  console.log(req.user.user.id)
    //  console.log(order)
        // if(req.user.user.id !== order.userId || !req.user.user.isAdmin){
        //     return res.status(403).send("Access denied Not authorized....")
        // }
        // console.log(order)
        res.status(200).send(order)
        
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// Get Order stats
router.get("/stats",isAdmin,async(req,res)=>{
    const previousMonth=moment()
        .month(moment().month()-1)
        .set("date",1)
        .format("YYYY-MM-DD HH:MM:SS")
  try {
    const orders=await Order.aggregate([
        {
            $match:{createdAt:{$gte: new Date(previousMonth)}}
        },
        {
            $project:{
                month:{$month:"$createdAt"}
            }
        },
        {
            $group:{
                _id:"$month",
                total:{$sum:1}
            }
        }
    ]);
    // console.log(orders)
    res.status(200).send(orders)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
});


// get income stats


router.get("/income/stats",isAdmin,async(req,res)=>{
    const previousMonth=moment()
        .month(moment().month()-1)
        .set("date",1)
        .format("YYYY-MM-DD HH:MM:SS")
  try {
    const income=await Order.aggregate([
        {
            $match:{createdAt:{$gte: new Date(previousMonth)}}
        },
        {
            $project:{
                month:{$month:"$createdAt"},
                sales:"$Total"
            }
        },
        {
            $group:{
                _id:"$month",
                total:{$sum:"$sales"}
            }
        }
    ]);
    res.status(200).send(income)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
});

// GET ! Week sales

router.get("/week-sales",isAdmin,async(req,res)=>{
    const last7Days=moment()
        .day(moment().day()-7)
        .format("YYYY-MM-DD HH:MM:SS")
  try {
    const income=await Order.aggregate([
        {
            $match:{createdAt:{$gte: new Date(last7Days)}}
        },
        {
            $project:{
                day:{$dayOfWeek:"$createdAt"},
                sales:"$Total"
            }
        },
        {
            $group:{
                _id:"$day",
                total:{$sum:"$sales"}
            }
        }
    ]);
    res.status(200).send(income)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
});



module.exports=router;