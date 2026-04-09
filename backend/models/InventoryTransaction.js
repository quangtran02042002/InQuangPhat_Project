const mongoose = require('mongoose');

// Schema cho từng dòng hàng hóa trong phiếu
const inventoryItemSchema = mongoose.Schema({
  itemCode: { type: String, required: true },      // Mã hàng / PO
  itemName: { type: String, required: true },      // Tên bán thành phẩm
  color: { type: String, required: true },         // Màu sắc
  unit: { type: String, default: 'Cái' },          // Đơn vị tính
  quantity: { type: Number, required: true },      // Số lượng
  note: { type: String, default: '' },             // Ghi chú dòng
}, { _id: false });

const inventoryTransactionSchema = mongoose.Schema(
  {
    type: { type: String, enum: ['import', 'export'], required: true },
    
    // Nhà may / Kho giao nhận hàng
    factoryName: { type: String, required: true },

    // Khách hàng đặt order (brand owner) - tách biệt với nhà may
    orderCustomer: { type: String, default: '' },

    // Thông tin phiếu
    deliveryAddress: { type: String, default: '' },
    reason: { type: String, default: '' },

    // Danh sách hàng hóa (nhiều style/màu trong 1 phiếu)
    items: {
      type: [inventoryItemSchema],
      required: true,
      validate: [arr => arr.length > 0, 'Phải có ít nhất 1 mặt hàng'],
    },

    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
module.exports = InventoryTransaction;
