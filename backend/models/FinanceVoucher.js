const mongoose = require('mongoose');

const financeAttachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    originalName: { type: String, default: '' },
    resourceType: { type: String, default: '' },
    format: { type: String, default: '' },
    bytes: { type: Number, default: 0 },
  },
  { _id: false }
);

const financeAllocationSchema = new mongoose.Schema(
  {
    sourceDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FinanceSourceDocument',
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const financeVoucherSchema = new mongoose.Schema(
  {
    voucherNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
    transactionDate: { type: Date, default: Date.now, required: true },
    amount: { type: Number, required: true, min: 0 },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'FinanceCategory', default: null },
    fromAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'FinanceAccount', required: true },
    toAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'FinanceAccount', default: null },
    counterpartyModel: {
      type: String,
      enum: ['Customer', 'Supplier', '', null],
      default: null,
    },
    counterpartyId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'counterpartyModel',
      default: null,
    },
    counterpartyNameSnapshot: { type: String, default: '', trim: true },
    allocations: { type: [financeAllocationSchema], default: [] },
    attachments: { type: [financeAttachmentSchema], default: [] },
    notes: { type: String, default: '', trim: true },
    status: { type: String, enum: ['posted', 'voided'], default: 'posted' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    postedAt: { type: Date, default: Date.now },
    voidedAt: { type: Date, default: null },
    voidReason: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

financeVoucherSchema.pre('validate', function financeVoucherPreValidate(next) {
  this.amount = Number(this.amount || 0);

  if (this.type === 'transfer' && !this.toAccountId) {
    return next(new Error('Phieu chuyen quy phai co tai khoan dich'));
  }

  if (this.type !== 'transfer' && !this.categoryId) {
    return next(new Error('Phieu thu chi phai chon danh muc'));
  }

  if (this.type !== 'transfer') {
    this.toAccountId = null;
  }

  return next();
});

module.exports = mongoose.model('FinanceVoucher', financeVoucherSchema);
