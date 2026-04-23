const Receivable = require('../models/Receivable');
const Payable = require('../models/Payable');

const DEBT_AGE_GROUPS = [
  { group: 'current', min: -Infinity, max: 0 },
  { group: '1-15',   min: 1, max: 15 },
  { group: '16-30',  min: 16, max: 30 },
  { group: '31-60',  min: 31, max: 60 },
  { group: '61-90',  min: 61, max: 90 },
  { group: 'over90', min: 91, max: Infinity },
];

const classifyDebtAge = (daysOverdue) => {
  if (daysOverdue <= 0) return 'current';
  for (const { group, min, max } of DEBT_AGE_GROUPS) {
    if (daysOverdue >= min && daysOverdue <= max) return group;
  }
  return 'over90';
};

/**
 * Update debt age for a single Receivable document
 * @param {Document} rec - Mongoose Receivable document
 */
const updateReceivableDebtAge = async (rec) => {
  if (rec.status === 'paid') return;
  const now = new Date();
  const due = rec.dueDate ? new Date(rec.dueDate) : null;
  if (!due) return;

  const daysOverdue = Math.floor((now - due) / (1000 * 60 * 60 * 24));
  const newGroup = classifyDebtAge(daysOverdue);

  let changed = false;
  if (rec.debtAgeDays !== daysOverdue) { rec.debtAgeDays = daysOverdue; changed = true; }
  if (rec.debtAgeGroup !== newGroup) { rec.debtAgeGroup = newGroup; changed = true; }
  if (daysOverdue > 0 && rec.status !== 'overdue' && rec.status !== 'bad_debt') {
    rec.status = 'overdue';
    changed = true;
  }
  if (changed) {
    try { await rec.save(); } catch (_) {}
  }
};

/**
 * Update debt age for a single Payable document
 */
const updatePayableDebtAge = async (payable) => {
  if (payable.status === 'paid') return;
  const now = new Date();
  const due = payable.dueDate ? new Date(payable.dueDate) : null;
  if (!due) return;

  const daysOverdue = Math.floor((now - due) / (1000 * 60 * 60 * 24));
  const newGroup = classifyDebtAge(daysOverdue);

  let changed = false;
  if (payable.debtAgeDays !== daysOverdue) { payable.debtAgeDays = daysOverdue; changed = true; }
  if (payable.debtAgeGroup !== newGroup) { payable.debtAgeGroup = newGroup; changed = true; }
  if (daysOverdue > 0 && payable.status !== 'overdue') {
    payable.status = 'overdue';
    changed = true;
  }
  if (changed) {
    try { await payable.save(); } catch (_) {}
  }
};

/**
 * Batch update all active receivables & payables (can be cron job)
 */
const runBatchDebtAging = async () => {
  try {
    const receivables = await Receivable.find({ status: { $in: ['pending', 'partial', 'overdue'] } });
    for (const rec of receivables) await updateReceivableDebtAge(rec);

    const payables = await Payable.find({ status: { $in: ['pending', 'partial', 'overdue'] } });
    for (const p of payables) await updatePayableDebtAge(p);

    console.log(`[DebtAging] Updated ${receivables.length} receivables, ${payables.length} payables`);
  } catch (e) {
    console.error('[DebtAging] Error:', e.message);
  }
};

module.exports = { updateReceivableDebtAge, updatePayableDebtAge, runBatchDebtAging, classifyDebtAge };
