const mongoose = require('mongoose');

const finishingPriceSchema = mongoose.Schema({
    processId: { type: String, required: true, unique: true }, // ID cố định, VD: 'lam_bong'
    name: { type: String, required: true },                   // Tên công đoạn
    description: { type: String },                            // Mô tả ngắn
    category: { type: String, required: true },               // Nhóm: surface, shaping, rigid, book, finishing
    categoryName: { type: String },                           // Tên nhóm hiển thị
    unit: { type: String, default: 'đ/SP' },                  // Đơn vị: đ/SP, đ/tờ in, đ/cuốn, đ/tổng
    price: { type: Number, required: true, default: 0 },      // Giá tiền
    icon: { type: String },                                   // Emoji icon
    color: { type: String },                                  // Mã màu hex
    isActive: { type: Boolean, default: true },               // Bật/tắt công đoạn
}, { timestamps: true });

module.exports = mongoose.model('FinishingPrice', finishingPriceSchema);
