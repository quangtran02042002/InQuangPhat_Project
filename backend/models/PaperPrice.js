const mongoose = require('mongoose');

// Schema phụ: Định nghĩa 1 khổ giấy (kích thước, giá, đơn vị)
const sizeSchema = mongoose.Schema({
    dimensions: { type: String, required: true }, // VD: '650x860'
    price: { type: Number, required: true },      // VD: 1940
    unit: { type: String, default: 'đ/tờ' }       // VD: 'đ/tờ', 'đ/ram', 'đ/kg'
});

// Schema chính: Loại giấy (Couche 300gsm)
const paperPriceSchema = mongoose.Schema({
    paperType: { type: String, required: true }, // VD: 'Couche 300gsm'
    sizes: [sizeSchema], // Mảng chứa các khổ giấy ở trên
    supplier: { type: String, default: 'Chung' } // Thêm nếu muốn phân biệt nguồn nhập
}, { timestamps: true });

module.exports = mongoose.model('PaperPrice', paperPriceSchema);