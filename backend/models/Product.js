const mongoose = require('mongoose');

// Schema con cho bảng giá
const priceSchema = mongoose.Schema({
  minQuantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

// THÊM SCHEMA CHO HÌNH ẢNH
const imageSchema = mongoose.Schema({
  url: { type: String, required: true },
});
const productSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    
    // QUAN TRỌNG: Phải là mảng chứa imageSchema
    images: [imageSchema], 
    
    category: { type: String, required: true },
    description: { type: String, required: true },
    priceTable: [priceSchema],
    countInStock: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;