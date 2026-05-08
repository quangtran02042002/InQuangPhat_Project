const EmergencyFund = require('../models/EmergencyFund');
const CashBook = require('../models/CashBook');

// GET /api/finance/emergency-fund
const getEmergencyFund = async (req, res) => {
  try {
    const fund = await EmergencyFund.findOne().sort({ updatedAt: -1 }).populate('linkedCashBook', 'name currentBalance type');
    res.json(fund || null);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// PUT /api/finance/emergency-fund  (upsert — singleton)
const upsertEmergencyFund = async (req, res) => {
  try {
    const existing = await EmergencyFund.findOne().sort({ updatedAt: -1 });
    if (existing) {
      const { targetMonths, monthlyOPEX, linkedCashBook, currentAmount } = req.body;
      if (targetMonths !== undefined) existing.targetMonths = targetMonths;
      if (monthlyOPEX !== undefined) existing.monthlyOPEX = monthlyOPEX;
      if (linkedCashBook !== undefined) existing.linkedCashBook = linkedCashBook;
      if (currentAmount !== undefined) existing.currentAmount = currentAmount;
      existing.updatedBy = req.user._id;
      await existing.save();
      return res.json(existing);
    }
    const fund = await EmergencyFund.create({ ...req.body, updatedBy: req.user._id });
    res.status(201).json(fund);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// POST /api/finance/emergency-fund/contribute
const addContribution = async (req, res) => {
  try {
    const { amount, note, date } = req.body;
    const fund = await EmergencyFund.findOne().sort({ updatedAt: -1 });
    if (!fund) return res.status(404).json({ message: 'Chưa cài đặt quỹ dự phòng' });
    fund.contributions.push({ amount, note, date: date || new Date() });
    fund.currentAmount += amount;
    fund.updatedBy = req.user._id;
    await fund.save();
    res.json(fund);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

module.exports = { getEmergencyFund, upsertEmergencyFund, addContribution };
