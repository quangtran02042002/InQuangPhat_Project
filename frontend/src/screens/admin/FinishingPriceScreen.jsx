import React, { useState, useEffect, useMemo } from 'react';
import {
    FaSave, FaSync, FaCheck, FaSearch, FaChevronDown, FaChevronUp,
    FaShieldAlt, FaBoxOpen, FaCubes, FaBookOpen, FaCut,
    FaSpinner, FaSeedling, FaArrowLeft, FaTags, FaHistory
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import { toast } from 'react-toastify';

// ==========================================
// CONSTANTS
// ==========================================
const CATEGORY_META = {
    surface: { name: 'Gia công bề mặt', subtitle: 'Tăng thẩm mỹ & bảo vệ', icon: <FaShieldAlt />, gradient: 'from-violet-500 to-cyan-500', border: 'border-violet-200', bg: 'bg-violet-50' },
    shaping: { name: 'Gia công định hình', subtitle: 'Hộp giấy & Bao bì', icon: <FaBoxOpen />, gradient: 'from-orange-500 to-amber-500', border: 'border-orange-200', bg: 'bg-orange-50' },
    rigid: { name: 'Hộp cứng cao cấp', subtitle: 'Rigid Boxes', icon: <FaCubes />, gradient: 'from-emerald-500 to-teal-500', border: 'border-emerald-200', bg: 'bg-emerald-50' },
    book: { name: 'Sách, Tạp chí, Catalog', subtitle: 'Đóng gáy & Gia công', icon: <FaBookOpen />, gradient: 'from-blue-500 to-indigo-500', border: 'border-blue-200', bg: 'bg-blue-50' },
    finishing: { name: 'Hoàn thiện phụ trợ', subtitle: 'Cắt xén, Đục lỗ, Số nhảy', icon: <FaCut />, gradient: 'from-slate-500 to-gray-500', border: 'border-slate-200', bg: 'bg-slate-50' },
};

const UNIT_OPTIONS = ['đ/SP', 'đ/tờ in', 'đ/cuốn', 'đ/tổng'];

// ==========================================
// SKELETON LOADER
// ==========================================
const SkeletonRow = () => (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/5" />
            <div className="h-3 bg-gray-100 rounded w-3/5" />
        </div>
        <div className="h-9 w-24 bg-gray-200 rounded-xl" />
        <div className="h-9 w-20 bg-gray-200 rounded-xl" />
    </div>
);

// ==========================================
// MAIN COMPONENT
// ==========================================
const FinishingPriceScreen = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [seeding, setSeeding] = useState(false);

    // Data
    const [finishingPrices, setFinishingPrices] = useState([]);
    const [editedPrices, setEditedPrices] = useState({}); // { _id: { price, unit, ... } }
    const [searchTerm, setSearchTerm] = useState('');
    const [collapsedCategories, setCollapsedCategories] = useState([]);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const authConfig = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

    // ---- FETCH DATA ----
    const fetchPrices = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/finishing-prices', authConfig);
            setFinishingPrices(data);
            setEditedPrices({});
        } catch (e) {
            console.error(e);
            toast.error('Không thể tải dữ liệu giá gia công');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPrices(); }, []);

    // ---- SEED DEFAULT DATA ----
    const seedData = async () => {
        setSeeding(true);
        try {
            const { data } = await axios.post('/api/finishing-prices/seed', {}, authConfig);
            toast.success(data.message);
            await fetchPrices();
        } catch (e) {
            toast.error('Lỗi khi tạo dữ liệu mặc định');
        } finally {
            setSeeding(false);
        }
    };

    // ---- EDIT HANDLERS ----
    const handlePriceChange = (id, field, value) => {
        setEditedPrices(prev => ({
            ...prev,
            [id]: { ...prev[id], _id: id, [field]: value }
        }));
    };

    const hasChanges = Object.keys(editedPrices).length > 0;

    // ---- SAVE ALL CHANGES ----
    const saveAllChanges = async () => {
        if (!hasChanges) return;
        setSaving(true);
        try {
            const updates = Object.values(editedPrices).map(edit => ({
                ...edit,
                price: edit.price !== undefined ? Number(edit.price) : undefined,
            }));
            await axios.put('/api/finishing-prices/bulk-update', { updates }, authConfig);
            toast.success(`Đã cập nhật ${updates.length} công đoạn thành công!`);
            await fetchPrices();
        } catch (e) {
            toast.error('Lỗi khi lưu cập nhật');
        } finally {
            setSaving(false);
        }
    };

    // ---- SAVE SINGLE ----
    const saveSingle = async (id) => {
        const edit = editedPrices[id];
        if (!edit) return;
        try {
            await axios.put(`/api/finishing-prices/${id}`, {
                ...edit,
                price: edit.price !== undefined ? Number(edit.price) : undefined,
            }, authConfig);
            toast.success('Đã cập nhật!');
            // Remove from edited
            setEditedPrices(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
            // Refresh single item in list
            const updated = finishingPrices.map(p => {
                if (p._id === id) {
                    return {
                        ...p,
                        ...(edit.price !== undefined && { price: Number(edit.price) }),
                        ...(edit.unit !== undefined && { unit: edit.unit }),
                    };
                }
                return p;
            });
            setFinishingPrices(updated);
        } catch (e) {
            toast.error('Lỗi cập nhật');
        }
    };

    // ---- TOGGLE CATEGORY ----
    const toggleCategory = (catId) => {
        setCollapsedCategories(prev =>
            prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
        );
    };

    // ---- GROUPED DATA ----
    const groupedData = useMemo(() => {
        const groups = {};
        const filtered = finishingPrices.filter(p =>
            !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        for (const p of filtered) {
            if (!groups[p.category]) groups[p.category] = [];
            groups[p.category].push(p);
        }
        return groups;
    }, [finishingPrices, searchTerm]);

    const categoryOrder = ['surface', 'shaping', 'rigid', 'book', 'finishing'];

    // ---- GET DISPLAY VALUE (edited or original) ----
    const getVal = (item, field) => {
        if (editedPrices[item._id]?.[field] !== undefined) return editedPrices[item._id][field];
        return item[field];
    };

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827] relative">
            {isSidebarOpen && <div className="fixed inset-0 bg-[#111827]/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}
            <div className={`fixed inset-y-0 left-0 z-50 h-full transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0 lg:block`}>
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col w-full overflow-hidden">
                <AdminHeader title="Công Cụ Tính Giá In" />

                {/* HEADER WITH TABS */}
                <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 shrink-0 flex flex-col sm:flex-row justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden text-gray-500" onClick={() => setIsSidebarOpen(true)}>☰</button>
                        <h1 className="text-lg md:text-xl font-bold text-[#111827] whitespace-nowrap hidden sm:block">Tính Giá & Báo Giá</h1>
                        <nav className="hidden sm:flex gap-6 text-sm font-medium ml-4">
                            <button onClick={() => navigate('/admin/print-price-calc', { state: { defaultTab: 'Tính giá' } })} className="whitespace-nowrap pb-3 -mb-3 transition-colors text-[#6B7280] hover:text-[#111827]">
                                Tính giá
                            </button>
                            <button onClick={() => navigate('/admin/print-price-calc', { state: { defaultTab: 'Lịch sử báo giá' } })} className="whitespace-nowrap pb-3 -mb-3 transition-colors text-[#6B7280] hover:text-[#111827]">
                                <FaHistory className="inline mr-1.5 text-xs" />Lịch sử báo giá
                            </button>
                            <button className="whitespace-nowrap pb-3 -mb-3 transition-colors text-[#006B4D] border-b-2 border-[#006B4D] flex items-center gap-1.5">
                                <FaTags className="text-xs" /> Quản lý giá GC
                            </button>
                        </nav>
                    </div>
                </header>

                {/* Mobile tabs */}
                <div className="sm:hidden bg-white px-4 border-b border-gray-200 flex gap-4 text-sm font-medium overflow-x-auto shrink-0">
                    <button onClick={() => navigate('/admin/print-price-calc', { state: { defaultTab: 'Tính giá' } })} className="whitespace-nowrap py-3 transition-colors text-[#6B7280]">
                        Tính giá
                    </button>
                    <button onClick={() => navigate('/admin/print-price-calc', { state: { defaultTab: 'Lịch sử báo giá' } })} className="whitespace-nowrap py-3 transition-colors text-[#6B7280]">
                        Lịch sử báo giá
                    </button>
                    <button className="whitespace-nowrap py-3 text-[#006B4D] border-b-2 border-[#006B4D] flex items-center gap-1">
                        <FaTags className="text-xs" /> Giá GC
                    </button>
                </div>

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                    <div className="max-w-[1200px] mx-auto space-y-6">
                        {/* PAGE TITLE & SEARCH ROW */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#006B4D] to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                                    <FaTags />
                                </div>
                                <div>
                                    <h2 className="text-lg md:text-xl font-extrabold text-[#111827]">Quản Lý Giá Gia Công</h2>
                                    <p className="text-xs text-gray-500">Chỉnh sửa giá các công đoạn sau in</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {/* Search */}
                                <div className="relative flex-1 sm:w-64">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                    <input
                                        type="text"
                                        placeholder="Tìm công đoạn..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D] font-medium"
                                    />
                                </div>
                                {/* Reload */}
                                <button onClick={fetchPrices} disabled={loading} className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-500 hover:text-[#006B4D]">
                                    <FaSync className={loading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        </div>

                        {/* EMPTY STATE - SEED BUTTON */}
                        {!loading && finishingPrices.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaSeedling className="text-3xl text-emerald-500" />
                                </div>
                                <h2 className="text-xl font-extrabold text-gray-800 mb-2">Chưa có dữ liệu giá gia công</h2>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                    Bấm nút bên dưới để tạo toàn bộ 22 công đoạn gia công với giá mặc định.
                                    Bạn có thể chỉnh sửa giá bất kỳ lúc nào.
                                </p>
                                <button
                                    onClick={seedData}
                                    disabled={seeding}
                                    className="bg-gradient-to-r from-[#006B4D] to-emerald-600 text-white px-8 py-4 rounded-2xl font-extrabold text-base flex items-center gap-3 mx-auto shadow-xl shadow-emerald-600/25 hover:shadow-2xl hover:shadow-emerald-600/30 transition-all transform hover:scale-[1.02] active:scale-95"
                                >
                                    {seeding ? <FaSpinner className="animate-spin" /> : <FaSeedling />}
                                    {seeding ? 'Đang tạo dữ liệu...' : 'Tạo Dữ Liệu Mặc Định (22 Công Đoạn)'}
                                </button>
                            </div>
                        )}

                        {/* LOADING SKELETON */}
                        {loading && (
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
                            </div>
                        )}

                        {/* DATA TABLE BY CATEGORY */}
                        {!loading && finishingPrices.length > 0 && (
                            <>
                                {/* Stats Bar */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                                    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4">
                                        <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-400 font-bold">Tổng công đoạn</p>
                                        <p className="text-lg sm:text-2xl font-black text-[#111827] mt-0.5 sm:mt-1">{finishingPrices.length}</p>
                                    </div>
                                    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4">
                                        <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-400 font-bold">Nhóm</p>
                                        <p className="text-lg sm:text-2xl font-black text-[#111827] mt-0.5 sm:mt-1">{Object.keys(groupedData).length}</p>
                                    </div>
                                    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4">
                                        <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-400 font-bold">Đang sửa</p>
                                        <p className={`text-lg sm:text-2xl font-black mt-0.5 sm:mt-1 ${hasChanges ? 'text-amber-500' : 'text-gray-300'}`}>{Object.keys(editedPrices).length}</p>
                                    </div>
                                    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4">
                                        <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-400 font-bold">Cập nhật lúc</p>
                                        <p className="text-xs sm:text-sm font-bold text-[#111827] mt-1 truncate">{finishingPrices[0]?.updatedAt ? new Date(finishingPrices[0].updatedAt).toLocaleDateString('vi-VN') : '—'}</p>
                                    </div>
                                </div>

                                {/* Category Sections */}
                                {categoryOrder.map(catId => {
                                    const items = groupedData[catId];
                                    if (!items || items.length === 0) return null;
                                    const meta = CATEGORY_META[catId] || { name: catId, icon: null };
                                    const isCollapsed = collapsedCategories.includes(catId);

                                    return (
                                        <div key={catId} className={`bg-white rounded-xl sm:rounded-2xl border overflow-hidden shadow-sm ${meta.border}`}>
                                            {/* Category Header */}
                                            <button
                                                type="button"
                                                onClick={() => toggleCategory(catId)}
                                                className={`w-full flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 ${meta.bg} hover:brightness-95 transition cursor-pointer`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br ${meta.gradient} rounded-lg sm:rounded-xl flex items-center justify-center text-white text-xs sm:text-sm shadow-sm`}>
                                                        {meta.icon}
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-extrabold text-xs sm:text-sm text-gray-800">{meta.name}</h3>
                                                        <p className="text-[9px] sm:text-[10px] text-gray-500">{meta.subtitle} • {items.length} công đoạn</p>
                                                    </div>
                                                </div>
                                                {isCollapsed ? <FaChevronDown className="text-gray-400 text-xs" /> : <FaChevronUp className="text-gray-400 text-xs" />}
                                            </button>

                                            {/* Items View */}
                                            {!isCollapsed && (
                                                <>
                                                    {/* --- DESKTOP TABLE VIEW --- */}
                                                    <div className="hidden md:block overflow-x-auto">
                                                        <table className="min-w-full">
                                                            <thead>
                                                                <tr className="text-[10px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100">
                                                                    <th className="py-3 px-4 text-left w-14"></th>
                                                                    <th className="py-3 px-4 text-left">Công đoạn</th>
                                                                    <th className="py-3 px-4 text-left hidden md:table-cell">Mô tả</th>
                                                                    <th className="py-3 px-4 text-center w-32">Đơn vị</th>
                                                                    <th className="py-3 px-4 text-right w-40">Giá tiền</th>
                                                                    <th className="py-3 px-4 text-center w-20"></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {items.map(item => {
                                                                    const isEdited = !!editedPrices[item._id];
                                                                    const currentPrice = getVal(item, 'price');
                                                                    const currentUnit = getVal(item, 'unit');

                                                                    return (
                                                                        <tr
                                                                            key={item._id}
                                                                            className={`border-b border-gray-50 transition-colors ${isEdited ? 'bg-amber-50/50' : 'hover:bg-gray-50/50'}`}
                                                                        >
                                                                            <td className="py-3 px-4">
                                                                                <span className="text-xl">{item.icon}</span>
                                                                            </td>
                                                                            <td className="py-3 px-4">
                                                                                <h4 className="font-extrabold text-sm text-gray-800 leading-tight">{item.name}</h4>
                                                                                <span className="text-[10px] text-gray-400 font-mono">{item.processId}</span>
                                                                            </td>
                                                                            <td className="py-3 px-4 hidden md:table-cell">
                                                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed max-w-xs">{item.description}</p>
                                                                            </td>
                                                                            <td className="py-3 px-4 text-center">
                                                                                <select
                                                                                    value={currentUnit}
                                                                                    onChange={e => handlePriceChange(item._id, 'unit', e.target.value)}
                                                                                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] cursor-pointer"
                                                                                >
                                                                                    {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                                                                                </select>
                                                                            </td>
                                                                            <td className="py-3 px-4 text-right">
                                                                                <div className="relative inline-flex items-center">
                                                                                    <input
                                                                                        type="number"
                                                                                        value={currentPrice}
                                                                                        onChange={e => handlePriceChange(item._id, 'price', e.target.value)}
                                                                                        className={`w-32 border rounded-xl px-3 py-2 text-sm text-right font-black outline-none transition-all ${isEdited
                                                                                            ? 'border-amber-400 bg-amber-50 text-amber-700 ring-2 ring-amber-200'
                                                                                            : 'border-gray-200 text-gray-800 focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D]'
                                                                                            }`}
                                                                                    />
                                                                                    <span className="ml-1.5 text-[10px] font-bold text-gray-400">đ</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="py-3 px-4 text-center">
                                                                                {isEdited && (
                                                                                    <button
                                                                                        onClick={() => saveSingle(item._id)}
                                                                                        className="w-8 h-8 bg-[#006B4D] text-white rounded-lg flex items-center justify-center hover:bg-[#005a3f] transition transform active:scale-90 shadow-sm"
                                                                                        title="Lưu riêng"
                                                                                    >
                                                                                        <FaCheck className="text-xs" />
                                                                                    </button>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* --- MOBILE CARD VIEW --- */}
                                                    <div className="md:hidden divide-y divide-gray-100 px-3.5">
                                                        {items.map(item => {
                                                            const isEdited = !!editedPrices[item._id];
                                                            const currentPrice = getVal(item, 'price');
                                                            const currentUnit = getVal(item, 'unit');

                                                            return (
                                                                <div key={item._id} className={`py-3.5 flex flex-col gap-2.5 ${isEdited ? 'bg-amber-50/20 px-2 -mx-2 rounded-lg' : ''}`}>
                                                                    <div className="flex justify-between items-center gap-2">
                                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                                            <span className="text-xl shrink-0">{item.icon}</span>
                                                                            <div className="min-w-0">
                                                                                <h4 className="font-extrabold text-xs text-gray-800 leading-tight truncate">{item.name}</h4>
                                                                                <span className="text-[9px] text-gray-400 font-mono">{item.processId}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="shrink-0 flex items-center gap-2">
                                                                            {isEdited && (
                                                                                <button onClick={() => saveSingle(item._id)} className="w-7 h-7 bg-[#006B4D] text-white rounded-lg flex items-center justify-center shadow-sm">
                                                                                    <FaCheck size={11} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-3 items-center border-t border-gray-100 pt-2">
                                                                        <div>
                                                                            <label className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Đơn vị</label>
                                                                            <select
                                                                                value={currentUnit}
                                                                                onChange={e => handlePriceChange(item._id, 'unit', e.target.value)}
                                                                                className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] cursor-pointer"
                                                                            >
                                                                                {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                                                                            </select>
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5 text-right">Giá tiền</label>
                                                                            <div className="relative flex items-center justify-end">
                                                                                <input
                                                                                    type="number"
                                                                                    value={currentPrice}
                                                                                    onChange={e => handlePriceChange(item._id, 'price', e.target.value)}
                                                                                    className={`w-28 border rounded-lg px-2 py-1 text-xs text-right font-black outline-none transition-all ${isEdited
                                                                                        ? 'border-amber-400 bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                                                                                        : 'border-gray-200 text-gray-800 focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D]'
                                                                                        }`}
                                                                                />
                                                                                <span className="ml-1 text-[9px] font-bold text-gray-400">đ</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </main>

                {/* STICKY SAVE BAR */}
                {hasChanges && (
                    <div className="sticky bottom-0 z-30 bg-[#111827] px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-700 shadow-2xl">
                        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
                                <span className="text-xs sm:text-sm font-bold text-gray-300">
                                    Đã chỉnh sửa <span className="text-amber-400 font-black">{Object.keys(editedPrices).length}</span> công đoạn
                                </span>
                                <button
                                    onClick={() => setEditedPrices({})}
                                    className="text-xs text-gray-500 hover:text-gray-300 underline ml-2 transition"
                                >
                                    Hủy tất cả
                                </button>
                            </div>
                            <button
                                onClick={saveAllChanges}
                                disabled={saving}
                                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-[#006B4D] text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                            >
                                {saving ? <FaSpinner className="animate-spin text-xs" /> : <FaSave size={12} />}
                                {saving ? 'Đang lưu...' : 'LƯU TẤT CẢ THAY ĐỔI'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinishingPriceScreen;
