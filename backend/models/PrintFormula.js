const mongoose = require('mongoose');

// --- Sub-schema: Màu mực ---
const inkColorSchema = new mongoose.Schema({
  colorName: { type: String, required: true },
  colorCode:  { type: String },
  inkBrand:   { type: String },
  mixRatio:   { type: String },
  note:       { type: String },
}, { _id: false });

// --- Sub-schema: Bước gia công sau in ---
const postProcessSchema = new mongoose.Schema({
  step: { type: String, required: true },
  note: { type: String },
}, { _id: false });

// --- Sub-schema: Chi tiết in Offset ---
const offsetComponentSchema = new mongoose.Schema({
  componentName: { type: String, required: true }, // Nắp hộp, Khay hộp...
  paperType:     { type: String },
  paperWeight:   { type: String },
  paperSize:     { type: String },
  paperSupplier: { type: String },
  inkColors:     [inkColorSchema],
  postProcess:   [postProcessSchema],
}, { _id: true }); // Tự động có _id để update

// --- Sub-schema: Khung lụa ---
const silkFrameSchema = new mongoose.Schema({
  stepSequence:    { type: Number },
  frameName:       { type: String, required: true }, // Tên khung/chi tiết
  meshDetails:     { type: String },                 // Loại lưới, độ căng
  inkFormula:      { type: String },                 // Công thức keo/mực pha trộn
  squeegeeStrokes: { type: String },                 // Số lần gạt
  printHits:       { type: String },                 // Số lần in
  image:           { type: String },                 // URL hình ảnh đính kèm minh họa kéo lụa
}, { _id: true });

// --- Sub-schema: File đính kèm chung ---
const attachmentSchema = new mongoose.Schema({
  name:       { type: String },
  url:        { type: String, required: true },
  public_id:  { type: String },
}, { _id: false });

// --- Main Schema ---
const printFormulaSchema = new mongoose.Schema(
  {
    formulaCode: { type: String, unique: true }, // Tự sinh: OFF-2026-001
    name:        { type: String, required: true, trim: true },
    printType:   { type: String, enum: ['offset', 'silk'], required: true },
    customer:    { type: String, trim: true },
    product:     { type: String, trim: true },
    status:      { type: String, enum: ['draft', 'approved', 'archived'], default: 'draft' },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // --- Cấu trúc cho In Offset ---
    offsetComponents: [offsetComponentSchema],

    // --- Cấu trúc cho In Lụa ---
    silkEmulsion:   { type: String }, // Keo chụp bảng
    silkFrames:     [silkFrameSchema],

    // --- Cài đặt máy (Chung) ---
    machineName:     { type: String },
    machineSettings: { type: String },

    // --- Ghi chú & File chung ---
    notes:       { type: String },
    images:      [{ public_id: String, url: String }], // Hình đại diện cho cả bài
    attachments: [attachmentSchema],
  },
  { timestamps: true }
);

// --- Auto-generate formulaCode trước khi lưu ---
printFormulaSchema.pre('save', async function () {
  if (!this.formulaCode) {
    const prefix = this.printType === 'offset' ? 'OFF' : 'SILK';
    const year   = new Date().getFullYear();
    const count  = await mongoose.model('PrintFormula').countDocuments({ printType: this.printType });
    const seq    = String(count + 1).padStart(3, '0');
    this.formulaCode = `${prefix}-${year}-${seq}`;
  }
});

module.exports = mongoose.model('PrintFormula', printFormulaSchema);
