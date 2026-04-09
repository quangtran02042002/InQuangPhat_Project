const PrintFormula = require('../models/PrintFormula');

// ──────────────────────────────────────────────
// GET /api/print-formulas    — Danh sách (có filter/search)
// ──────────────────────────────────────────────
const getFormulas = async (req, res) => {
  try {
    const { printType, status, q } = req.query;
    const filter = {};
    if (printType) filter.printType = printType;
    if (status)    filter.status    = status;
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ name: regex }, { formulaCode: regex }, { customer: regex }, { product: regex }];
    }
    const formulas = await PrintFormula.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(formulas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// GET /api/print-formulas/:id   — Chi tiết
// ──────────────────────────────────────────────
const getFormulaById = async (req, res) => {
  try {
    const formula = await PrintFormula.findById(req.params.id).populate('createdBy', 'name');
    if (!formula) return res.status(404).json({ message: 'Không tìm thấy công thức' });
    res.json(formula);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// POST /api/print-formulas   — Tạo mới
// ──────────────────────────────────────────────
const createFormula = async (req, res) => {
  try {
    const formula = new PrintFormula({
      ...req.body,
      createdBy: req.user._id,
    });
    const saved = await formula.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// PUT /api/print-formulas/:id   — Cập nhật
// ──────────────────────────────────────────────
const updateFormula = async (req, res) => {
  try {
    const formula = await PrintFormula.findById(req.params.id);
    if (!formula) return res.status(404).json({ message: 'Không tìm thấy công thức' });

    // Không cho cập nhật formulaCode
    const { formulaCode, ...rest } = req.body;
    Object.assign(formula, rest);
    const updated = await formula.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// DELETE /api/print-formulas/:id
// ──────────────────────────────────────────────
const deleteFormula = async (req, res) => {
  try {
    const formula = await PrintFormula.findByIdAndDelete(req.params.id);
    if (!formula) return res.status(404).json({ message: 'Không tìm thấy công thức' });
    res.json({ message: 'Đã xóa công thức' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// PUT /api/print-formulas/:id/duplicate — Nhân bản
// ──────────────────────────────────────────────
const duplicateFormula = async (req, res) => {
  try {
    const original = await PrintFormula.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ message: 'Không tìm thấy công thức' });
    
    delete original._id;
    delete original.formulaCode; // auto-gen mã mới
    delete original.createdAt;
    delete original.updatedAt;
    delete original.__v;

    const copy = new PrintFormula({
      ...original,
      name:      `[COPY] ${original.name}`,
      status:    'draft',
      createdBy: req.user._id,
    });
    const saved = await copy.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getFormulas,
  getFormulaById,
  createFormula,
  updateFormula,
  deleteFormula,
  duplicateFormula,
};
