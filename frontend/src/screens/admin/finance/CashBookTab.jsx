import React, { useState } from 'react';
import {
  FaWallet, FaPlus, FaArrowDown, FaArrowUp, FaSearch,
  FaSpinner, FaSync, FaTrash, FaTimes, FaCheck,
  FaUniversity,
} from 'react-icons/fa';
import {
  useGetCashBooksQuery, useCreateCashBookMutation, useUpdateCashBookMutation,
  useDeleteCashBookMutation,
  useGetTransactionsQuery, useCreateTransactionMutation, useCancelTransactionMutation,
  useGetCategoriesQuery,
} from '../../../slices/financeApiSlice';
import { toast } from 'react-toastify';
import FinanceAttachmentUploader from '../../../components/FinanceAttachmentUploader';
import ConfirmModal from '../../../components/ConfirmModal';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0));

const BADGE_TYPE = {
  income: 'bg-green-100 text-green-700',
  expense: 'bg-red-100 text-red-700',
};

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-extrabold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><FaTimes /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const CashBookTab = () => {
  const { data: books = [], isLoading: loadingBooks, refetch: refetchBooks } = useGetCashBooksQuery();
  const { data: catData } = useGetCategoriesQuery();
  const categories = catData || [];

  const [selectedBook, setSelectedBook] = useState(null);
  const [txFilter, setTxFilter] = useState({ type: '', search: '' });
  const [txParams, setTxParams] = useState({ page: 1, limit: 50 });

  const { data: txData, isLoading: loadingTx, refetch: refetchTx } = useGetTransactionsQuery({
    cashBook: selectedBook?._id,
    ...txFilter,
    ...txParams,
  }, { skip: !selectedBook });

  const [createBook] = useCreateCashBookMutation();
  const [updateBook] = useUpdateCashBookMutation();
  const [deleteBook] = useDeleteCashBookMutation();
  const [createTx] = useCreateTransactionMutation();
  const [cancelTx] = useCancelTransactionMutation();

  const [showBookModal, setShowBookModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState('income');

  const [bookForm, setBookForm] = useState({ name: '', type: 'cash', initialBalance: '', currency: 'VND', bankName: '', bankAccountNumber: '' });
  const [txForm, setTxForm] = useState({ cashBookId: '', categoryId: '', amount: '', description: '', counterparty: '', date: new Date().toISOString().slice(0, 10), method: 'cash', hasInvoice: false, invoiceNumber: '' });
  const [attachments, setAttachments] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', itemName: '', onConfirm: null, isDanger: true });

  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      await createBook({ ...bookForm, openingBalance: Number(bookForm.openingBalance) || 0 }).unwrap();
      toast.success('Đã tạo sổ quỹ mới');
      setShowBookModal(false);
      setBookForm({ name: '', type: 'cash', currency: 'VND', bankName: '', accountNumber: '', openingBalance: '' });
    } catch (err) {
      toast.error(err?.data?.message || 'Lỗi tạo sổ quỹ');
    }
  };

  const handleCreateTx = async (e) => {
    e.preventDefault();
    if (!selectedBook) { toast.error('Vui lòng chọn sổ quỹ'); return; }
    try {
      await createTx({
        type: txType,
        amount: Number(txForm.amount),
        cashBook: selectedBook._id,
        category: txForm.categoryId || undefined,
        description: txForm.description,
        transactionDate: txForm.transactionDate,
        hasInvoice: txForm.hasInvoice,
        invoiceNumber: txForm.hasInvoice ? txForm.invoiceNumber : undefined,
        currency: selectedBook.currency || 'VND',
        attachments,
      }).unwrap();
      toast.success(`Đã ghi nhận ${txType === 'income' ? 'thu' : 'chi'} tiền`);
      setShowTxModal(false);
      setTxForm({ amount: '', categoryId: '', description: '', transactionDate: new Date().toISOString().slice(0, 10), hasInvoice: false, invoiceNumber: '' });
      setAttachments([]);
      refetchTx();
      refetchBooks();
    } catch (err) {
      toast.error(err?.data?.message || 'Lỗi ghi nhận giao dịch');
    }
  };

  const handleCancelTx = (id, desc) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hủy giao dịch',
      itemName: desc || 'Giao dịch thu/chi',
      message: 'Bạn có chắc muốn hủy giao dịch này? Số dư sổ quỹ sẽ được hoàn lại tương ứng.',
      isDanger: true,
      onConfirm: async () => {
        try {
          await cancelTx(id).unwrap();
          toast.success('Đã hủy giao dịch thành công');
          setConfirmModal({ isOpen: false, title: '', message: '', itemName: '', onConfirm: null, isDanger: true });
          refetchTx();
          refetchBooks();
        } catch (err) {
          toast.error(err?.data?.message || 'Lỗi hủy giao dịch');
        }
      },
    });
  };

  const transactions = txData?.transactions || [];
  const filteredCats = categories.filter(c =>
    txType === 'income' ? c.direction === 'income' : c.direction === 'expense'
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* CASHBOOK CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-lg text-gray-800 flex items-center gap-2">
            <FaWallet className="text-emerald-600" /> Danh sách sổ quỹ
          </h2>
          <button
            onClick={() => setShowBookModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
          >
            <FaPlus /> Thêm sổ quỹ
          </button>
        </div>

        {loadingBooks ? (
          <div className="flex items-center justify-center h-24"><FaSpinner className="animate-spin text-2xl text-emerald-500" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {books.map(book => (
              <div
                key={book._id}
                className="relative group"
              >
                <button
                  onClick={() => setSelectedBook(book._id === selectedBook?._id ? null : book)}
                  className={`w-full rounded-2xl p-4 text-left border-2 transition-all shadow-sm ${
                    selectedBook?._id === book._id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-100 bg-white hover:border-emerald-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {book.type === 'bank' ? <FaUniversity className="text-blue-500" /> : <FaWallet className="text-emerald-500" />}
                    <span className="text-xs font-bold text-gray-500 uppercase">{book.type}</span>
                  </div>
                  <p className="font-bold text-sm text-gray-800 leading-tight pr-6">{book.name}</p>
                  <p className={`text-lg font-extrabold mt-2 ${book.currentBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {fmt(book.currentBalance)}đ
                  </p>
                  <p className="text-xs text-gray-400">{book.currency}</p>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmModal({
                      isOpen: true,
                      title: 'Xóa sổ quỹ',
                      itemName: book.name,
                      message: `Bạn có chắc chắn muốn xóa sổ quỹ "${book.name}" không?`,
                      isDanger: true,
                      onConfirm: async () => {
                        try {
                          await deleteBook(book._id).unwrap();
                          toast.success('Đã xóa sổ quỹ thành công');
                          setConfirmModal({ isOpen: false, title: '', message: '', itemName: '', onConfirm: null, isDanger: true });
                          refetchBooks();
                          if (selectedBook?._id === book._id) {
                            setSelectedBook(null);
                          }
                        } catch (err) {
                          toast.error(err?.data?.message || 'Lỗi khi xóa sổ quỹ');
                        }
                      },
                    });
                  }}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 lg:opacity-0 lg:group-hover:opacity-100 transition duration-150 active:scale-95"
                  title="Xóa sổ quỹ"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
            ))}
            {books.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-400">
                <FaWallet className="text-4xl mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Chưa có sổ quỹ nào. Tạo sổ quỹ đầu tiên!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TRANSACTION SECTION */}
      {selectedBook && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 border-b">
            <div>
              <h3 className="font-extrabold text-gray-800">{selectedBook.name}</h3>
              <p className="text-sm text-gray-500">
                Số dư: <span className={`font-bold ${selectedBook.currentBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {fmt(selectedBook.currentBalance)}đ
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setTxType('income'); setShowTxModal(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition"
              >
                <FaArrowDown /> Thu tiền
              </button>
              <button
                onClick={() => { setTxType('expense'); setShowTxModal(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition"
              >
                <FaArrowUp /> Chi tiền
              </button>
              <button onClick={refetchTx} className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:text-emerald-600 transition">
                <FaSync className={loadingTx ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 px-5 py-3 border-b bg-gray-50/50">
            <div className="relative flex-1 max-w-xs">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Tìm giao dịch..."
                value={txFilter.search}
                onChange={e => setTxFilter(f => ({ ...f, search: e.target.value }))}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <select
              value={txFilter.type}
              onChange={e => setTxFilter(f => ({ ...f, type: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option value="">Tất cả</option>
              <option value="income">Thu</option>
              <option value="expense">Chi</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loadingTx ? (
              <div className="flex items-center justify-center h-32"><FaSpinner className="animate-spin text-2xl text-emerald-500" /></div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">Chưa có giao dịch nào</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <th className="px-5 py-3 text-left">Mã CT</th>
                    <th className="px-5 py-3 text-left">Ngày</th>
                    <th className="px-5 py-3 text-left">Loại</th>
                    <th className="px-5 py-3 text-left">Danh mục</th>
                    <th className="px-5 py-3 text-left">Mô tả</th>
                    <th className="px-5 py-3 text-right">Số tiền</th>
                    <th className="px-5 py-3 text-center">HĐ</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map(tx => (
                    <tr key={tx._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">{tx.transactionCode}</td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(tx.transactionDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${BADGE_TYPE[tx.type]}`}>
                          {tx.type === 'income' ? '↓ Thu' : '↑ Chi'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{tx.category?.name || '—'}</td>
                      <td className="px-5 py-3 text-gray-700 max-w-[200px] truncate">{tx.description || '—'}</td>
                      <td className={`px-5 py-3 text-right font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amountInVND)}đ
                      </td>
                      <td className="px-5 py-3 text-center">
                        {tx.hasInvoice ? (
                          <span title={tx.invoiceNumber} className="text-emerald-500"><FaCheck /></span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => handleCancelTx(tx._id)}
                          className="text-gray-300 hover:text-red-500 transition"
                          title="Hủy giao dịch"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* CREATE BOOK MODAL */}
      <Modal open={showBookModal} onClose={() => setShowBookModal(false)} title="Thêm sổ quỹ mới">
        <form onSubmit={handleCreateBook} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tên sổ quỹ *</label>
            <input required value={bookForm.name} onChange={e => setBookForm(f => ({ ...f, name: e.target.value }))}
              placeholder="VD: Két tiền mặt, TK Vietcombank..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Loại</label>
              <select value={bookForm.type} onChange={e => setBookForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                <option value="cash">💵 Tiền mặt</option>
                <option value="bank">🏦 Ngân hàng</option>
                <option value="emergency">🔐 Quỹ dự phòng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Đơn vị tiền</label>
              <select value={bookForm.currency} onChange={e => setBookForm(f => ({ ...f, currency: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          {bookForm.type === 'bank' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên ngân hàng</label>
                <input value={bookForm.bankName} onChange={e => setBookForm(f => ({ ...f, bankName: e.target.value }))}
                  placeholder="Vietcombank, MB Bank..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Số tài khoản</label>
                <input value={bookForm.accountNumber} onChange={e => setBookForm(f => ({ ...f, accountNumber: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Số dư ban đầu (đ)</label>
            <input type="number" value={bookForm.openingBalance} onChange={e => setBookForm(f => ({ ...f, openingBalance: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition">
            Tạo sổ quỹ
          </button>
        </form>
      </Modal>

      {/* CREATE TRANSACTION MODAL */}
      <Modal
        open={showTxModal}
        onClose={() => setShowTxModal(false)}
        title={txType === 'income' ? '📥 Thu tiền' : '📤 Chi tiền'}
      >
        <form onSubmit={handleCreateTx} className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            <button type="button"
              onClick={() => setTxType('income')}
              className={`flex-1 py-2.5 text-sm font-bold transition ${txType === 'income' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >↓ Thu tiền</button>
            <button type="button"
              onClick={() => setTxType('expense')}
              className={`flex-1 py-2.5 text-sm font-bold transition ${txType === 'expense' ? 'bg-red-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >↑ Chi tiền</button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Số tiền * (đ)</label>
            <input required type="number" min="1" value={txForm.amount}
              onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="0" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Danh mục</label>
              <select value={txForm.categoryId} onChange={e => setTxForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                <option value="">-- Không phân loại --</option>
                {filteredCats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày giao dịch</label>
              <input type="date" value={txForm.transactionDate} onChange={e => setTxForm(f => ({ ...f, transactionDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả</label>
            <input value={txForm.description} onChange={e => setTxForm(f => ({ ...f, description: e.target.value }))}
              placeholder="VD: Thu tiền đơn hàng KH ABC..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={txForm.hasInvoice} onChange={e => setTxForm(f => ({ ...f, hasInvoice: e.target.checked }))}
              className="rounded" />
            <span className="text-sm font-medium text-gray-700">Có hóa đơn</span>
          </label>
          {txForm.hasInvoice && (
            <input value={txForm.invoiceNumber} onChange={e => setTxForm(f => ({ ...f, invoiceNumber: e.target.value }))}
              placeholder="Số hóa đơn..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          )}

          <div className="pt-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Chứng từ đính kèm</label>
            <FinanceAttachmentUploader attachments={attachments} setAttachments={setAttachments} />
          </div>

          <button type="submit"
            className={`w-full py-3 text-white font-bold rounded-xl transition ${txType === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}
          >
            Xác nhận {txType === 'income' ? 'Thu tiền' : 'Chi tiền'}
          </button>
        </form>
      </Modal>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', itemName: '', onConfirm: null, isDanger: true })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        itemName={confirmModal.itemName}
        isDanger={confirmModal.isDanger}
        confirmText="Xác nhận"
        cancelText="Hủy bỏ"
      />
    </div>
  );
};

export default CashBookTab;
