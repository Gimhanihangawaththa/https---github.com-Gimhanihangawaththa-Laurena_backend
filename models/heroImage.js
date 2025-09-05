const mongoose = require("mongoose");

const HeroImageSchema = new mongoose.Schema({
   title: { type: String, required: true },
  description: { type: String },
  image: { type: String },// only save file path, not base64
});

module.exports = mongoose.model("HeroImage", HeroImageSchema);
