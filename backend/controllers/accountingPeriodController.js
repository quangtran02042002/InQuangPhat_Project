const AccountingPeriod = require('../models/AccountingPeriod');

// GET /api/finance/periods
const getPeriods = async (req, res) => {
  try {
    const periods = await AccountingPeriod.find().sort({ startDate: -1 });
    res.json(periods);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/finance/periods
const createPeriod = async (req, res) => {
  try {
    const period = await AccountingPeriod.create({ ...req.body });
    res.status(201).json(period);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// PUT /api/finance/periods/:id/close
const closePeriod = async (req, res) => {
  try {
    const period = await AccountingPeriod.findById(req.params.id);
    if (!period) return res.status(404).json({ message: 'Không tìm thấy kỳ kế toán' });
    if (period.isClosed) return res.status(400).json({ message: 'Kỳ kế toán đã được khóa' });
    period.isClosed = true;
    period.closedAt = new Date();
    period.closedBy = req.user._id;
    if (req.body.note) period.note = req.body.note;
    await period.save();
    res.json(period);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// GET /api/finance/periods/current — lấy kỳ hiện tại (không bị đóng)
const getCurrentPeriod = async (req, res) => {
  try {
    const now = new Date();
    const period = await AccountingPeriod.findOne({
      isClosed: false,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ startDate: -1 });
    res.json(period || null);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DELETE /api/finance/periods/:id
const deletePeriod = async (req, res) => {
  try {
    const period = await AccountingPeriod.findById(req.params.id);
    if (!period) return res.status(404).json({ message: 'Không tìm thấy' });
    if (period.isClosed) return res.status(400).json({ message: 'Kỳ đã khóa không thể xóa' });
    await period.deleteOne();
    res.json({ message: 'Đã xóa kỳ kế toán' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { getPeriods, createPeriod, closePeriod, getCurrentPeriod, deletePeriod };
