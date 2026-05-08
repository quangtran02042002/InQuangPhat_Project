const express = require('express');
const router = express.Router();
const { protect, admin, authorize } = require('../middleware/authMiddleware');

// Controllers
const { getCategories, createCategory, updateCategory, deleteCategory, seedCategories } = require('../controllers/financeCategoryController');
const { getCashBooks, createCashBook, updateCashBook, deleteCashBook, getCashBookTransactions, getCashBookSummary } = require('../controllers/cashBookController');
const { getTransactions, createTransaction, updateTransaction, cancelTransaction, getTransactionSummary } = require('../controllers/cashTransactionController');
const { getReceivables, createReceivable, updateReceivable, recordPayment: recordReceivablePayment, getAgingReport: getReceivableAging, sendReminder, deleteReceivable } = require('../controllers/receivableController');
const { getPayables, createPayable, updatePayable, recordPayment: recordPayablePayment, getAgingReport: getPayableAging, getDueSoon, deletePayable } = require('../controllers/payableController');
const { getEmergencyFund, upsertEmergencyFund, addContribution } = require('../controllers/emergencyFundController');
const { getDashboard, getCashflowReport, getNetDebtReport, getPnLReport, getEmergencyFundStatus } = require('../controllers/financeReportController');
const { getPeriods, createPeriod, closePeriod, getCurrentPeriod, deletePeriod } = require('../controllers/accountingPeriodController');

// All finance routes require authentication
router.use(protect, admin, authorize('director', 'accountant'));

// ── CATEGORIES ──────────────────────────────────────────
router.get('/categories', getCategories);
router.post('/categories/seed', seedCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// ── CASH BOOKS ──────────────────────────────────────────
router.get('/cashbooks', getCashBooks);
router.post('/cashbooks', createCashBook);
router.put('/cashbooks/:id', updateCashBook);
router.delete('/cashbooks/:id', deleteCashBook);
router.get('/cashbooks/:id/transactions', getCashBookTransactions);
router.get('/cashbooks/:id/summary', getCashBookSummary);

// ── TRANSACTIONS ─────────────────────────────────────────
router.get('/transactions/summary', getTransactionSummary);
router.get('/transactions', getTransactions);
router.post('/transactions', createTransaction);
router.put('/transactions/:id', updateTransaction);
router.delete('/transactions/:id', cancelTransaction);

// ── RECEIVABLES ──────────────────────────────────────────
router.get('/receivables/aging', getReceivableAging);
router.get('/receivables', getReceivables);
router.post('/receivables', createReceivable);
router.put('/receivables/:id', updateReceivable);
router.delete('/receivables/:id', deleteReceivable);
router.post('/receivables/:id/payment', recordReceivablePayment);
router.post('/receivables/:id/remind', sendReminder);

// ── PAYABLES ─────────────────────────────────────────────
router.get('/payables/aging', getPayableAging);
router.get('/payables/due-soon', getDueSoon);
router.get('/payables', getPayables);
router.post('/payables', createPayable);
router.put('/payables/:id', updatePayable);
router.delete('/payables/:id', deletePayable);
router.post('/payables/:id/payment', recordPayablePayment);

// ── EMERGENCY FUND ───────────────────────────────────────
router.get('/emergency-fund', getEmergencyFund);
router.put('/emergency-fund', upsertEmergencyFund);
router.post('/emergency-fund/contribute', addContribution);

// ── REPORTS ──────────────────────────────────────────────
router.get('/reports/dashboard', getDashboard);
router.get('/reports/cashflow', getCashflowReport);
router.get('/reports/net-debt', getNetDebtReport);
router.get('/reports/pnl', getPnLReport);
router.get('/reports/emergency-fund', getEmergencyFundStatus);

// ── ACCOUNTING PERIODS ───────────────────────────────────
router.get('/periods/current', getCurrentPeriod);
router.get('/periods', getPeriods);
router.post('/periods', createPeriod);
router.put('/periods/:id/close', closePeriod);
router.delete('/periods/:id', deletePeriod);

module.exports = router;
