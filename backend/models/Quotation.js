const mongoose = require('mongoose');

// Sub-schema cho mỗi mức giá (cặp số lượng - đơn giá)
const priceTierSchema = new mongoose.Schema({
  quantity: { type: Number, default: 0 },
  unitPrice: { type: Number, default: 0 },
}, { _id: false });

const quotationItemSchema = new mongoose.Schema({
  style: { type: String, default: '' },          // Mã hàng (Style)
  images: [{ type: String }],                     // Array URL hình ảnh (Cloudinary)
  printTechnique: { type: String, default: '' },  // Kĩ thuật in
  // Giữ field cũ cho backward compatibility (dữ liệu cũ)
  quantity: { type: Number, default: 0 },
  unitPrice: { type: Number, default: 0 },
  // ✅ MỚI: Array đa mức số lượng - đơn giá
  priceTiers: [priceTierSchema],
  note: { type: String, default: '' },            // Ghi chú
}, { _id: true });

const quotationSchema = new mongoose.Schema({
  quotationCode: { type: String, unique: true },
  customerName: { type: String, required: true },
  quoteDate: { type: Date, default: Date.now },
  items: [quotationItemSchema],
  // Giữ grandTotal cho backward compat nhưng không bắt buộc
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
