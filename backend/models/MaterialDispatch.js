const mongoose = require('mongoose');

const materialDispatchSchema = mongoose.Schema(
    {
        material: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Material',
            required: true,
        },
        materialName: { type: String, required: true }, // Snapshot tên để tránh lỗi khi xóa material
        materialUnit: { type: String, required: true }, // Snapshot đơn vị
        type: {
            type: String,
            enum: ['nhap', 'xuat'],
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [0.001, 'Số lượng phải lớn hơn 0'],
        },
        recipient: { type: String, default: '' },    // Người nhận (khi xuất) / Nguồn nhập (khi nhập)
        note: { type: String, default: '' },          // Ghi chú thêm
        createdBy: { type: String, default: 'Admin' }, // Người tạo phiếu
        quantityAfter: { type: Number },              // Tồn kho sau giao dịch (snapshot)
    },
    { timestamps: true }
);

module.exports = mongoose.model('MaterialDispatch', materialDispatchSchema);
