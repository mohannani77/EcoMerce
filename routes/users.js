// const User = require("../Models/user");
const { auth, isUser, isAdmin } = require("../middleware/auth");
const moment = require("moment");
const user = require("../Models/user");
const bcrypt = require("bcrypt");
const cloudinary = require("../utilities/cloudinary");
const router = require("express").Router();

router.get("/stats", isAdmin, async (req, res) => {
  const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH:MM:SS");
  try {
    const users = await user.aggregate([
      {
        $match: { createdAt: { $gte: new Date(previousMonth) } },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    // console.log("users ",users)
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//Get All users

router.get("/", async (req, res) => {
  try {
    const users = await user.find().sort({ _id: -1 });
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete

router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const deleteUser = await user.findByIdAndDelete(req.params.id);
    res.status(200).send(deleteUser);
  } catch (error) {
    res.status(500).send(error);
  }
});

// get user by id

router.get("/:id", async (req, res) => {
  try {
    // console.log(req.params.id)
    const users = await user.findById(req.params.id);
    // console.log(users)
    res.status(200).send({
      _id: users._id,
      name: users.name,
      email: users.email,
      isAdmin: users.isAdmin,
      image: users.image,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

//update user

router.put("/:id", async (req, res) => {
  try {
    //   console.log(req.body.image)
    const users = await user.findById(req.params.id);
    // console.log("user ",users)
    // console.log(req.body.email)
    // console.log(users.email)
    console.log("1");
    if (!(users.email === req.body.email)) {
      console.log("2");
      const emailInuse = await user.findOne({ email: req.body.emal });
      if (emailInuse) {
        console.log("3");
        return res.status(400).send("that email is already taken...");
      }
    }
    if (req.body.password && users) {
      console.log("4");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      users.password = hashedPassword;
      console.log(users.password);
    }
    // console.log(req.body.uimg)
    let uploadRes = "";
    let updateuser=''
    if (req.body.uimg) {
      try {
        console.log("5");
        uploadRes = await cloudinary.uploader.upload(req.body.uimg, {
          upload_preset: "profiles",
        });
        console.log("uploded.....");
        if (uploadRes) {
           updateuser = await user.findByIdAndUpdate(
            req.params.id,
            {
              name: req.body.name,
              email: req.body.email,
              isAdmin: req.body.isAdmin,
              image: uploadRes,
              password: users.password,
            },
            { new: true }
          );
        }
        console.log("updateddd....");
      } catch (error) {
        console.error(error.message);
      }
    }
    else {
        updateuser = await user.findByIdAndUpdate(
            req.params.id,
            {
              name: req.body.name,
              email: req.body.email,
              isAdmin: req.body.isAdmin,
              image:req.body.image,
              password: users.password,
            },
            { new: true }
          );
    }
    res.status(200).send({
      _id: updateuser._id,
      name: updateuser.name,
      email: updateuser.email,
      image: updateuser.image,
      isAdmin: updateuser.isAdmin,
    });

    console.log("7");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

////

// if (req.body.productImg) {
//     try{
//     const destroyRes = await cloudinary.uploader.destroy(
//       req.body.product.image.public_id
//     );
//     if(destroyRes) {
//       const uploadRes = await cloudinary.uploader.upload(req.body.productImg, {
//         upload_preset: "onlineShops",
//       }
//       );

//       if (uploadRes) {
//         const updatedPro = await Product.findByIdAndUpdate(
//           req.params.id,
//           {
//             $set: {
//               ...req.body.product,
//               image: uploadRes,
//             },
//           },
//           { new: true }
//         );
//         res.status(200).send(updatedPro);
//       }
//     }
// }catch(err){
//     res.status(500).send(err.message)
// }

module.exports = router;
