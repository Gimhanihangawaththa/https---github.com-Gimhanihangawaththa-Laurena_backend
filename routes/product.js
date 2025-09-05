// const router = require('express').Router();
// let Product = require('../models/product');

// // ➤ ADD Product
// router.route('/add').post((req, res) => {
//   const productName = req.body.productName;
//   const description = req.body.description;
//   const price = Number(req.body.price);
//   const image = req.body.image; // if storing filename/URL, not file upload here

//   const newProduct = new Product({
//     productName,
//     description,
//     price,
//     image,
//   });

//   newProduct.save()
//     .then(() => { res.json('Product added!'); })
//     .catch((err) => { console.log(err); res.status(500).json({ error: err.message }); });
// });

// // ➤ GET All Products
// router.route('/').get((req, res) => {
//   Product.find()
//     .then((products) => { res.json(products); })
//     .catch((err) => { console.log(err); res.status(500).json({ error: err.message }); });
// });

// // ➤ UPDATE Product
// router.route('/update/:id').put(async (req, res) => {
//   let productId = req.params.id;
//   const { productName, description, price, image } = req.body;

//   const updateProduct = {
//     productName,
//     description,
//     price,
//     image,
//   };

//   await Product.findByIdAndUpdate(productId, updateProduct)
//     .then(() => {
//       res.status(200).send({ status: "Product updated" });
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).send({ status: "Error with updating product", error: err.message });
//     });
// });

// // ➤ DELETE Product
// router.route('/delete/:id').delete(async (req, res) => {
//   let productId = req.params.id;

//   await Product.findByIdAndDelete(productId)
//     .then(() => {
//       res.status(200).send({ status: "Product deleted" });
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).send({ status: "Error with deleting product", error: err.message });
//     });
// });

// // ➤ GET Product by ID
// router.route('/get/:id').get(async (req, res) => {
//   let productId = req.params.id;

//   await Product.findById(productId)
//     .then((product) => {
//       res.status(200).send({ status: "Product fetched", product });
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).send({ status: "Error with get product", error: err.message });
//     });
// });

// module.exports = router;


const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
let Product = require('../models/product.js');



// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // images stored in /uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  },
});

const upload = multer({ storage: storage });

/**
 * ADD Product
 */
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const newProduct = new Product({
      productName: req.body.productName,
      description: req.body.description,
      price: req.body.price,
      image: req.file ? req.file.filename : "",
    });

    await newProduct.save();
    res.json('Product added!');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});


router.get('/newarrivals', async (req, res) => {
  try {
    // Fetch latest 8 products, sorted by creation time (_id descending)
    const newArrivals = await Product.find()
      .sort({ _id: -1 }) // newest first
      .limit(8);

    res.status(200).json(newArrivals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Error fetching new arrivals", error: err.message });
  }
});







router.get("/singleview/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    // console.log("Fetched product:", product);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product); // send product directly
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Server error" });
  }
});





/**
 * GET all Products
 */
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPDATE Product
 */
router.put('/update/:id', upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ status: "Product not found" });
    }

    const updateProduct = {
      productName: req.body.productName,
      description: req.body.description,
      price: req.body.price,
    };

    // if new image uploaded, delete old one & replace with new
    if (req.file) {
      if (product.image) {
        const oldPath = path.join(__dirname, '..', 'uploads', product.image);
        fs.unlink(oldPath, (err) => {
          if (err) console.error("Error deleting old image:", err);
        });
      }
      updateProduct.image = req.file.filename;
    }

    await Product.findByIdAndUpdate(req.params.id, updateProduct);
    res.status(200).send({ status: "Product updated" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: "Error updating product", error: err.message });
  }
});

/**
 * DELETE Product (also delete image from /uploads)
 */
router.delete('/delete/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send({ status: "Product not found" });
    }

    // Delete image from uploads if exists
    if (product.image) {
      const filePath = path.join(__dirname, '..', 'uploads', product.image);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).send({ status: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: "Error deleting product", error: err.message });
  }
});

/**
 * GET single Product
 */
// router.get('/get/:id', async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//       return res.status(404).send({ status: "Product not found" });
//     }
//     res.status(200).send({ status: "Product fetched", product });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ status: "Error fetching product", error: err.message });
//   }
// });

module.exports = router;
