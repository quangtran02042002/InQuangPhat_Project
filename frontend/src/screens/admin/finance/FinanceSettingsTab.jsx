import React, { useState } from 'react';
import {
  FaCog, FaPlus, FaTrash, FaEdit, FaLock, FaSpinner, FaTimes,
  FaPiggyBank, FaCalendarAlt, FaCheck,
} from 'react-icons/fa';
import {
  useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation,
  useDeleteCategoryMutation, useSeedCategoriesMutation,
  useGetEmergencyFundQuery, useUpsertEmergencyFundMutation, useAddEmergencyContributionMutation,
  useGetPeriodsQuery, useCreatePeriodMutation, useClosePeriodMutation, useDeletePeriodMutation,
} from '../../../slices/financeApiSlice';
import { toast } from 'react-toastify';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0));

const GROUP_LABEL = { revenue: 'Doanh thu', cogs: 'Giá vốn', opex: 'OPEX', other: 'Khác' };
const GROUP_COLOR = {
  revenue: 'bg-green-100 text-green-700',
  cogs: 'bg-orange-100 text-orange-700',
  opex: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-600',
};

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

const FinanceSettingsTab = () => {
  const [activeSection, setActiveSection] = useState('categories');

  // CATEGORIES
  const { data: cats = [], isLoading: loadCats } = useGetCategoriesQuery({ isActive: false });
  const [createCat] = useCreateCategoryMutation();
  const [updateCat] = useUpdateCategoryMutation();
  const [deleteCat] = useDeleteCategoryMutation();
  const [seedCats] = useSeedCategoriesMutation();
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', code: '', direction: 'expense', group: 'opex', description: '' });

  // EMERGENCY FUND
  const { data: fund } = useGetEmergencyFundQuery();
  const [upsertFund] = useUpsertEmergencyFundMutation();
  const [addContrib] = useAddEmergencyContributionMutation();
  const [fundForm, setFundForm] = useState({ targetMonths: 3, monthlyOPEX: '' });
  const [contribForm, setContribForm] = useState({ amount: '', note: '' });

  // PERIODS
  const { data: periods = [], isLoading: loadPeriods } = useGetPeriodsQuery();
  const [createPeriod] = useCreatePeriodMutation();
  const [closePeriod] = useClosePeriodMutation();
  const [deletePeriod] = useDeletePeriodMutation();
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [periodForm, setPeriodForm] = useState({ name: '', startDate: '', endDate: '' });

  const handleSaveCat = async (e) => {
    e.preventDefault();
    try {
      if (editCat) {
        await updateCat({ id: editCat._id, ...catForm }).unwrap();
        toast.success('Đã cập nhật danh mục');
      } else {
        await createCat(catForm).unwrap();
        toast.success('Đã tạo danh mục');
      }
      setShowCatModal(false);
      setEditCat(null);
      setCatForm({ name: '', code: '', direction: 'expense', group: 'opex', description: '' });
    } catch (err) { toast.error(err?.data?.message || 'Lỗi'); }
  };

  const handleEditCat = (cat) => {
    setEditCat(cat);
    setCatForm({ name: cat.name, code: cat.code, direction: cat.direction, group: cat.group, description: cat.description || '' });
    setShowCatModal(true);
  };

  const handleDeleteCat = async (id) => {
    if (!window.confirm('Xóa danh mục này?')) return;
    try { await deleteCat(id).unwrap(); toast.success('Đã xóa'); } catch (err) { toast.error(err?.data?.message || 'Lỗi'); }
  };

  const handleSeed = async () => {
    if (!window.confirm('Tạo lại 15 danh mục mặc định? Các danh mục đã có sẽ không bị thay đổi.')) return;
    try {
      const { created } = await seedCats().unwrap();
      toast.success(`Đã tạo ${created} danh mục mặc định`);
    } catch (err) { toast.error(err?.data?.message || 'Lỗi'); }
  };

  const handleSaveFund = async (e) => {
    e.preventDefault();
    try {
      await upsertFund({ targetMonths: Number(fundForm.targetMonths), monthlyOPEX: Number(fundForm.monthlyOPEX) }).unwrap();
      toast.success('Đã cập nhật cài đặt quỹ dự phòng');
    } catch (err) { toast.error(err?.data?.message || 'Lỗi'); }
  };

  const handleContrib = async (e) => {
    e.preventDefault();
    try {
      await addContrib({ amount: Number(contribForm.amount), note: contribForm.note }).unwrap();
      toast.success('Đã ghi nhận khoản trích lập');
      setContribForm({ amount: '', note: '' });
    } catch (err) { toast.error(err?.data?.message || 'Lỗi'); }
  };

  const handleSavePeriod = async (e) => {
    e.preventDefault();
    try {
      await createPeriod(periodForm).unwrap();
      toast.success('Đã tạo kỳ kế toán');
      setShowPeriodModal(false);
      setPeriodForm({ name: '', startDate: '', endDate: '' });
    } catch (err) { toast.error(err?.data?.message || 'Lỗi'); }
  };

  const handleClosePeriod = async (id) => {
    if (!window.confirm('Khóa sổ kỳ kế toán này? Không thể hoàn tác.')) return;
    try { await closePeriod({ id }).unwrap(); toast.success('Đã khóa sổ kỳ kế toán'); } catch (err) { toast.error(err?.data?.message || 'Lỗi'); }
  };

  const SECTIONS = [
    { id: 'categories', label: 'Danh mục tài chính', icon: FaCog },
    { id: 'emergency', label: 'Quỹ dự phòng', icon: FaPiggyBank },
    { id: 'periods', label: 'Kỳ kế toán', icon: FaCalendarAlt },
  ];

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      <div className="flex gap-6">
        {/* LEFT NAV */}
        <div className="w-48 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left border-b border-gray-50 last:border-0 transition ${activeSection === id ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Icon className="text-sm shrink-0" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 space-y-6">
          {/* ── CATEGORIES ───────────────────────────── */}
          {activeSection === 'categories' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="font-extrabold text-gray-800">Danh mục tài chính</h2>
                <div className="flex gap-2">
                  <button onClick={handleSeed}
                    className="px-3 py-1.5 border border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl text-sm font-bold transition">
                    🌱 Seed mặc định
                  </button>
                  <button onClick={() => { setEditCat(null); setCatForm({ name: '', code: '', direction: 'expense', group: 'opex', description: '' }); setShowCatModal(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition">
                    <FaPlus size={10} /> Thêm
                  </button>
                </div>
              </div>
              {loadCats ? (
                <div className="flex justify-center py-10"><FaSpinner className="animate-spin text-2xl text-emerald-500" /></div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <th className="px-4 py-3 text-left">Mã</th>
                      <th className="px-4 py-3 text-left">Tên danh mục</th>
                      <th className="px-4 py-3 text-center">Nhóm</th>
                      <th className="px-4 py-3 text-center">Loại</th>
                      <th className="px-4 py-3 text-center">HT</th>
                      <th className="px-4 py-3 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {cats.map(cat => (
                      <tr key={cat._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{cat.code}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{cat.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${GROUP_COLOR[cat.group] || 'bg-gray-100 text-gray-600'}`}>
                            {GROUP_LABEL[cat.group] || cat.group}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cat.direction === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {cat.direction === 'income' ? '↓ Thu' : '↑ Chi'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {cat.isSystem ? <FaLock className="text-gray-300 mx-auto text-xs" title="Hệ thống" /> : <FaCheck className="text-emerald-400 mx-auto text-xs" />}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => handleEditCat(cat)} className="p-1.5 text-blue-400 hover:text-blue-600 transition">
                              <FaEdit className="text-xs" />
                            </button>
                            {!cat.isSystem && (
                              <button onClick={() => handleDeleteCat(cat._id)} className="p-1.5 text-gray-300 hover:text-red-500 transition">
                                <FaTrash className="text-xs" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {cats.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                        Chưa có danh mục. Bấm "Seed mặc định" để khởi tạo.
                      </td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── EMERGENCY FUND ──────────────────────── */}
          {activeSection === 'emergency' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                  <FaPiggyBank className="text-amber-500" /> Cài đặt quỹ dự phòng
                </h2>
                {fund && (
                  <div className="mb-5 bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-amber-700 font-semibold">Hiện có</span>
                      <span className="font-black text-amber-900">{fmt(fund.currentAmount)}đ</span>
                    </div>
                    <div className="w-full bg-amber-100 rounded-full h-3 mb-1">
                      <div className="bg-amber-400 h-3 rounded-full transition-all"
                        style={{ width: fund.targetAmount ? `${Math.min(100, (fund.currentAmount / fund.targetAmount) * 100)}%` : '0%' }} />
                    </div>
                    <div className="flex justify-between text-xs text-amber-600">
                      <span>Mục tiêu: {fmt(fund.targetAmount)}đ</span>
                      <span>{fund.targetAmount ? ((fund.currentAmount / fund.targetAmount) * 100).toFixed(0) : 0}%</span>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSaveFund} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mục tiêu (tháng)</label>
                    <input type="number" min="1" max="24" value={fundForm.targetMonths}
                      onChange={e => setFundForm(f => ({ ...f, targetMonths: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">OPEX trung bình/tháng (đ)</label>
                    <input type="number" min="0" value={fundForm.monthlyOPEX}
                      onChange={e => setFundForm(f => ({ ...f, monthlyOPEX: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Mục tiêu tự động: {fundForm.targetMonths} tháng × {fmt(Number(fundForm.monthlyOPEX))}đ = <span className="font-bold text-gray-600">{fmt(Number(fundForm.targetMonths) * Number(fundForm.monthlyOPEX))}đ</span></p>
                  </div>
                  <button type="submit" className="col-span-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition">
                    Lưu cài đặt
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4">Thêm khoản trích lập</h3>
                <form onSubmit={handleContrib} className="flex gap-3 flex-wrap">
                  <input required type="number" min="1" value={contribForm.amount}
                    onChange={e => setContribForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="Số tiền (đ)"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 min-w-[160px]" />
                  <input value={contribForm.note} onChange={e => setContribForm(f => ({ ...f, note: e.target.value }))}
                    placeholder="Ghi chú..."
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 min-w-[160px]" />
                  <button type="submit" className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition text-sm">
                    + Trích lập
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── ACCOUNTING PERIODS ──────────────────── */}
          {activeSection === 'periods' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="font-extrabold text-gray-800">Kỳ kế toán</h2>
                <button onClick={() => setShowPeriodModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition">
                  <FaPlus size={10} /> Tạo kỳ mới
                </button>
              </div>
              {loadPeriods ? (
                <div className="flex justify-center py-10"><FaSpinner className="animate-spin text-2xl text-emerald-500" /></div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {periods.map(p => (
                    <div key={p._id} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(p.startDate).toLocaleDateString('vi-VN')} → {new Date(p.endDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.isClosed ? (
                          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold">
                            <FaLock className="text-[10px]" /> Đã khóa
                          </span>
                        ) : (
                          <>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">Đang mở</span>
                            <button onClick={() => handleClosePeriod(p._id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition" title="Khóa kỳ">
                              <FaLock className="text-xs" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {periods.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">Chưa có kỳ kế toán nào</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CATEGORY MODAL */}
      <Modal open={showCatModal} onClose={() => setShowCatModal(false)} title={editCat ? 'Sửa danh mục' : 'Thêm danh mục mới'}>
        <form onSubmit={handleSaveCat} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mã danh mục *</label>
              <input required value={catForm.code} onChange={e => setCatForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="VD: REV-IN, OPEX-RENT"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nhóm</label>
              <select value={catForm.group} onChange={e => setCatForm(f => ({ ...f, group: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                <option value="revenue">Doanh thu (Revenue)</option>
                <option value="cogs">Giá vốn (COGS)</option>
                <option value="opex">OPEX</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tên danh mục *</label>
            <input required value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hướng</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              <button type="button" onClick={() => setCatForm(f => ({ ...f, direction: 'income' }))}
                className={`flex-1 py-2 text-sm font-bold transition ${catForm.direction === 'income' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                ↓ Thu nhập
              </button>
              <button type="button" onClick={() => setCatForm(f => ({ ...f, direction: 'expense' }))}
                className={`flex-1 py-2 text-sm font-bold transition ${catForm.direction === 'expense' ? 'bg-red-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                ↑ Chi tiêu
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả</label>
            <input value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition">
            {editCat ? 'Cập nhật' : 'Tạo danh mục'}
          </button>
        </form>
      </Modal>

      {/* PERIOD MODAL */}
      <Modal open={showPeriodModal} onClose={() => setShowPeriodModal(false)} title="Tạo kỳ kế toán mới">
        <form onSubmit={handleSavePeriod} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tên kỳ *</label>
            <input required value={periodForm.name} onChange={e => setPeriodForm(f => ({ ...f, name: e.target.value }))}
              placeholder="VD: Tháng 04/2026, Q2-2026..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày bắt đầu *</label>
              <input required type="date" value={periodForm.startDate} onChange={e => setPeriodForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày kết thúc *</label>
              <input required type="date" value={periodForm.endDate} onChange={e => setPeriodForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition">
            Tạo kỳ kế toán
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default FinanceSettingsTab;
