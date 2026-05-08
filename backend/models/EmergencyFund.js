const mongoose = require('mongoose');

const emergencyFundSchema = new mongoose.Schema(
  {
    targetMonths: { type: Number, default: 3 },
    monthlyOPEX: { type: Number, default: 0 },
    targetAmount: { type: Number, default: 0 },
    currentAmount: { type: Number, default: 0 },
    linkedCashBook: { type: mongoose.Schema.Types.ObjectId, ref: 'CashBook' },
    contributions: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        note: String,
      },
    ],
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto compute targetAmount before save
emergencyFundSchema.pre('save', function () {
  this.targetAmount = this.targetMonths * this.monthlyOPEX;
});

module.exports = mongoose.model('EmergencyFund', emergencyFundSchema);
