const mongoose = require('mongoose');

const materialOrderSchema = mongoose.Schema(
  {
    orderCode: { type: String, unique: true, required: true }, // PO-YYYYMMDD-XXX

    // Liên kết vật tư trong kho (có thể null nếu tạo mới)
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
    materialName: { type: String, required: [true, 'Vui lòng nhập tên vật tư'] },
    materialUnit: { type: String, required: [true, 'Vui lòng nhập đơn vị'] },
    quantity: { type: Number, required: true, min: [0.001, 'Số lượng phải lớn hơn 0'] },

    supplier: { type: String, default: '' },
    unitPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },

    orderDate: { type: Date, default: Date.now },
    expectedDate: { type: Date },
    note: { type: String, default: '' },
    createdBy: { type: String, default: 'Admin' },

    // Checklist trạng thái
    isOrdered: { type: Boolean, default: false },
    isDelivered: { type: Boolean, default: false },

    // Track phiếu nhập kho đã tạo khi delivered
    deliveredDispatch: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialDispatch' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MaterialOrder', materialOrderSchema);
