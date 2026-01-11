// backend/models/Supplier.js
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên nhà cung cấp'],
    trim: true
  },
  taxCode: {
    type: String,
    trim: true,
    default: ''
  },
  contactName: { // Tên người liên hệ (Sales bên họ)
    type: String, 
    trim: true 
  },
  phone: {
    type: String,
    required: [true, 'Cần có số điện thoại liên hệ']
  },
  address: {
    type: String,
    default: ''
  },
  productsProvided: {
    type: String,
    // VD: "Giấy Coucher, Giấy Ford, Mực in..."
    default: '' 
  },
  note: {
    type: String, // Ghi chú riêng của bạn (VD: "Bên này hay giao chậm", "Giá rẻ nhất")
    default: ''
  },
  user: { // Ai là người tạo nhà cung cấp này (Admin nào)
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);