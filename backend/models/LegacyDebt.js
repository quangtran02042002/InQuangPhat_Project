const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String }
});

const debtSchema = mongoose.Schema({
    partner: { type: String, required: true },
    direction: { type: String, enum: ['receivable', 'payable'], required: true }, // receivable = đối tác nợ, payable = mình nợ
    amount: { type: Number, required: true }, // Tổng tiền nợ
    description: { type: String }, // Lý do nợ / Nội dung
    dueDate: { type: Date }, // Hạn trả
    status: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
    attachments: [{ type: String }], // Các file đính kèm
    payments: [paymentSchema] // Lịch sử trả
}, { timestamps: true });

module.exports = mongoose.model('Debt', debtSchema);
