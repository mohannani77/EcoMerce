const bcypt = require("bcrypt");
const joi = require("joi");
const express = require("express");
const User = require("../Models/user");
const jwtAuthToken = require('../utilities/jwtAuthToken');
const jwt = require("jsonwebtoken");


const router=express.Router();

router.post('/',async (req,res)=>{
 try {
    const schema=joi.object({
        email:joi.string().max(200).min(3).required().email(),
        password:joi.string().min(6).max(200).required()
    })
    const {err}=schema.validate(req.body)
    if(err) return res.status(400).send(err.details[0].message)
    let user=await User.findOne({email:req.body.email})
    if(!user) return res.status(400).send("User not exits")
    const isvalid=await bcypt.compare(req.body.password,user.password)
    if(!isvalid) return res.status(400).send("Invalid email or password....")
    const token=jwtAuthToken(user)
    res.send(token)
 } catch (error) {
    console.log(error)
 }
})
module.exports=router