const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  style: { type: String, default: '' },          // Mã hàng (Style)
  images: [{ type: String }],                     // Array URL hình ảnh (Cloudinary)
  printTechnique: { type: String, default: '' },  // Kĩ thuật in
  quantity: { type: Number, default: 0 },         // Số lượng
  unitPrice: { type: Number, default: 0 },        // Đơn giá
  note: { type: String, default: '' },            // Ghi chú
}, { _id: true });

const quotationSchema = new mongoose.Schema({
  quotationCode: { type: String, unique: true },
  customerName: { type: String, required: true },
  quoteDate: { type: Date, default: Date.now },
  items: [quotationItemSchema],
  grandTotal: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected'],
    default: 'draft',
  },
}, { timestamps: true });

// Auto-generate quotationCode: BG-YYYY-NNN
quotationSchema.pre('save', async function () {
  if (!this.quotationCode) {
    const year = new Date().getFullYear();
    const lastQuote = await mongoose.model('Quotation').findOne({
      quotationCode: new RegExp(`^BG-${year}-`),
    }).sort({ createdAt: -1 });

    let nextSeq = 1;
    if (lastQuote && lastQuote.quotationCode) {
      const parts = lastQuote.quotationCode.split('-');
      if (parts.length === 3) {
        nextSeq = parseInt(parts[2], 10) + 1;
      }
    }
    const seq = String(nextSeq).padStart(3, '0');
    this.quotationCode = `BG-${year}-${seq}`;
  }
});

module.exports = mongoose.model('Quotation', quotationSchema);
