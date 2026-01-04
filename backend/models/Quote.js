const mongoose = require('mongoose');

const quoteSchema = mongoose.Schema({
  name: { type: String, required: true }, // Tên khách
  phone: { type: String, required: true }, // SĐT (Quan trọng nhất để sale gọi lại)
  email: { type: String },
  productName: { type: String }, // Khách đang quan tâm sản phẩm nào
  quantity: { type: String }, // Số lượng dự kiến
  message: { type: String }, // Quy cách, ghi chú thêm
  status: { 
    type: String, 
    default: 'New', 
    enum: ['New', 'Contacted', 'Done'] // Mới, Đã gọi, Hoàn thành
  }, 
}, {
  timestamps: true // Lưu thời gian gửi
});

const Quote = mongoose.model('Quote', quoteSchema);
module.exports = Quote;