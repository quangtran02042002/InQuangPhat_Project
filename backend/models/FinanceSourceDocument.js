const mongoose = require('mongoose');

const financeSourceDocumentSchema = new mongoose.Schema({
  documentCode: { type: String, required: true, unique: true, uppercase: true }, // Mã đơn hàng hoặc Phiếu nhập
  documentType: { type: String, enum: ['sales_order', 'purchase_invoice', 'opening_balance', 'expense_claim'], required: true },
  
  // Đối tượng (Khách hàng hoặc NCC)
  counterpartyId: { type: mongoose.Schema.Types.ObjectId, refPath: 'counterpartyModel', required: true },
  counterpartyModel: { type: String, enum: ['Customer', 'Supplier'], required: true },
  counterpartyName: { type: String, required: true },
  
  // Trạng thái tiền
  totalAmount: { type: Number, required: true }, // Tổng tiền phải thu/trả của tờ chứng từ này
  paidAmount: { type: Number, default: 0 }, // Số tiền đã trả
  outstandingAmount: { type: Number, required: true }, // Nợ còn lại (totalAmount - paidAmount)
  
  status: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  note: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('FinanceSourceDocument', financeSourceDocumentSchema);
