const CashBook = require('../models/CashBook');
const CashTransaction = require('../models/CashTransaction');

// GET /api/finance/cashbooks
const getCashBooks = async (req, res) => {
  try {
    const books = await CashBook.find({ isActive: true }).sort({ createdAt: 1 });
    res.json(books);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/finance/cashbooks
const createCashBook = async (req, res) => {
  try {
    const book = await CashBook.create({
      ...req.body,
      currentBalance: req.body.openingBalance || 0,
      createdBy: req.user._id,
    });
    res.status(201).json(book);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// PUT /api/finance/cashbooks/:id
const updateCashBook = async (req, res) => {
  try {
    const book = await CashBook.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Không tìm thấy sổ quỹ' });
    const { currentBalance, ...rest } = req.body; // Do not allow direct currentBalance override
    Object.assign(book, rest);
    const updated = await book.save();
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// DELETE /api/finance/cashbooks/:id
const deleteCashBook = async (req, res) => {
  try {
    const book = await CashBook.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Không tìm thấy sổ quỹ' });
    
    if (book.currentBalance !== 0) {
      return res.status(400).json({ message: 'Không thể vô hiệu hóa sổ quỹ còn số dư. Vui lòng chuyển tiền sang sổ khác trước.' });
    }

    // Soft delete
    book.isActive = false;
    await book.save();
    res.json({ message: 'Đã vô hiệu hóa sổ quỹ' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/finance/cashbooks/:id/transactions
const getCashBookTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, page = 1, limit = 50 } = req.query;
    const filter = { cashBook: req.params.id, status: 'active' };
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [transactions, total] = await Promise.all([
      CashTransaction.find(filter)
        .populate('category', 'name code direction group')
        .populate('createdBy', 'name')
        .sort({ transactionDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      CashTransaction.countDocuments(filter),
    ]);
    res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/finance/cashbooks/:id/summary
const getCashBookSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { id } = req.params;
    const filter = { cashBook: id, status: 'active' };
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }
    const [income, expense, book] = await Promise.all([
      CashTransaction.aggregate([
        { $match: { ...filter, type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amountInVND' } } },
      ]),
      CashTransaction.aggregate([
        { $match: { ...filter, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amountInVND' } } },
      ]),
      CashBook.findById(id),
    ]);
    res.json({
      cashBook: book,
      totalIncome: income[0]?.total || 0,
      totalExpense: expense[0]?.total || 0,
      net: (income[0]?.total || 0) - (expense[0]?.total || 0),
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { getCashBooks, createCashBook, updateCashBook, deleteCashBook, getCashBookTransactions, getCashBookSummary };
