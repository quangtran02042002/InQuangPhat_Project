const mongoose = require('mongoose');

// Schema con cho bảng giá (để gọn code)
const priceSchema = mongoose.Schema({
  minQuantity: { type: Number, required: true }, // VD: 100 cái
  price: { type: Number, required: true },       // Giá: 5000đ
}, { _id: false });

const productSchema = mongoose.Schema({
  // Thông tin cơ bản
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // URL thân thiện: hop-giay-a4
  category: { type: String, required: true }, // Tạm thời để string, sau này nâng cấp sau
  
  // Hình ảnh (Mảng object)
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String }, // ID của Cloudinary
      isThumbnail: { type: Boolean, default: false }
    }
  ],

  // Chi tiết kỹ thuật
  material: { type: String }, // Chất liệu: Couche 300gsm
  description: { type: String }, // Cho phép HTML
  
  // Bảng giá linh động
  priceTable: [priceSchema], 

  // SEO Info
  seoTitle: { type: String },
  seoDescription: { type: String },

  isFeatured: { type: Boolean, default: false }, // Hiện trang chủ
  isActive: { type: Boolean, default: true },    // Còn hàng/Hết hàng

}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;