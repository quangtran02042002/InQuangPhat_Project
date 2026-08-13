const mongoose = require('mongoose');

const qcInspectionSchema = new mongoose.Schema(
  {
    inspectionCode: {
      type: String,
      unique: true,
    },
    orderName: {
      type: String,
      required: [true, 'Vui lòng nhập tên đơn hàng/sản phẩm'],
    },
    sampleType: {
      type: String,
      enum: ['first_off', 'inline', 'final'],
      default: 'first_off',
    },
    inspector: {
      type: String,
      default: '',
    },
    inspectionDate: {
      type: Date,
      default: Date.now,
    },

    // Ảnh chụp mẫu thực tế (Cloudinary URLs)
    images: [{ type: String }],

    // Ảnh mẫu chuẩn/artwork gốc để đối chiếu
    referenceImages: [{ type: String }],

    // ===== CHECKLIST 6 TIÊU CHÍ (pass / fail) =====
    checklist: {
      colorAccuracy: {
        type: String,
        enum: ['pass', 'fail', 'pending'],
        default: 'pending',
      },
      registration: {
        type: String,
        enum: ['pass', 'fail', 'pending'],
        default: 'pending',
      },
      printClarity: {
        type: String,
        enum: ['pass', 'fail', 'pending'],
        default: 'pending',
      },
      cuttingAccuracy: {
        type: String,
        enum: ['pass', 'fail', 'pending'],
        default: 'pending',
      },
      printPosition: {
        type: String,
        enum: ['pass', 'fail', 'pending'],
        default: 'pending',
      },
      packaging: {
        type: String,
        enum: ['pass', 'fail', 'pending'],
        default: 'pending',
      },
    },

    // ===== KẾT LUẬN =====
    verdict: {
      type: String,
      enum: ['approved', 'rejected', 'conditional', 'pending'],
      default: 'pending',
    },
    defectDescription: {
      type: String,
      default: '',
    },
    correctiveAction: {
      type: String,
      default: '',
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

// Auto-generate inspectionCode: QC-YYYYMMDD-XXX
qcInspectionSchema.pre('save', async function () {
  if (this.isNew || !this.inspectionCode) {
    const date = new Date();
    const dateStr =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0');
    const prefix = `QC-${dateStr}`;

    const lastDoc = await this.constructor.findOne(
      { inspectionCode: { $regex: `^${prefix}` } },
      {},
      { sort: { createdAt: -1 } }
    );

    let seq = 1;
    if (lastDoc && lastDoc.inspectionCode) {
      const parts = lastDoc.inspectionCode.split('-');
      const lastSeq = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }
    this.inspectionCode = `${prefix}-${seq.toString().padStart(3, '0')}`;
  }
});

const QCInspection = mongoose.model('QCInspection', qcInspectionSchema);

module.exports = QCInspection;
