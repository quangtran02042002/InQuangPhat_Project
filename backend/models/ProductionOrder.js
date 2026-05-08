const mongoose = require('mongoose');

const productionOrderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      unique: true,
    },
    orderName: { // Customer or Product Name (e.g. "Hộp Cứng HueOneFood")
      type: String,
      required: true,
    },
    totalQuantity: { // Tổng số lượng của đơn hàng
      type: Number,
      required: true,
      default: 0,
    },
    printType: { // Loại Kỹ thuật in của toàn Lệnh
      type: String,
      enum: ['offset', 'silk'],
      default: 'offset',
      required: true,
    },
    printJobs: [
      {
        jobName: { type: String, required: true },
        quantity: { type: Number, default: 0 },
        image: { type: String, default: '' }, // Hình ảnh Artwork của bài in
        
        // THÔNG SỐ VẬT TƯ
        material: { type: String, default: '' },
        printSize: { type: String, default: '' }, // Khổ thành phẩm
        printPaperSize: { type: String, default: '' }, // Khổ giấy in
        cutPaperSize: { type: String, default: '' }, // Khổ giấy cắt
        cutPaperQuantity: { type: Number, default: 0 }, // Số lượng giấy cắt
        isPlateReady: { type: Boolean, default: false }, // Trạng thái kẽm/khuôn
        
        // QUY TRÌNH IN & GIA CÔNG
        printColors: { type: String, default: '' },
        postProcess: { type: [String], default: [] },
        
        notes: { type: String, default: '' },
        printFormula: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'PrintFormula',
          required: false,
        },
      }
    ],

    // TIẾN ĐỘ CHUẨN BỊ (OFFSET)
    isPaperOrdered: { type: Boolean, default: false },
    isPlateOutput: { type: Boolean, default: false },
    isMoldOutput: { type: Boolean, default: false },
    isOffsetLamination: { type: Boolean, default: false },
    isTicketPrinted: { type: Boolean, default: false },

    // TIẾN ĐỘ CHUẨN BỊ (LỤA)
    isSilkInkColor: { type: Boolean, default: false },
    isSilkFilm: { type: Boolean, default: false },
    isSilkFrame: { type: Boolean, default: false },
    isSilkPattern: { type: Boolean, default: false },
    isSilkFabric: { type: Boolean, default: false },
    
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate orderCode exactly before saving
productionOrderSchema.pre('save', async function () {
  if (this.isNew || !this.orderCode) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const prefix = `LSX-${year}`;
    
    const lastOrder = await this.constructor.findOne(
      { orderCode: { $regex: `^${prefix}` } },
      {},
      { sort: { 'createdAt': -1 } }
    );

    let seq = 1;
    if (lastOrder && lastOrder.orderCode) {
      const lastSeq = parseInt(lastOrder.orderCode.split('-')[2]);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }
    this.orderCode = `${prefix}-${seq.toString().padStart(3, '0')}`;
  }
});

const ProductionOrder = mongoose.model('ProductionOrder', productionOrderSchema);

module.exports = ProductionOrder;
