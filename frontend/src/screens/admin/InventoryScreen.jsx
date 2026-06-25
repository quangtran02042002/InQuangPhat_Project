import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaBars, FaBoxOpen, FaExchangeAlt, FaFileExport, FaPlus, FaTrash,
  FaMinus, FaLayerGroup, FaPrint,
} from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import ConfirmModal from '../../components/ConfirmModal';
import ExportSlipTemplate from '../../components/ExportSlipTemplate';

const EMPTY_ITEM = { itemCode: '', itemName: '', color: '', unit: 'Cái', quantity: '', note: '' };

const InventoryScreen = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const authConfig = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
  const isAdmin = userInfo?.isAdmin || ['director', 'production'].includes(userInfo?.role);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewSlip, setViewSlip] = useState(null); // giao dịch đang xem phiếu

  // ── Form State ──────────────────────────────────────────
  const [txType, setTxType] = useState('import');
  const [factoryName, setFactoryName] = useState('');
  const [orderCustomer, setOrderCustomer] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [reason, setReason] = useState('');
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);

  useEffect(() => {
    if (!userInfo) { navigate('/login'); return; }
    fetchTransactions();
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await axios.get('/api/inventory', authConfig);
      setTransactions(res.data);
    } catch {
      toast.error('Lỗi khi tải dữ liệu xuất nhập!');
    }
  }, []);

  // Cập nhật 1 dòng hàng
  const updateItem = (index, field, value) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
  };

  // Thêm dòng hàng
  const addItemRow = () => setItems(prev => [...prev, { ...EMPTY_ITEM }]);

  // Xóa dòng hàng
  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFactoryName('');
    setOrderCustomer('');
    setDeliveryAddress('');
    setReason('');
    setItems([{ ...EMPTY_ITEM }]);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!factoryName.trim()) return toast.warning('Vui lòng nhập Tên nhà may/kho.');

    // Validate items
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.itemCode.trim() || !it.itemName.trim() || !it.color.trim() || !it.quantity || Number(it.quantity) <= 0) {
        return toast.warning(`Dòng hàng ${i + 1}: thiếu thông tin hoặc số lượng không hợp lệ.`);
      }
    }

    setLoading(true);
    try {
      await axios.post('/api/inventory', {
        type: txType,
        factoryName: factoryName.trim(),
        orderCustomer: orderCustomer.trim(),
        deliveryAddress: deliveryAddress.trim(),
        reason: reason.trim(),
        items: items.map(it => ({ ...it, quantity: Number(it.quantity) })),
      }, authConfig);

      toast.success(txType === 'import' ? 'Đã nhập kho thành công!' : 'Đã xuất kho thành công!');
      resetForm();
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const deleteHandler = async () => {
    try {
      await axios.delete(`/api/inventory/${deleteId}`, authConfig);
      setTransactions(t => t.filter(x => x._id !== deleteId));
      setIsDeleteModalOpen(false);
      toast.success('Đã xóa phiếu');
    } catch {
      toast.error('Lỗi khi xóa');
    }
  };

  const totalItems = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827] relative">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 h-full transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <AdminHeader title="Lịch Sử Xuất Nhập (BTP)" />
        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center gap-4 shrink-0">
          <button className="lg:hidden text-gray-500 hover:text-[#006B4D]" onClick={() => setIsSidebarOpen(true)}><FaBars size={20} /></button>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold flex items-center gap-2">
              <FaBoxOpen className="text-[#006B4D]" /> Quản Lý Xuất Nhập (BTP)
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Ghi nhận hàng bán thành phẩm in vải – nhiều style / màu mỗi phiếu</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6">

            {/* ══════════════ FORM ══════════════ */}
            {isAdmin && (
              <div className="xl:w-[420px] shrink-0">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 sticky top-6">
                  <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                    <FaExchangeAlt className="text-gray-400" /> Tạo Phiếu Giao Dịch Mới
                  </h2>

                  {/* Toggle type */}
                  <div className="flex bg-gray-100 p-1 rounded-xl mb-5">
                    {['import', 'export'].map(t => (
                      <button key={t} type="button"
                        onClick={() => setTxType(t)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${txType === t ? (t === 'import' ? 'bg-[#006B4D] text-white shadow' : 'bg-orange-500 text-white shadow') : 'text-gray-500'}`}
                      >{t === 'import' ? 'Nhập Hàng' : 'Xuất Hàng'}</button>
                    ))}
                  </div>

                  <form onSubmit={submitHandler} className="space-y-4 text-sm">
                    {/* ─── Info chung ─── */}
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="font-bold text-gray-600 mb-1 block">Tên Nhà may / Kho <span className="text-red-500">*</span></label>
                        <input value={factoryName} onChange={e => setFactoryName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#006B4D]"
                          placeholder="VD: Xưởng A, Nhà may Bình Minh..." />
                      </div>
                      <div>
                        <label className="font-bold text-gray-600 mb-1 block">Khách hàng đặt Order (Brand)</label>
                        <input value={orderCustomer} onChange={e => setOrderCustomer(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#006B4D]"
                          placeholder="VD: Adidas VN, HueOneFood..." />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-gray-600 mb-1 block">Địa chỉ giao</label>
                          <input value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#006B4D]"
                            placeholder="..." />
                        </div>
                        <div>
                          <label className="font-bold text-gray-600 mb-1 block">Lý do</label>
                          <input value={reason} onChange={e => setReason(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#006B4D]"
                            placeholder="Giao hàng theo PO..." />
                        </div>
                      </div>
                    </div>

                    {/* ─── Danh sách mặt hàng ─── */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-gray-700 flex items-center gap-1"><FaLayerGroup size={12} /> Danh sách hàng hóa <span className="text-red-500">*</span></label>
                        <button type="button" onClick={addItemRow}
                          className="text-xs flex items-center gap-1 text-[#006B4D] hover:underline font-bold">
                          <FaPlus size={10} /> Thêm dòng
                        </button>
                      </div>

                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                        {items.map((it, idx) => (
                          <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 relative">
                            {/* Số thứ tự & xóa dòng */}
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-black text-[#006B4D] bg-[#E6F0ED] px-2 py-0.5 rounded">#{idx + 1}</span>
                              {items.length > 1 && (
                                <button type="button" onClick={() => removeItemRow(idx)} className="text-gray-400 hover:text-red-500 transition">
                                  <FaMinus size={12} />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[11px] text-gray-500 font-bold">Mã hàng (PO) *</label>
                                <input value={it.itemCode} onChange={e => updateItem(idx, 'itemCode', e.target.value.toUpperCase())}
                                  className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#006B4D] font-bold uppercase"
                                  placeholder="QP1, ABC-001..." />
                              </div>
                              <div>
                                <label className="text-[11px] text-gray-500 font-bold">Màu sắc *</label>
                                <input value={it.color} onChange={e => updateItem(idx, 'color', e.target.value)}
                                  className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#006B4D]"
                                  placeholder="Đen, Trắng, Đỏ..." />
                              </div>
                              <div className="col-span-2">
                                <label className="text-[11px] text-gray-500 font-bold">Tên BTP / Loại vải *</label>
                                <input value={it.itemName} onChange={e => updateItem(idx, 'itemName', e.target.value)}
                                  className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#006B4D]"
                                  placeholder="Áo thun, Quần short..." />
                              </div>
                              <div>
                                <label className="text-[11px] text-gray-500 font-bold">Số lượng *</label>
                                <input type="number" min="1" value={it.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                  className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#006B4D] font-bold"
                                  placeholder="0" />
                              </div>
                              <div>
                                <label className="text-[11px] text-gray-500 font-bold">Đơn vị</label>
                                <input value={it.unit} onChange={e => updateItem(idx, 'unit', e.target.value)}
                                  className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#006B4D]" />
                              </div>
                              <div className="col-span-2">
                                <label className="text-[11px] text-gray-500 font-bold">Ghi chú dòng</label>
                                <input value={it.note} onChange={e => updateItem(idx, 'note', e.target.value)}
                                  className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#006B4D]"
                                  placeholder="(Không bắt buộc)" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tổng SL preview */}
                      <div className="flex justify-end mt-2 text-xs text-gray-500 font-bold">
                        {items.length} mặt hàng • Tổng SL: <span className="text-[#006B4D] ml-1">{totalItems.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                      className={`w-full py-3 rounded-xl text-white font-bold flex justify-center items-center gap-2 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${txType === 'import' ? 'bg-[#006B4D] hover:bg-[#00543C]' : 'bg-orange-500 hover:bg-orange-600'}`}
                    >
                      {txType === 'import' ? <FaPlus /> : <FaFileExport />}
                      {loading ? 'Đang xử lý...' : (txType === 'import' ? 'Xác Nhận Nhập Kho' : 'Xác Nhận Xuất Kho')}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ══════════════ LIST ══════════════ */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-extrabold">Lịch Sử Phiếu Giao Dịch</h3>
                  <span className="text-xs font-bold text-[#006B4D] bg-[#E6F0ED] px-2 py-1 rounded-md">{transactions.length} phiếu</span>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead>
                      <tr className="text-gray-400 text-xs uppercase font-bold border-b border-gray-100 bg-white">
                        <th className="py-3 px-4">Thời gian</th>
                        <th className="py-3 px-4">Loại</th>
                        <th className="py-3 px-4">Nhà may / Kho</th>
                        <th className="py-3 px-4">Khách đặt Order</th>
                        <th className="py-3 px-4 text-center">Số mặt hàng</th>
                        <th className="py-3 px-4 text-right">Tổng SL</th>
                        <th className="py-3 px-4 text-center">Phiếu</th>
                        {isAdmin && <th className="py-3 px-4 text-center">Xóa</th>}
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-50">
                      {transactions.length === 0 && (
                        <tr><td colSpan={8} className="text-center py-12 text-gray-400">Chưa có phiếu nào.</td></tr>
                      )}
                      {transactions.map(tx => {
                        const totalQty = tx.items?.reduce((s, it) => s + it.quantity, 0) || 0;
                        return (
                          <tr key={tx._id} className="hover:bg-gray-50 transition">
                            <td className="py-3 px-4">
                              <div className="font-bold text-gray-700 text-xs">{new Date(tx.date || tx.createdAt).toLocaleDateString('vi-VN')}</div>
                              <div className="text-[10px] text-gray-400">{new Date(tx.date || tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td className="py-3 px-4">
                              {tx.type === 'import'
                                ? <span className="inline-flex items-center gap-1 text-xs font-bold text-[#006B4D] bg-[#E6F0ED] px-2 py-1 rounded"><FaPlus size={9} /> NHẬP</span>
                                : <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded"><FaFileExport size={9} /> XUẤT</span>
                              }
                            </td>
                            <td className="py-3 px-4 font-bold text-gray-800">{tx.factoryName}</td>
                            <td className="py-3 px-4 text-gray-500 text-xs">{tx.orderCustomer || <span className="italic text-gray-300">—</span>}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center gap-1 font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs">
                                <FaLayerGroup size={9} className="text-gray-400" /> {tx.items?.length || 0}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`text-base font-black ${tx.type === 'import' ? 'text-[#006B4D]' : 'text-orange-500'}`}>
                                {tx.type === 'import' ? '+' : '-'}{totalQty.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => setViewSlip(tx)}
                                className="mx-auto w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-purple-100 hover:text-purple-600 transition"
                                title="Xem & In Phiếu"
                              >
                                <FaPrint size={13} />
                              </button>
                            </td>
                            {isAdmin && (
                              <td className="py-3 px-4 text-center">
                                <button onClick={() => { setDeleteId(tx._id); setIsDeleteModalOpen(true); }}
                                  className="text-gray-400 hover:text-red-500 transition"><FaTrash size={13} /></button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card */}
                <div className="md:hidden flex flex-col p-4 gap-3 bg-gray-50">
                  {transactions.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">Chưa có phiếu nào.</div>}
                  {transactions.map(tx => {
                    const totalQty = tx.items?.reduce((s, i) => s + i.quantity, 0) || 0;
                    return (
                      <div key={tx._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          {tx.type === 'import'
                            ? <span className="text-[10px] font-bold text-[#006B4D] bg-[#E6F0ED] px-2 py-1 rounded">NHẬP KHO</span>
                            : <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">XUẤT KHO</span>
                          }
                          <span className="text-xs text-gray-400">{new Date(tx.date || tx.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="font-bold text-gray-800">{tx.factoryName}</div>
                        {tx.orderCustomer && <div className="text-xs text-gray-500 mt-0.5">Order: {tx.orderCustomer}</div>}
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                          <div className="text-xs text-gray-500">{tx.items?.length || 0} mặt hàng</div>
                          <span className={`text-lg font-black ${tx.type === 'import' ? 'text-[#006B4D]' : 'text-orange-500'}`}>
                            {tx.type === 'import' ? '+' : '-'}{totalQty.toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <button onClick={() => setViewSlip(tx)} className="text-xs font-bold text-purple-600 flex items-center gap-1 hover:underline">
                            <FaPrint size={11} /> Xem Phiếu
                          </button>
                          {isAdmin && (
                            <button onClick={() => { setDeleteId(tx._id); setIsDeleteModalOpen(true); }} className="text-gray-400 hover:text-red-500 transition">
                              <FaTrash size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Print Slip Modal */}
      {viewSlip && <ExportSlipTemplate transaction={viewSlip} onClose={() => setViewSlip(null)} />}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteHandler}
        title="Xóa Phiếu"
        message="Xác nhận xóa phiếu giao dịch này? Tồn kho có thể bị ảnh hưởng."
      />
    </div>
  );
};

export default InventoryScreen;
