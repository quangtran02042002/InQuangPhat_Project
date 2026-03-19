const mongoose = require('mongoose');

const surchargeSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true }, // VD: 'Cán màng mờ'
    unit: { type: String, required: true }, // VD: 'đ/m2', 'đ/nhịp'
    price: { type: Number, required: true }, // Đơn giá (VD: 1200)
    minPrice: { type: Number, default: 0 } // Giá sàn tối thiểu (VD: 100000)
}, { timestamps: true });

module.exports = mongoose.model('Surcharge', surchargeSchema);