const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
  type: { type: String, required: true, enum: ['income', 'expense'] }, // Thu hoặc Chi
  amount: { type: Number, required: true }, // Số tiền
  category: { type: String, required: true }, // Danh mục (VD: Tiền điện, Thu tiền khách A)
  description: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);