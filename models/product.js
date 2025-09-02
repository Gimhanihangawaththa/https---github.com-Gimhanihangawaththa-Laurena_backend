
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    productName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true } // will store image filename or URL
}, {
    timestamps: true  // adds createdAt & updatedAt automatically
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
