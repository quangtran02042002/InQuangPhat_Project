const mongoose = require('mongoose');

const materialPriceSchema = mongoose.Schema({
    category: { type: String, required: true }, // Nhóm (VD: Lưới/Màn, Keo dán)
    name: { type: String, required: true },     // Tên vật liệu (VD: Màn 120T)
    unit: { type: String, default: 'đ/cái' },   // Đơn vị
    price: { type: Number, required: true },
    supplier: { type: String },                 // Nhà cung cấp
    note: { type: String }                      // Ghi chú
}, { timestamps: true });

module.exports = mongoose.model('MaterialPrice', materialPriceSchema);
