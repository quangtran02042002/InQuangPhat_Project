const CashTransaction = require('../models/CashTransaction');
const CashBook = require('../models/CashBook');
const { generateCode } = require('../utils/financeCodeGenerator');

// Helper: update cashbook balance
const updateBalance = async (cashBookId, amount, type) => {
  const book = await CashBook.findById(cashBookId);
  if (!book) return;
  if (type === 'income') book.currentBalance += amount;
  else if (type === 'expense') book.currentBalance -= amount;
  await book.save();
};

// GET /api/finance/transactions
const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, cashBook, category, page = 1, limit = 50, search } = req.query;
    const filter = { status: 'active' };
    if (type) filter.type = type;
    if (cashBook) filter.cashBook = cashBook;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { transactionCode: { $regex: search, $options: 'i' } },
        { counterpartyName: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [transactions, total] = await Promise.all([
      CashTransaction.find(filter)
        .populate('category', 'name code direction group')
        .populate('cashBook', 'name type')
        .populate('createdBy', 'name')
        .sort({ transactionDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      CashTransaction.countDocuments(filter),
    ]);
    res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/finance/transactions
const createTransaction = async (req, res) => {
  try {
    const { type, cashBook: cashBookId } = req.body;
    const prefix = type === 'income' ? 'PT' : 'PC';
    const transactionCode = await generateCode(CashTransaction, 'transactionCode', prefix);

    const tx = await CashTransaction.create({
      ...req.body,
      transactionCode,
      createdBy: req.user._id,
    });

    // Update cashbook balance
    await updateBalance(cashBookId, tx.amountInVND, type);

    const populated = await tx.populate([
      { path: 'category', select: 'name code direction group' },
      { path: 'cashBook', select: 'name type' },
    ]);

    res.status(201).json(populated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// PUT /api/finance/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const tx = await CashTransaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
    if (tx.status === 'cancelled') return res.status(400).json({ message: 'Giao dịch đã hủy không thể sửa' });

    // Revert old balance, apply new
    const oldAmountInVND = tx.amountInVND;
    const oldType = tx.type;
    const oldCashBookId = tx.cashBook; // LƯU LẠI SỔ QUỸ CŨ

    Object.assign(tx, req.body);
    const updated = await tx.save();

    // Revert old balance TỪ SỔ QUỸ CŨ
    if (oldType === 'income') {
      await CashBook.findByIdAndUpdate(oldCashBookId, { $inc: { currentBalance: -oldAmountInVND } });
    } else {
      await CashBook.findByIdAndUpdate(oldCashBookId, { $inc: { currentBalance: oldAmountInVND } });
    }
    // Apply new balance VÀO SỔ QUỸ MỚI
    await updateBalance(updated.cashBook, updated.amountInVND, updated.type);

    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// DELETE /api/finance/transactions/:id  (soft cancel)
const cancelTransaction = async (req, res) => {
  try {
    const tx = await CashTransaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
    if (tx.status === 'cancelled') return res.status(400).json({ message: 'Giao dịch đã bị hủy rồi' });

    // Revert balance
    if (tx.type === 'income') {
      await CashBook.findByIdAndUpdate(tx.cashBook, { $inc: { currentBalance: -tx.amountInVND } });
    } else {
      await CashBook.findByIdAndUpdate(tx.cashBook, { $inc: { currentBalance: tx.amountInVND } });
    }

    tx.status = 'cancelled';
    await tx.save();
    res.json({ message: 'Đã hủy giao dịch và hoàn số dư sổ quỹ' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/finance/transactions/summary  — today stats
const getTransactionSummary = async (req, res) => {
  try {
    const { startDate, endDate, cashBook } = req.query;
    const filter = { status: 'active' };
    if (cashBook) filter.cashBook = cashBook;
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }
    const [income, expense] = await Promise.all([
      CashTransaction.aggregate([
        { $match: { ...filter, type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amountInVND' }, count: { $sum: 1 } } },
      ]),
      CashTransaction.aggregate([
        { $match: { ...filter, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amountInVND' }, count: { $sum: 1 } } },
      ]),
    ]);
    res.json({
      totalIncome: income[0]?.total || 0,
      incomeCount: income[0]?.count || 0,
      totalExpense: expense[0]?.total || 0,
      expenseCount: expense[0]?.count || 0,
      netFlow: (income[0]?.total || 0) - (expense[0]?.total || 0),
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { getTransactions, createTransaction, updateTransaction, cancelTransaction, getTransactionSummary };
