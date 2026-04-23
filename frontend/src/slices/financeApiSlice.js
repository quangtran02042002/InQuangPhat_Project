import { apiSlice } from './apiSlice';

const FINANCE_URL = '/api/finance';

export const financeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ── CATEGORIES ──────────────────────────────────────
    getCategories: builder.query({
      query: (params = {}) => ({ url: `${FINANCE_URL}/categories`, params }),
      providesTags: ['FinanceCategory'],
    }),
    createCategory: builder.mutation({
      query: (body) => ({ url: `${FINANCE_URL}/categories`, method: 'POST', body }),
      invalidatesTags: ['FinanceCategory'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${FINANCE_URL}/categories/${id}`, method: 'PUT', body }),
      invalidatesTags: ['FinanceCategory'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({ url: `${FINANCE_URL}/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['FinanceCategory'],
    }),
    seedCategories: builder.mutation({
      query: () => ({ url: `${FINANCE_URL}/categories/seed`, method: 'POST' }),
      invalidatesTags: ['FinanceCategory'],
    }),

    // ── CASH BOOKS ──────────────────────────────────────
    getCashBooks: builder.query({
      query: () => ({ url: `${FINANCE_URL}/cashbooks` }),
      providesTags: ['CashBook'],
    }),
    createCashBook: builder.mutation({
      query: (body) => ({ url: `${FINANCE_URL}/cashbooks`, method: 'POST', body }),
      invalidatesTags: ['CashBook'],
    }),
    updateCashBook: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${FINANCE_URL}/cashbooks/${id}`, method: 'PUT', body }),
      invalidatesTags: ['CashBook'],
    }),
    deleteCashBook: builder.mutation({
      query: (id) => ({ url: `${FINANCE_URL}/cashbooks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['CashBook'],
    }),
    getCashBookTransactions: builder.query({
      query: ({ id, ...params }) => ({ url: `${FINANCE_URL}/cashbooks/${id}/transactions`, params }),
      providesTags: ['CashTransaction'],
    }),

    // ── TRANSACTIONS ─────────────────────────────────────
    getTransactions: builder.query({
      query: (params = {}) => ({ url: `${FINANCE_URL}/transactions`, params }),
      providesTags: ['CashTransaction'],
    }),
    getTransactionSummary: builder.query({
      query: (params = {}) => ({ url: `${FINANCE_URL}/transactions/summary`, params }),
      providesTags: ['CashTransaction'],
    }),
    createTransaction: builder.mutation({
      query: (body) => ({ url: `${FINANCE_URL}/transactions`, method: 'POST', body }),
      invalidatesTags: ['CashTransaction', 'CashBook', 'FinanceReport'],
    }),
    updateTransaction: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${FINANCE_URL}/transactions/${id}`, method: 'PUT', body }),
      invalidatesTags: ['CashTransaction', 'CashBook', 'FinanceReport'],
    }),
    cancelTransaction: builder.mutation({
      query: (id) => ({ url: `${FINANCE_URL}/transactions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['CashTransaction', 'CashBook', 'FinanceReport'],
    }),

    // ── RECEIVABLES ──────────────────────────────────────
    getReceivables: builder.query({
      query: (params = {}) => ({ url: `${FINANCE_URL}/receivables`, params }),
      providesTags: ['Receivable'],
    }),
    getReceivableAging: builder.query({
      query: () => ({ url: `${FINANCE_URL}/receivables/aging` }),
      providesTags: ['Receivable'],
    }),
    createReceivable: builder.mutation({
      query: (body) => ({ url: `${FINANCE_URL}/receivables`, method: 'POST', body }),
      invalidatesTags: ['Receivable', 'FinanceReport'],
    }),
    updateReceivable: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${FINANCE_URL}/receivables/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Receivable'],
    }),
    deleteReceivable: builder.mutation({
      query: (id) => ({ url: `${FINANCE_URL}/receivables/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Receivable', 'FinanceReport'],
    }),
    recordReceivablePayment: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${FINANCE_URL}/receivables/${id}/payment`, method: 'POST', body }),
      invalidatesTags: ['Receivable', 'CashTransaction', 'CashBook', 'FinanceReport'],
    }),
    sendReceivableReminder: builder.mutation({
      query: (id) => ({ url: `${FINANCE_URL}/receivables/${id}/remind`, method: 'POST' }),
    }),

    // ── PAYABLES ─────────────────────────────────────────
    getPayables: builder.query({
      query: (params = {}) => ({ url: `${FINANCE_URL}/payables`, params }),
      providesTags: ['Payable'],
    }),
    getPayableAging: builder.query({
      query: () => ({ url: `${FINANCE_URL}/payables/aging` }),
      providesTags: ['Payable'],
    }),
    getPayablesDueSoon: builder.query({
      query: (params = {}) => ({ url: `${FINANCE_URL}/payables/due-soon`, params }),
      providesTags: ['Payable'],
    }),
    createPayable: builder.mutation({
      query: (body) => ({ url: `${FINANCE_URL}/payables`, method: 'POST', body }),
      invalidatesTags: ['Payable', 'FinanceReport'],
    }),
    updatePayable: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${FINANCE_URL}/payables/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Payable'],
    }),
    deletePayable: builder.mutation({
      query: (id) => ({ url: `${FINANCE_URL}/payables/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Payable', 'FinanceReport'],
    }),
    recordPayablePayment: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${FINANCE_URL}/payables/${id}/payment`, method: 'POST', body }),
      invalidatesTags: ['Payable', 'CashTransaction', 'CashBook', 'FinanceReport'],
    }),

    // ── EMERGENCY FUND ───────────────────────────────────
    getEmergencyFund: builder.query({
      query: () => ({ url: `${FINANCE_URL}/emergency-fund` }),
      providesTags: ['EmergencyFund'],
    }),
    upsertEmergencyFund: builder.mutation({
      query: (body) => ({ url: `${FINANCE_URL}/emergency-fund`, method: 'PUT', body }),
      invalidatesTags: ['EmergencyFund', 'FinanceReport'],
    }),
    addEmergencyContribution: builder.mutation({
      query: (body) => ({ url: `${FINANCE_URL}/emergency-fund/contribute`, method: 'POST', body }),
      invalidatesTags: ['EmergencyFund'],
    }),

    // ── REPORTS ──────────────────────────────────────────
    getFinanceDashboard: builder.query({
      query: () => ({ url: `${FINANCE_URL}/reports/dashboard` }),
      providesTags: ['FinanceReport'],
    }),
    getCashflowReport: builder.query({
      query: (params = {}) => ({ url: `${FINANCE_URL}/reports/cashflow`, params }),
      providesTags: ['FinanceReport'],
    }),
    getNetDebtReport: builder.query({
      query: () => ({ url: `${FINANCE_URL}/reports/net-debt` }),
      providesTags: ['FinanceReport', 'Receivable', 'Payable'],
    }),
    getPnLReport: builder.query({
      query: (params = {}) => ({ url: `${FINANCE_URL}/reports/pnl`, params }),
      providesTags: ['FinanceReport'],
    }),

    // ── ACCOUNTING PERIODS ───────────────────────────────
    getPeriods: builder.query({
      query: () => ({ url: `${FINANCE_URL}/periods` }),
      providesTags: ['AccountingPeriod'],
    }),
    getCurrentPeriod: builder.query({
      query: () => ({ url: `${FINANCE_URL}/periods/current` }),
      providesTags: ['AccountingPeriod'],
    }),
    createPeriod: builder.mutation({
      query: (body) => ({ url: `${FINANCE_URL}/periods`, method: 'POST', body }),
      invalidatesTags: ['AccountingPeriod'],
    }),
    closePeriod: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${FINANCE_URL}/periods/${id}/close`, method: 'PUT', body }),
      invalidatesTags: ['AccountingPeriod'],
    }),
    deletePeriod: builder.mutation({
      query: (id) => ({ url: `${FINANCE_URL}/periods/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AccountingPeriod'],
    }),
  }),
});

export const {
  useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation,
  useDeleteCategoryMutation, useSeedCategoriesMutation,

  useGetCashBooksQuery, useCreateCashBookMutation, useUpdateCashBookMutation,
  useDeleteCashBookMutation, useGetCashBookTransactionsQuery,

  useGetTransactionsQuery, useGetTransactionSummaryQuery,
  useCreateTransactionMutation, useUpdateTransactionMutation, useCancelTransactionMutation,

  useGetReceivablesQuery, useGetReceivableAgingQuery,
  useCreateReceivableMutation, useUpdateReceivableMutation, useDeleteReceivableMutation,
  useRecordReceivablePaymentMutation, useSendReceivableReminderMutation,

  useGetPayablesQuery, useGetPayableAgingQuery, useGetPayablesDueSoonQuery,
  useCreatePayableMutation, useUpdatePayableMutation, useDeletePayableMutation,
  useRecordPayablePaymentMutation,

  useGetEmergencyFundQuery, useUpsertEmergencyFundMutation, useAddEmergencyContributionMutation,

  useGetFinanceDashboardQuery, useGetCashflowReportQuery,
  useGetNetDebtReportQuery, useGetPnLReportQuery,

  useGetPeriodsQuery, useGetCurrentPeriodQuery,
  useCreatePeriodMutation, useClosePeriodMutation, useDeletePeriodMutation,
} = financeApiSlice;
