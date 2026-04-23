const mongoose = require('mongoose');

const attachmentSchema = {
  url: String,
  publicId: String,
  fileName: String,
  fileType: { type: String, enum: ['image', 'pdf', 'other'], default: 'other' },
};

const cashTransactionSchema = new mongoose.Schema(
  {
    transactionCode: { type: String, unique: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ['VND', 'USD'], default: 'VND' },
    exchangeRate: { type: Number, default: 1 },
    amountInVND: { type: Number },

    category: { type: mongoose.Schema.Types.ObjectId, ref: 'FinanceCategory' },
    cashBook: { type: mongoose.Schema.Types.ObjectId, ref: 'CashBook', required: true },

    counterpartyType: { type: String, enum: ['customer', 'supplier', 'internal', 'other'] },
    counterpartyId: { type: mongoose.Schema.Types.ObjectId, refPath: 'counterpartyModel' },
    counterpartyModel: { type: String, enum: ['Customer', 'Supplier'] },
    counterpartyName: { type: String },

    linkedReceivable: { type: mongoose.Schema.Types.ObjectId, ref: 'Receivable' },
    linkedPayable: { type: mongoose.Schema.Types.ObjectId, ref: 'Payable' },

    description: { type: String, trim: true },
    transactionDate: { type: Date, default: Date.now },

    attachments: [attachmentSchema],

    hasInvoice: { type: Boolean, default: false },
    invoiceNumber: { type: String },

    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-compute amountInVND before save
cashTransactionSchema.pre('save', function () {
  this.amountInVND = this.amount * (this.exchangeRate || 1);
});

module.exports = mongoose.model('CashTransaction', cashTransactionSchema);
