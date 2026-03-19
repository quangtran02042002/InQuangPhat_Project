const mongoose = require('mongoose');

const paperWeightSchema = mongoose.Schema({
    weight: { type: String, required: true, unique: true }, // VD: '300gsm'
    description: { type: String } // VD: 'Giấy dày làm hộp'
}, { timestamps: true });

module.exports = mongoose.model('PaperWeight', paperWeightSchema);