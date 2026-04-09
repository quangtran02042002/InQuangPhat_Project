const Debt = require('../models/Debt');
const FinanceSourceDocument = require('../models/FinanceSourceDocument');
const { formatDateCode, getNextCode } = require('../utils/financeCodeGenerator');

const normalizeCutoffDate = (cutoffDateInput) => {
  const cutoffDate = cutoffDateInput ? new Date(cutoffDateInput) : new Date();

  if (Number.isNaN(cutoffDate.getTime())) {
    throw new Error('Ngay cut-off khong hop le');
  }

  cutoffDate.setHours(23, 59, 59, 999);
  return cutoffDate;
};

const calculateDebtPaidToCutoff = (payments, cutoffDate) => {
  if (!Array.isArray(payments)) {
    return 0;
  }

  return payments.reduce((sum, payment) => {
    const paymentDate = payment && payment.date ? new Date(payment.date) : null;
    if (!paymentDate || Number.isNaN(paymentDate.getTime()) || paymentDate > cutoffDate) {
      return sum;
    }

    return sum + Number(payment.amount || 0);
  }, 0);
};

const buildLegacyDebtOpeningBalancePreview = async (cutoffDateInput) => {
  const cutoffDate = normalizeCutoffDate(cutoffDateInput);

  const debts = await Debt.find({
    createdAt: { $lte: cutoffDate },
  })
    .sort({ partner: 1, createdAt: 1 })
    .lean();

  const items = debts
    .map((debt) => {
      const originalAmount = Number(debt.amount || 0);
      const paidToCutoff = calculateDebtPaidToCutoff(debt.payments, cutoffDate);
      const outstandingAmount = Math.max(originalAmount - paidToCutoff, 0);

      if (outstandingAmount <= 0) {
        return null;
      }

      const direction = debt.direction === 'receivable' ? 'receivable' : 'payable';

      return {
        legacyDebtId: String(debt._id),
        partner: debt.partner,
        direction,
        counterpartyType: direction === 'receivable' ? 'customer' : 'supplier',
        originalAmount,
        paidToCutoff,
        outstandingAmount,
        dueDate: debt.dueDate || null,
        description: debt.description || '',
        legacyStatus: debt.status || 'pending',
        attachments: Array.isArray(debt.attachments) ? debt.attachments : [],
        paymentCountToCutoff: Array.isArray(debt.payments)
          ? debt.payments.filter((payment) => new Date(payment.date) <= cutoffDate).length
          : 0,
      };
    })
    .filter(Boolean);

  const summary = items.reduce(
    (accumulator, item) => {
      if (item.direction === 'receivable') {
        accumulator.receivableCount += 1;
        accumulator.totalReceivable += item.outstandingAmount;
      } else {
        accumulator.payableCount += 1;
        accumulator.totalPayable += item.outstandingAmount;
      }

      return accumulator;
    },
    {
      receivableCount: 0,
      payableCount: 0,
      totalReceivable: 0,
      totalPayable: 0,
    }
  );

  return {
    cutoffDate,
    items,
    summary: {
      ...summary,
      totalItems: items.length,
      netReceivableMinusPayable: summary.totalReceivable - summary.totalPayable,
    },
  };
};

const applyLegacyDebtOpeningBalances = async ({
  cutoffDateInput,
  migrationBatchCode,
  createdBy,
}) => {
  const { cutoffDate, items, summary } = await buildLegacyDebtOpeningBalancePreview(cutoffDateInput);
  const resolvedBatchCode = (migrationBatchCode || `OB-DEBT-${formatDateCode(cutoffDate)}`).toUpperCase();

  let createdCount = 0;
  let skippedCount = 0;

  for (const item of items) {
    const existingDocument = await FinanceSourceDocument.findOne({
      isOpeningBalance: true,
      openingBalanceCutoffDate: cutoffDate,
      'legacySource.collection': 'Debt',
      'legacySource.legacyId': item.legacyDebtId,
    }).lean();

    if (existingDocument) {
      skippedCount += 1;
      continue;
    }

    const documentPrefix =
      item.direction === 'receivable'
        ? `OBR-${formatDateCode(cutoffDate)}`
        : `OBP-${formatDateCode(cutoffDate)}`;

    const documentCode = await getNextCode(FinanceSourceDocument, 'documentCode', documentPrefix);

    await FinanceSourceDocument.create({
      documentType: 'opening_balance',
      documentCode,
      counterpartyType: item.counterpartyType,
      counterpartyName: item.partner,
      issueDate: cutoffDate,
      dueDate: item.dueDate,
      grossAmount: item.outstandingAmount,
      taxAmount: 0,
      netAmount: item.outstandingAmount,
      paidAmount: 0,
      outstandingAmount: item.outstandingAmount,
      settlementStatus: 'unpaid',
      invoiceStatus: 'not_required',
      attachments: item.attachments.map((url) => ({
        url,
        attachmentType: 'other',
        uploadedBy: createdBy || null,
      })),
      linkedEntityType: 'legacy_debt',
      linkedEntityId: item.legacyDebtId,
      isOpeningBalance: true,
      openingBalanceCutoffDate: cutoffDate,
      legacySource: {
        collection: 'Debt',
        legacyId: item.legacyDebtId,
      },
      legacySnapshot: {
        originalAmount: item.originalAmount,
        paidToCutoff: item.paidToCutoff,
        legacyStatus: item.legacyStatus,
      },
      migrationBatchCode: resolvedBatchCode,
      note: item.description,
      createdBy: createdBy || null,
    });

    createdCount += 1;
  }

  return {
    cutoffDate,
    migrationBatchCode: resolvedBatchCode,
    summary,
    createdCount,
    skippedCount,
  };
};

module.exports = {
  normalizeCutoffDate,
  buildLegacyDebtOpeningBalancePreview,
  applyLegacyDebtOpeningBalances,
};
