const mongoose = require('mongoose');

const paperSizeSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true }, // VD: '65x86 cm'
    description: { type: String } // VD: 'Khổ giấy chuẩn'
    // ĐÃ XÓA: trường bleed (bù hao)
}, { timestamps: true });

module.exports = mongoose.model('PaperSize', paperSizeSchema);