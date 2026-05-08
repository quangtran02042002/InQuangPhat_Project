import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBars, FaTimes, FaUpload, FaWallet } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import ConfirmModal from '../../components/ConfirmModal';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getAuthConfig,
  getUserInfo,
  normalizeAmount,
} from '../../utils/financeHelpers';

const TAB_ITEMS = [
  { key: 'cashbook', label: 'Sổ quỹ & Dòng tiền' },
  { key: 'vouchers', label: 'Thu / Chi' },
  { key: 'receivables', label: 'Phải thu' },
  { key: 'payables', label: 'Phải trả' },
];

const EMPTY_ACCOUNT_FORM = {
  id: '',
  code: '',
  name: '',
  type: 'cash',
  bankName: '',
  accountNumber: '',
  openingBalance: '0',
  isActive: true,
};

const EMPTY_CATEGORY_FORM = {
  id: '',
  code: '',
  name: '',
  type: 'expense',
  description: '',
  isActive: true,
};

const buildSourceDocumentForm = (documentType = 'receivable') => ({
  id: '',
  documentType,
  counterpartyModel: documentType === 'receivable' ? 'Customer' : 'Supplier',
  counterpartyId: '',
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  totalAmount: '',
  linkedEntityModel: '',
  linkedEntityId: '',
  note: '',
});

const buildVoucherForm = (type = 'income', accounts = []) => ({
  type,
  transactionDate: new Date().toISOString().slice(0, 10),
  amount: '',
  categoryId: '',
  fromAccountId: accounts[0]?._id || '',
  toAccountId: '',
  counterpartyModel: type === 'expense' ? 'Supplier' : 'Customer',
  counterpartyId: '',
  notes: '',
});

const buildOpeningPartyRow = (counterpartyModel) => ({
  counterpartyModel,
  counterpartyId: '',
  amount: '',
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  note: '',
});

const normalizeSuppliers = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.suppliers)) return payload.suppliers;
  return [];
};

const getCounterpartyOptions = (model, customers, suppliers) =>
  model === 'Supplier' ? suppliers : customers;

const ModalShell = ({ isOpen, onClose, title, width = 'max-w-4xl', children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#111827]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full ${width} max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-200`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-black text-[#111827]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-gray-500"
          >
            <FaTimes />
          </button>
        </div>
        <div className="max-h-[calc(90vh-81px)] overflow-y-auto p-6 bg-[#F9FAFB]">{children}</div>
      </div>
    </div>
  );
};

const SectionCard = ({ title, subtitle, actions, children }) => (
  <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-black text-[#111827]">{title}</h2>
        {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const FinanceCenterScreen = () => {
  const navigate = useNavigate();
  const userInfo = getUserInfo();
  const authConfig = useMemo(() => getAuthConfig(), [userInfo?.token]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('cashbook');
  const [overview, setOverview] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [receivableDocuments, setReceivableDocuments] = useState([]);
  const [payableDocuments, setPayableDocuments] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [productionOrders, setProductionOrders] = useState([]);
  const [inventoryTransactions, setInventoryTransactions] = useState([]);
  const [adminQuotes, setAdminQuotes] = useState([]);
  const [ledgerAccountId, setLedgerAccountId] = useState('');

  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [sourceDocumentModalOpen, setSourceDocumentModalOpen] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [openingBalanceModalOpen, setOpeningBalanceModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const [accountForm, setAccountForm] = useState(EMPTY_ACCOUNT_FORM);
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM);
  const [sourceDocumentForm, setSourceDocumentForm] = useState(buildSourceDocumentForm());
  const [voucherForm, setVoucherForm] = useState(buildVoucherForm('income', []));
  const [voucherAllocations, setVoucherAllocations] = useState([{ sourceDocumentId: '', amount: '' }]);
  const [voucherFiles, setVoucherFiles] = useState([]);
  const [openingBalanceForm, setOpeningBalanceForm] = useState({
    accountBalances: [],
    receivables: [buildOpeningPartyRow('Customer')],
    payables: [buildOpeningPartyRow('Supplier')],
  });

  useEffect(() => {
    if (!userInfo?.token) {
      navigate('/login');
      return;
    }
    fetchFinanceData();
  }, [navigate, userInfo?.token]);

  useEffect(() => {
    if (!ledgerAccountId && accounts.length > 0) {
      setLedgerAccountId(accounts[0]._id);
    }
  }, [accounts, ledgerAccountId]);

  useEffect(() => {
    if (sourceDocumentForm.linkedEntityModel !== 'AdminQuote' || !sourceDocumentForm.linkedEntityId) {
      return;
    }

    const selectedQuote = adminQuotes.find((quote) => quote._id === sourceDocumentForm.linkedEntityId);
    if (!selectedQuote) return;

    setSourceDocumentForm((prev) => {
      const next = { ...prev };
      if (!prev.totalAmount) next.totalAmount = String(selectedQuote.grandTotal || '');
      if (!prev.note) next.note = `Linked quote ${selectedQuote.quoteCode || selectedQuote._id}`;
      return next;
    });
  }, [adminQuotes, sourceDocumentForm.linkedEntityId, sourceDocumentForm.linkedEntityModel]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [
        overviewRes,
        accountsRes,
        categoriesRes,
        receivablesRes,
        payablesRes,
        vouchersRes,
        customersRes,
        suppliersRes,
        productionOrdersRes,
        inventoryRes,
        adminQuotesRes,
      ] = await Promise.all([
        axios.get('/api/finance/reports/overview', authConfig),
        axios.get('/api/finance/accounts', authConfig),
        axios.get('/api/finance/categories', authConfig),
        axios.get('/api/finance/source-documents?documentType=receivable', authConfig),
        axios.get('/api/finance/source-documents?documentType=payable', authConfig),
        axios.get('/api/finance/vouchers', authConfig),
        axios.get('/api/customers', authConfig),
        axios.get('/api/v1/suppliers', authConfig),
        axios.get('/api/production-orders?pageSize=100', authConfig),
        axios.get('/api/inventory', authConfig),
        axios.get('/api/admin-quotes', authConfig),
      ]);

      setOverview(overviewRes.data);
      setAccounts(Array.isArray(accountsRes.data) ? accountsRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      setReceivableDocuments(Array.isArray(receivablesRes.data) ? receivablesRes.data : []);
      setPayableDocuments(Array.isArray(payablesRes.data) ? payablesRes.data : []);
      setVouchers(Array.isArray(vouchersRes.data) ? vouchersRes.data : []);
      setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
      setSuppliers(normalizeSuppliers(suppliersRes.data));
      setProductionOrders(Array.isArray(productionOrdersRes.data?.orders) ? productionOrdersRes.data.orders : []);
      setInventoryTransactions(Array.isArray(inventoryRes.data) ? inventoryRes.data : []);
      setAdminQuotes(Array.isArray(adminQuotesRes.data) ? adminQuotesRes.data : []);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Không thể tải dữ liệu tài chính');
    } finally {
      setLoading(false);
    }
  };

  const linkedEntityOptions = useMemo(
    () => ({
      ProductionOrder: productionOrders.map((order) => ({
        _id: order._id,
        label: `${order.orderCode || 'LSX'} - ${order.orderName || 'Lenh san xuat'}`,
      })),
      InventoryTransaction: inventoryTransactions.map((item) => ({
        _id: item._id,
        label: `${item.type === 'import' ? 'Nhap' : 'Xuat'} - ${item.factoryName || 'Kho'} - ${formatDate(item.date)}`,
      })),
      AdminQuote: adminQuotes.map((quote) => ({
        _id: quote._id,
        label: `${quote.quoteCode || 'BG'} - ${quote.customerName || 'Khach hang'}`,
      })),
    }),
    [adminQuotes, inventoryTransactions, productionOrders]
  );

  const filteredCategories = useMemo(() => {
    if (voucherForm.type === 'transfer') return [];
    return categories.filter((category) => category.type === voucherForm.type && category.isActive !== false);
  }, [categories, voucherForm.type]);

  const availableAllocationDocuments = useMemo(() => {
    if (voucherForm.type === 'income') return receivableDocuments.filter((item) => Number(item.outstandingAmount || 0) > 0);
    if (voucherForm.type === 'expense') return payableDocuments.filter((item) => Number(item.outstandingAmount || 0) > 0);
    return [];
  }, [payableDocuments, receivableDocuments, voucherForm.type]);

  const ledgerEntries = useMemo(() => {
    if (!ledgerAccountId) return [];
    return vouchers.filter(
      (voucher) =>
        voucher.fromAccountId?._id === ledgerAccountId ||
        voucher.fromAccountId === ledgerAccountId ||
        voucher.toAccountId?._id === ledgerAccountId ||
        voucher.toAccountId === ledgerAccountId
    );
  }, [ledgerAccountId, vouchers]);

  const receivableTotal = useMemo(
    () => receivableDocuments.reduce((sum, item) => sum + Number(item.outstandingAmount || 0), 0),
    [receivableDocuments]
  );

  const payableTotal = useMemo(
    () => payableDocuments.reduce((sum, item) => sum + Number(item.outstandingAmount || 0), 0),
    [payableDocuments]
  );

  const currentAccount = useMemo(
    () => accounts.find((account) => account._id === ledgerAccountId),
    [accounts, ledgerAccountId]
  );

  const selectedFromAccount = useMemo(
    () => accounts.find((account) => account._id === voucherForm.fromAccountId),
    [accounts, voucherForm.fromAccountId]
  );

  const selectedToAccount = useMemo(
    () => accounts.find((account) => account._id === voucherForm.toAccountId),
    [accounts, voucherForm.toAccountId]
  );

  const projectedBalances = useMemo(() => {
    const amount = normalizeAmount(voucherForm.amount);
    const result = {
      fromAfter: selectedFromAccount ? Number(selectedFromAccount.currentBalance || 0) : null,
      toAfter: selectedToAccount ? Number(selectedToAccount.currentBalance || 0) : null,
    };

    if (!amount) return result;
    if (voucherForm.type === 'income' && selectedFromAccount) result.fromAfter += amount;
    if ((voucherForm.type === 'expense' || voucherForm.type === 'transfer') && selectedFromAccount) result.fromAfter -= amount;
    if (voucherForm.type === 'transfer' && selectedToAccount) result.toAfter += amount;
    return result;
  }, [selectedFromAccount, selectedToAccount, voucherForm.amount, voucherForm.type]);

  const openAccountModal = (account = null) => {
    setAccountForm(
      account
        ? {
          id: account._id,
          code: account.code || '',
          name: account.name || '',
          type: account.type || 'cash',
          bankName: account.bankName || '',
          accountNumber: account.accountNumber || '',
          openingBalance: String(account.openingBalance ?? account.currentBalance ?? 0),
          isActive: account.isActive !== false,
        }
        : EMPTY_ACCOUNT_FORM
    );
    setAccountModalOpen(true);
  };

  const openCategoryModal = (category = null) => {
    setCategoryForm(
      category
        ? {
          id: category._id,
          code: category.code || '',
          name: category.name || '',
          type: category.type || 'expense',
          description: category.description || '',
          isActive: category.isActive !== false,
        }
        : EMPTY_CATEGORY_FORM
    );
    setCategoryModalOpen(true);
  };

  const openSourceDocumentModal = (documentType = 'receivable', document = null) => {
    setSourceDocumentForm(
      document
        ? {
          id: document._id,
          documentType: document.documentType === 'opening_balance' ? document.balanceType : document.documentType,
          counterpartyModel: document.counterpartyModel,
          counterpartyId: document.counterpartyId?._id || document.counterpartyId || '',
          issueDate: document.issueDate ? new Date(document.issueDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
          dueDate: document.dueDate ? new Date(document.dueDate).toISOString().slice(0, 10) : '',
          totalAmount: String(document.totalAmount || ''),
          linkedEntityModel: document.linkedEntityModel || '',
          linkedEntityId: document.linkedEntityId || '',
          note: document.note || '',
        }
        : buildSourceDocumentForm(documentType)
    );
    setSourceDocumentModalOpen(true);
  };

  const openVoucherModal = ({ type = 'income', document = null } = {}) => {
    setVoucherForm({
      ...buildVoucherForm(type, accounts),
      counterpartyModel: document?.counterpartyModel || (type === 'expense' ? 'Supplier' : 'Customer'),
      counterpartyId: document?.counterpartyId?._id || document?.counterpartyId || '',
    });
    setVoucherAllocations(
      document ? [{ sourceDocumentId: document._id, amount: String(document.outstandingAmount || '') }] : [{ sourceDocumentId: '', amount: '' }]
    );
    setVoucherFiles([]);
    setVoucherModalOpen(true);
  };

  const openOpeningBalanceModal = () => {
    setOpeningBalanceForm({
      accountBalances: accounts.map((account) => ({
        accountId: account._id,
        amount: String(account.openingBalance ?? account.currentBalance ?? 0),
      })),
      receivables: [buildOpeningPartyRow('Customer')],
      payables: [buildOpeningPartyRow('Supplier')],
    });
    setOpeningBalanceModalOpen(true);
  };

  const changeAllocationRow = (index, field, value) => {
    setVoucherAllocations((prev) => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  };

  const changeOpeningRow = (groupKey, index, field, value) => {
    setOpeningBalanceForm((prev) => ({
      ...prev,
      [groupKey]: prev[groupKey].map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
    }));
  };

  const addOpeningRow = (groupKey, counterpartyModel) => {
    setOpeningBalanceForm((prev) => ({
      ...prev,
      [groupKey]: [...prev[groupKey], buildOpeningPartyRow(counterpartyModel)],
    }));
  };

  const removeOpeningRow = (groupKey, index) => {
    setOpeningBalanceForm((prev) => ({
      ...prev,
      [groupKey]: prev[groupKey].length === 1 ? prev[groupKey] : prev[groupKey].filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const handleAccountSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        code: accountForm.code,
        name: accountForm.name,
        type: accountForm.type,
        bankName: accountForm.bankName,
        accountNumber: accountForm.accountNumber,
        openingBalance: Number(accountForm.openingBalance || 0),
        isActive: accountForm.isActive,
      };

      if (accountForm.id) {
        await axios.put(`/api/finance/accounts/${accountForm.id}`, payload, authConfig);
        toast.success('Đã cập nhật sổ quỹ');
      } else {
        await axios.post('/api/finance/accounts', payload, authConfig);
        toast.success('Đã tạo sổ quỹ mới');
      }

      setAccountModalOpen(false);
      setAccountForm(EMPTY_ACCOUNT_FORM);
      await fetchFinanceData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể lưu sổ quỹ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        code: categoryForm.code,
        name: categoryForm.name,
        type: categoryForm.type,
        description: categoryForm.description,
        isActive: categoryForm.isActive,
      };

      if (categoryForm.id) {
        await axios.put(`/api/finance/categories/${categoryForm.id}`, payload, authConfig);
        toast.success('Đã cập nhật danh mục');
      } else {
        await axios.post('/api/finance/categories', payload, authConfig);
        toast.success('Đã tạo danh mục mới');
      }

      setCategoryForm(EMPTY_CATEGORY_FORM);
      await fetchFinanceData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể lưu danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSourceDocumentSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        documentType: sourceDocumentForm.documentType,
        counterpartyModel: sourceDocumentForm.counterpartyModel,
        counterpartyId: sourceDocumentForm.counterpartyId,
        issueDate: sourceDocumentForm.issueDate,
        dueDate: sourceDocumentForm.dueDate || null,
        totalAmount: Number(sourceDocumentForm.totalAmount || 0),
        linkedEntityModel: sourceDocumentForm.linkedEntityModel || null,
        linkedEntityId: sourceDocumentForm.linkedEntityId || null,
        note: sourceDocumentForm.note,
      };

      if (sourceDocumentForm.id) {
        await axios.put(`/api/finance/source-documents/${sourceDocumentForm.id}`, payload, authConfig);
        toast.success('Đã cập nhật chứng từ gốc');
      } else {
        await axios.post('/api/finance/source-documents', payload, authConfig);
        toast.success('Đã tạo chứng từ gốc');
      }

      setSourceDocumentModalOpen(false);
      setSourceDocumentForm(buildSourceDocumentForm());
      await fetchFinanceData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể lưu chứng từ gốc');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadVoucherFiles = async () => {
    if (!voucherFiles.length) return [];

    const formData = new FormData();
    voucherFiles.forEach((file) => formData.append('files', file));

    const uploadConfig = {
      headers: {
        ...authConfig.headers,
        'Content-Type': 'multipart/form-data',
      },
    };

    const response = await axios.post('/api/finance/upload', formData, uploadConfig);
    return Array.isArray(response.data) ? response.data : [];
  };

  const handleVoucherSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const attachments = await uploadVoucherFiles();
      const allocations = voucherAllocations
        .filter((item) => item.sourceDocumentId && Number(item.amount || 0) > 0)
        .map((item) => ({
          sourceDocumentId: item.sourceDocumentId,
          amount: Number(item.amount || 0),
        }));

      const payload = {
        type: voucherForm.type,
        transactionDate: voucherForm.transactionDate,
        amount: Number(voucherForm.amount || 0),
        categoryId: voucherForm.type === 'transfer' ? null : voucherForm.categoryId,
        fromAccountId: voucherForm.fromAccountId,
        toAccountId: voucherForm.type === 'transfer' ? voucherForm.toAccountId : null,
        counterpartyModel: voucherForm.counterpartyId ? voucherForm.counterpartyModel : null,
        counterpartyId: voucherForm.counterpartyId || null,
        notes: voucherForm.notes,
        attachments,
        allocations,
      };

      const response = await axios.post('/api/finance/vouchers', payload, authConfig);
      toast.success('Đã ghi sổ phiếu giao dịch');
      if (Array.isArray(response.data?.warnings) && response.data.warnings.length > 0) {
        response.data.warnings.forEach((warning) => toast.warning(warning));
      }
      setVoucherModalOpen(false);
      setVoucherForm(buildVoucherForm('income', accounts));
      setVoucherAllocations([{ sourceDocumentId: '', amount: '' }]);
      setVoucherFiles([]);
      await fetchFinanceData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể ghi sổ phiếu giao dịch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoidVoucher = async (voucher) => {
    const voidReason = window.prompt(`Nhập lý do hủy phiếu ${voucher.voucherNo}`, 'Nhập sai nghiệp vụ');
    if (voidReason === null) return;

    try {
      await axios.patch(`/api/finance/vouchers/${voucher._id}/void`, { voidReason }, authConfig);
      toast.success('Đã hủy phiếu giao dịch');
      await fetchFinanceData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể hủy phiếu giao dịch');
    }
  };

  const handleOpeningBalanceSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        accountBalances: openingBalanceForm.accountBalances.map((item) => ({
          accountId: item.accountId,
          amount: Number(item.amount || 0),
        })),
        receivables: openingBalanceForm.receivables
          .filter((item) => item.counterpartyId && Number(item.amount || 0) > 0)
          .map((item) => ({
            counterpartyModel: 'Customer',
            counterpartyId: item.counterpartyId,
            amount: Number(item.amount || 0),
            issueDate: item.issueDate,
            dueDate: item.dueDate || null,
            note: item.note,
          })),
        payables: openingBalanceForm.payables
          .filter((item) => item.counterpartyId && Number(item.amount || 0) > 0)
          .map((item) => ({
            counterpartyModel: 'Supplier',
            counterpartyId: item.counterpartyId,
            amount: Number(item.amount || 0),
            issueDate: item.issueDate,
            dueDate: item.dueDate || null,
            note: item.note,
          })),
      };

      const response = await axios.post('/api/finance/opening-balances', payload, authConfig);
      toast.success(
        `Đã nhập số dư đầu kỳ (${response.data?.updatedAccounts || 0} sổ quỹ, ${response.data?.createdDocuments || 0} công nợ)`
      );
      setOpeningBalanceModalOpen(false);
      await fetchFinanceData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể nhập số dư đầu kỳ');
    } finally {
      setSubmitting(false);
    }
  };

  const requestDeleteAccount = (account) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa sổ quỹ',
      message: `Bạn chắc chắn muốn xóa sổ quỹ ${account.name}?`,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/finance/accounts/${account._id}`, authConfig);
          toast.success('Đã xóa sổ quỹ');
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
          await fetchFinanceData();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Không thể xóa sổ quỹ');
        }
      },
    });
  };

  const requestDeleteCategory = (category) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa danh mục',
      message: `Bạn chắc chắn muốn xóa danh mục ${category.name}?`,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/finance/categories/${category._id}`, authConfig);
          toast.success('Đã xóa danh mục');
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
          await fetchFinanceData();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Không thể xóa danh mục');
        }
      },
    });
  };

  const renderDocumentTable = (items, kind) => (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 uppercase tracking-[0.14em] text-xs">
            <th className="pb-3 pr-4">Chứng từ</th>
            <th className="pb-3 pr-4">Đối tượng</th>
            <th className="pb-3 pr-4">Ngày</th>
            <th className="pb-3 pr-4">Liên kết</th>
            <th className="pb-3 pr-4">Còn nợ</th>
            <th className="pb-3 pr-4">Trạng thái</th>
            <th className="pb-3 text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id} className="border-t border-gray-100">
              <td className="py-4 pr-4">
                <div className="font-bold text-[#111827]">{item.documentNo}</div>
                <div className="text-xs text-gray-400 mt-1">{formatCurrency(item.totalAmount)}</div>
              </td>
              <td className="py-4 pr-4">
                <div className="font-semibold text-[#111827]">{item.counterpartyNameSnapshot}</div>
                <div className="text-xs text-gray-400 mt-1">{item.counterpartyModel}</div>
              </td>
              <td className="py-4 pr-4">
                <div className="font-medium text-[#111827]">{formatDate(item.issueDate)}</div>
                <div className="text-xs text-gray-400 mt-1">Han {formatDate(item.dueDate)}</div>
              </td>
              <td className="py-4 pr-4 text-gray-500">{item.linkedEntityModel || 'Không liên kết'}</td>
              <td className="py-4 pr-4 font-black text-[#111827]">{formatCurrency(item.outstandingAmount)}</td>
              <td className="py-4 pr-4">
                <span className="px-3 py-1 rounded-full bg-[#E6F0ED] text-[#006B4D] text-xs font-bold uppercase">
                  {item.status}
                </span>
              </td>
              <td className="py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openSourceDocumentModal(kind, item)}
                    className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold"
                  >
                    Sua
                  </button>
                  <button
                    type="button"
                    onClick={() => openVoucherModal({ type: kind === 'receivable' ? 'income' : 'expense', document: item })}
                    className={`px-3 py-2 rounded-xl text-white font-bold ${kind === 'receivable' ? 'bg-[#006B4D] hover:bg-[#00543c]' : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                  >
                    {kind === 'receivable' ? 'Thu tiền' : 'Chi tiền'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-12 text-center text-gray-400 font-medium">
                Chua co chung tu công nợ nao.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F9FAFB]">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#006B4D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="font-medium text-gray-500">Đang tải trung tâm tài chính...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827] relative">
        {isSidebarOpen ? (
          <div
            className="fixed inset-0 bg-[#111827]/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : null}

        <div className={`fixed inset-y-0 left-0 z-50 h-full transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0 lg:block`}>
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col w-full overflow-hidden">
          <AdminHeader title="Finance Center" onMenuClick={() => setIsSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-6 pb-10">
              <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#111827] text-white flex items-center justify-center text-2xl shadow-lg">
                    <FaWallet />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#111827]">Trung tâm tài chính</h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Quan ly sổ quỹ, chung tu goc, phieu giao dich va công nợ AR/AP tren cung mot luong.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => openVoucherModal({ type: 'income' })}
                    className="px-4 py-3 rounded-2xl bg-[#006B4D] text-white font-bold shadow-sm hover:bg-[#00543c] transition"
                  >
                    Tạo phiếu
                  </button>
                  <button
                    type="button"
                    onClick={openOpeningBalanceModal}
                    className="px-4 py-3 rounded-2xl bg-[#111827] text-white font-bold shadow-sm hover:bg-gray-800 transition"
                  >
                    Nhập số dư đầu kỳ
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/finance-dashboard')}
                    className="px-4 py-3 rounded-2xl border border-gray-200 bg-white font-bold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Xem dashboard
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Tổng tiền hiện có</div>
                  <div className="mt-3 text-2xl font-black text-[#111827]">{formatCurrency(overview?.accountSummary?.totalBalance)}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Thu 30 ngày</div>
                  <div className="mt-3 text-2xl font-black text-[#111827]">{formatCurrency(overview?.movementSummary?.last30Days?.inflow)}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Chi 30 ngày</div>
                  <div className="mt-3 text-2xl font-black text-[#111827]">{formatCurrency(overview?.movementSummary?.last30Days?.outflow)}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Công nợ ròng</div>
                  <div className="mt-3 text-2xl font-black text-[#111827]">{formatCurrency(receivableTotal - payableTotal)}</div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-2 flex flex-wrap gap-2">
                {TAB_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveTab(item.key)}
                    className={`px-4 py-3 rounded-2xl font-bold transition ${activeTab === item.key ? 'bg-[#111827] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {activeTab === 'cashbook' ? (
                <div className="space-y-6">
                  <SectionCard
                    title="Sổ quỹ"
                    subtitle="Số dư thực tế tại các tài khoản tiền mặt và ngân hàng."
                    actions={
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openCategoryModal()}
                          className="px-4 py-2.5 rounded-2xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                        >
                          Danh mục thu chi
                        </button>
                        <button
                          type="button"
                          onClick={() => openAccountModal()}
                          className="px-4 py-2.5 rounded-2xl bg-[#006B4D] text-white font-bold hover:bg-[#00543c]"
                        >
                          Them sổ quỹ
                        </button>
                      </div>
                    }
                  >
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {accounts.map((account) => (
                        <div key={account._id} className="rounded-2xl border border-gray-200 bg-[#F9FAFB] p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xs uppercase tracking-[0.16em] text-gray-400 font-bold">{account.type}</div>
                              <div className="text-xl font-black text-[#111827] mt-1">{account.name}</div>
                              <div className="text-sm text-gray-500 mt-1">{account.code || 'NO-CODE'}</div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${account.isActive !== false ? 'bg-[#E6F0ED] text-[#006B4D]' : 'bg-gray-100 text-gray-500'}`}>
                              {account.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="mt-5 text-3xl font-black text-[#111827]">{formatCurrency(account.currentBalance)}</div>
                          <div className="mt-2 text-sm text-gray-500">
                            Opening {formatCurrency(account.openingBalance)} {account.bankName ? `• ${account.bankName}` : ''}
                          </div>
                          <div className="mt-5 flex gap-2">
                            <button
                              type="button"
                              onClick={() => openAccountModal(account)}
                              className="px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-white"
                            >
                              Sua
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDeleteAccount(account)}
                              className="px-3 py-2 rounded-xl border border-red-200 text-red-500 font-bold hover:bg-red-50"
                            >
                              Xoa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Dong tien theo sổ quỹ"
                    subtitle="Xem lịch sử phát sinh Thu / Chi / Chuyển quỹ theo từng tài khoản."
                    actions={
                      <select
                        value={ledgerAccountId}
                        onChange={(event) => setLedgerAccountId(event.target.value)}
                        className="px-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm font-medium"
                      >
                        {accounts.map((account) => (
                          <option key={account._id} value={account._id}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    }
                  >
                    <div className="mb-4 rounded-2xl bg-[#F9FAFB] border border-gray-200 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.14em] text-gray-400 font-bold">Tài khoản đang xem</div>
                      <div className="text-lg font-black text-[#111827] mt-1">{currentAccount?.name || 'Chưa chọn'}</div>
                      <div className="text-sm text-gray-500 mt-1">Số dư hiện tại {formatCurrency(currentAccount?.currentBalance)}</div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-400 uppercase tracking-[0.14em] text-xs">
                            <th className="pb-3 pr-4">Phiếu</th>
                            <th className="pb-3 pr-4">Loại</th>
                            <th className="pb-3 pr-4">Đối tượng</th>
                            <th className="pb-3 pr-4">Ngày</th>
                            <th className="pb-3 pr-4">Giá trị</th>
                            <th className="pb-3 pr-4">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ledgerEntries.map((voucher) => (
                            <tr key={voucher._id} className="border-t border-gray-100">
                              <td className="py-4 pr-4">
                                <div className="font-bold text-[#111827]">{voucher.voucherNo}</div>
                                <div className="text-xs text-gray-400 mt-1">{voucher.categoryId?.name || 'Transfer / Opening'}</div>
                              </td>
                              <td className="py-4 pr-4 font-semibold uppercase text-[#111827]">{voucher.type}</td>
                              <td className="py-4 pr-4 text-gray-600">{voucher.counterpartyNameSnapshot || 'No counterparty'}</td>
                              <td className="py-4 pr-4 text-gray-600">{formatDateTime(voucher.transactionDate)}</td>
                              <td className="py-4 pr-4 font-black text-[#111827]">{formatCurrency(voucher.amount)}</td>
                              <td className="py-4 pr-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${voucher.status === 'voided' ? 'bg-red-50 text-red-500' : 'bg-[#E6F0ED] text-[#006B4D]'}`}>
                                  {voucher.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {ledgerEntries.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="py-12 text-center text-gray-400 font-medium">
                                Chưa có giao dịch nào cho tài khoản này.
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </SectionCard>
                </div>
              ) : null}

              {activeTab === 'vouchers' ? (
                <SectionCard
                  title="Phiếu giao dich"
                  subtitle="Lập phiếu Thu / Chi / Chuyển quỹ, upload hóa đơn và ghi sổ ngay lập tức."
                  actions={
                    <button
                      type="button"
                      onClick={() => openVoucherModal({ type: 'income' })}
                      className="px-4 py-2.5 rounded-2xl bg-[#006B4D] text-white font-bold hover:bg-[#00543c]"
                    >
                      Tạo phiếu moi
                    </button>
                  }
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-400 uppercase tracking-[0.14em] text-xs">
                          <th className="pb-3 pr-4">Phiếu</th>
                          <th className="pb-3 pr-4">Loại</th>
                          <th className="pb-3 pr-4">Tài khoản</th>
                          <th className="pb-3 pr-4">Đối tượng</th>
                          <th className="pb-3 pr-4">Giá trị</th>
                          <th className="pb-3 pr-4">Chứng từ goc</th>
                          <th className="pb-3 pr-4">Đính kèm</th>
                          <th className="pb-3 text-right">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vouchers.map((voucher) => (
                          <tr key={voucher._id} className="border-t border-gray-100 align-top">
                            <td className="py-4 pr-4">
                              <div className="font-bold text-[#111827]">{voucher.voucherNo}</div>
                              <div className="text-xs text-gray-400 mt-1">{formatDateTime(voucher.transactionDate)}</div>
                            </td>
                            <td className="py-4 pr-4">
                              <div className="font-bold uppercase text-[#111827]">{voucher.type}</div>
                              <div className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${voucher.status === 'voided' ? 'bg-red-50 text-red-500' : 'bg-[#E6F0ED] text-[#006B4D]'}`}>
                                {voucher.status}
                              </div>
                            </td>
                            <td className="py-4 pr-4 text-gray-600">
                              <div>{voucher.fromAccountId?.name || 'No account'}</div>
                              {voucher.toAccountId?.name ? <div className="text-xs text-gray-400 mt-1">To {voucher.toAccountId.name}</div> : null}
                            </td>
                            <td className="py-4 pr-4 text-gray-600">{voucher.counterpartyNameSnapshot || 'No counterparty'}</td>
                            <td className="py-4 pr-4 font-black text-[#111827]">{formatCurrency(voucher.amount)}</td>
                            <td className="py-4 pr-4">
                              <div className="space-y-1">
                                {(voucher.allocations || []).map((allocation) => (
                                  <div key={allocation._id || allocation.sourceDocumentId?._id || allocation.sourceDocumentId} className="text-xs text-gray-500">
                                    {(allocation.sourceDocumentId?.documentNo || 'Unknown')} - {formatCurrency(allocation.amount)}
                                  </div>
                                ))}
                                {(!voucher.allocations || voucher.allocations.length === 0) ? <span className="text-xs text-gray-300">Không allocate</span> : null}
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <div className="space-y-1">
                                {(voucher.attachments || []).map((attachment) => (
                                  <a
                                    key={attachment.publicId || attachment.url}
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block text-xs text-[#006B4D] font-bold hover:underline"
                                  >
                                    {attachment.originalName || 'Open file'}
                                  </a>
                                ))}
                                {(!voucher.attachments || voucher.attachments.length === 0) ? <span className="text-xs text-gray-300">Không có file</span> : null}
                              </div>
                            </td>
                            <td className="py-4 text-right">
                              {voucher.status !== 'voided' ? (
                                <button
                                  type="button"
                                  onClick={() => handleVoidVoucher(voucher)}
                                  className="px-3 py-2 rounded-xl border border-red-200 text-red-500 font-bold hover:bg-red-50"
                                >
                                  Void
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400 font-bold">Đã hủy</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {vouchers.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="py-12 text-center text-gray-400 font-medium">
                              Chưa có phiếu giao dịch nào.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              ) : null}

              {activeTab === 'receivables' ? (
                <SectionCard
                  title="Công nợ phải thu"
                  subtitle="Theo dõi các chứng từ bán hàng / opening balance và lập phiếu thu trực tiếp."
                  actions={
                    <button
                      type="button"
                      onClick={() => openSourceDocumentModal('receivable')}
                      className="px-4 py-2.5 rounded-2xl bg-[#006B4D] text-white font-bold hover:bg-[#00543c]"
                    >
                      Tạo chứng từ phải thu
                    </button>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="rounded-2xl bg-[#F9FAFB] border border-gray-200 p-4">
                      <div className="text-xs uppercase tracking-[0.14em] text-gray-400 font-bold">Tổng phải thu</div>
                      <div className="text-2xl font-black text-[#111827] mt-2">{formatCurrency(receivableTotal)}</div>
                    </div>
                    <div className="rounded-2xl bg-[#F9FAFB] border border-gray-200 p-4">
                      <div className="text-xs uppercase tracking-[0.14em] text-gray-400 font-bold">Số chứng từ mở</div>
                      <div className="text-2xl font-black text-[#111827] mt-2">{receivableDocuments.length}</div>
                    </div>
                  </div>
                  {renderDocumentTable(receivableDocuments, 'receivable')}
                </SectionCard>
              ) : null}

              {activeTab === 'payables' ? (
                <SectionCard
                  title="Công nợ phải trả"
                  subtitle="Theo doi công nợ nha cung cap va lap phieu chi ngay tren tung chung tu."
                  actions={
                    <button
                      type="button"
                      onClick={() => openSourceDocumentModal('payable')}
                      className="px-4 py-2.5 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600"
                    >
                      Tạo chứng từ phải trả
                    </button>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="rounded-2xl bg-[#F9FAFB] border border-gray-200 p-4">
                      <div className="text-xs uppercase tracking-[0.14em] text-gray-400 font-bold">Tổng phải trả</div>
                      <div className="text-2xl font-black text-[#111827] mt-2">{formatCurrency(payableTotal)}</div>
                    </div>
                    <div className="rounded-2xl bg-[#F9FAFB] border border-gray-200 p-4">
                      <div className="text-xs uppercase tracking-[0.14em] text-gray-400 font-bold">Số chứng từ mở</div>
                      <div className="text-2xl font-black text-[#111827] mt-2">{payableDocuments.length}</div>
                    </div>
                  </div>
                  {renderDocumentTable(payableDocuments, 'payable')}
                </SectionCard>
              ) : null}
            </div>
          </main>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#006B4D] text-white rounded-full shadow-xl flex items-center justify-center z-30 hover:bg-[#00543c] transition-all active:scale-95"
          >
            <FaBars size={24} />
          </button>
        </div>
      </div>

      <ModalShell
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        title={accountForm.id ? 'Cập nhật sổ quỹ' : 'Tao sổ quỹ moi'}
        width="max-w-2xl"
      >
        <form onSubmit={handleAccountSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Ma sổ quỹ</label>
              <input value={accountForm.code} onChange={(event) => setAccountForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white" placeholder="QTM-01" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Ten sổ quỹ</label>
              <input required value={accountForm.name} onChange={(event) => setAccountForm((prev) => ({ ...prev, name: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white" placeholder="Quy tien mat VP" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Loại tai khoan</label>
              <select value={accountForm.type} onChange={(event) => setAccountForm((prev) => ({ ...prev, type: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Số dư đầu kỳ</label>
              <input type="number" min="0" value={accountForm.openingBalance} onChange={(event) => setAccountForm((prev) => ({ ...prev, openingBalance: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Ngân hàng</label>
              <input value={accountForm.bankName} onChange={(event) => setAccountForm((prev) => ({ ...prev, bankName: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white" placeholder="Vietcombank" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Số tài khoản</label>
              <input value={accountForm.accountNumber} onChange={(event) => setAccountForm((prev) => ({ ...prev, accountNumber: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white" placeholder="123456789" />
            </div>
          </div>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-600">
            <input type="checkbox" checked={accountForm.isActive} onChange={(event) => setAccountForm((prev) => ({ ...prev, isActive: event.target.checked }))} />
            Kich hoat sổ quỹ
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setAccountModalOpen(false)} className="px-5 py-3 rounded-2xl border border-gray-200 font-bold text-gray-600">Đóng</button>
            <button type="submit" disabled={submitting} className="px-5 py-3 rounded-2xl bg-[#006B4D] text-white font-bold disabled:opacity-60">{submitting ? 'Đang lưu...' : 'Luu sổ quỹ'}</button>
          </div>
        </form>
      </ModalShell>

      <ModalShell
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="Danh mục thu chi"
      >
        <div className="grid grid-cols-1 xl:grid-cols-[360px,1fr] gap-6">
          <form onSubmit={handleCategorySubmit} className="space-y-4 bg-white rounded-3xl border border-gray-200 p-5">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Mã danh mục</label>
              <input value={categoryForm.code} onChange={(event) => setCategoryForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white" placeholder="CP-NVL" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Tên danh mục</label>
              <input required value={categoryForm.name} onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white" placeholder="Chi mua vat tu" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Loại</label>
              <select value={categoryForm.type} onChange={(event) => setCategoryForm((prev) => ({ ...prev, type: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Mô tả</label>
              <textarea rows="4" value={categoryForm.description} onChange={(event) => setCategoryForm((prev) => ({ ...prev, description: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white" placeholder="Dien giai noi dung danh muc" />
            </div>
            <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-600">
              <input type="checkbox" checked={categoryForm.isActive} onChange={(event) => setCategoryForm((prev) => ({ ...prev, isActive: event.target.checked }))} />
              Danh mục đang hoạt động
            </label>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="flex-1 px-5 py-3 rounded-2xl bg-[#006B4D] text-white font-bold disabled:opacity-60">
                {categoryForm.id ? 'Cập nhật' : 'Tạo danh mục'}
              </button>
              <button type="button" onClick={() => setCategoryForm(EMPTY_CATEGORY_FORM)} className="px-5 py-3 rounded-2xl border border-gray-200 font-bold text-gray-600">
                Mới
              </button>
            </div>
          </form>

          <div className="bg-white rounded-3xl border border-gray-200 p-5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 uppercase tracking-[0.14em] text-xs">
                    <th className="pb-3 pr-4">Danh mục</th>
                    <th className="pb-3 pr-4">Loại</th>
                    <th className="pb-3 pr-4">Trạng thái</th>
                    <th className="pb-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id} className="border-t border-gray-100">
                      <td className="py-4 pr-4">
                        <div className="font-bold text-[#111827]">{category.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{category.code}</div>
                      </td>
                      <td className="py-4 pr-4 uppercase font-semibold text-gray-600">{category.type}</td>
                      <td className="py-4 pr-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${category.isActive !== false ? 'bg-[#E6F0ED] text-[#006B4D]' : 'bg-gray-100 text-gray-500'}`}>
                          {category.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openCategoryModal(category)} className="px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50">
                            Sua
                          </button>
                          {!category.isSystem ? (
                            <button type="button" onClick={() => requestDeleteCategory(category)} className="px-3 py-2 rounded-xl border border-red-200 font-bold text-red-500 hover:bg-red-50">
                              Xoa
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300 font-bold px-2 py-2">System</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        isOpen={sourceDocumentModalOpen}
        onClose={() => setSourceDocumentModalOpen(false)}
        title={sourceDocumentForm.id ? 'Cập nhật chung tu goc' : 'Tạo chứng từ gốc'}
      >
        <form onSubmit={handleSourceDocumentSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Loại chung tu</label>
              <select value={sourceDocumentForm.documentType} onChange={(event) => setSourceDocumentForm((prev) => ({ ...prev, documentType: event.target.value, counterpartyModel: event.target.value === 'receivable' ? 'Customer' : 'Supplier', counterpartyId: '' }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                <option value="receivable">Receivable</option>
                <option value="payable">Payable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Đối tượng</label>
              <select value={sourceDocumentForm.counterpartyModel} onChange={(event) => setSourceDocumentForm((prev) => ({ ...prev, counterpartyModel: event.target.value, counterpartyId: '' }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                <option value="Customer">Customer</option>
                <option value="Supplier">Supplier</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Chọn đối tượng</label>
              <select value={sourceDocumentForm.counterpartyId} onChange={(event) => setSourceDocumentForm((prev) => ({ ...prev, counterpartyId: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                <option value="">Chọn đối tượng</option>
                {getCounterpartyOptions(sourceDocumentForm.counterpartyModel, customers, suppliers).map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Ngày lập</label>
              <input type="date" value={sourceDocumentForm.issueDate} onChange={(event) => setSourceDocumentForm((prev) => ({ ...prev, issueDate: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Hạn thanh toán</label>
              <input type="date" value={sourceDocumentForm.dueDate} onChange={(event) => setSourceDocumentForm((prev) => ({ ...prev, dueDate: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Tổng giá trị</label>
              <input type="number" min="0" value={sourceDocumentForm.totalAmount} onChange={(event) => setSourceDocumentForm((prev) => ({ ...prev, totalAmount: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Liên kết nghiep vu</label>
              <select value={sourceDocumentForm.linkedEntityModel} onChange={(event) => setSourceDocumentForm((prev) => ({ ...prev, linkedEntityModel: event.target.value, linkedEntityId: '' }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                <option value="">Không liên kết</option>
                <option value="ProductionOrder">ProductionOrder</option>
                <option value="InventoryTransaction">InventoryTransaction</option>
                <option value="AdminQuote">AdminQuote</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Chon chung tu lien ket</label>
              <select value={sourceDocumentForm.linkedEntityId} onChange={(event) => setSourceDocumentForm((prev) => ({ ...prev, linkedEntityId: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                <option value="">Chọn liên kết</option>
                {(linkedEntityOptions[sourceDocumentForm.linkedEntityModel] || []).map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">Ghi chú</label>
            <textarea rows="4" value={sourceDocumentForm.note} onChange={(event) => setSourceDocumentForm((prev) => ({ ...prev, note: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white" placeholder="Dien giai nghiep vu công nợ" />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setSourceDocumentModalOpen(false)} className="px-5 py-3 rounded-2xl border border-gray-200 font-bold text-gray-600">Đóng</button>
            <button type="submit" disabled={submitting} className="px-5 py-3 rounded-2xl bg-[#006B4D] text-white font-bold disabled:opacity-60">{submitting ? 'Đang lưu...' : 'Lưu chứng từ'}</button>
          </div>
        </form>
      </ModalShell>

      <ModalShell
        isOpen={voucherModalOpen}
        onClose={() => setVoucherModalOpen(false)}
        title="Lập phiếu giao dịch"
      >
        <form onSubmit={handleVoucherSubmit} className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr,0.8fr] gap-6">
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Loại phieu</label>
                  <select value={voucherForm.type} onChange={(event) => { const nextType = event.target.value; setVoucherForm((prev) => ({ ...prev, type: nextType, categoryId: '', toAccountId: nextType === 'transfer' ? prev.toAccountId : '', counterpartyModel: nextType === 'expense' ? 'Supplier' : 'Customer', counterpartyId: '' })); setVoucherAllocations([{ sourceDocumentId: '', amount: '' }]); }} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Ngày giao dịch</label>
                  <input type="date" value={voucherForm.transactionDate} onChange={(event) => setVoucherForm((prev) => ({ ...prev, transactionDate: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Số tiền</label>
                  <input type="number" min="0" value={voucherForm.amount} onChange={(event) => setVoucherForm((prev) => ({ ...prev, amount: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Tài khoản nguon / nhan</label>
                  <select value={voucherForm.fromAccountId} onChange={(event) => setVoucherForm((prev) => ({ ...prev, fromAccountId: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                    <option value="">Chon sổ quỹ</option>
                    {accounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.name} - {formatCurrency(account.currentBalance)}
                      </option>
                    ))}
                  </select>
                </div>
                {voucherForm.type === 'transfer' ? (
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">Tài khoản dich</label>
                    <select value={voucherForm.toAccountId} onChange={(event) => setVoucherForm((prev) => ({ ...prev, toAccountId: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                      <option value="">Chọn tài khoản đích</option>
                      {accounts.map((account) => (
                        <option key={account._id} value={account._id}>
                          {account.name} - {formatCurrency(account.currentBalance)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">Danh mục</label>
                    <select value={voucherForm.categoryId} onChange={(event) => setVoucherForm((prev) => ({ ...prev, categoryId: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                      <option value="">Chọn danh mục</option>
                      {filteredCategories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {voucherForm.type !== 'transfer' ? (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Counterparty model</label>
                      <select value={voucherForm.counterpartyModel} onChange={(event) => setVoucherForm((prev) => ({ ...prev, counterpartyModel: event.target.value, counterpartyId: '' }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                        <option value="Customer">Customer</option>
                        <option value="Supplier">Supplier</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 xl:col-span-1">
                      <label className="block text-sm font-bold text-gray-600 mb-2">Chọn đối tượng</label>
                      <select value={voucherForm.counterpartyId} onChange={(event) => setVoucherForm((prev) => ({ ...prev, counterpartyId: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                        <option value="">Không chọn</option>
                        {getCounterpartyOptions(voucherForm.counterpartyModel, customers, suppliers).map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : null}
              </div>

              {voucherForm.type !== 'transfer' ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-base font-black text-[#111827]">Allocate vào chứng từ gốc</h4>
                      <p className="text-sm text-gray-500 mt-1">Hỗ trợ một hoặc nhiều chứng từ phải thu / phải trả.</p>
                    </div>
                    <button type="button" onClick={() => setVoucherAllocations((prev) => [...prev, { sourceDocumentId: '', amount: '' }])} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50">
                      Thêm dòng
                    </button>
                  </div>
                  <div className="space-y-3">
                    {voucherAllocations.map((allocation, index) => (
                      <div key={`${allocation.sourceDocumentId}-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr,180px,90px] gap-3">
                        <select value={allocation.sourceDocumentId} onChange={(event) => changeAllocationRow(index, 'sourceDocumentId', event.target.value)} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm">
                          <option value="">Không cần chứng từ</option>
                          {availableAllocationDocuments.map((document) => (
                            <option key={document._id} value={document._id}>
                              {document.documentNo} - {document.counterpartyNameSnapshot} - Còn {formatCurrency(document.outstandingAmount)}
                            </option>
                          ))}
                        </select>
                        <input type="number" min="0" value={allocation.amount} onChange={(event) => changeAllocationRow(index, 'amount', event.target.value)} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white" placeholder="Số tiền allocate" />
                        <button type="button" onClick={() => setVoucherAllocations((prev) => (prev.length === 1 ? prev : prev.filter((_, rowIndex) => rowIndex !== index)))} className="px-3 py-3 rounded-2xl border border-red-200 text-red-500 font-bold hover:bg-red-50">
                          Xoa
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Ghi chú</label>
                <textarea rows="4" value={voucherForm.notes} onChange={(event) => setVoucherForm((prev) => ({ ...prev, notes: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white" placeholder="Ghi chú nghiep vu, noi dung chi / thu, tham chieu hoa don..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Upload hóa đơn / chứng từ</label>
                <label className="w-full rounded-3xl border border-dashed border-gray-300 bg-white px-5 py-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#006B4D] transition">
                  <FaUpload className="text-2xl text-gray-400 mb-3" />
                  <span className="font-bold text-[#111827]">Chọn PDF, JPG, PNG, WEBP</span>
                  <span className="text-sm text-gray-400 mt-1">Tối đa 10 tệp, 10MB / tệp</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" multiple onChange={(event) => setVoucherFiles(Array.from(event.target.files || []))} className="hidden" />
                </label>
                {voucherFiles.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {voucherFiles.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="rounded-2xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-600">
                        {file.name} ({Math.ceil(file.size / 1024)} KB)
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-gray-200 p-5">
                <div className="text-xs uppercase tracking-[0.14em] text-gray-400 font-bold">Preview số dư</div>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl bg-[#F9FAFB] border border-gray-200 p-4">
                    <div className="text-sm font-bold text-gray-500">Tài khoản nguon / nhan</div>
                    <div className="text-lg font-black text-[#111827] mt-1">{selectedFromAccount?.name || 'Chưa chọn'}</div>
                    <div className="text-sm text-gray-500 mt-2">Hiện tại {formatCurrency(selectedFromAccount?.currentBalance)}</div>
                    <div className="text-sm text-[#006B4D] font-bold mt-1">Sau giao dịch {formatCurrency(projectedBalances.fromAfter)}</div>
                  </div>
                  {voucherForm.type === 'transfer' ? (
                    <div className="rounded-2xl bg-[#F9FAFB] border border-gray-200 p-4">
                      <div className="text-sm font-bold text-gray-500">Tài khoản dich</div>
                      <div className="text-lg font-black text-[#111827] mt-1">{selectedToAccount?.name || 'Chưa chọn'}</div>
                      <div className="text-sm text-gray-500 mt-2">Hiện tại {formatCurrency(selectedToAccount?.currentBalance)}</div>
                      <div className="text-sm text-[#006B4D] font-bold mt-1">Sau giao dịch {formatCurrency(projectedBalances.toAfter)}</div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-200 p-5">
                <div className="text-xs uppercase tracking-[0.14em] text-gray-400 font-bold">Ghi chú nghiep vu</div>
                <div className="mt-3 space-y-3 text-sm text-gray-500">
                  <div>Income cong tien vao sổ quỹ va giam phai thu neu co allocate.</div>
                  <div>Expense tru tien khoi sổ quỹ va giam phai tra neu co allocate.</div>
                  <div>Transfer chi chuyen tien noi bo, khong vao P&amp;L va khong dong vao công nợ.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setVoucherModalOpen(false)} className="px-5 py-3 rounded-2xl border border-gray-200 font-bold text-gray-600">Đóng</button>
            <button type="submit" disabled={submitting} className="px-5 py-3 rounded-2xl bg-[#006B4D] text-white font-bold disabled:opacity-60">{submitting ? 'Đang ghi sổ...' : 'Ghi sổ ngay'}</button>
          </div>
        </form>
      </ModalShell>

      <ModalShell
        isOpen={openingBalanceModalOpen}
        onClose={() => setOpeningBalanceModalOpen(false)}
        title="Nhập số dư đầu kỳ"
      >
        <form onSubmit={handleOpeningBalanceSubmit} className="space-y-6">
          <SectionCard title="So du cac sổ quỹ" subtitle="Dùng trước khi phát sinh giao dịch production.">
            <div className="space-y-3">
              {openingBalanceForm.accountBalances.map((item) => {
                const account = accounts.find((entry) => entry._id === item.accountId);
                return (
                  <div key={item.accountId} className="grid grid-cols-1 md:grid-cols-[1fr,220px] gap-3">
                    <div className="px-4 py-3 rounded-2xl border border-gray-200 bg-white font-bold text-[#111827]">
                      {account?.name}
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={item.amount}
                      onChange={(event) =>
                        setOpeningBalanceForm((prev) => ({
                          ...prev,
                          accountBalances: prev.accountBalances.map((row) =>
                            row.accountId === item.accountId ? { ...row, amount: event.target.value } : row
                          ),
                        }))
                      }
                      className="px-4 py-3 rounded-2xl border border-gray-200 bg-white"
                    />
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            title="Opening balance phải thu"
            subtitle="Nhập các khoản khách hàng còn nợ tại thời điểm go-live."
            actions={<button type="button" onClick={() => addOpeningRow('receivables', 'Customer')} className="px-4 py-2.5 rounded-2xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50">Thêm dòng</button>}
          >
            <div className="space-y-3">
              {openingBalanceForm.receivables.map((row, index) => (
                <div key={`receivable-${index}`} className="grid grid-cols-1 xl:grid-cols-[1fr,180px,170px,170px,90px] gap-3">
                  <select value={row.counterpartyId} onChange={(event) => changeOpeningRow('receivables', index, 'counterpartyId', event.target.value)} className="px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                    <option value="">Chọn customer</option>
                    {customers.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <input type="number" min="0" value={row.amount} onChange={(event) => changeOpeningRow('receivables', index, 'amount', event.target.value)} className="px-4 py-3 rounded-2xl border border-gray-200 bg-white" placeholder="Số tiền" />
                  <input type="date" value={row.issueDate} onChange={(event) => changeOpeningRow('receivables', index, 'issueDate', event.target.value)} className="px-4 py-3 rounded-2xl border border-gray-200 bg-white" />
                  <input type="date" value={row.dueDate} onChange={(event) => changeOpeningRow('receivables', index, 'dueDate', event.target.value)} className="px-4 py-3 rounded-2xl border border-gray-200 bg-white" />
                  <button type="button" onClick={() => removeOpeningRow('receivables', index)} className="px-3 py-3 rounded-2xl border border-red-200 text-red-500 font-bold hover:bg-red-50">Xóa</button>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Opening balance phải trả"
            subtitle="Nhap cac khoan công nợ nha cung cap con ton."
            actions={<button type="button" onClick={() => addOpeningRow('payables', 'Supplier')} className="px-4 py-2.5 rounded-2xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50">Thêm dòng</button>}
          >
            <div className="space-y-3">
              {openingBalanceForm.payables.map((row, index) => (
                <div key={`payable-${index}`} className="grid grid-cols-1 xl:grid-cols-[1fr,180px,170px,170px,90px] gap-3">
                  <select value={row.counterpartyId} onChange={(event) => changeOpeningRow('payables', index, 'counterpartyId', event.target.value)} className="px-4 py-3 rounded-2xl border border-gray-200 bg-white">
                    <option value="">Chọn supplier</option>
                    {suppliers.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <input type="number" min="0" value={row.amount} onChange={(event) => changeOpeningRow('payables', index, 'amount', event.target.value)} className="px-4 py-3 rounded-2xl border border-gray-200 bg-white" placeholder="Số tiền" />
                  <input type="date" value={row.issueDate} onChange={(event) => changeOpeningRow('payables', index, 'issueDate', event.target.value)} className="px-4 py-3 rounded-2xl border border-gray-200 bg-white" />
                  <input type="date" value={row.dueDate} onChange={(event) => changeOpeningRow('payables', index, 'dueDate', event.target.value)} className="px-4 py-3 rounded-2xl border border-gray-200 bg-white" />
                  <button type="button" onClick={() => removeOpeningRow('payables', index)} className="px-3 py-3 rounded-2xl border border-red-200 text-red-500 font-bold hover:bg-red-50">Xóa</button>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setOpeningBalanceModalOpen(false)} className="px-5 py-3 rounded-2xl border border-gray-200 font-bold text-gray-600">Đóng</button>
            <button type="submit" disabled={submitting} className="px-5 py-3 rounded-2xl bg-[#111827] text-white font-bold disabled:opacity-60">{submitting ? 'Dang xu ly...' : 'Ap dung opening balance'}</button>
          </div>
        </form>
      </ModalShell>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
        onConfirm={async () => {
          if (typeof confirmModal.onConfirm === 'function') {
            await confirmModal.onConfirm();
          }
        }}
      />
    </>
  );
};

export default FinanceCenterScreen;
