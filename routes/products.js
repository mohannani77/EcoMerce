const express = require("express");
const router = express.Router();
const cloudinary = require("../utilities/cloudinary");
const { Product } = require("../Models/product");
const { isAdmin } = require("../middleware/auth");
const { auth } = require("../middleware/auth");

router.post("/", isAdmin, async (req, res) => {
  const { name, brand, desc, price, image } = req.body;

  try {
    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        upload_preset: "onlineShops",
      });

      if (uploadRes) {
        const newproduct = new Product({
          name,
          brand,
          desc,
          price,
          image: uploadRes,
        });

        const savedProduct = await newproduct.save();
        res.status(200).send(savedProduct);
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).send(products);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// GET PRODUCT BY ID

router.get("/find/:id",isAdmin, async (req, res) => {
  try {
    const products = await Product.findById(req.params.id);
    res.status(200).send(products);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// Delete a product

router.delete("/:id",isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found....");
    if (product.image.public_id) {
      const destroy = await cloudinary.uploader.destroy(
        product.image.public_id
      );
      if (destroy) {
        const deleteproduct = await Product.findByIdAndDelete(req.params.id);
        res.status(200).send(deleteproduct);
      }
    } else {
      console.log("Action terminated. Failed to delete Product image...");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//edit product

router.put("/:id",isAdmin, async (req, res) => {
  if (req.body.productImg) {
    try{
    const destroyRes = await cloudinary.uploader.destroy(
      req.body.product.image.public_id
    );
    if(destroyRes) {
      const uploadRes = await cloudinary.uploader.upload(req.body.productImg, {
        upload_preset: "onlineShops",
      }
      );

      if (uploadRes) {
        const updatedPro = await Product.findByIdAndUpdate(
          req.params.id,
          {
            $set: {
              ...req.body.product,
              image: uploadRes,
            },
          },
          { new: true }
        );
        res.status(200).send(updatedPro);
      }
    }
}catch(err){
    res.status(500).send(err.message)
}
  }
  else{
    try {
        const updatedPro=await Product.findByIdAndUpdate(
            req.params.id,
            {
              $set: {
                ...req.body.product,
              },
            },
            { new: true }
        )
        // console.log(updatedPro)
        res.status(200).send(updatedPro)
    } catch (error) {
        res.status(500).send(error.message)
    }
  }
});

module.exports = router;
