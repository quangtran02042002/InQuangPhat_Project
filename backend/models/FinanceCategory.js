const mongoose = require('mongoose');

const financeCategorySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    direction: { type: String, enum: ['income', 'expense'], required: true },
    group: { type: String, enum: ['revenue', 'cogs', 'opex', 'other'], required: true },
    description: { type: String, default: '', trim: true },
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FinanceCategory', financeCategorySchema);
