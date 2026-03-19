const mongoose = require('mongoose');

const chemicalSchema = mongoose.Schema({
    name: { type: String, required: true },
    unit: { type: String, required: true }, // Can, Lít, Thùng, Kg...
    quantity: { type: Number, required: true, default: 0 },
    minStock: { type: Number, required: true, default: 5 }, // Mức cảnh báo sắp hết
    safetyNote: { type: String }, // Ghi chú an toàn (VD: Dễ cháy, Tránh nắng...)
    supplier: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Chemical', chemicalSchema);