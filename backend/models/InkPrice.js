const mongoose = require('mongoose');

const inkPriceSchema = mongoose.Schema({
    inkType: { type: String, required: true }, // Tên mực (VD: Mực Offset, Mực UV)
    brand: { type: String, required: true },   // Hãng (VD: Toyo, DIC)
    unit: { type: String, default: 'đ/kg' },   // Đơn vị (đ/kg, đ/lon)
    price: { type: Number, required: true },
    supplier: { type: String, required: true },// Nhà cung cấp
    note: { type: String }                     // Ghi chú
}, { timestamps: true });

module.exports = mongoose.model('InkPrice', inkPriceSchema);
