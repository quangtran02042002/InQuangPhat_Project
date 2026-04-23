const CashBook = require('../models/CashBook');
const CashTransaction = require('../models/CashTransaction');
const Receivable = require('../models/Receivable');
const Payable = require('../models/Payable');
const EmergencyFund = require('../models/EmergencyFund');
const FinanceCategory = require('../models/FinanceCategory');

// GET /api/finance/reports/dashboard
const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const [
      cashBooks,
      todayIncome,
      todayExpense,
      monthIncome,
      monthExpense,
      receivableSummary,
      payableSummary,
      emergencyFund,
      overdueReceivables,
      dueSoonPayables,
    ] = await Promise.all([
      CashBook.find({ isActive: true }),

      CashTransaction.aggregate([
        { $match: { type: 'income', status: 'active', transactionDate: { $gte: todayStart, $lte: todayEnd } } },
        { $group: { _id: null, total: { $sum: '$amountInVND' } } },
      ]),
      CashTransaction.aggregate([
        { $match: { type: 'expense', status: 'active', transactionDate: { $gte: todayStart, $lte: todayEnd } } },
        { $group: { _id: null, total: { $sum: '$amountInVND' } } },
      ]),
      CashTransaction.aggregate([
        { $match: { type: 'income', status: 'active', transactionDate: { $gte: thisMonthStart, $lte: thisMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$amountInVND' } } },
      ]),
      CashTransaction.aggregate([
        { $match: { type: 'expense', status: 'active', transactionDate: { $gte: thisMonthStart, $lte: thisMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$amountInVND' } } },
      ]),

      Receivable.aggregate([
        { $match: { status: { $in: ['pending', 'partial', 'overdue'] } } },
        { $group: { _id: null, total: { $sum: '$outstandingAmount' }, count: { $sum: 1 } } },
      ]),
      Payable.aggregate([
        { $match: { status: { $in: ['pending', 'partial', 'overdue'] } } },
        { $group: { _id: null, total: { $sum: '$outstandingAmount' }, count: { $sum: 1 } } },
      ]),

      EmergencyFund.findOne().sort({ updatedAt: -1 }),

      // Overdue receivables (top 5)
      Receivable.find({ status: 'overdue' })
        .sort({ debtAgeDays: -1 })
        .limit(5)
        .select('customerName outstandingAmount debtAgeDays dueDate documentCode'),

      // Due-soon payables (within 7 days)
      Payable.find({
        status: { $in: ['pending', 'partial'] },
        dueDate: { $gte: today, $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) },
      }).sort({ dueDate: 1 }).limit(5).select('supplierName outstandingAmount dueDate documentCode'),
    ]);

    const totalBalance = cashBooks.reduce((s, b) => s + b.currentBalance, 0);
    const totalReceivable = receivableSummary[0]?.total || 0;
    const totalPayable = payableSummary[0]?.total || 0;

    res.json({
      totalBalance,
      cashBooks,
      today: {
        income: todayIncome[0]?.total || 0,
        expense: todayExpense[0]?.total || 0,
        net: (todayIncome[0]?.total || 0) - (todayExpense[0]?.total || 0),
      },
      thisMonth: {
        income: monthIncome[0]?.total || 0,
        expense: monthExpense[0]?.total || 0,
        net: (monthIncome[0]?.total || 0) - (monthExpense[0]?.total || 0),
      },
      receivable: { total: totalReceivable, count: receivableSummary[0]?.count || 0 },
      payable: { total: totalPayable, count: payableSummary[0]?.count || 0 },
      netDebt: totalReceivable - totalPayable,
      emergencyFund: emergencyFund || { currentAmount: 0, targetAmount: 0, targetMonths: 3 },
      overdueReceivables,
      dueSoonPayables,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/finance/reports/cashflow?period=30&groupBy=day
const getCashflowReport = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const groupBy = req.query.groupBy || 'day'; // 'day' | 'week' | 'month'
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    let dateFormat;
    if (groupBy === 'month') dateFormat = '%Y-%m';
    else if (groupBy === 'week') dateFormat = '%Y-W%V';
    else dateFormat = '%Y-%m-%d';

    const [incomeData, expenseData] = await Promise.all([
      CashTransaction.aggregate([
        { $match: { type: 'income', status: 'active', transactionDate: { $gte: startDate } } },
        { $group: {
          _id: { $dateToString: { format: dateFormat, date: '$transactionDate' } },
          total: { $sum: '$amountInVND' },
          count: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]),
      CashTransaction.aggregate([
        { $match: { type: 'expense', status: 'active', transactionDate: { $gte: startDate } } },
        { $group: {
          _id: { $dateToString: { format: dateFormat, date: '$transactionDate' } },
          total: { $sum: '$amountInVND' },
          count: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Merge into unified series
    const allDates = new Set([...incomeData.map(d => d._id), ...expenseData.map(d => d._id)]);
    const incomeMap = Object.fromEntries(incomeData.map(d => [d._id, d.total]));
    const expenseMap = Object.fromEntries(expenseData.map(d => [d._id, d.total]));

    const series = [...allDates].sort().map(date => ({
      date,
      income: incomeMap[date] || 0,
      expense: expenseMap[date] || 0,
      net: (incomeMap[date] || 0) - (expenseMap[date] || 0),
    }));

    res.json({ series, days, groupBy });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/finance/reports/net-debt
const getNetDebtReport = async (req, res) => {
  try {
    const [recGroups, payGroups, recTotal, payTotal] = await Promise.all([
      Receivable.aggregate([
        { $match: { status: { $in: ['pending', 'partial', 'overdue'] } } },
        { $group: { _id: '$debtAgeGroup', total: { $sum: '$outstandingAmount' }, count: { $sum: 1 } } },
      ]),
      Payable.aggregate([
        { $match: { status: { $in: ['pending', 'partial', 'overdue'] } } },
        { $group: { _id: '$debtAgeGroup', total: { $sum: '$outstandingAmount' }, count: { $sum: 1 } } },
      ]),
      Receivable.aggregate([
        { $match: { status: { $in: ['pending', 'partial', 'overdue'] } } },
        { $group: { _id: null, total: { $sum: '$outstandingAmount' } } },
      ]),
      Payable.aggregate([
        { $match: { status: { $in: ['pending', 'partial', 'overdue'] } } },
        { $group: { _id: null, total: { $sum: '$outstandingAmount' } } },
      ]),
    ]);
    res.json({
      receivableByAge: recGroups,
      payableByAge: payGroups,
      totalReceivable: recTotal[0]?.total || 0,
      totalPayable: payTotal[0]?.total || 0,
      netDebt: (recTotal[0]?.total || 0) - (payTotal[0]?.total || 0),
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/finance/reports/pnl?startDate=&endDate=
const getPnLReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchDate = {};
    if (startDate) matchDate.$gte = new Date(startDate);
    if (endDate) matchDate.$lte = new Date(new Date(endDate).setHours(23, 59, 59));

    const txFilter = { status: 'active' };
    if (startDate || endDate) txFilter.transactionDate = matchDate;

    // Revenue
    const revCats = await FinanceCategory.find({ group: 'revenue', direction: 'income' }).select('_id');
    const revCatIds = revCats.map(c => c._id);

    // COGS
    const cogsCats = await FinanceCategory.find({ group: 'cogs', direction: 'expense' }).select('_id');
    const cogsCatIds = cogsCats.map(c => c._id);

    // OPEX
    const opexCats = await FinanceCategory.find({ group: 'opex', direction: 'expense' }).select('_id');
    const opexCatIds = opexCats.map(c => c._id);

    const [revenue, cogs, opex, byCategory] = await Promise.all([
      CashTransaction.aggregate([
        { $match: { ...txFilter, type: 'income', category: { $in: revCatIds } } },
        { $group: { _id: null, total: { $sum: '$amountInVND' } } },
      ]),
      CashTransaction.aggregate([
        { $match: { ...txFilter, type: 'expense', category: { $in: cogsCatIds } } },
        { $group: { _id: null, total: { $sum: '$amountInVND' } } },
      ]),
      CashTransaction.aggregate([
        { $match: { ...txFilter, type: 'expense', category: { $in: opexCatIds } } },
        { $group: { _id: null, total: { $sum: '$amountInVND' } } },
      ]),
      CashTransaction.aggregate([
        { $match: { ...txFilter } },
        { $group: { _id: '$category', total: { $sum: '$amountInVND' }, type: { $first: '$type' } } },
        { $lookup: { from: 'financecategories', localField: '_id', foreignField: '_id', as: 'cat' } },
        { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
        { $project: {
          categoryName: '$cat.name',
          categoryCode: '$cat.code',
          group: '$cat.group',
          direction: '$cat.direction',
          total: 1,
          type: 1,
        }},
      ]),
    ]);

    const rev = revenue[0]?.total || 0;
    const cogsTotal = cogs[0]?.total || 0;
    const opexTotal = opex[0]?.total || 0;
    const grossProfit = rev - cogsTotal;
    const netProfit = grossProfit - opexTotal;

    res.json({
      revenue: rev,
      cogs: cogsTotal,
      grossProfit,
      grossMargin: rev > 0 ? ((grossProfit / rev) * 100).toFixed(1) : '0',
      opex: opexTotal,
      netProfit,
      netMargin: rev > 0 ? ((netProfit / rev) * 100).toFixed(1) : '0',
      byCategory,
      period: { startDate, endDate },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/finance/reports/emergency-fund
const getEmergencyFundStatus = async (req, res) => {
  try {
    const fund = await EmergencyFund.findOne().sort({ updatedAt: -1 }).populate('linkedCashBook', 'name currentBalance');
    res.json(fund || { currentAmount: 0, targetAmount: 0, targetMonths: 3, monthlyOPEX: 0 });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { getDashboard, getCashflowReport, getNetDebtReport, getPnLReport, getEmergencyFundStatus };
