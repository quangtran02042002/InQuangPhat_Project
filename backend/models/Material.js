const mongoose = require('mongoose');

const materialSchema = mongoose.Schema({
  name: { type: String, required: true }, // Tên vật tư (VD: Giấy Couche 300)
  unit: { type: String, required: true }, // Đơn vị (Ram, Kg, Thùng)
  quantity: { type: Number, required: true, default: 0 }, // Số lượng tồn
  minStock: { type: Number, default: 10 }, // Mức cảnh báo sắp hết
  note: { type: String }, // Ghi chú
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);