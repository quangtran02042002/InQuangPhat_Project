import React, { useState } from 'react';
import {
  FaPlus, FaSearch, FaSpinner, FaWarehouse, FaTimes, FaTrash, FaExclamationCircle,
} from 'react-icons/fa';
import {
  useGetPayablesQuery, useCreatePayableMutation,
  useRecordPayablePaymentMutation, useDeletePayableMutation,
  useGetPayablesDueSoonQuery, useGetCashBooksQuery,
} from '../../../slices/financeApiSlice';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import FinanceAttachmentUploader from '../../../components/FinanceAttachmentUploader';
import ConfirmModal from '../../../components/ConfirmModal';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0));
const AGE_BADGE = {
  'current': { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', row: '', label: 'Chưa đến hạn' },
  '1-15':    { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',   row: '', label: '1-15 ngày' },
  '16-30':   { badge: 'bg-orange-100 text-orange-700 border-orange-200',   row: 'bg-orange-50', label: '16-30 ngày' },
  '31-60':   { badge: 'bg-red-100 text-red-700 border-red-200',            row: 'bg-red-50', label: '31-60 ngày' },
  '61-90':   { badge: 'bg-red-200 text-red-800 border-red-300',            row: 'bg-red-50', label: '61-90 ngày' },
  'over90':  { badge: 'bg-gray-800 text-white border-gray-700',            row: 'bg-gray-50', label: '>90 ngày' },
};
const PIE_COLORS = ['#10b981','#f59e0b','#f97316','#ef4444','#b91c1c','#374151'];

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h3 className="font-extrabold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><FaTimes /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const PayableTab = () => {
  const [filter, setFilter] = useState({ status: '', debtAgeGroup: '', search: '', page: 1, limit: 50 });
  const { data: res, isLoading } = useGetPayablesQuery(filter);
  const { data: dueSoon } = useGetPayablesDueSoonQuery({ days: 7 });
  const { data: books = [] } = useGetCashBooksQuery();

  const [createPayable] = useCreatePayableMutation();
  const [recordPayment] = useRecordPayablePaymentMutation();
  const [deletePayable] = useDeletePayableMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [showPayment, setShowPayment] = useState(null);
  const [form, setForm] = useState({ supplierName: '', totalAmount: '', description: '', issueDate: new Date().toISOString().slice(0,10), dueDate: '', paymentTermDays: 30 });
  const [payForm, setPayForm] = useState({ amount: '', cashBookId: '', method: 'cash', note: '' });
  const [payAttachments, setPayAttachments] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, supplier: '' });

  const items = res?.items || [];
  const totalOutstanding = items.reduce((s, p) => s + p.outstandingAmount, 0);
  const dueSoonTotal = dueSoon?.totalDue || 0;

  // Aging pie chart data
  const ageGroups = Object.entries(AGE_BADGE).map(([key, { label }], i) => {
    const count = items.filter(r => r.debtAgeGroup === key).length;
    const total = items.filter(r => r.debtAgeGroup === key).reduce((s, r) => s + r.outstandingAmount, 0);
    return { name: label, count, total, fill: PIE_COLORS[i] };
  }).filter(g => g.count > 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createPayable({ ...form, totalAmount: Number(form.totalAmount), paymentTermDays: Number(form.paymentTermDays) }).unwrap();
      toast.success('Đã tạo khoản phải trả');
      setShowCreate(false);
      setForm({ supplierName: '', totalAmount: '', description: '', issueDate: new Date().toISOString().slice(0,10), dueDate: '', paymentTermDays: 30 });
    } catch (err) { toast.error(err?.data?.message || 'Lỗi'); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!payForm.cashBookId) { toast.error('Chọn sổ quỹ thanh toán'); return; }
    try {
      await recordPayment({ 
        id: showPayment._id, 
        amount: Number(payForm.amount), 
        cashBookId: payForm.cashBookId, 
        method: payForm.method, 
        note: payForm.note,
        attachments: payAttachments
      }).unwrap();
      toast.success('Đã ghi nhận thanh toán');
      setShowPayment(null);
      setPayForm({ amount: '', cashBookId: '', method: 'cash', note: '' });
      setPayAttachments([]);
    } catch (err) { toast.error(err?.data?.message || 'Lỗi'); }
  };

  const handleDeleteClick = (p) => {
    setDeleteModal({
      isOpen: true,
      id: p._id,
      supplier: p.counterpartyNameSnapshot,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deletePayable(deleteModal.id).unwrap();
      toast.success('Đã xóa khoản phải trả');
      setDeleteModal({ isOpen: false, id: null, supplier: '' });
    } catch (err) {
      toast.error(err?.data?.message || 'Lỗi');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-xl text-gray-800">Công nợ phải trả</h2>
          <p className="text-sm text-gray-500">Tổng còn nợ: <span className="font-bold text-red-600">{fmt(totalOutstanding)}đ</span></p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition">
          <FaPlus /> Thêm khoản phải trả
        </button>
      </div>

      {/* DUE SOON ALERT */}
      {dueSoon?.items?.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FaExclamationCircle className="text-orange-500 text-lg" />
            <h3 className="font-bold text-orange-800">Sắp đến hạn trong 7 ngày — Tổng: {fmt(dueSoonTotal)}đ</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {dueSoon.items.map(p => (
              <div key={p._id} className="flex items-center justify-between bg-white border border-orange-100 rounded-xl px-3 py-2 text-sm">
                <div>
                  <p className="font-semibold text-gray-800">{p.supplierName}</p>
                  <p className="text-xs text-orange-500">Hạn: {new Date(p.dueDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <p className="font-bold text-orange-700">{fmt(p.outstandingAmount)}đ</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AGING PIE */}
      {ageGroups.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-sm text-gray-700 mb-3">Phân tích tuổi nợ</h3>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <ResponsiveContainer width={220} height={180}>
              <PieChart>
                <Pie data={ageGroups} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={false}>
                  {ageGroups.map((g, i) => <Cell key={g.name} fill={g.fill} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v) + 'đ'} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2">
              {ageGroups.map(g => (
                <div key={g.name} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: g.fill }} />
                  <div>
                    <p className="text-xs font-bold text-gray-600">{g.name}</p>
                    <p className="text-xs text-gray-500">{g.count} khoản · {fmt(g.total)}đ</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input placeholder="Tìm nhà cung cấp, mã..." value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
        </div>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ trả</option>
          <option value="partial">Thanh toán một phần</option>
          <option value="overdue">Quá hạn</option>
          <option value="paid">Đã trả</option>
        </select>
        <select value={filter.debtAgeGroup} onChange={e => setFilter(f => ({ ...f, debtAgeGroup: e.target.value }))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
          <option value="">Tất cả tuổi nợ</option>
          {Object.entries(AGE_BADGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32"><FaSpinner className="animate-spin text-2xl text-emerald-500" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FaWarehouse className="text-5xl mx-auto mb-3 text-gray-200" />
            <p className="text-sm">Chưa có khoản phải trả nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <th className="px-4 py-3 text-left">Mã CT</th>
                  <th className="px-4 py-3 text-left">Nhà cung cấp</th>
                  <th className="px-4 py-3 text-left">Diễn giải</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                  <th className="px-4 py-3 text-right">Còn nợ</th>
                  <th className="px-4 py-3 text-center">Tuổi nợ</th>
                  <th className="px-4 py-3 text-center">Hạn T/T</th>
                  <th className="px-4 py-3 text-center">TT</th>
                  <th className="px-4 py-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(p => {
                  const age = AGE_BADGE[p.debtAgeGroup] || AGE_BADGE['current'];
                  return (
                    <tr key={p._id} className={`hover:bg-gray-50 transition ${age.row} ${p.status === 'overdue' ? 'border-l-4 border-l-red-400' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.documentCode}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{p.supplierName}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{p.description || '—'}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(p.totalAmount)}đ</td>
                      <td className="px-4 py-3 text-right font-bold text-red-600">{fmt(p.outstandingAmount)}đ</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full border text-xs font-bold ${age.badge}`}>
                          {p.debtAgeDays > 0 ? `+${p.debtAgeDays}d` : 'Đúng hạn'}
                        </span>
                      </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {p.dueDate ? new Date(p.dueDate).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        p.status === 'paid' ? 'bg-green-100 text-green-700' :
                        p.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        p.status === 'partial' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>{
                        p.status === 'paid' ? 'Đã trả' :
                        p.status === 'overdue' ? 'Quá hạn' :
                        p.status === 'partial' ? 'Một phần' : 'Chờ trả'
                      }</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {p.status !== 'paid' && (
                          <button onClick={() => setShowPayment(p)}
                            className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold transition">
                            Trả tiền
                          </button>
                        )}
                        <button onClick={() => handleDeleteClick(p)} title="Xóa" className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition active:scale-95">
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Thêm khoản phải trả">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nhà cung cấp *</label>
            <input required value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Diễn giải</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="VD: Nhập giấy Coucher 300gsm lô 05/2026"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tổng tiền * (đ)</label>
            <input required type="number" min="1" value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày phát sinh</label>
              <input type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hạn thanh toán</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition">
            Tạo khoản phải trả
          </button>
        </form>
      </Modal>

      {/* PAYMENT MODAL */}
      <Modal open={!!showPayment} onClose={() => setShowPayment(null)} title="Ghi nhận thanh toán">
        {showPayment && (
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="font-bold text-gray-700">{showPayment.supplierName}</p>
              <p className="text-gray-500">Còn nợ: <span className="text-red-600 font-bold">{fmt(showPayment.outstandingAmount)}đ</span></p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Số tiền thanh toán * (đ)</label>
              <input required type="number" min="1" max={showPayment.outstandingAmount} value={payForm.amount}
                onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Thanh toán từ sổ quỹ *</label>
              <select required value={payForm.cashBookId} onChange={e => setPayForm(f => ({ ...f, cashBookId: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                <option value="">-- Chọn sổ quỹ --</option>
                {books.map(b => <option key={b._id} value={b._id}>{b.name} ({fmt(b.currentBalance)}đ)</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phương thức</label>
              <select value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                <option value="cash">💵 Tiền mặt</option>
                <option value="bank_transfer">🏦 Chuyển khoản</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div className="pt-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Chứng từ (Hoá đơn/Uỷ nhiệm chi)</label>
              <FinanceAttachmentUploader attachments={payAttachments} setAttachments={setPayAttachments} />
            </div>
            <button type="submit" className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition">
              Xác nhận trả tiền
            </button>
          </form>
        )}
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, supplier: '' })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa khoản phải trả"
        itemName={deleteModal.supplier}
        message="Bạn có chắc chắn muốn xóa khoản phải trả này không? Hành động này không thể hoàn tác."
        confirmText="Đồng ý xóa"
        cancelText="Hủy bỏ"
      />
    </div>
  );
};

export default PayableTab;
