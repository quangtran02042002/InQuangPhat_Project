const PrintFormula = require('../models/PrintFormula');

// ──────────────────────────────────────────────
// GET /api/print-formulas    — Danh sách (có filter/search)
// ──────────────────────────────────────────────
const getFormulas = async (req, res) => {
  try {
    const { printType, status, q, sampleGroup, latestOnly } = req.query;
    const filter = {};
    if (printType)    filter.printType    = printType;
    if (status)       filter.status       = status;
    if (sampleGroup)  filter.sampleGroup  = sampleGroup;
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ name: regex }, { formulaCode: regex }, { customer: regex }, { product: regex }, { sampleGroup: regex }];
    }

    let formulas;

    // latestOnly=true → chỉ lấy phiên bản mới nhất của mỗi nhóm mẫu
    if (latestOnly === 'true') {
      // Dùng aggregation để lấy version max trong mỗi sampleGroup
      const pipeline = [
        { $match: filter },
        { $sort: { sampleGroup: 1, version: -1 } },
        { $group: { _id: '$sampleGroup', docId: { $first: '$_id' } } },
        { $lookup: { from: 'printformulas', localField: 'docId', foreignField: '_id', as: 'doc' } },
        { $unwind: '$doc' },
        { $replaceRoot: { newRoot: '$doc' } },
        { $sort: { updatedAt: -1 } },
      ];
      formulas = await PrintFormula.aggregate(pipeline);
    } else {
      formulas = await PrintFormula.find(filter)
        .populate('createdBy', 'name')
        .populate('approvedBy', 'name')
        .sort({ sampleGroup: 1, version: -1 });
    }

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
    const formula = await PrintFormula.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');
    if (!formula) return res.status(404).json({ message: 'Không tìm thấy mẫu' });
    res.json(formula);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// POST /api/print-formulas   — Tạo mẫu mới (v1)
// ──────────────────────────────────────────────
const createFormula = async (req, res) => {
  try {
    const formula = new PrintFormula({
      ...req.body,
      status: 'draft',
      version: 1,
      createdBy: req.user._id,
    });
    const saved = await formula.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// PUT /api/print-formulas/:id   — Cập nhật (chỉ bản draft)
// ──────────────────────────────────────────────
const updateFormula = async (req, res) => {
  try {
    const formula = await PrintFormula.findById(req.params.id);
    if (!formula) return res.status(404).json({ message: 'Không tìm thấy mẫu' });
    if (formula.status === 'approved') {
      return res.status(400).json({ message: 'Không thể chỉnh sửa mẫu đã được chốt (approved)' });
    }

    // Không cho cập nhật formulaCode, sampleGroup, version
    const { formulaCode, sampleGroup, version, approvedAt, approvedBy, ...rest } = req.body;
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
    if (!formula) return res.status(404).json({ message: 'Không tìm thấy mẫu' });
    res.json({ message: 'Đã xóa phiên bản mẫu' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// POST /api/print-formulas/:id/next-version
// Tạo phiên bản tiếp theo từ mẫu hiện tại (cùng sampleGroup, version+1)
// ──────────────────────────────────────────────
const createNextVersion = async (req, res) => {
  try {
    const original = await PrintFormula.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ message: 'Không tìm thấy mẫu' });
    if (original.status === 'approved') {
      return res.status(400).json({ message: 'Mẫu đã chốt, không thể tạo phiên bản mới. Hãy tạo nhóm mẫu mới.' });
    }

    // Tìm version cao nhất hiện có trong nhóm mẫu
    const latestInGroup = await PrintFormula.findOne(
      { sampleGroup: original.sampleGroup },
      'version',
      { sort: { version: -1 } }
    );
    const nextVersion = (latestInGroup?.version || original.version) + 1;

    const { _id, formulaCode, createdAt, updatedAt, __v, approvedAt, approvedBy, ...rest } = original;

    const newVersion = new PrintFormula({
      ...rest,
      sampleGroup: original.sampleGroup,
      version: nextVersion,
      status: 'draft',
      createdBy: req.user._id,
    });
    const saved = await newVersion.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// POST /api/print-formulas/:id/approve
// Chốt mẫu: đánh dấu approved, archive các phiên bản draft khác trong nhóm
// ──────────────────────────────────────────────
const approveFormula = async (req, res) => {
  try {
    const formula = await PrintFormula.findById(req.params.id);
    if (!formula) return res.status(404).json({ message: 'Không tìm thấy mẫu' });
    if (formula.status === 'approved') {
      return res.status(400).json({ message: 'Mẫu đã được chốt trước đó' });
    }

    // Archive tất cả phiên bản draft khác cùng nhóm
    await PrintFormula.updateMany(
      { sampleGroup: formula.sampleGroup, _id: { $ne: formula._id }, status: 'draft' },
      { $set: { status: 'archived' } }
    );

    // Chốt phiên bản này
    formula.status     = 'approved';
    formula.approvedAt = new Date();
    formula.approvedBy = req.user._id;
    const saved = await formula.save();

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────
// GET /api/print-formulas/group/:sampleGroup
// Lấy toàn bộ lịch sử phiên bản của 1 nhóm mẫu
// ──────────────────────────────────────────────
const getVersionHistory = async (req, res) => {
  try {
    const versions = await PrintFormula.find({ sampleGroup: req.params.sampleGroup })
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ version: 1 });
    res.json(versions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getFormulas,
  getFormulaById,
  createFormula,
  updateFormula,
  deleteFormula,
  createNextVersion,
  approveFormula,
  getVersionHistory,
};
