import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    FaFlask, FaTrash, FaPlus, FaExclamationTriangle, FaWarehouse,
    FaSearch, FaTimes, FaClipboardList, FaArrowDown, FaArrowUp,
    FaUser, FaStickyNote, FaBoxOpen, FaSync, FaFilter,
    FaCheck, FaBan, FaHourglassHalf, FaCheckCircle,
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
const ChemicalScreen = () => {
    // ---------- TAB STATE ----------
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'dispatch'

    // ---------- SHARED STATE ----------
    const [chemicals, setChemicals] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // ---------- INVENTORY TAB STATE ----------
    const [formData, setFormData] = useState({
        name: '', unit: '', quantity: 0, minStock: 5, safetyNote: '', supplier: '',
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
    const [currentItem, setCurrentItem] = useState({ chemicalId: '', quantity: '' });
    const [dispatchSearchTerm, setDispatchSearchTerm] = useState('');
    const [showDispatchDropdown, setShowDispatchDropdown] = useState(false);

    const [dispatchForm, setDispatchForm] = useState({
        type: 'xuat',
        recipient: '',
        note: '',
    });
    const [dispatchSubmitting, setDispatchSubmitting] = useState(false);
    const [filterType, setFilterType] = useState('all'); // 'all' | 'nhap' | 'xuat'
    const [filterChemical, setFilterChemical] = useState('');
    const [dispatchKeyword, setDispatchKeyword] = useState('');
    const [expandedDispatchId, setExpandedDispatchId] = useState(null);

    // ---------- CONFIRM NHẬP KHO MODAL ----------
    const [confirmNhapModal, setConfirmNhapModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // dispatch _id đang xử lý

    // ============================================================
    // FETCH
    // ============================================================
    const fetchChemicals = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/chemicals', config);
            setChemicals(data);
        } catch {
            toast.error('Lỗi tải danh sách hóa chất');
        }
    }, [userInfo.token]);

    const fetchDispatches = useCallback(async () => {
        setDispatchLoading(true);
        try {
            const config = { 
                headers: { Authorization: `Bearer ${userInfo.token}` },
                params: filterChemical ? { chemical: filterChemical } : {}
            };
            const { data } = await axios.get('/api/chemicals/dispatches', config);
            setDispatches(data);
        } catch {
            toast.error('Lỗi tải lịch sử cấp phát');
        } finally {
            setDispatchLoading(false);
        }
    }, [filterChemical, userInfo.token]);

    useEffect(() => { fetchChemicals(); }, [fetchChemicals]);
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
            await axios.post('/api/chemicals', formData, config);
            toast.success('Đã thêm hóa chất mới');
            setFormData({ name: '', unit: '', quantity: 0, minStock: 5, safetyNote: '', supplier: '' });
            setIsAddFormOpen(false);
            fetchChemicals();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi thêm');
        }
    };

    const updateQuantity = async (id, currentQty) => {
        const newQty = editQuantity[id];
        if (newQty === undefined || Number(newQty) === currentQty) return;
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`/api/chemicals/${id}`, { quantity: Number(newQty) }, config);
            toast.success('Cập nhật tồn kho thành công');
            fetchChemicals();
        } catch {
            toast.error('Lỗi cập nhật');
        }
    };

    const deleteHandler = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`/api/chemicals/${deleteId}`, config);
            setChemicals(chemicals.filter((x) => x._id !== deleteId));
            setIsModalOpen(false);
            toast.success('Đã xóa hóa chất');
        } catch {
            toast.error('Lỗi khi xóa');
        }
    };

    const filteredChemicals = chemicals.filter(
        (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.supplier && c.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const lowStockChemicals = chemicals.filter((c) => c.quantity <= c.minStock);

    // ============================================================
    // DISPATCH HANDLERS
    // ============================================================
    const handleAddItem = () => {
        if (!currentItem.chemicalId) {
            toast.warning('Vui lòng chọn hóa chất');
            return;
        }
        if (!currentItem.quantity || Number(currentItem.quantity) <= 0) {
            toast.warning('Số lượng phải lớn hơn 0');
            return;
        }

        const chemical = chemicals.find(c => c._id === currentItem.chemicalId);
        if (!chemical) return;

        const existing = dispatchItems.find(item => item.chemicalId === currentItem.chemicalId);
        if (existing) {
            toast.warning('Hóa chất này đã có trong phiếu. Vui lòng xóa đi để thêm lại nếu cần đổi số lượng.');
            return;
        }

        if (dispatchForm.type === 'xuat' && Number(currentItem.quantity) > chemical.quantity) {
            toast.warning(`Không đủ tồn kho! Chỉ còn ${chemical.quantity} ${chemical.unit}`);
            return;
        }

        setDispatchItems([...dispatchItems, {
            chemicalId: currentItem.chemicalId,
            name: chemical.name,
            unit: chemical.unit,
            stock: chemical.quantity,
            quantity: Number(currentItem.quantity)
        }]);

        setCurrentItem({ chemicalId: '', quantity: '' });
        setDispatchSearchTerm('');
    };

    const handleRemoveItem = (chemicalId) => {
        setDispatchItems(dispatchItems.filter(item => item.chemicalId !== chemicalId));
    };

    const handleDispatchSubmit = async (e) => {
        e.preventDefault();
        if (dispatchItems.length === 0) {
            toast.warning('Vui lòng thêm ít nhất 1 mặt hàng vào phiếu');
            return;
        }
        // Phiếu NHẬP: mở modal xác nhận trước
        if (dispatchForm.type === 'nhap') {
            setConfirmNhapModal(true);
            return;
        }
        // Phiếu XUẤT: submit ngay (chỉ tạo phiếu pending, chưa trừ kho)
        await submitDispatchToAPI();
    };

    // Xác nhận nhập kho qua modal
    const confirmNhapSubmit = async () => {
        setConfirmNhapModal(false);
        await submitDispatchToAPI();
    };

    // Hàm gọi API tạo phiếu
    const submitDispatchToAPI = async () => {
        setDispatchSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post('/api/chemicals/dispatches', {
                items: dispatchItems,
                type: dispatchForm.type,
                recipient: dispatchForm.recipient,
                note: dispatchForm.note,
                createdBy: userInfo.name,
            }, config);

            toast.success(data.message || `✅ Tạo phiếu thành công!`);

            if (data.isLow) {
                toast.warning(`⚠️ Cảnh báo: Có mặt hàng đã xuống dưới ngưỡng an toàn!`, { autoClose: 6000 });
            }

            setDispatchForm({ type: 'xuat', recipient: '', note: '' });
            setDispatchItems([]);
            await fetchChemicals();
            await fetchDispatches();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi tạo phiếu cấp phát');
        } finally {
            setDispatchSubmitting(false);
        }
    };

    // Duyệt phiếu xuất kho
    const handleApproveDispatch = async (dispatchId) => {
        setActionLoading(dispatchId);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.patch(
                `/api/chemicals/dispatches/${dispatchId}/status`,
                { action: 'approve', approvedBy: userInfo.name },
                config
            );
            toast.success(data.message || '✅ Đã duyệt phiếu xuất kho!');
            if (data.isLow) {
                toast.warning('⚠️ Có mặt hàng xuống dưới ngưỡng an toàn!', { autoClose: 6000 });
            }
            await fetchChemicals();
            await fetchDispatches();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi duyệt phiếu');
        } finally {
            setActionLoading(null);
        }
    };

    // Hủy (xóa) phiếu xuất kho đang pending
    const handleCancelDispatch = async (dispatchId) => {
        if (!window.confirm('Bạn có chắc muốn hủy và xóa phiếu yêu cầu này không?')) return;
        setActionLoading(dispatchId);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.patch(
                `/api/chemicals/dispatches/${dispatchId}/status`,
                { action: 'cancel', approvedBy: userInfo.name },
                config
            );
            toast.success('Đã hủy và xóa phiếu yêu cầu xuất kho.');
            await fetchDispatches();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi hủy phiếu');
        } finally {
            setActionLoading(null);
        }
    };


    const filteredDispatches = dispatches.filter((d) => {
        if (filterType !== 'all' && d.type !== filterType) return false;
        if (!dispatchKeyword) return true;
        const kw = dispatchKeyword.toLowerCase();
        const inRecipient = d.recipient?.toLowerCase().includes(kw);
        const inNote = d.note?.toLowerCase().includes(kw);
        const inItems = d.items?.some(i => i.chemicalName?.toLowerCase().includes(kw));
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
    // SELECTED CHEMICAL INFO (for dispatch form)
    // ============================================================
    const selectedChemical = chemicals.find((c) => c._id === currentItem.chemicalId);
    const dispatchDropdownOptions = chemicals.filter(c => c.name.toLowerCase().includes(dispatchSearchTerm.toLowerCase()));

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
                    title="Kho Hóa Chất & Mực In"
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                {/* ── TAB BAR (giống FinishingPriceScreen) ── */}
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
                            {lowStockChemicals.length > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ml-1">
                                    {lowStockChemicals.length}
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
                            Cấp Phát Hóa Chất
                        </button>
                    </nav>
                </header>

                {/* STICKY LOW-STOCK ALERT BANNER */}
                {lowStockChemicals.length > 0 && (
                    <div className="bg-red-50 border-b-2 border-red-200 px-4 md:px-8 py-2.5 flex items-center gap-3 shrink-0">
                        <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shrink-0 animate-pulse">
                            <FaExclamationTriangle className="text-white text-xs" />
                        </div>
                        <span className="text-red-700 font-bold text-sm flex-1">
                            🚨 {lowStockChemicals.length} mặt hàng đang dưới ngưỡng an toàn:{' '}
                            <span className="font-extrabold">
                                {lowStockChemicals.slice(0, 3).map((c) => c.name).join(', ')}
                                {lowStockChemicals.length > 3 && ` và ${lowStockChemicals.length - 3} khác`}
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
                        <div className="max-w-7xl mx-auto">

                            {/* Title Section */}
                            <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-xl md:text-2xl shadow-sm shrink-0">
                                        <FaFlask />
                                    </div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Quản lý Tồn kho</h2>
                                        <p className="text-[#6B7280] text-xs md:text-sm mt-0.5">
                                            Theo dõi số lượng mực in, dung môi và hóa chất
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
                                                        Tên hóa chất / Mực in <span className="text-red-500">*</span>
                                                    </label>
                                                    <input type="text" required className="w-full border border-gray-200 p-3 text-sm md:text-base rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-medium text-[#111827] shadow-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="VD: Mực UV xanh, Xylene..." />
                                                </div>
                                                <div className="grid grid-cols-3 gap-3 md:gap-4">
                                                    <div>
                                                        <label className="block text-[10px] md:text-[11px] font-bold text-[#6B7280] uppercase mb-2">
                                                            Đơn vị <span className="text-red-500">*</span>
                                                        </label>
                                                        <input type="text" required className="w-full border border-gray-200 p-3 text-sm md:text-base rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-medium text-[#111827] shadow-sm" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="Kg, Lít..." />
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
                                                        Lưu ý An toàn / Bảo quản
                                                    </label>
                                                    <input type="text" className="w-full border border-gray-200 p-3 text-sm md:text-base rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-medium text-[#111827] shadow-sm placeholder-red-300" value={formData.safetyNote} onChange={(e) => setFormData({ ...formData, safetyNote: e.target.value })} placeholder="VD: Dễ cháy, để nơi thoáng mát..." />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Nhà cung cấp</label>
                                                    <input type="text" className="w-full border border-gray-200 p-3 text-sm md:text-base rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-medium text-[#111827] shadow-sm" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} placeholder="Nhập tên NCC..." />
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

                                {/* CỘT PHẢI: DANH SÁCH HÓA CHẤT */}
                                <div className="lg:col-span-2 flex flex-col gap-4">
                                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center w-full sm:w-auto text-[#6B7280] font-bold">
                                            <FaWarehouse className="text-[#006B4D] mr-2 text-xl" />
                                            Tổng: <span className="text-[#111827] ml-1 bg-[#E6F0ED] px-2 py-0.5 rounded-lg">{chemicals.length} mã</span>
                                            {lowStockChemicals.length > 0 && (
                                                <span className="ml-2 bg-red-100 text-red-600 text-xs font-extrabold px-2 py-0.5 rounded-lg">
                                                    {lowStockChemicals.length} sắp hết
                                                </span>
                                            )}
                                        </div>
                                        <div className="w-full sm:w-1/2 md:w-64 relative">
                                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input type="text" placeholder="Tìm tên, nhà cung cấp..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-[#111827] text-sm rounded-full pl-10 pr-4 py-2 outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] transition-all" />
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1">
                                        <div className="overflow-x-auto custom-scrollbar max-h-[650px]">
                                            <table className="min-w-full leading-normal text-left">
                                                <thead className="bg-[#F9FAFB] text-[10px] md:text-xs font-bold text-[#6B7280] uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-5 py-4 w-1/2">Tên Hóa Chất</th>
                                                        <th className="px-5 py-4 text-center">Đơn vị</th>
                                                        <th className="px-5 py-4 text-center">Tồn kho hiện tại</th>
                                                        <th className="px-5 py-4 text-center">Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm">
                                                    {filteredChemicals.length === 0 ? (
                                                        <tr><td colSpan="4" className="text-center py-10 text-gray-400 font-medium">Chưa có dữ liệu</td></tr>
                                                    ) : filteredChemicals.map((item, idx) => (
                                                        <tr key={item._id} className={`hover:bg-[#E6F0ED]/30 transition-colors ${idx !== filteredChemicals.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                                            <td className="px-5 py-4 min-w-[200px]">
                                                                <div className="font-bold text-[#111827] text-base">{item.name}</div>
                                                                {item.safetyNote && (
                                                                    <div className="text-[11px] text-orange-600 bg-orange-50 px-2 py-1 rounded inline-flex items-center font-bold mt-1.5 border border-orange-100">
                                                                        <FaExclamationTriangle className="mr-1" /> {item.safetyNote}
                                                                    </div>
                                                                )}
                                                                <div className="text-[11px] text-gray-500 mt-1 font-medium"><span className="text-gray-400">NCC:</span> {item.supplier || 'Chưa cập nhật'}</div>
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
                {/* TAB 2: CẤP PHÁT HÓA CHẤT                               */}
                {/* ====================================================== */}
                {activeTab === 'dispatch' && (
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                        <div className="max-w-7xl mx-auto">

                            {/* Title */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-xl md:text-2xl shadow-sm shrink-0">
                                    <FaClipboardList />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Cấp Phát Hóa Chất</h2>
                                    <p className="text-[#6B7280] text-xs md:text-sm mt-f0.5">
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

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* CỘT TRÁI: FORM TẠO PHIẾU */}
                                <div className="lg:col-span-1">
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
                                                    <FaFlask className="text-[#006B4D]" /> Chọn hóa chất để thêm
                                                </div>
                                                
                                                {/* AUTOCOMPLETE HÓA CHẤT */}
                                                <div className="relative">
                                                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-2">
                                                        Tìm Hóa chất <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                        <input
                                                            type="text"
                                                            value={dispatchSearchTerm}
                                                            onChange={(e) => {
                                                                setDispatchSearchTerm(e.target.value);
                                                                setShowDispatchDropdown(true);
                                                                if (!e.target.value) setCurrentItem({ ...currentItem, chemicalId: '' });
                                                            }}
                                                            onFocus={() => setShowDispatchDropdown(true)}
                                                            className="w-full border border-gray-200 pl-9 pr-3 py-3 text-sm rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-medium text-[#111827] shadow-sm bg-white"
                                                            placeholder="Gõ tên hóa chất..."
                                                        />
                                                    </div>

                                                    {/* DROPDOWN */}
                                                    {showDispatchDropdown && dispatchSearchTerm && (
                                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                                            {dispatchDropdownOptions.length === 0 ? (
                                                                <div className="p-3 text-sm text-gray-500 text-center italic">Không tìm thấy</div>
                                                            ) : (
                                                                dispatchDropdownOptions.map(c => (
                                                                    <div
                                                                        key={c._id}
                                                                        onClick={() => {
                                                                            setCurrentItem({ ...currentItem, chemicalId: c._id });
                                                                            setDispatchSearchTerm(c.name);
                                                                            setShowDispatchDropdown(false);
                                                                        }}
                                                                        className="p-3 border-b border-gray-100 hover:bg-[#E6F0ED] cursor-pointer transition-colors"
                                                                    >
                                                                        <div className="font-bold text-[#111827]">{c.name}</div>
                                                                        <div className="text-[10px] text-gray-500">Còn: {c.quantity} {c.unit}</div>
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

                                                {selectedChemical && (
                                                    <div className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${selectedChemical.quantity <= selectedChemical.minStock ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#E6F0ED] text-[#006B4D]'}`}>
                                                        <FaFlask className="shrink-0" />
                                                        Kho hiện tại: <span className="text-base font-extrabold">{formatQty(selectedChemical.quantity)}</span> {selectedChemical.unit}
                                                    </div>
                                                )}

                                                <div className="flex items-end gap-3">
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-2">
                                                            Số lượng {selectedChemical ? `(${selectedChemical.unit})` : ''} <span className="text-red-500">*</span>
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
                                                            <li key={item.chemicalId} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-green-100 shadow-sm">
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
                                                                        onClick={() => handleRemoveItem(item.chemicalId)}
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
                                                    placeholder={dispatchForm.type === 'nhap' ? 'VD: NCC Hóa chất...' : 'VD: Nguyễn Văn A (SX In)'}
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

                                            {/* GHI CHÚ CHO PHIẾU XUẤT */}
                                            {dispatchForm.type === 'xuat' && (
                                                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                                                    <FaHourglassHalf className="text-amber-500 shrink-0 mt-0.5 text-sm" />
                                                    <p className="text-amber-700 text-[11px] font-semibold leading-relaxed">
                                                        Phiếu xuất sẽ ở trạng thái <strong>Chờ duyệt</strong>. Người phụ trách kho cần phê duyệt trước khi tồn kho được trừ.
                                                    </p>
                                                </div>
                                            )}

                                            {/* SUBMIT */}
                                            <button
                                                type="submit"
                                                disabled={dispatchSubmitting || dispatchItems.length === 0}
                                                className={`w-full py-3 rounded-xl font-extrabold text-white shadow-md transition flex items-center justify-center gap-2 active:scale-95 ${
                                                    dispatchForm.type === 'xuat'
                                                        ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
                                                        : 'bg-green-500 hover:bg-green-600 shadow-green-200'
                                                } disabled:opacity-60 disabled:cursor-not-allowed`}
                                            >
                                                {dispatchSubmitting ? (
                                                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                                ) : dispatchForm.type === 'xuat' ? (
                                                    <><FaHourglassHalf /> Gửi Yêu Cầu Xuất ({dispatchItems.length} mục)</>
                                                ) : (
                                                    <><FaArrowDown /> Tạo Phiếu Nhập ({dispatchItems.length} mục)</>
                                                )}
                                            </button>

                                        </form>
                                    </div>
                                </div>

                                {/* CỘT PHẢI: LỊCH SỬ CẤP PHÁT */}
                                <div className="lg:col-span-2 flex flex-col gap-4">

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
                                                value={filterChemical}
                                                onChange={(e) => setFilterChemical(e.target.value)}
                                                className="flex-1 sm:w-48 border border-gray-200 text-sm rounded-xl px-3 py-2 outline-none focus:border-[#006B4D] font-medium"
                                            >
                                                <option value="">Tất cả hóa chất</option>
                                                {chemicals.map((c) => (
                                                    <option key={c._id} value={c._id}>{c.name}</option>
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
                                            placeholder="Tìm theo người nhận, ghi chú, tên hóa chất..."
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
                                                            <th className="px-4 py-3 text-left">Phiếu số</th>
                                                            <th className="px-4 py-3 text-center">Loại</th>
                                                            <th className="px-4 py-3 text-center">Tổng Số lượng</th>
                                                            <th className="px-4 py-3 text-center">Trạng thái</th>
                                                            <th className="px-4 py-3 text-left hidden md:table-cell">Người nhận</th>
                                                            <th className="px-4 py-3 text-left hidden lg:table-cell">Ghi chú</th>
                                                            <th className="px-4 py-3 text-left">Thời gian</th>
                                                            <th className="px-4 py-3 text-center">Thao tác</th>
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
                                                                    <td className="px-4 py-3">
                                                                        <div className="font-bold text-[#111827]">Phiếu {d.type === 'nhap' ? 'nhập' : 'xuất'} {sttAbs}</div>
                                                                        {hasItems && <div className="text-[10px] text-gray-400">{d.items.length} mặt hàng (Bấm xem)</div>}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center align-middle">
                                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                                                                            d.type === 'nhap'
                                                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                                                : 'bg-red-100 text-red-600 border border-red-200'
                                                                        }`}>
                                                                            {d.type === 'nhap' ? <FaArrowDown className="text-[10px]" /> : <FaArrowUp className="text-[10px]" />}
                                                                            {d.type === 'nhap' ? 'Nhập' : 'Xuất'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center align-middle">
                                                                        <span className={`font-extrabold text-base ${d.type === 'nhap' ? 'text-green-600' : 'text-red-500'}`}>
                                                                            {d.type === 'nhap' ? '+' : '-'}{formatQty(totalQty)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 hidden md:table-cell align-middle">
                                                                        <div className="font-medium text-[#111827] flex items-center gap-1">
                                                                            {d.recipient ? (
                                                                                <><FaUser className="text-gray-300 text-xs shrink-0" /> {d.recipient}</>
                                                                            ) : (
                                                                                <span className="text-gray-300 italic">—</span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs max-w-[160px] truncate align-middle">
                                                                        {d.note || '—'}
                                                                    </td>
                                                                    <td className="px-4 py-3 align-middle">
                                                                        <div className="text-[#111827] font-medium text-xs">{timeAgo(d.createdAt)}</div>
                                                                        <div className="text-[10px] text-gray-400">{new Date(d.createdAt).toLocaleDateString('vi-VN')}</div>
                                                                    </td>
                                                                    {/* CỘT TRẠNG THÁI */}
                                                                    <td className="px-4 py-3 text-center align-middle" onClick={e => e.stopPropagation()}>
                                                                        {(() => {
                                                                            const st = d.status || (d.type === 'nhap' ? 'approved' : 'approved');
                                                                            if (st === 'pending') return (
                                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-700 border border-amber-200">
                                                                                    <FaHourglassHalf className="text-[10px]" /> Chờ duyệt
                                                                                </span>
                                                                            );
                                                                            if (st === 'approved') return (
                                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-green-100 text-green-700 border border-green-200">
                                                                                    <FaCheckCircle className="text-[10px]" /> Đã duyệt
                                                                                </span>
                                                                            );
                                                                            return null;
                                                                        })()}
                                                                    </td>
                                                                    {/* CỘT THAO TÁC */}
                                                                    <td className="px-4 py-3 text-center align-middle" onClick={e => e.stopPropagation()}>
                                                                        {(d.status === 'pending' || (!d.status && d.type === 'xuat')) && (
                                                                            <div className="flex items-center justify-center gap-1.5">
                                                                                <button
                                                                                    onClick={() => handleApproveDispatch(d._id)}
                                                                                    disabled={actionLoading === d._id}
                                                                                    title="Duyệt phiếu"
                                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition disabled:opacity-50"
                                                                                >
                                                                                    {actionLoading === d._id ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <FaCheck size={11} />}
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleCancelDispatch(d._id)}
                                                                                    disabled={actionLoading === d._id}
                                                                                    title="Hủy phiếu"
                                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                                                                                >
                                                                                    <FaBan size={11} />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                        {(d.status === 'approved' || (d.type === 'nhap' && !d.status)) && (
                                                                            <span className="text-gray-300 text-xs">—</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                {isExpanded && (
                                                                    <tr className="bg-gray-50 border-b border-gray-200">
                                                                        <td colSpan={8} className="px-4 py-4">
                                                                            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                                                                <h4 className="font-bold text-[#111827] mb-3 text-sm flex items-center gap-2">
                                                                                    <FaBoxOpen className="text-[#006B4D]" /> Chi tiết phiếu {d.type === 'nhap' ? 'nhập' : 'xuất'} số {sttAbs}
                                                                                </h4>
                                                                                <table className="w-full text-xs">
                                                                                    <thead>
                                                                                        <tr className="border-b border-gray-100 text-gray-500 text-left">
                                                                                            <th className="pb-2 font-medium">Hóa chất</th>
                                                                                            <th className="pb-2 font-medium text-right">Số lượng</th>
                                                                                            <th className="pb-2 font-medium text-right">ĐVT</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {hasItems ? d.items.map((item, i) => (
                                                                                            <tr key={i} className="border-b border-gray-50 last:border-0">
                                                                                                <td className="py-2 font-bold text-[#111827]">{item.chemicalName}</td>
                                                                                                <td className="py-2 text-right font-extrabold text-[#006B4D]">{formatQty(item.quantity)}</td>
                                                                                                <td className="py-2 text-right text-gray-500">{item.chemicalUnit}</td>
                                                                                            </tr>
                                                                                        )) : (
                                                                                            <tr>
                                                                                                <td className="py-2 font-bold text-[#111827]">{d.chemicalName}</td>
                                                                                                <td className="py-2 text-right font-extrabold text-[#006B4D]">{formatQty(d.quantity)}</td>
                                                                                                <td className="py-2 text-right text-gray-500">{d.chemicalUnit}</td>
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

            {/* MODAL XÁC NHẬN XÓA HÓA CHẤT */}
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={deleteHandler}
                title="Xóa hóa chất"
                message="Hóa chất này sẽ bị xóa khỏi danh mục kho. Bạn chắc chắn chứ?"
            />

            {/* MODAL XÁC NHẬN NHẬP KHO */}
            {confirmNhapModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md mx-4 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-green-50 flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shrink-0">
                                <FaArrowDown size={18} />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-[#111827] text-lg">Xác nhận Nhập Kho</h3>
                                <p className="text-green-700 text-xs font-medium mt-0.5">Thao tác này sẽ cộng số lượng vào tồn kho ngay lập tức.</p>
                            </div>
                        </div>
                        <div className="p-6 space-y-3">
                            <p className="text-sm text-gray-600 font-medium">
                                Bạn sắp tạo phiếu nhập kho cho <strong className="text-[#111827]">{dispatchItems.length} mặt hàng</strong>
                                {dispatchForm.recipient && <> từ <strong className="text-[#111827]">"{dispatchForm.recipient}"</strong></>}.
                            </p>
                            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 border border-gray-100">
                                {dispatchItems.map((item) => (
                                    <div key={item.chemicalId} className="flex justify-between items-center text-sm">
                                        <span className="font-semibold text-gray-700">{item.name}</span>
                                        <span className="font-extrabold text-green-600">+{formatQty(item.quantity)} <span className="text-xs text-gray-400">{item.unit}</span></span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 italic">Bạn có chắc chắn muốn nhập kho không?</p>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button
                                onClick={() => setConfirmNhapModal(false)}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmNhapSubmit}
                                className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-extrabold transition shadow-lg shadow-green-200"
                            >
                                <FaCheck /> Xác nhận Nhập Kho
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChemicalScreen;