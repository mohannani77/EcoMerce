const bcypt = require("bcrypt");
const joi = require("joi");
const express = require("express");
const User = require("../Models/user");
// const jwtAuthToken = require('../utilities/jwtAuthToken');
const jwt = require("jsonwebtoken");
const jwtAuthToken = require("../utilities/jwtAuthToken");
const cloudinary = require("../utilities/cloudinary");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, password,image } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).send("user already exits");
    }
      if (image) {
        const uploadRes = await cloudinary.uploader.upload(image, {
          upload_preset: "profiles",
        });
  
        if (uploadRes) {
    const newdata = new User({ name, email, password,image:uploadRes });
    const salt = await bcypt.genSalt(10);
    newdata.password = await bcypt.hash(newdata.password, salt);
    const token=jwtAuthToken(newdata)
     res.send(token)
    await newdata.save()
        }
      }
   
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
