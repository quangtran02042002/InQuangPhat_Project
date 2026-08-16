import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConfirmModal from '../../../components/ConfirmModal';
import {
  FaPlus, FaTimes, FaEdit, FaTrash, FaCheck,
  FaShoppingCart, FaFilter, FaTruck,
  FaBoxOpen, FaSave,
  FaExclamationTriangle, FaClock, FaCheckCircle,
  FaInfoCircle
} from 'react-icons/fa';

const STATUS_BADGE = {
  pending: { label: 'Chờ đặt', color: 'bg-gray-100 text-gray-600', icon: <FaClock className="text-[10px]" /> },
  ordered: { label: 'Đã đặt', color: 'bg-blue-100 text-blue-700', icon: <FaTruck className="text-[10px]" /> },
  delivered: { label: 'Đã nhận', color: 'bg-emerald-100 text-emerald-700', icon: <FaCheckCircle className="text-[10px]" /> },
};

const getOrderStatus = (order) => {
  if (order.isDelivered) return 'delivered';
  if (order.isOrdered) return 'ordered';
  return 'pending';
};

const MaterialOrderTab = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${userInfo?.token}` } }), [userInfo?.token]);

  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [toggling, setToggling] = useState(null);
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', itemName: '', onConfirm: null, isDanger: true });

  // Form
  const [form, setForm] = useState({
    materialId: '', materialName: '', materialUnit: '',
    quantity: '', supplier: '', unitPrice: '',
    orderDate: new Date().toISOString().slice(0, 10),
    expectedDate: '', note: '', isNewMaterial: false,
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [ordersRes, materialsRes, suppliersRes] = await Promise.all([
        axios.get('/api/material-orders', config),
        axios.get('/api/materials'),
        axios.get('/api/v1/suppliers', config).catch(() => ({ data: [] })),
      ]);
      setOrders(ordersRes.data);
      setMaterials(materialsRes.data);
      setSuppliers(suppliersRes.data?.suppliers || suppliersRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filteredOrders = useMemo(() => {
    if (!filterStatus) return orders;
    return orders.filter(o => getOrderStatus(o) === filterStatus);
  }, [orders, filterStatus]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => !o.isOrdered && !o.isDelivered).length,
    ordered: orders.filter(o => o.isOrdered && !o.isDelivered).length,
    delivered: orders.filter(o => o.isDelivered).length,
  }), [orders]);

  const openCreate = () => {
    setEditingOrder(null);
    setForm({
      materialId: '', materialName: '', materialUnit: '',
      quantity: '', supplier: '', unitPrice: '',
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDate: '', note: '', isNewMaterial: false,
    });
    setShowModal(true);
  };

  const openEdit = (order) => {
    setEditingOrder(order);
    setForm({
      materialId: order.material?._id || '',
      materialName: order.materialName,
      materialUnit: order.materialUnit,
      quantity: order.quantity,
      supplier: order.supplier || '',
      unitPrice: order.unitPrice || '',
      orderDate: order.orderDate ? new Date(order.orderDate).toISOString().slice(0, 10) : '',
      expectedDate: order.expectedDate ? new Date(order.expectedDate).toISOString().slice(0, 10) : '',
      note: order.note || '',
      isNewMaterial: false,
    });
    setShowModal(true);
  };

  const handleMaterialSelect = (e) => {
    const val = e.target.value;
    if (val === '__new__') {
      setForm({ ...form, materialId: '', materialName: '', materialUnit: '', isNewMaterial: true });
    } else if (val) {
      const mat = materials.find(m => m._id === val);
      if (mat) {
        setForm({ ...form, materialId: mat._id, materialName: mat.name, materialUnit: mat.unit, isNewMaterial: false });
      }
    } else {
      setForm({ ...form, materialId: '', materialName: '', materialUnit: '', isNewMaterial: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, createdBy: userInfo?.name || 'Admin' };
      if (editingOrder) {
        await axios.put(`/api/material-orders/${editingOrder._id}`, payload, config);
        toast.success('Đã cập nhật đơn đặt hàng');
      } else {
        await axios.post('/api/material-orders', payload, config);
        toast.success('Đã tạo đơn đặt hàng mới');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu đơn');
    }
  };

  const handleToggleOrdered = async (order) => {
    try {
      await axios.put(`/api/material-orders/${order._id}`, { isOrdered: !order.isOrdered }, config);
      toast.success(order.isOrdered ? 'Đã bỏ trạng thái Đã đặt' : 'Đã xác nhận Đã đặt hàng NCC');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi');
    }
  };

  const handleToggleDelivered = (order) => {
    const actionMessage = order.isDelivered
      ? `Bỏ tick "Hàng đã về" sẽ TRỪ LẠI ${order.quantity} ${order.materialUnit} khỏi kho vật tư.`
      : `Xác nhận "Hàng đã về" sẽ TỰ ĐỘNG CỘNG ${order.quantity} ${order.materialUnit} VÀO KHO VẬT TƯ.`;

    setConfirmState({
      isOpen: true,
      title: order.isDelivered ? 'Xác nhận hoàn tác nhập kho' : 'Xác nhận hàng đã về kho',
      message: actionMessage,
      itemName: `${order.orderCode} - ${order.materialName}`,
      isDanger: order.isDelivered,
      onConfirm: async () => {
        setToggling(order._id);
        try {
          const { data } = await axios.put(`/api/material-orders/${order._id}/toggle-delivered`, {}, config);
          toast.success(data.message || 'Cập nhật kho thành công');
          setConfirmState({ isOpen: false, title: '', message: '', itemName: '', onConfirm: null, isDanger: true });
          fetchAll();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Lỗi');
        } finally {
          setToggling(null);
        }
      },
    });
  };

  const handleDelete = (id) => {
    const order = orders.find(o => o._id === id);
    const warningMessage = order?.isDelivered
      ? `Đơn này đã nhận hàng! Xóa đơn sẽ TRỪ LẠI ${order.quantity} ${order.materialUnit} khỏi kho.`
      : 'Bạn có chắc chắn muốn xóa đơn đặt hàng này khỏi danh sách?';

    setConfirmState({
      isOpen: true,
      title: 'Xác nhận xóa đơn đặt hàng',
      message: warningMessage,
      itemName: `${order?.orderCode} - ${order?.materialName}`,
      isDanger: true,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/material-orders/${id}`, config);
          toast.success('Đã xóa đơn đặt hàng');
          setConfirmState({ isOpen: false, title: '', message: '', itemName: '', onConfirm: null, isDanger: true });
          fetchAll();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Lỗi khi xóa đơn');
        }
      },
    });
  };

  const formatCurrency = (val) => {
    if (!val) return '—';
    return Number(val).toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

  // --- RENDER ORDER CARD (Mobile) ---
  const renderOrderCard = (order) => {
    const status = getOrderStatus(order);
    const badge = STATUS_BADGE[status];

    return (
      <div key={order._id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#006B4D] bg-[#E6F0ED] px-2 py-0.5 rounded-lg">
              {order.orderCode}
            </span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${badge.color}`}>
              {badge.icon} {badge.label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {!order.isDelivered && (
              <button onClick={() => openEdit(order)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition">
                <FaEdit className="text-xs" />
              </button>
            )}
            <button onClick={() => handleDelete(order._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition">
              <FaTrash className="text-xs" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2">
            <FaBoxOpen className="text-gray-400 text-xs shrink-0" />
            <span className="text-sm font-bold text-[#111827] truncate">{order.materialName}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <span><strong>Số lượng:</strong> {order.quantity} {order.materialUnit}</span>
            <span><strong>NCC:</strong> {order.supplier || '—'}</span>
            <span><strong>Đơn giá:</strong> {formatCurrency(order.unitPrice)}</span>
            <span><strong>Thành tiền:</strong> {formatCurrency(order.totalPrice)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
            <span>📅 Đặt: {formatDate(order.orderDate)}</span>
            <span>📦 Dự kiến: {formatDate(order.expectedDate)}</span>
          </div>
          {order.note && (
            <p className="text-[10px] text-gray-400 italic">📝 {order.note}</p>
          )}
        </div>

        {/* Checklist */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          {/* Đã đặt */}
          <button
            onClick={() => handleToggleOrdered(order)}
            disabled={order.isDelivered}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition border
              ${order.isOrdered
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-blue-50 hover:border-blue-200'
              }
              ${order.isDelivered ? 'cursor-not-allowed opacity-60' : 'active:scale-95'}
            `}
          >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center
              ${order.isOrdered ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}
            `}>
              {order.isOrdered && <FaCheck className="text-[8px]" />}
            </div>
            Đã đặt
          </button>

          {/* Hàng đã về */}
          <button
            onClick={() => handleToggleDelivered(order)}
            disabled={toggling === order._id}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition border
              ${order.isDelivered
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-emerald-50 hover:border-emerald-200'
              }
              ${toggling === order._id ? 'cursor-wait' : 'active:scale-95'}
            `}
          >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center
              ${order.isDelivered ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'}
            `}>
              {order.isDelivered && <FaCheck className="text-[8px]" />}
            </div>
            {toggling === order._id ? 'Đang xử lý...' : 'Hàng đã về'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-lg sm:text-xl shadow-sm">
            <FaShoppingCart />
          </div>
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-[#111827]">Đơn đặt Nguyên vật liệu</h2>
            <p className="text-[#6B7280] text-[11px] mt-0.5">Theo dõi đặt hàng & nhập kho NVL</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#006B4D] hover:bg-[#00543c] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md active:scale-95"
        >
          <FaPlus /> Tạo đơn đặt hàng
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center cursor-pointer hover:border-[#006B4D]/30 transition" onClick={() => setFilterStatus('')}>
          <div className="text-2xl font-extrabold text-[#111827]">{stats.total}</div>
          <div className="text-[10px] font-bold text-gray-500 uppercase">Tổng đơn</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center cursor-pointer hover:border-gray-400 transition" onClick={() => setFilterStatus('pending')}>
          <div className="text-2xl font-extrabold text-gray-600">{stats.pending}</div>
          <div className="text-[10px] font-bold text-gray-500 uppercase">Chờ đặt</div>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 p-3 text-center cursor-pointer hover:border-blue-400 transition" onClick={() => setFilterStatus('ordered')}>
          <div className="text-2xl font-extrabold text-blue-600">{stats.ordered}</div>
          <div className="text-[10px] font-bold text-blue-500 uppercase">Đã đặt</div>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-3 text-center cursor-pointer hover:border-emerald-400 transition" onClick={() => setFilterStatus('delivered')}>
          <div className="text-2xl font-extrabold text-emerald-600">{stats.delivered}</div>
          <div className="text-[10px] font-bold text-emerald-500 uppercase">Đã nhận</div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2 text-xs text-blue-700">
        <FaInfoCircle className="shrink-0" />
        <span>Khi tick <strong>"Hàng đã về"</strong> → số lượng sẽ được <strong>tự động cộng vào kho vật tư</strong> & tạo phiếu nhập kho.</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1 text-[11px] text-gray-500">
          <FaFilter /> Lọc:
        </div>
        {[
          { value: '', label: 'Tất cả' },
          { value: 'pending', label: 'Chờ đặt' },
          { value: 'ordered', label: 'Đã đặt' },
          { value: 'delivered', label: 'Đã nhận' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition border
              ${filterStatus === tab.value
                ? 'bg-[#006B4D] text-white border-[#006B4D]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#006B4D]/30'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006B4D] mx-auto mb-4" />
          <div className="text-gray-500 font-medium">Đang tải...</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <FaShoppingCart className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-500">Chưa có đơn đặt hàng nào</p>
          <p className="text-xs text-gray-400 mt-1">Nhấn "Tạo đơn đặt hàng" để bắt đầu</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-bold text-xs text-gray-500 uppercase">Mã đơn</th>
                    <th className="text-left px-4 py-3 font-bold text-xs text-gray-500 uppercase">Vật tư</th>
                    <th className="text-center px-4 py-3 font-bold text-xs text-gray-500 uppercase">SL</th>
                    <th className="text-left px-4 py-3 font-bold text-xs text-gray-500 uppercase">NCC</th>
                    <th className="text-right px-4 py-3 font-bold text-xs text-gray-500 uppercase">Đơn giá</th>
                    <th className="text-right px-4 py-3 font-bold text-xs text-gray-500 uppercase">Thành tiền</th>
                    <th className="text-center px-4 py-3 font-bold text-xs text-gray-500 uppercase">Ngày đặt</th>
                    <th className="text-center px-4 py-3 font-bold text-xs text-gray-500 uppercase">☑ Đã đặt</th>
                    <th className="text-center px-4 py-3 font-bold text-xs text-gray-500 uppercase">☑ Hàng về</th>
                    <th className="text-center px-4 py-3 font-bold text-xs text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, idx) => {
                    const status = getOrderStatus(order);
                    const badge = STATUS_BADGE[status];
                    return (
                      <tr key={order._id} className={`border-b border-gray-100 hover:bg-gray-50/50 transition ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                        <td className="px-4 py-3">
                          <span className="text-xs font-extrabold text-[#006B4D] bg-[#E6F0ED] px-2 py-0.5 rounded-lg">
                            {order.orderCode}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-[#111827] text-sm">{order.materialName}</div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badge.color} inline-flex items-center gap-1 mt-0.5`}>
                            {badge.icon} {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold">{order.quantity} <span className="text-gray-400 text-xs">{order.materialUnit}</span></td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{order.supplier || '—'}</td>
                        <td className="px-4 py-3 text-right text-xs text-gray-600">{formatCurrency(order.unitPrice)}</td>
                        <td className="px-4 py-3 text-right text-xs font-bold text-[#111827]">{formatCurrency(order.totalPrice)}</td>
                        <td className="px-4 py-3 text-center text-xs text-gray-500">{formatDate(order.orderDate)}</td>

                        {/* Checkbox: Đã đặt */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleOrdered(order)}
                            disabled={order.isDelivered}
                            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center mx-auto transition
                              ${order.isOrdered
                                ? 'bg-blue-500 border-blue-500 text-white'
                                : 'border-gray-300 hover:border-blue-400 text-transparent hover:text-blue-400'
                              }
                              ${order.isDelivered ? 'cursor-not-allowed opacity-60' : 'cursor-pointer active:scale-90'}
                            `}
                          >
                            <FaCheck className="text-xs" />
                          </button>
                        </td>

                        {/* Checkbox: Hàng đã về */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleDelivered(order)}
                            disabled={toggling === order._id}
                            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center mx-auto transition
                              ${order.isDelivered
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-gray-300 hover:border-emerald-400 text-transparent hover:text-emerald-400'
                              }
                              ${toggling === order._id ? 'cursor-wait animate-pulse' : 'cursor-pointer active:scale-90'}
                            `}
                          >
                            {toggling === order._id ? (
                              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FaCheck className="text-xs" />
                            )}
                          </button>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {!order.isDelivered && (
                              <button onClick={() => openEdit(order)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition" title="Sửa">
                                <FaEdit className="text-xs" />
                              </button>
                            )}
                            <button onClick={() => handleDelete(order._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition" title="Xóa">
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List */}
          <div className="lg:hidden space-y-3">
            {filteredOrders.map(renderOrderCard)}
          </div>
        </>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-3 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-[#111827]">
                {editingOrder ? '✏️ Sửa đơn đặt hàng' : '➕ Tạo đơn đặt hàng NVL'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <FaTimes className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-3 py-3 sm:p-4 space-y-4">
              {!editingOrder && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Chọn vật tư *</label>
                  <select
                    value={form.isNewMaterial ? '__new__' : form.materialId}
                    onChange={handleMaterialSelect}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none"
                  >
                    <option value="">-- Chọn vật tư có sẵn --</option>
                    {materials.map(m => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.unit}) — Tồn: {m.quantity}
                      </option>
                    ))}
                    <option value="__new__">➕ Tạo vật tư mới...</option>
                  </select>
                </div>
              )}

              {(form.isNewMaterial || editingOrder) && (
                <div className={`${form.isNewMaterial ? 'bg-amber-50 border border-amber-200 rounded-xl p-3' : ''}`}>
                  {form.isNewMaterial && (
                    <p className="text-xs text-amber-700 font-bold mb-2 flex items-center gap-1">
                      <FaExclamationTriangle /> Vật tư mới — sẽ tự động thêm vào kho khi hàng về
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Tên vật tư *</label>
                      <input
                        type="text"
                        required
                        value={form.materialName}
                        onChange={(e) => setForm({ ...form, materialName: e.target.value })}
                        placeholder="VD: Giấy Couche 300gsm"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none"
                        readOnly={!!editingOrder}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Đơn vị *</label>
                      <input
                        type="text"
                        required
                        value={form.materialUnit}
                        onChange={(e) => setForm({ ...form, materialUnit: e.target.value })}
                        placeholder="Ram, Kg, Thùng"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none"
                        readOnly={!!editingOrder}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Số lượng đặt *</label>
                  <input
                    type="number"
                    required
                    min="0.001"
                    step="any"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="VD: 50"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nhà cung cấp</label>
                  <input
                    type="text"
                    list="supplier-list"
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    placeholder="Chọn hoặc nhập tay"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none"
                  />
                  <datalist id="supplier-list">
                    {suppliers.map(s => (
                      <option key={s._id} value={s.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Đơn giá (đ)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Thành tiền</label>
                  <div className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 text-sm font-bold text-[#111827]">
                    {formatCurrency((Number(form.quantity) || 0) * (Number(form.unitPrice) || 0))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Ngày đặt</label>
                  <input
                    type="date"
                    value={form.orderDate}
                    onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Dự kiến nhận hàng</label>
                  <input
                    type="date"
                    value={form.expectedDate}
                    onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Ghi chú</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={2}
                  placeholder="Ghi chú thêm..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#006B4D] hover:bg-[#00543c] text-white font-bold py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                <FaSave /> {editingOrder ? 'Cập nhật' : 'Tạo đơn đặt hàng'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, title: '', message: '', itemName: '', onConfirm: null, isDanger: true })}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        itemName={confirmState.itemName}
        isDanger={confirmState.isDanger}
        confirmText="Xác nhận"
        cancelText="Hủy bỏ"
      />
    </div>
  );
};

export default MaterialOrderTab;
