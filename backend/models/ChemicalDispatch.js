const mongoose = require('mongoose');

const dispatchItemSchema = mongoose.Schema({
    chemical: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chemical',
        required: true,
    },
    chemicalName: { type: String, required: true },
    chemicalUnit: { type: String, required: true },
    quantity: {
        type: Number,
        required: true,
        min: [0.001, 'Số lượng phải lớn hơn 0'],
    },
    quantityAfter: { type: Number },
});

const chemicalDispatchSchema = mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['nhap', 'xuat'],
            required: true,
        },
        items: [dispatchItemSchema],
        recipient: { type: String, default: '' },
        note: { type: String, default: '' },
        createdBy: { type: String, default: 'Admin' },
        
        // --- CÁC TRƯỜNG CŨ (giữ lại để tương thích ngược với dữ liệu cũ) ---
        chemical: { type: mongoose.Schema.Types.ObjectId, ref: 'Chemical' },
        chemicalName: { type: String },
        chemicalUnit: { type: String },
        quantity: { type: Number },
        quantityAfter: { type: Number },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ChemicalDispatch', chemicalDispatchSchema);
