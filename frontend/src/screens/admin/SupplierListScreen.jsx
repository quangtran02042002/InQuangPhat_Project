import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaTruck, FaSearch, FaTimes, FaPhoneAlt, FaBoxOpen, FaUserTie, FaBars, FaFileInvoice } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';
import AdminHeader from '../../components/AdminHeader';

// Hàm chọn màu Avatar ngẫu nhiên
const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-100 text-gray-600';
    const colors = ['bg-red-100 text-red-600', 'bg-orange-100 text-orange-600', 'bg-amber-100 text-amber-600', 'bg-green-100 text-green-600', 'bg-teal-100 text-teal-600', 'bg-blue-100 text-blue-600', 'bg-indigo-100 text-indigo-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash % colors.length)];
};

const SupplierListScreen = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- STATE TÌM KIẾM ---
    const [keyword, setKeyword] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // === STATE QUẢN LÝ SIDEBAR MOBILE ===
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }
        fetchSuppliers();
    }, [navigate]);

    const fetchSuppliers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/v1/suppliers', config);
            setSuppliers(data.suppliers || data);
            setLoading(false);
        } catch (error) {
            toast.error('Lỗi tải danh sách nhà cung cấp');
            setLoading(false);
        }
    };

    const deleteHandler = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`/api/v1/suppliers/${deleteId}`, config);
            setSuppliers(suppliers.filter((s) => s._id !== deleteId));
            toast.success('Đã xóa nhà cung cấp thành công');
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Lỗi khi xóa nhà cung cấp');
        }
    };

    // --- LOGIC LỌC DỮ LIỆU ---
    const filteredSuppliers = suppliers.filter((sup) => {
        const searchLower = keyword.toLowerCase();
        return (
            sup.name.toLowerCase().includes(searchLower) ||
            (sup.productsProvided && sup.productsProvided.toLowerCase().includes(searchLower)) ||
            (sup.contactName && sup.contactName.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827] relative">

            {/* ================= OVERLAY & SIDEBAR MOBILE ================= */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-[#111827]/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <div className={`fixed inset-y-0 left-0 z-50 h-full transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0 lg:block`}>
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col w-full overflow-hidden">

                {/* ================= GỌI ADMIN HEADER ĐỒNG BỘ ================= */}
                <AdminHeader
                    title="Quản lý Nhà Cung Cấp"
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                {/* ================= MAIN CONTENT ================= */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
                    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

                        {/* --- KHU VỰC TIÊU ĐỀ & NÚT THÊM (DESKTOP) --- */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-xl md:text-2xl shadow-sm shrink-0">
                                    <FaTruck />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Danh mục Đối tác</h2>
                                    <p className="text-[#6B7280] text-xs md:text-sm mt-0.5 md:mt-1">Quản lý mạng lưới nhà cung cấp vật tư in ấn</p>
                                </div>
                            </div>
                            <Link to="/admin/supplier/new" className="hidden sm:flex items-center gap-2 bg-[#006B4D] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#00543c] transition active:scale-95 shrink-0">
                                <FaPlus /> Thêm NCC Mới
                            </Link>
                        </div>

                        {/* --- THANH CÔNG CỤ TÌM KIẾM --- */}
                        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">

                            {/* Ô TÌM KIẾM */}
                            <div className="relative w-full sm:w-1/2 lg:w-1/3">
                                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tên NCC, sản phẩm, người liên hệ..."
                                    className="w-full bg-gray-50 border border-gray-200 text-[#111827] text-sm md:text-base rounded-xl pl-12 pr-10 py-3 outline-none focus:border-[#006B4D] focus:bg-white transition shadow-sm"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                                {keyword && (
                                    <button onClick={() => setKeyword('')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition">
                                        <FaTimes />
                                    </button>
                                )}
                            </div>

                            {/* THỐNG KÊ NHANH */}
                            <div className="w-full sm:w-auto flex items-center justify-center bg-[#E6F0ED] text-[#006B4D] px-5 py-3 rounded-xl font-bold text-sm shadow-sm">
                                {filteredSuppliers.length} <span className="font-medium ml-1">Đối tác</span>
                            </div>
                        </div>

                        {/* --- HIỂN THỊ DỮ LIỆU --- */}
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006B4D] mx-auto mb-4"></div>
                                <div className="text-gray-400 font-medium">Đang tải danh sách nhà cung cấp...</div>
                            </div>
                        ) : filteredSuppliers.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 border-dashed text-gray-400 shadow-sm flex flex-col items-center">
                                <FaTruck className="text-5xl text-gray-200 mb-4 opacity-50" />
                                <p className="text-lg font-extrabold text-[#111827]">Không tìm thấy đối tác nào</p>
                                <p className="text-sm mt-1">Vui lòng thử lại với từ khóa khác</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-20 sm:mb-0">

                                {/* ================= GIAO DIỆN DESKTOP (TABLE) ================= */}
                                <div className="hidden lg:block overflow-x-auto custom-scrollbar max-h-[70vh]">
                                    <table className="min-w-full leading-normal text-left align-middle">
                                        <thead className="bg-[#F9FAFB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                                            <tr>
                                                <th className="px-6 py-5 w-1/4">Nhà Cung Cấp</th>
                                                <th className="px-6 py-5 w-1/3">Sản phẩm chính</th>
                                                <th className="px-6 py-5 w-1/4">Liên hệ</th>
                                                <th className="px-6 py-5 text-center w-28">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {filteredSuppliers.map((sup) => (
                                                <tr key={sup._id} className="border-b border-gray-100 hover:bg-[#E6F0ED]/30 transition-colors">

                                                    {/* 1. Tên NCC & MST */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm ${getAvatarColor(sup.name)}`}>
                                                                {sup.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="font-extrabold text-[#111827] text-base leading-tight truncate mb-1" title={sup.name}>
                                                                    {sup.name}
                                                                </p>
                                                                {sup.taxCode ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-100 text-[#6B7280] border border-gray-200">
                                                                        <FaFileInvoice className="text-[9px]" /> MST: {sup.taxCode}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] font-bold text-gray-300 italic">Chưa cập nhật MST</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* 2. Sản phẩm */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-start gap-2.5 group">
                                                            <div className="bg-[#E6F0ED] p-1.5 rounded text-[#006B4D] shrink-0 mt-0.5">
                                                                <FaBoxOpen size={12} />
                                                            </div>
                                                            <span className="text-gray-600 font-medium leading-relaxed line-clamp-2" title={sup.productsProvided}>
                                                                {sup.productsProvided || 'Chưa phân loại sản phẩm'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* 3. Thông tin liên hệ */}
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center text-sm font-extrabold text-[#006B4D]">
                                                                <FaPhoneAlt className="mr-2 text-xs opacity-50" />
                                                                {sup.phone}
                                                            </div>
                                                            {sup.contactName && (
                                                                <div className="flex items-center text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                                                                    <FaUserTie className="mr-2 text-gray-400" />
                                                                    {sup.contactName}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* 4. Hành động */}
                                                    <td className="px-6 py-4 text-center align-middle">
                                                        <div className="flex justify-center space-x-2">
                                                            <Link to={`/admin/supplier/${sup._id}/edit`} className="text-gray-400 hover:text-[#006B4D] bg-white hover:bg-[#E6F0ED] p-2.5 rounded-lg transition-colors border border-transparent hover:border-[#006B4D]/20 shadow-sm" title="Sửa đối tác"><FaEdit size={16} /></Link>
                                                            <button onClick={() => { setDeleteId(sup._id); setIsModalOpen(true); }} className="text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 p-2.5 rounded-lg transition-colors border border-transparent hover:border-red-100 shadow-sm" title="Xóa đối tác"><FaTrash size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* ================= GIAO DIỆN MOBILE (CARD LIST) ================= */}
                                <div className="lg:hidden flex flex-col divide-y divide-gray-100">
                                    {filteredSuppliers.map((sup) => (
                                        <div key={sup._id} className="p-4 bg-white flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm ${getAvatarColor(sup.name)}`}>
                                                        {sup.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-[#111827] text-base leading-tight">{sup.name}</p>
                                                        {sup.taxCode && <p className="text-[10px] font-mono font-bold text-gray-400 mt-0.5">MST: {sup.taxCode}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Link to={`/admin/supplier/${sup._id}/edit`} className="p-2 text-gray-400 hover:text-[#006B4D]"><FaEdit size={14} /></Link>
                                                    <button onClick={() => { setDeleteId(sup._id); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-red-500"><FaTrash size={14} /></button>
                                                </div>
                                            </div>

                                            <div className="bg-[#F9FAFB] p-3 rounded-xl border border-gray-100">
                                                <div className="flex items-start gap-2 mb-2">
                                                    <FaBoxOpen className="text-gray-400 mt-1 shrink-0" size={12} />
                                                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{sup.productsProvided || 'Chưa cập nhật sản phẩm'}</p>
                                                </div>
                                                <div className="flex flex-col gap-1 pt-2 border-t border-gray-200/50">
                                                    <a href={`tel:${sup.phone}`} className="flex items-center text-sm font-extrabold text-[#006B4D]">
                                                        <FaPhoneAlt className="mr-2 text-xs opacity-50" /> {sup.phone}
                                                    </a>
                                                    {sup.contactName && (
                                                        <p className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                            <FaUserTie className="mr-2 text-gray-400" /> {sup.contactName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        )}
                    </div>

                    {/* Nút Floating Thêm mới cho Mobile */}
                    <Link
                        to="/admin/supplier/new"
                        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#006B4D] text-white rounded-full shadow-[0_4px_12px_rgba(0,107,77,0.4)] flex items-center justify-center z-30 hover:bg-[#00543c] transition-all active:scale-95"
                    >
                        <FaPlus size={20} />
                    </Link>
                </main>
            </div>

            <ConfirmModal
                isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={deleteHandler}
                title="Xác nhận xóa đối tác" message="Bạn chắc chắn muốn xóa nhà cung cấp này khỏi hệ thống? Dữ liệu không thể phục hồi."
            />
        </div>
    );
};

export default SupplierListScreen;