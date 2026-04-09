const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['quote', 'stock', 'system', 'debt', 'order', 'process'], default: 'system' }, // Phân loại icon
  isRead: { type: Boolean, default: false }, // Trạng thái đã đọc
  link: { type: String } // Đường dẫn khi bấm vào
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);