import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    FaWarehouse, FaTrash, FaPlus, FaExclamationTriangle,
    FaSearch, FaTimes, FaClipboardList, FaArrowDown, FaArrowUp,
    FaUser, FaStickyNote, FaBoxOpen, FaSync, FaFilter,
} from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';
import AdminHeader from '../../components/AdminHeader';

// ============================================================
// HELPERS
// ============================================================
const formatQty = (num) => Number(num).toLocaleString('vi-VN');
const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'vừa xong';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    const d = Math.floor(h / 24);
    return `${d} ngày trước`;
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const MaterialScreen = () => {
    // ---------- TAB STATE ----------
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'dispatch'

    // ---------- SHARED STATE ----------
    const [materials, setMaterials] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // ---------- INVENTORY TAB STATE ----------
    const [formData, setFormData] = useState({
        name: '', unit: '', quantity: 0, minStock: 10, note: '',
    });
    const [editQuantity, setEditQuantity] = useState({});
    const [deleteId, setDeleteId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);

    // ---------- DISPATCH TAB STATE ----------
    const [dispatches, setDispatches] = useState([]);
    const [dispatchLoading, setDispatchLoading] = useState(false);
    
    // Multiple Items state
    const [dispatchItems, setDispatchItems] = useState([]);
    const [currentItem, setCurrentItem] = useState({ materialId: '', quantity: '' });
    const [dispatchSearchTerm, setDispatchSearchTerm] = useState('');
    const [showDispatchDropdown, setShowDispatchDropdown] = useState(false);

    const [dispatchForm, setDispatchForm] = useState({
        type: 'xuat',
        recipient: '',
        note: '',
    });
    const [dispatchSubmitting, setDispatchSubmitting] = useState(false);
    const [filterType, setFilterType] = useState('all'); // 'all' | 'nhap' | 'xuat'
    const [filterMaterial, setFilterMaterial] = useState('');
    const [dispatchKeyword, setDispatchKeyword] = useState('');
    const [expandedDispatchId, setExpandedDispatchId] = useState(null);

    // ============================================================
    // FETCH
    // ============================================================
    const fetchMaterials = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/materials', config);
            setMaterials(data);
        } catch {
            toast.error('Lỗi tải danh sách vật tư');
        }
    }, [userInfo.token]);

    const fetchDispatches = useCallback(async () => {
        setDispatchLoading(true);
        try {
            const config = { 
                headers: { Authorization: `Bearer ${userInfo.token}` },
                params: filterMaterial ? { material: filterMaterial } : {}
            };
            const { data } = await axios.get('/api/materials/dispatches', config);
            setDispatches(data);
        } catch {
            toast.error('Lỗi tải lịch sử cấp phát');
        } finally {
            setDispatchLoading(false);
        }
    }, [filterMaterial, userInfo.token]);

    useEffect(() => { fetchMaterials(); }, [fetchMaterials]);
    useEffect(() => {
        if (activeTab === 'dispatch') fetchDispatches();
    }, [activeTab, fetchDispatches]);

    // ============================================================
    // INVENTORY HANDLERS
    // ============================================================
    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post('/api/materials', formData, config);
            toast.success('Đã thêm vật tư mới');
            setFormData({ name: '', unit: '', quantity: 0, minStock: 10, note: '' });
            setIsAddFormOpen(false);
            fetchMaterials();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi thêm');
        }
    };

    const updateQuantity = async (id, currentQty) => {
        const newQty = editQuantity[id];
        if (newQty === undefined || Number(newQty) === currentQty) return;
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`/api/materials/${id}`, { quantity: Number(newQty) }, config);
            toast.success('Cập nhật tồn kho thành công');
            fetchMaterials();
        } catch {
            toast.error('Lỗi cập nhật');
        }
    };

    const deleteHandler = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`/api/materials/${deleteId}`, config);
            setMaterials(materials.filter((x) => x._id !== deleteId));
            setIsModalOpen(false);
            toast.success('Đã xóa vật tư');
        } catch {
            toast.error('Lỗi khi xóa');
        }
    };

    const filteredMaterials = materials.filter(
        (m) =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.note && m.note.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const lowStockMaterials = materials.filter((m) => m.quantity <= m.minStock);

    // ============================================================
    // DISPATCH HANDLERS
    // ============================================================
    const handleAddItem = () => {
        if (!currentItem.materialId) {
            toast.warning('Vui lòng chọn vật tư');
            return;
        }
        if (!currentItem.quantity || Number(currentItem.quantity) <= 0) {
            toast.warning('Số lượng phải lớn hơn 0');
            return;
        }

        const material = materials.find(m => m._id === currentItem.materialId);
        if (!material) return;

        const existing = dispatchItems.find(item => item.materialId === currentItem.materialId);
        if (existing) {
            toast.warning('Vật tư này đã có trong phiếu. Vui lòng xóa đi để thêm lại nếu cần đổi số lượng.');
            return;
        }

        if (dispatchForm.type === 'xuat' && Number(currentItem.quantity) > material.quantity) {
            toast.warning(`Không đủ tồn kho! Chỉ còn ${material.quantity} ${material.unit}`);
            return;
        }

        setDispatchItems([...dispatchItems, {
            materialId: currentItem.materialId,
            name: material.name,
            unit: material.unit,
            stock: material.quantity,
            quantity: Number(currentItem.quantity)
        }]);

        setCurrentItem({ materialId: '', quantity: '' });
        setDispatchSearchTerm('');
    };

    const handleRemoveItem = (materialId) => {
        setDispatchItems(dispatchItems.filter(item => item.materialId !== materialId));
    };

    const handleDispatchSubmit = async (e) => {
        e.preventDefault();
        if (dispatchItems.length === 0) {
            toast.warning('Vui lòng thêm ít nhất 1 mặt hàng vào phiếu');
            return;
        }
        setDispatchSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post('/api/materials/dispatches', {
                items: dispatchItems,
                type: dispatchForm.type,
                recipient: dispatchForm.recipient,
                note: dispatchForm.note,
                createdBy: userInfo.name,
            }, config);

            const typeLabel = dispatchForm.type === 'nhap' ? 'Nhập kho' : 'Xuất kho';
            toast.success(data.message || `✅ ${typeLabel} thành công!`);

            if (data.isLow) {
                toast.warning(`⚠️ Cảnh báo: Có mặt hàng đã xuống dưới ngưỡng an toàn!`, { autoClose: 6000 });
            }

            setDispatchForm({ type: 'xuat', recipient: '', note: '' });
            setDispatchItems([]);
            await fetchMaterials();
            await fetchDispatches();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi tạo phiếu cấp phát');
        } finally {
            setDispatchSubmitting(false);
        }
    };

    const filteredDispatches = dispatches.filter((d) => {
        if (filterType !== 'all' && d.type !== filterType) return false;
        if (!dispatchKeyword) return true;
        const kw = dispatchKeyword.toLowerCase();
        const inRecipient = d.recipient?.toLowerCase().includes(kw);
        const inNote = d.note?.toLowerCase().includes(kw);
        const inItems = d.items?.some(i => i.materialName?.toLowerCase().includes(kw));
        return inRecipient || inNote || inItems;
    });

    const totalNhap = dispatches.filter((d) => d.type === 'nhap').reduce((s, d) => {
        if (d.items && d.items.length > 0) {
            return s + d.items.reduce((sum, i) => sum + i.quantity, 0);
        }
        return s + (d.quantity || 0);
    }, 0);
    const totalXuat = dispatches.filter((d) => d.type === 'xuat').reduce((s, d) => {
        if (d.items && d.items.length > 0) {
            return s + d.items.reduce((sum, i) => sum + i.quantity, 0);
        }
        return s + (d.quantity || 0);
    }, 0);

    // ============================================================
    // SELECTED MATERIAL INFO (for dispatch form)
    // ============================================================
    const selectedMaterial = materials.find((m) => m._id === currentItem.materialId);
    const dispatchDropdownOptions = materials.filter(m => m.name.toLowerCase().includes(dispatchSearchTerm.toLowerCase()));

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827] relative">

            {/* OVERLAY & SIDEBAR MOBILE */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-[#111827]/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <div className={`fixed inset-y-0 left-0 z-50 h-full transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0 lg:block`}>
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col w-full overflow-hidden">

                {/* ADMIN HEADER */}
                <AdminHeader
                    title="Kho Vật Tư (Giấy/Kẽm)"
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                {/* ── TAB BAR ── */}
                <header className="bg-white border-b border-gray-200 px-4 md:px-8 shrink-0 flex flex-col sm:flex-row justify-between gap-0">
                    <nav className="flex gap-1 text-sm font-medium overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`flex items-center gap-2 whitespace-nowrap px-5 py-3.5 border-b-2 transition-colors ${
                                activeTab === 'inventory'
                                    ? 'border-[#006B4D] text-[#006B4D] font-extrabold'
                                    : 'border-transparent text-[#6B7280] hover:text-[#111827]'
                            }`}
                        >
                            <FaWarehouse className="text-xs" />
                            Kho Tồn Kho
                            {lowStockMaterials.length > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ml-1">
                                    {lowStockMaterials.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('dispatch')}
                            className={`flex items-center gap-2 whitespace-nowrap px-5 py-3.5 border-b-2 transition-colors ${
                                activeTab === 'dispatch'
                                    ? 'border-[#006B4D] text-[#006B4D] font-extrabold'
                                    : 'border-transparent text-[#6B7280] hover:text-[#111827]'
                            }`}
                        >
                            <FaClipboardList className="text-xs" />
                            Cấp Phát Vật Tư
                        </button>
                    </nav>
                </header>

                {/* STICKY LOW-STOCK ALERT BANNER */}
                {lowStockMaterials.length > 0 && (
                    <div className="bg-red-50 border-b-2 border-red-200 px-4 md:px-8 py-2.5 flex items-center gap-3 shrink-0">
                        <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shrink-0 animate-pulse">
                            <FaExclamationTriangle className="text-white text-xs" />
                        </div>
                        <span className="text-red-700 font-bold text-sm flex-1">
                            🚨 {lowStockMaterials.length} mặt hàng đang dưới ngưỡng an toàn:{' '}
                            <span className="font-extrabold">
                                {lowStockMaterials.slice(0, 3).map((m) => m.name).join(', ')}
                                {lowStockMaterials.length > 3 && ` và ${lowStockMaterials.length - 3} khác`}
                            </span>
                        </span>
                        <button
                            onClick={() => setActiveTab('dispatch')}
                            className="text-red-600 font-extrabold text-xs bg-red-100 px-3 py-1.5 rounded-lg hover:bg-red-200 transition shrink-0"
                        >
                            Nhập kho →
                        </button>
                    </div>
                )}

                {/* ====================================================== */}
                {/* TAB 1: KHO TỒN KHO                                      */}
                {/* ====================================================== */}
                {activeTab === 'inventory' && (
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                        <div className="w-full">

                            {/* Title Section */}
                            <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-xl md:text-2xl shadow-sm shrink-0">
                                        <FaWarehouse />
                                    </div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Quản lý Tồn kho Vật tư</h2>
                                        <p className="text-[#6B7280] text-xs md:text-sm mt-0.5">
                                            Theo dõi giấy, kẽm, màng, keo dán và vật tư phụ
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsAddFormOpen(true)}
                                    className="lg:hidden flex items-center gap-2 bg-[#006B4D] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#00543c] transition active:scale-95 shrink-0"
                                >
                                    <FaPlus /> Thêm
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                                {/* CỘT TRÁI: FORM THÊM MỚI */}
                                <div className={`${isAddFormOpen ? 'fixed inset-0 z-50 bg-[#111827]/60 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm' : 'hidden lg:block'}`}>
                                    <div className={`bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl lg:shadow-sm lg:border lg:border-gray-200 w-full max-w-md ${isAddFormOpen ? 'animate-fade-in-up sm:animate-fade-in-down max-h-[90vh] flex flex-col' : 'h-fit'}`}>
                                        <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-[#F9FAFB] rounded-t-2xl">
                                            <h3 className="font-extrabold text-lg text-[#111827] flex items-center">
                                                <FaPlus className="text-[#006B4D] mr-2" /> Thêm Danh Mục Mới
                                            </h3>
                                            {isAddFormOpen && (
                                                <button type="button" onClick={() => setIsAddFormOpen(false)} className="text-gray-400 hover:text-red-500 bg-white p-2 rounded-full shadow-sm transition lg:hidden">
                                                    <FaTimes size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className={`p-5 md:p-6 ${isAddFormOpen ? 'overflow-y-auto' : ''}`}>
                                            <form onSubmit={submitHandler} className="space-y-5">
                                                <div>
                                                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">
                                                        Tên vật tư <span className="text-red-500">*</span>
                                                    </label>
                                                    <input type="text" required className="w-full border border-gray-200 p-3 text-sm md:text-base rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-medium text-[#111827] shadow-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="VD: Giấy Couche 300, Kẽm CTP..." />
                                                </div>
                                                <div className="grid grid-cols-3 gap-3 md:gap-4">
                                                    <div>
                                                        <label className="block text-[10px] md:text-[11px] font-bold text-[#6B7280] uppercase mb-2">
                                                            Đơn vị <span className="text-red-500">*</span>
                                                        </label>
                                                        <input type="text" required className="w-full border border-gray-200 p-3 text-sm md:text-base rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-medium text-[#111827] shadow-sm" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="Ram, Kg..." />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] md:text-[11px] font-bold text-[#6B7280] uppercase mb-2">
                                                            SL Đầu
                                                        </label>
                                                        <input type="number" min="0" step="any" className="w-full border border-gray-200 p-3 text-sm md:text-base rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-medium text-[#111827] shadow-sm" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value === '' ? '' : parseFloat(e.target.value) })} placeholder="0" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] md:text-[11px] font-bold text-[#6B7280] uppercase mb-2">
                                                            Cảnh báo <span className="text-red-500">*</span>
                                                        </label>
                                                        <input type="number" min="0" required className="w-full border border-gray-200 p-3 text-sm md:text-base rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-medium text-[#111827] shadow-sm" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">
                                                        Ghi chú
                                                    </label>
                                                    <input type="text" className="w-full border border-gray-200 p-3 text-sm md:text-base rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-medium text-[#111827] shadow-sm" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="VD: Giấy nhập từ NCC ABC..." />
                                                </div>
                                                <div className="pt-2">
                                                    <button type="submit" className="w-full bg-[#006B4D] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#00543c] transition flex items-center justify-center">
                                                        <FaPlus className="mr-2" /> Tạo danh mục
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* CỘT PHẢI: DANH SÁCH VẬT TƯ */}
                                <div className="lg:col-span-2 flex flex-col gap-4">
                                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center w-full sm:w-auto text-[#6B7280] font-bold">
                                            <FaWarehouse className="text-[#006B4D] mr-2 text-xl" />
                                            Tổng: <span className="text-[#111827] ml-1 bg-[#E6F0ED] px-2 py-0.5 rounded-lg">{materials.length} mã</span>
                                            {lowStockMaterials.length > 0 && (
                                                <span className="ml-2 bg-red-100 text-red-600 text-xs font-extrabold px-2 py-0.5 rounded-lg">
                                                    {lowStockMaterials.length} sắp hết
                                                </span>
                                            )}
                                        </div>
                                        <div className="w-full sm:w-1/2 md:w-64 relative">
                                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input type="text" placeholder="Tìm tên, ghi chú..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-[#111827] text-sm rounded-full pl-10 pr-4 py-2 outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] transition-all" />
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1">
                                        <div className="overflow-x-auto custom-scrollbar max-h-[650px]">
                                            <table className="min-w-full leading-normal text-left">
                                                <thead className="bg-[#F9FAFB] text-[10px] md:text-xs font-bold text-[#6B7280] uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-5 py-4 w-1/2">Tên Vật Tư</th>
                                                        <th className="px-5 py-4 text-center">Đơn vị</th>
                                                        <th className="px-5 py-4 text-center">Tồn kho hiện tại</th>
                                                        <th className="px-5 py-4 text-center">Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm">
                                                    {filteredMaterials.length === 0 ? (
                                                        <tr><td colSpan="4" className="text-center py-10 text-gray-400 font-medium">Chưa có dữ liệu</td></tr>
                                                    ) : filteredMaterials.map((item, idx) => (
                                                        <tr key={item._id} className={`hover:bg-[#E6F0ED]/30 transition-colors ${idx !== filteredMaterials.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                                            <td className="px-5 py-4 min-w-[200px]">
                                                                <div className="font-bold text-[#111827] text-base">{item.name}</div>
                                                                {item.note && (
                                                                    <div className="text-[11px] text-gray-500 mt-1 font-medium">{item.note}</div>
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-4 text-center font-bold text-gray-500 bg-gray-50/50">{item.unit}</td>
                                                            <td className="px-5 py-4 text-center">
                                                                <div className="flex flex-col items-center justify-center gap-1">
                                                                    <input
                                                                        type="number"
                                                                        className={`w-20 md:w-24 text-center border-b-2 bg-transparent px-1 py-1.5 outline-none font-extrabold text-lg transition-colors ${item.quantity <= item.minStock ? 'border-red-500 text-red-600' : 'border-gray-200 focus:border-[#006B4D] text-[#006B4D]'}`}
                                                                        defaultValue={item.quantity}
                                                                        onChange={(e) => setEditQuantity({ ...editQuantity, [item._id]: e.target.value })}
                                                                        onBlur={() => updateQuantity(item._id, item.quantity)}
                                                                    />
                                                                    {item.quantity <= item.minStock && (
                                                                        <div className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full mt-1 border border-red-100">
                                                                            Sắp hết! (Định mức: {item.minStock})
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4 text-center">
                                                                <button onClick={() => { setDeleteId(item._id); setIsModalOpen(true); }} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                                    <FaTrash size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                )}

                {/* ====================================================== */}
                {/* TAB 2: CẤP PHÁT VẬT TƯ                                 */}
                {/* ====================================================== */}
                {activeTab === 'dispatch' && (
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                        <div className="w-full">

                            {/* Title */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-xl md:text-2xl shadow-sm shrink-0">
                                    <FaClipboardList />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Cấp Phát Vật Tư</h2>
                                    <p className="text-[#6B7280] text-xs md:text-sm mt-0.5">
                                        Ghi nhận phiếu nhập / xuất — tồn kho tự động cập nhật
                                    </p>
                                </div>
                            </div>

                            {/* STATS ROW */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                        <FaArrowDown />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Tổng nhập (kỳ này)</p>
                                        <p className="text-xl font-extrabold text-green-600">{formatQty(totalNhap)}</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                                        <FaArrowUp />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Tổng xuất (kỳ này)</p>
                                        <p className="text-xl font-extrabold text-red-500">{formatQty(totalXuat)}</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#E6F0ED] rounded-xl flex items-center justify-center text-[#006B4D]">
                                        <FaClipboardList />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Tổng phiếu</p>
                                        <p className="text-xl font-extrabold text-[#111827]">{dispatches.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                                {/* CỘT TRÁI: FORM TẠO PHIẾU */}
                                <div className="xl:col-span-4">
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-5 border-b border-gray-100 bg-[#F9FAFB]">
                                            <h3 className="font-extrabold text-[#111827] flex items-center gap-2">
                                                <FaBoxOpen className="text-[#006B4D]" /> Tạo Phiếu Mới
                                            </h3>
                                        </div>
                                        <form onSubmit={handleDispatchSubmit} className="p-5 space-y-4">

                                             {/* LOẠI PHIẾU TOGGLE */}
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-2">Loại phiếu</label>
                                                <div className="flex rounded-xl overflow-hidden border border-gray-200">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDispatchForm({ ...dispatchForm, type: 'xuat' })}
                                                        className={`flex-1 py-2.5 text-sm font-extrabold flex items-center justify-center gap-2 transition-colors ${dispatchForm.type === 'xuat' ? 'bg-red-500 text-white' : 'bg-white text-gray-500 hover:bg-red-50'}`}
                                                    >
                                                        <FaArrowUp className="text-xs" /> Xuất Kho
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDispatchForm({ ...dispatchForm, type: 'nhap' })}
                                                        className={`flex-1 py-2.5 text-sm font-extrabold flex items-center justify-center gap-2 transition-colors ${dispatchForm.type === 'nhap' ? 'bg-green-500 text-white' : 'bg-white text-gray-500 hover:bg-green-50'}`}
                                                    >
                                                        <FaArrowDown className="text-xs" /> Nhập Kho
                                                    </button>
                                                </div>
                                            </div>

                                            {/* KHU VỰC TÌM KIẾM & THÊM MẶT HÀNG */}
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                                                <div className="font-extrabold text-[#111827] text-sm flex items-center gap-2 mb-2">
                                                    <FaWarehouse className="text-[#006B4D]" /> Chọn vật tư để thêm
                                                </div>
                                                
                                                {/* AUTOCOMPLETE VẬT TƯ */}
                                                <div className="relative">
                                                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-2">
                                                        Tìm Vật tư <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                        <input
                                                            type="text"
                                                            value={dispatchSearchTerm}
                                                            onChange={(e) => {
                                                                setDispatchSearchTerm(e.target.value);
                                                                setShowDispatchDropdown(true);
                                                                if (!e.target.value) setCurrentItem({ ...currentItem, materialId: '' });
                                                            }}
                                                            onFocus={() => setShowDispatchDropdown(true)}
                                                            className="w-full border border-gray-200 pl-9 pr-3 py-3 text-sm rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-medium text-[#111827] shadow-sm bg-white"
                                                            placeholder="Gõ tên vật tư..."
                                                        />
                                                    </div>

                                                    {/* DROPDOWN */}
                                                    {showDispatchDropdown && dispatchSearchTerm && (
                                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                                            {dispatchDropdownOptions.length === 0 ? (
                                                                <div className="p-3 text-sm text-gray-500 text-center italic">Không tìm thấy</div>
                                                            ) : (
                                                                dispatchDropdownOptions.map(m => (
                                                                    <div
                                                                        key={m._id}
                                                                        onClick={() => {
                                                                            setCurrentItem({ ...currentItem, materialId: m._id });
                                                                            setDispatchSearchTerm(m.name);
                                                                            setShowDispatchDropdown(false);
                                                                        }}
                                                                        className="p-3 border-b border-gray-100 hover:bg-[#E6F0ED] cursor-pointer transition-colors"
                                                                    >
                                                                        <div className="font-bold text-[#111827]">{m.name}</div>
                                                                        <div className="text-[10px] text-gray-500">Còn: {m.quantity} {m.unit}</div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Backdrop close dropdown */}
                                                    {showDispatchDropdown && (
                                                        <div className="fixed inset-0 z-10" onClick={() => setShowDispatchDropdown(false)}></div>
                                                    )}
                                                </div>

                                                {selectedMaterial && (
                                                    <div className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${selectedMaterial.quantity <= selectedMaterial.minStock ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#E6F0ED] text-[#006B4D]'}`}>
                                                        <FaWarehouse className="shrink-0" />
                                                        Kho hiện tại: <span className="text-base font-extrabold">{formatQty(selectedMaterial.quantity)}</span> {selectedMaterial.unit}
                                                    </div>
                                                )}

                                                <div className="flex items-end gap-3">
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-2">
                                                            Số lượng {selectedMaterial ? `(${selectedMaterial.unit})` : ''} <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="any"
                                                            value={currentItem.quantity}
                                                            onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                                                            className="w-full border border-gray-200 p-3 text-sm rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-extrabold text-[#111827] shadow-sm text-center"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddItem}
                                                        className="h-[46px] px-4 bg-[#111827] text-white rounded-xl font-bold shadow-md hover:bg-black transition flex items-center gap-2 shrink-0"
                                                    >
                                                        <FaPlus /> Thêm
                                                    </button>
                                                </div>
                                            </div>

                                            {/* DANH SÁCH ĐÃ CHỌN */}
                                            {dispatchItems.length > 0 && (
                                                <div className="border border-green-200 bg-green-50/50 rounded-xl overflow-hidden">
                                                    <div className="bg-green-100/50 px-3 py-2 border-b border-green-200 text-xs font-extrabold text-green-800 flex items-center justify-between">
                                                        <span>Danh sách phiếu:</span>
                                                        <span className="bg-white px-2 py-0.5 rounded-full shadow-sm">{dispatchItems.length} mục</span>
                                                    </div>
                                                    <ul className="max-h-48 overflow-y-auto custom-scrollbar p-2 space-y-2">
                                                        {dispatchItems.map((item, idx) => (
                                                            <li key={item.materialId} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-green-100 shadow-sm">
                                                                <div className="flex-1 min-w-0 pr-2">
                                                                    <div className="font-bold text-[#111827] text-sm truncate">{item.name}</div>
                                                                    <div className="text-[10px] text-gray-500">
                                                                        Kho: {item.stock} {item.unit}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3 shrink-0">
                                                                    <div className="font-extrabold text-[#006B4D] text-base bg-[#E6F0ED] px-2 py-1 rounded-lg">
                                                                        {formatQty(item.quantity)} <span className="text-[10px]">{item.unit}</span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveItem(item.materialId)}
                                                                        className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition"
                                                                    >
                                                                        <FaTrash size={12} />
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* NGƯỜI NHẬN */}
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-2">
                                                    <FaUser className="inline mr-1" />
                                                    Người nhận {dispatchForm.type === 'nhap' ? '/ Nguồn nhập' : ''}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={dispatchForm.recipient}
                                                    onChange={(e) => setDispatchForm({ ...dispatchForm, recipient: e.target.value })}
                                                    className="w-full border border-gray-200 p-3 text-sm rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-medium text-[#111827] shadow-sm"
                                                    placeholder={dispatchForm.type === 'nhap' ? 'VD: NCC Giấy Bình Minh' : 'VD: Nguyễn Văn A (Xưởng in)'}
                                                />
                                            </div>

                                            {/* GHI CHÚ */}
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-2">
                                                    <FaStickyNote className="inline mr-1" /> Ghi chú chung
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={dispatchForm.note}
                                                    onChange={(e) => setDispatchForm({ ...dispatchForm, note: e.target.value })}
                                                    className="w-full border border-gray-200 p-3 text-sm rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-medium text-[#111827] shadow-sm resize-none"
                                                    placeholder="Ghi chú thêm nếu cần..."
                                                />
                                            </div>

                                            {/* SUBMIT */}
                                            <button
                                                type="submit"
                                                disabled={dispatchSubmitting || dispatchItems.length === 0}
                                                className={`w-full py-3 rounded-xl font-extrabold text-white shadow-md transition flex items-center justify-center gap-2 active:scale-95 ${
                                                    dispatchForm.type === 'xuat'
                                                        ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                                        : 'bg-green-500 hover:bg-green-600 shadow-green-200'
                                                } disabled:opacity-60 disabled:cursor-not-allowed`}
                                            >
                                                {dispatchSubmitting ? (
                                                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                                ) : dispatchForm.type === 'xuat' ? (
                                                    <><FaArrowUp /> Tạo Phiếu Xuất ({dispatchItems.length} mục)</>
                                                ) : (
                                                    <><FaArrowDown /> Tạo Phiếu Nhập ({dispatchItems.length} mục)</>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* CỘT PHẢI: LỊCH SỬ CẤP PHÁT */}
                                <div className="xl:col-span-8 flex flex-col gap-4">

                                    {/* Filter bar */}
                                    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <FaFilter className="text-gray-400 text-xs shrink-0" />
                                            <span className="text-sm font-bold text-gray-600">Lọc:</span>
                                            <div className="flex gap-1">
                                                {[
                                                    { key: 'all', label: 'Tất cả' },
                                                    { key: 'nhap', label: '↓ Nhập' },
                                                    { key: 'xuat', label: '↑ Xuất' },
                                                ].map(({ key, label }) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => setFilterType(key)}
                                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                                            filterType === key
                                                                ? 'bg-[#006B4D] text-white'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <select
                                                value={filterMaterial}
                                                onChange={(e) => setFilterMaterial(e.target.value)}
                                                className="flex-1 sm:w-48 border border-gray-200 text-sm rounded-xl px-3 py-2 outline-none focus:border-[#006B4D] font-medium"
                                            >
                                                <option value="">Tất cả vật tư</option>
                                                {materials.map((m) => (
                                                    <option key={m._id} value={m._id}>{m.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={fetchDispatches}
                                                className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:text-[#006B4D] hover:bg-gray-50 transition"
                                                title="Làm mới"
                                            >
                                                <FaSync className={dispatchLoading ? 'animate-spin' : ''} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Search bar for dispatch history */}
                                    <div className="relative">
                                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                        <input
                                            type="text"
                                            value={dispatchKeyword}
                                            onChange={e => setDispatchKeyword(e.target.value)}
                                            placeholder="Tìm theo người nhận, ghi chú, tên vật tư..."
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-10 py-2.5 text-sm outline-none focus:border-[#006B4D] focus:bg-white transition shadow-sm"
                                        />
                                        {dispatchKeyword && (
                                            <button onClick={() => setDispatchKeyword('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                                                <FaTimes size={12} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Table */}
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex-1">
                                        {dispatchLoading ? (
                                            <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
                                                <div className="w-8 h-8 border-2 border-[#006B4D] border-t-transparent rounded-full animate-spin" />
                                                <span className="text-sm font-medium">Đang tải lịch sử...</span>
                                            </div>
                                        ) : filteredDispatches.length === 0 ? (
                                            <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
                                                <FaClipboardList className="text-4xl text-gray-200" />
                                                <span className="text-sm font-medium">Chưa có phiếu cấp phát nào</span>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto custom-scrollbar max-h-[560px]">
                                                <table className="min-w-full text-sm leading-normal">
                                                    <thead className="bg-[#F9FAFB] text-[10px] font-bold text-[#6B7280] uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200">
                                                        <tr>
                                                            <th className="px-2 md:px-3 py-3 text-left">Phiếu số</th>
                                                            <th className="px-2 md:px-3 py-3 text-center">Loại</th>
                                                            <th className="px-2 md:px-3 py-3 text-center">Tổng SL</th>
                                                            <th className="px-2 md:px-3 py-3 text-left hidden md:table-cell">Người nhận</th>
                                                            <th className="px-2 md:px-3 py-3 text-left hidden xl:table-cell">Ghi chú</th>
                                                            <th className="px-2 md:px-3 py-3 text-left">Thời gian</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredDispatches.map((d, idx) => {
                                                            const hasItems = d.items && d.items.length > 0;
                                                            const totalQty = hasItems ? d.items.reduce((sum, item) => sum + item.quantity, 0) : (d.quantity || 0);
                                                            const isExpanded = expandedDispatchId === d._id;
                                                            const sttAbs = dispatches.length - dispatches.findIndex(x => x._id === d._id);

                                                            return (
                                                            <React.Fragment key={d._id}>
                                                                <tr 
                                                                    className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${!isExpanded && idx !== filteredDispatches.length - 1 ? 'border-b border-gray-100' : ''}`}
                                                                    onClick={() => setExpandedDispatchId(isExpanded ? null : d._id)}
                                                                >
                                                                    <td className="px-2 md:px-3 py-3">
                                                                        <div className="font-bold text-[#111827]">Phiếu {d.type === 'nhap' ? 'nhập' : 'xuất'} {sttAbs}</div>
                                                                        {hasItems && <div className="text-[10px] text-gray-400">{d.items.length} mặt hàng</div>}
                                                                    </td>
                                                                    <td className="px-2 md:px-3 py-3 text-center align-middle">
                                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-extrabold ${
                                                                            d.type === 'nhap'
                                                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                                                : 'bg-red-100 text-red-600 border border-red-200'
                                                                        }`}>
                                                                            {d.type === 'nhap' ? <FaArrowDown className="text-[10px]" /> : <FaArrowUp className="text-[10px]" />}
                                                                            {d.type === 'nhap' ? 'Nhập' : 'Xuất'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-2 md:px-3 py-3 text-center align-middle">
                                                                        <span className={`font-extrabold text-base ${d.type === 'nhap' ? 'text-green-600' : 'text-red-500'}`}>
                                                                            {d.type === 'nhap' ? '+' : '-'}{formatQty(totalQty)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-2 md:px-3 py-3 hidden md:table-cell align-middle">
                                                                        <div className="font-medium text-[#111827] flex items-center gap-1">
                                                                            {d.recipient ? (
                                                                                <><FaUser className="text-gray-300 text-xs shrink-0" /> {d.recipient}</>
                                                                            ) : (
                                                                                <span className="text-gray-300 italic">—</span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-2 md:px-3 py-3 hidden xl:table-cell text-gray-500 text-xs max-w-[120px] truncate align-middle">
                                                                        {d.note || '—'}
                                                                    </td>
                                                                    <td className="px-2 md:px-3 py-3 align-middle">
                                                                        <div className="text-[#111827] font-medium text-xs">{timeAgo(d.createdAt)}</div>
                                                                        <div className="text-[10px] text-gray-400">{new Date(d.createdAt).toLocaleDateString('vi-VN')}</div>
                                                                    </td>
                                                                </tr>
                                                                {isExpanded && (
                                                                    <tr className="bg-gray-50 border-b border-gray-200">
                                                                        <td colSpan={6} className="px-4 py-4">
                                                                            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                                                                <h4 className="font-bold text-[#111827] mb-3 text-sm flex items-center gap-2">
                                                                                    <FaBoxOpen className="text-[#006B4D]" /> Chi tiết phiếu {d.type === 'nhap' ? 'nhập' : 'xuất'} số {sttAbs}
                                                                                </h4>
                                                                                <table className="w-full text-xs">
                                                                                    <thead>
                                                                                        <tr className="border-b border-gray-100 text-gray-500 text-left">
                                                                                            <th className="pb-2 font-medium">Vật tư</th>
                                                                                            <th className="pb-2 font-medium text-right">Số lượng</th>
                                                                                            <th className="pb-2 font-medium text-right">ĐVT</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {hasItems ? d.items.map((item, i) => (
                                                                                            <tr key={i} className="border-b border-gray-50 last:border-0">
                                                                                                <td className="py-2 font-bold text-[#111827]">{item.materialName}</td>
                                                                                                <td className="py-2 text-right font-extrabold text-[#006B4D]">{formatQty(item.quantity)}</td>
                                                                                                <td className="py-2 text-right text-gray-500">{item.materialUnit}</td>
                                                                                            </tr>
                                                                                        )) : (
                                                                                            <tr>
                                                                                                <td className="py-2 font-bold text-[#111827]">{d.materialName}</td>
                                                                                                <td className="py-2 text-right font-extrabold text-[#006B4D]">{formatQty(d.quantity)}</td>
                                                                                                <td className="py-2 text-right text-gray-500">{d.materialUnit}</td>
                                                                                            </tr>
                                                                                        )}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                )}
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={deleteHandler}
                title="Xóa vật tư"
                message="Vật tư này sẽ bị xóa khỏi danh mục kho. Bạn chắc chắn chứ?"
            />
        </div>
    );
};

export default MaterialScreen;