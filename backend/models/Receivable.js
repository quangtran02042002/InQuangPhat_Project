const mongoose = require('mongoose');

const attachmentSchema = {
  url: String,
  publicId: String,
  fileName: String,
  fileType: { type: String, enum: ['image', 'pdf', 'other'], default: 'other' },
};

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  cashTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'CashTransaction' },
  method: { type: String, enum: ['cash', 'bank_transfer', 'other'], default: 'cash' },
  note: String,
});

const receivableSchema = new mongoose.Schema(
  {
    documentCode: { type: String, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, required: true },

    productionOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductionOrder' },
    orderCode: String,

    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ['VND', 'USD'], default: 'VND' },
    exchangeRate: { type: Number, default: 1 },

    depositRequired: { type: Boolean, default: false },
    depositRate: { type: Number, default: 0 },
    depositAmount: { type: Number, default: 0 },

    paidAmount: { type: Number, default: 0 },
    outstandingAmount: { type: Number, default: 0 },

    creditLine: { type: Number, default: 0 },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    paymentTermDays: { type: Number, default: 30 },

    // Tuổi nợ (auto-computed)
    debtAgeDays: { type: Number, default: 0 },
    debtAgeGroup: {
      type: String,
      enum: ['current', '1-15', '16-30', '31-60', '61-90', 'over90'],
      default: 'current',
    },

    lastReminderSentAt: Date,
    reminderCount: { type: Number, default: 0 },

    hasInvoice: { type: Boolean, default: false },
    invoiceNumber: String,

    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue', 'bad_debt'],
      default: 'pending',
    },
    note: String,

    payments: [paymentSchema],
    attachments: [attachmentSchema],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-compute outstandingAmount before save
receivableSchema.pre('save', function () {
  this.outstandingAmount = Math.max(0, this.totalAmount - this.paidAmount);
  if (this.outstandingAmount === 0 && this.paidAmount > 0) {
    this.status = 'paid';
  } else if (this.paidAmount > 0 && this.outstandingAmount > 0) {
    this.status = 'partial';
  }
});

module.exports = mongoose.model('Receivable', receivableSchema);
