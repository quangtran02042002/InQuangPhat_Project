const mongoose = require('mongoose');

const todoSchema = mongoose.Schema(
  {
    title: { type: String, required: [true, 'Vui lòng nhập tiêu đề công việc'], trim: true },
    description: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'done'],
      default: 'pending',
    },
    // Tiến độ hoàn thành (0-100%)
    progress: { type: Number, default: 0, min: 0, max: 100 },
    // Ngưỡng tự động hoàn thành (mặc định 90%)
    autoCompleteThreshold: { type: Number, default: 90 },
    // Mục tiêu số lượng (VD: 1000 sản phẩm)
    targetQuantity: { type: Number, default: 0 },
    // Số lượng đã hoàn thành
    completedQuantity: { type: Number, default: 0 },

    dueDate: { type: Date },
    category: {
      type: String,
      enum: ['production', 'purchasing', 'finance', 'general'],
      default: 'general',
    },
    assignedTo: { type: String, default: '' },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Lưu timestamp khi hoàn thành
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Todo', todoSchema);
