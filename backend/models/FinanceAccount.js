const mongoose = require('mongoose');

const financeAccountSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['cash', 'bank'], required: true, default: 'cash' },
    bankName: { type: String, default: '', trim: true },
    accountNumber: { type: String, default: '', trim: true },
    openingBalance: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    currency: { type: String, default: 'VND', uppercase: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

financeAccountSchema.pre('validate', function financeAccountPreValidate(next) {
  if (!this.currentBalance && this.currentBalance !== 0) {
    this.currentBalance = Number(this.openingBalance || 0);
  }

  this.openingBalance = Number(this.openingBalance || 0);
  this.currentBalance = Number(this.currentBalance || 0);
  next();
});

module.exports = mongoose.model('FinanceAccount', financeAccountSchema);
