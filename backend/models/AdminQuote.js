const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  specs: { type: String }, // Quy cách tóm tắt
  unitPrice: { type: Number }, // Đơn giá sau margin
  totalPrice: { type: Number }, // Thành tiền
  costBreakdown: {
    paperCost: { type: Number, default: 0 },
    printCost: { type: Number, default: 0 },
    lamCost: { type: Number, default: 0 },
    dieCost: { type: Number, default: 0 },
    uvCost: { type: Number, default: 0 },
    foilCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    margin: { type: Number, default: 0 },
  }
}, { _id: true });

const adminQuoteSchema = new mongoose.Schema({
  quoteCode: { type: String, unique: true },
  customerName: { type: String, required: true },
  items: [quoteItemSchema],
  grandTotal: { type: Number, default: 0 },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected'],
    default: 'draft'
  },
}, { timestamps: true });

// Auto-generate quoteCode
adminQuoteSchema.pre('save', async function () {
  if (!this.quoteCode) {
    const year = new Date().getFullYear();
    
    // Tìm báo giá cuối cùng trong năm hiện tại để lấy số thứ tự lớn nhất
    const lastQuote = await mongoose.model('AdminQuote').findOne({
      quoteCode: new RegExp(`^BG-${year}-`)
    }).sort({ createdAt: -1 });

    let nextSeq = 1;
    if (lastQuote && lastQuote.quoteCode) {
      const parts = lastQuote.quoteCode.split('-');
      if (parts.length === 3) {
        nextSeq = parseInt(parts[2], 10) + 1;
      }
    }
    
    const seq = String(nextSeq).padStart(3, '0');
    this.quoteCode = `BG-${year}-${seq}`;
  }
});

module.exports = mongoose.model('AdminQuote', adminQuoteSchema);
