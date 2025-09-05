const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
let HeroImage = require('../models/heroimage'); 

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/hero/"); // keep hero images in /uploads/hero
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  },
});

const upload = multer({ storage: storage });

/**
 * ADD Hero Image
 */
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const newHeroImage = new HeroImage({
      title: req.body.title,
      description: req.body.description,
      image: req.file ? req.file.filename : "",
    });

    await newHeroImage.save();
    res.json("Hero image added!");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add hero image" });
  }
});

/**
 * GET All Hero Images
 */
router.get("/", async (req, res) => {
  try {
    const images = await HeroImage.find().sort({ _id: -1 });
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET Single Hero Image
 */
router.get("/:id", async (req, res) => {
  try {
    const image = await HeroImage.findById(req.params.id);
    if (!image) {
      return res.status(404).send({ status: "Hero image not found" });
    }
    res.json(image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * UPDATE Hero Image
 */
router.put("/update/:id", upload.single("image"), async (req, res) => {
  try {
    const heroImage = await HeroImage.findById(req.params.id);
    if (!heroImage) {
      return res.status(404).send({ status: "Hero image not found" });
    }

    const updateData = {
      title: req.body.title,
      description: req.body.description,
    };

    // if new image uploaded, delete old one & replace with new
    if (req.file) {
      if (heroImage.image) {
        const oldPath = path.join(__dirname, "..", "uploads/hero", heroImage.image);
        fs.unlink(oldPath, (err) => {
          if (err) console.error("Error deleting old image:", err);
        });
      }
      updateData.image = req.file.filename;
    }

    await HeroImage.findByIdAndUpdate(req.params.id, updateData);
    res.status(200).send({ status: "Hero image updated" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: "Error updating hero image", error: err.message });
  }
});

/**
 * DELETE Hero Image
 */
router.delete("/delete/:id", async (req, res) => {
  try {
    const heroImage = await HeroImage.findById(req.params.id);
    if (!heroImage) {
      return res.status(404).send({ status: "Hero image not found" });
    }

    // Delete image file if exists
    if (heroImage.image) {
      const filePath = path.join(__dirname, "..", "uploads/hero", heroImage.image);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    await HeroImage.findByIdAndDelete(req.params.id);
    res.status(200).send({ status: "Hero image deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: "Error deleting hero image", error: err.message });
  }
});

module.exports = router;
