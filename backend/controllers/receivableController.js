const Receivable = require('../models/Receivable');
const CashTransaction = require('../models/CashTransaction');
const CashBook = require('../models/CashBook');
const { generateCode } = require('../utils/financeCodeGenerator');
const { updateReceivableDebtAge } = require('../services/debtAgingService');
const { sendDebtReminder } = require('../services/financeNotificationService');

// GET /api/finance/receivables
const getReceivables = async (req, res) => {
  try {
    const { status, customer, debtAgeGroup, page = 1, limit = 50, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (debtAgeGroup) filter.debtAgeGroup = debtAgeGroup;
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { documentCode: { $regex: search, $options: 'i' } },
        { orderCode: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Receivable.find(filter)
        .populate('customer', 'name')
        .populate('productionOrder', 'orderCode')
        .populate('createdBy', 'name')
        .sort({ issueDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Receivable.countDocuments(filter),
    ]);
    // Update debt age on the fly
    for (const item of items) await updateReceivableDebtAge(item);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/finance/receivables
const createReceivable = async (req, res) => {
  try {
    const documentCode = await generateCode(Receivable, 'documentCode', 'CNT');
    const rec = await Receivable.create({
      ...req.body,
      documentCode,
      outstandingAmount: req.body.totalAmount,
      createdBy: req.user._id,
    });
    res.status(201).json(rec);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// PUT /api/finance/receivables/:id
const updateReceivable = async (req, res) => {
  try {
    const rec = await Receivable.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Không tìm thấy công nợ' });
    Object.assign(rec, req.body);
    const updated = await rec.save();
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// POST /api/finance/receivables/:id/payment
const recordPayment = async (req, res) => {
  try {
    const { amount, cashBookId, method, note, paymentDate } = req.body;
    const rec = await Receivable.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Không tìm thấy công nợ' });
    if (amount <= 0) return res.status(400).json({ message: 'Số tiền phải lớn hơn 0' });

    // Create CashTransaction
    const prefix = 'PT';
    const transactionCode = await generateCode(CashTransaction, 'transactionCode', prefix);
    const tx = await CashTransaction.create({
      transactionCode,
      type: 'income',
      amount,
      currency: rec.currency,
      exchangeRate: rec.exchangeRate,
      amountInVND: amount * rec.exchangeRate,
      cashBook: cashBookId,
      counterpartyType: 'customer',
      counterpartyId: rec.customer,
      counterpartyModel: 'Customer',
      counterpartyName: rec.customerName,
      linkedReceivable: rec._id,
      description: `Thu tiền nợ từ ${rec.customerName} - ${rec.documentCode}`,
      transactionDate: paymentDate || new Date(),
      createdBy: req.user._id,
    });

    // Update cashbook balance
    await CashBook.findByIdAndUpdate(cashBookId, { $inc: { currentBalance: amount * rec.exchangeRate } });

    // Record payment in receivable
    rec.payments.push({ amount, date: paymentDate || new Date(), cashTransaction: tx._id, method, note });
    rec.paidAmount += amount;
    await rec.save(); // pre-save hook updates outstandingAmount and status

    res.json({ receivable: rec, transaction: tx });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// GET /api/finance/receivables/aging
const getAgingReport = async (req, res) => {
  try {
    const groups = await Receivable.aggregate([
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

// POST /api/finance/receivables/:id/remind
const sendReminder = async (req, res) => {
  try {
    const rec = await Receivable.findById(req.params.id).populate('customer');
    if (!rec) return res.status(404).json({ message: 'Không tìm thấy công nợ' });
    await sendDebtReminder({ type: 'receivable', doc: rec });
    rec.lastReminderSentAt = new Date();
    rec.reminderCount += 1;
    await rec.save();
    res.json({ message: 'Đã gửi nhắc nhở thành công' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DELETE /api/finance/receivables/:id
const deleteReceivable = async (req, res) => {
  try {
    const rec = await Receivable.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Không tìm thấy' });
    if (rec.paidAmount > 0) return res.status(400).json({ message: 'Không thể xóa công nợ đã thanh toán một phần' });
    await rec.deleteOne();
    res.json({ message: 'Đã xóa' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { getReceivables, createReceivable, updateReceivable, recordPayment, getAgingReport, sendReminder, deleteReceivable };
