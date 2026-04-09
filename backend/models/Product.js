const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    // ... (Giữ nguyên reviewSchema)
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: { type: String, required: true },
    images: [{ url: { type: String, required: true } }], // Mảng ảnh
    category: { type: String, required: true },
    group: {
      type: String,
      required: true, 
      enum: ['offset', 'garment'],
      default: 'offset'
    },
    description: { type: String, required: true },
    
    // Bảng giá nhiều mức
    priceTable: [
      {
        minQuantity: { type: Number, required: true },
        price: { type: String, required: true }
      }
    ],

    // --- ĐÃ XÓA TRƯỜNG countInStock TẠI ĐÂY ---

    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;