const mongoose = require('mongoose');

const dispatchItemSchema = mongoose.Schema({
    material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
        required: true,
    },
    materialName: { type: String, required: true },
    materialUnit: { type: String, required: true },
    quantity: {
        type: Number,
        required: true,
        min: [0.001, 'Số lượng phải lớn hơn 0'],
    },
    quantityAfter: { type: Number },
});

const materialDispatchSchema = mongoose.Schema(
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
        material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
        materialName: { type: String },
        materialUnit: { type: String },
        quantity: { type: Number },
        quantityAfter: { type: Number },
    },
    { timestamps: true }
);

module.exports = mongoose.model('MaterialDispatch', materialDispatchSchema);
