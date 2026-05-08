const mongoose = require('mongoose');

const cashBookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['cash', 'bank', 'emergency'], default: 'cash' },
    currency: { type: String, enum: ['VND', 'USD'], default: 'VND' },
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    currentBalance: { type: Number, default: 0 },
    openingBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    note: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CashBook', cashBookSchema);
