const FinanceCategory = require('../models/FinanceCategory');
const DEFAULT_CATEGORIES = require('../data/financeDefaultCategories');

// GET /api/finance/categories
const getCategories = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.group) filter.group = req.query.group;
    if (req.query.direction) filter.direction = req.query.direction;
    const cats = await FinanceCategory.find(filter).sort({ sortOrder: 1, code: 1 });
    res.json(cats);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/finance/categories
const createCategory = async (req, res) => {
  try {
    const cat = await FinanceCategory.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(cat);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// PUT /api/finance/categories/:id
const updateCategory = async (req, res) => {
  try {
    const cat = await FinanceCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    Object.assign(cat, req.body);
    const updated = await cat.save();
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// DELETE /api/finance/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const cat = await FinanceCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    if (cat.isSystem) return res.status(400).json({ message: 'Không thể xóa danh mục hệ thống' });
    await cat.deleteOne();
    res.json({ message: 'Đã xóa danh mục' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/finance/categories/seed
const seedCategories = async (req, res) => {
  try {
    let created = 0;
    for (const cat of DEFAULT_CATEGORIES) {
      const exists = await FinanceCategory.findOne({ code: cat.code });
      if (!exists) {
        await FinanceCategory.create({ ...cat, createdBy: req.user._id });
        created++;
      }
    }
    res.json({ message: `Đã tạo ${created} danh mục mặc định`, total: DEFAULT_CATEGORIES.length, created });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory, seedCategories };
