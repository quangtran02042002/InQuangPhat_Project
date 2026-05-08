const Payable = require('../models/Payable');
const CashTransaction = require('../models/CashTransaction');
const CashBook = require('../models/CashBook');
const { generateCode } = require('../utils/financeCodeGenerator');
const { updatePayableDebtAge } = require('../services/debtAgingService');

// GET /api/finance/payables
const getPayables = async (req, res) => {
  try {
    const { status, supplier, debtAgeGroup, page = 1, limit = 50, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (supplier) filter.supplier = supplier;
    if (debtAgeGroup) filter.debtAgeGroup = debtAgeGroup;
    if (search) {
      filter.$or = [
        { supplierName: { $regex: search, $options: 'i' } },
        { documentCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Payable.find(filter)
        .populate('supplier', 'name')
        .populate('createdBy', 'name')
        .sort({ issueDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Payable.countDocuments(filter),
    ]);
    for (const item of items) await updatePayableDebtAge(item);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/finance/payables
const createPayable = async (req, res) => {
  try {
    const documentCode = await generateCode(Payable, 'documentCode', 'CNC');
    const payable = await Payable.create({
      ...req.body,
      documentCode,
      outstandingAmount: req.body.totalAmount,
      createdBy: req.user._id,
    });
    res.status(201).json(payable);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// PUT /api/finance/payables/:id
const updatePayable = async (req, res) => {
  try {
    const payable = await Payable.findById(req.params.id);
    if (!payable) return res.status(404).json({ message: 'Không tìm thấy' });
    Object.assign(payable, req.body);
    const updated = await payable.save();
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// POST /api/finance/payables/:id/payment
const recordPayment = async (req, res) => {
  try {
    const { amount, cashBookId, method, note, paymentDate } = req.body;
    const payable = await Payable.findById(req.params.id);
    if (!payable) return res.status(404).json({ message: 'Không tìm thấy' });
    if (amount <= 0) return res.status(400).json({ message: 'Số tiền phải lớn hơn 0' });

    const transactionCode = await generateCode(CashTransaction, 'transactionCode', 'PC');
    const tx = await CashTransaction.create({
      transactionCode,
      type: 'expense',
      amount,
      currency: payable.currency,
      exchangeRate: payable.exchangeRate,
      amountInVND: amount * payable.exchangeRate,
      cashBook: cashBookId,
      counterpartyType: 'supplier',
      counterpartyId: payable.supplier,
      counterpartyModel: 'Supplier',
      counterpartyName: payable.supplierName,
      linkedPayable: payable._id,
      description: `Trả tiền nợ cho ${payable.supplierName} - ${payable.documentCode}`,
      transactionDate: paymentDate || new Date(),
      createdBy: req.user._id,
    });

    await CashBook.findByIdAndUpdate(cashBookId, { $inc: { currentBalance: -(amount * payable.exchangeRate) } });

    payable.payments.push({ amount, date: paymentDate || new Date(), cashTransaction: tx._id, method, note });
    payable.paidAmount += amount;
    await payable.save();

    res.json({ payable, transaction: tx });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// GET /api/finance/payables/aging
const getAgingReport = async (req, res) => {
  try {
    const groups = await Payable.aggregate([
      { $match: { status: { $in: ['pending', 'partial', 'overdue'] } } },
      { $group: {
        _id: '$debtAgeGroup',
        count: { $sum: 1 },
        totalOutstanding: { $sum: '$outstandingAmount' },
      }},
    ]);
    const totalOutstanding = groups.reduce((s, g) => s + g.totalOutstanding, 0);
    res.json({ groups, totalOutstanding });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/finance/payables/due-soon
const getDueSoon = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const items = await Payable.find({
      status: { $in: ['pending', 'partial'] },
      dueDate: { $gte: now, $lte: future },
    }).populate('supplier', 'name').sort({ dueDate: 1 });
    const totalDue = items.reduce((s, p) => s + p.outstandingAmount, 0);
    res.json({ items, totalDue });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DELETE /api/finance/payables/:id
const deletePayable = async (req, res) => {
  try {
    const payable = await Payable.findById(req.params.id);
    if (!payable) return res.status(404).json({ message: 'Không tìm thấy' });
    if (payable.paidAmount > 0) return res.status(400).json({ message: 'Không thể xóa công nợ đã thanh toán một phần' });
    await payable.deleteOne();
    res.json({ message: 'Đã xóa' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { getPayables, createPayable, updatePayable, recordPayment, getAgingReport, getDueSoon, deletePayable };
