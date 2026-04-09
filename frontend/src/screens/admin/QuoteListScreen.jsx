import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheckDouble, FaEye, FaPhone, FaCalendarAlt, FaSearch, FaFilter, FaTimes, FaClipboardList, FaBoxOpen, FaUser, FaClock, FaBars } from 'react-icons/fa';

import Sidebar from '../../components/Sidebar';
import QuoteDetailModal from '../../components/QuoteDetailModal';
import AdminHeader from '../../components/AdminHeader';

const QuoteListScreen = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- SEARCH & FILTER STATE ---
    const [keyword, setKeyword] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // --- UI STATE ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // Lấy danh sách từ API
    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get('/api/quotes', config);
                setQuotes(data);
                setLoading(false);
            } catch (error) {
                toast.error('Lỗi tải danh sách báo giá');
                setLoading(false);
            }
        };
        fetchQuotes();
    }, [userInfo.token]);

    // Hàm mở Modal xem chi tiết
    const openDetailHandler = (quote) => {
        setSelectedQuote(quote);
        setIsModalOpen(true);
    };

    // Hàm gọi API cập nhật trạng thái
    const updateStatusHandler = async (id, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.put(`/api/quotes/${id}/status`, { status: newStatus }, config);

            setQuotes(quotes.map(q => q._id === id ? { ...q, status: newStatus } : q));
            setSelectedQuote(data);

            toast.success(`Đã cập nhật trạng thái: ${newStatus}`);
        } catch (error) {
            toast.error('Lỗi khi cập nhật trạng thái');
        }
    };

    // --- LOGIC LỌC DỮ LIỆU ---
    const filteredQuotes = quotes.filter((quote) => {
        const searchLower = keyword.toLowerCase();
        const matchesKeyword =
            quote.name.toLowerCase().includes(searchLower) ||
            quote.phone.includes(searchLower) ||
            (quote.productName && quote.productName.toLowerCase().includes(searchLower));

        const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;

        return matchesKeyword && matchesStatus;
    });

    // Helper render Badge trạng thái theo style mới
    const getStatusBadge = (status) => {
        switch (status) {
            case 'New':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-[#E6F0ED] text-[#006B4D] border border-[#006B4D]/20 uppercase animate-pulse">Mới</span>;
            case 'Contacted':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-600 border border-amber-100 uppercase">Đang xử lý</span>;
            case 'Done':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100 uppercase">Hoàn thành</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-gray-100 text-gray-600 border border-gray-200 uppercase">{status}</span>;
        }
    };

    return (
        <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827] relative">

            {/* ================= SIDEBAR & OVERLAY ================= */}
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

                {/* ================= ADMIN HEADER ================= */}
                <AdminHeader
                    title="Quản lý Báo giá"
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

                        {/* --- TITLE SECTION --- */}
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-xl md:text-2xl shadow-sm shrink-0">
                                <FaClipboardList />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Yêu cầu từ khách hàng</h2>
                                <p className="text-[#6B7280] text-xs md:text-sm mt-0.5 md:mt-1">Phản hồi báo giá nhanh giúp tăng tỉ lệ chốt đơn</p>
                            </div>
                        </div>

                        {/* --- TOOLBAR (SEARCH & FILTER) --- */}
                        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
                            {/* SEARCH */}
                            <div className="relative w-full lg:w-1/2">
                                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tên khách, SĐT, tên sản phẩm..."
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

                            {/* FILTER & STATS */}
                            <div className="flex flex-wrap sm:flex-nowrap gap-3 md:gap-4 w-full lg:w-auto items-center">
                                <div className="relative flex-1 sm:flex-none">
                                    <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full sm:w-auto pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#006B4D] bg-white text-[#111827] text-sm md:text-base font-bold appearance-none cursor-pointer shadow-sm"
                                    >
                                        <option value="all">Tất cả trạng thái</option>
                                        <option value="New">Mới (Chưa xử lý)</option>
                                        <option value="Contacted">Đang xử lý</option>
                                        <option value="Done">Hoàn thành</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-center bg-[#E6F0ED] text-[#006B4D] px-5 py-3 rounded-xl font-extrabold text-sm shadow-sm shrink-0 border border-[#006B4D]/10">
                                    {filteredQuotes.length} <span className="font-bold ml-1 text-xs">YÊU CẦU</span>
                                </div>
                            </div>
                        </div>

                        {/* --- DATA LIST --- */}
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006B4D] mx-auto mb-4"></div>
                                <div className="text-gray-400 font-medium">Đang tải danh sách báo giá...</div>
                            </div>
                        ) : filteredQuotes.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 border-dashed text-gray-400 shadow-sm flex flex-col items-center">
                                <FaSearch className="text-5xl text-gray-200 mb-4" />
                                <p className="text-lg font-extrabold text-[#111827]">Không tìm thấy báo giá nào</p>
                                <p className="text-sm mt-1">Vui lòng thử lại với từ khóa hoặc trạng thái khác</p>
                            </div>
                        ) : (
                            <div className="mb-20 sm:mb-10">
                                {/* ================= DESKTOP TABLE ================= */}
                                <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <table className="min-w-full leading-normal text-left">
                                        <thead className="bg-[#F9FAFB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-5 w-1/5">Thời gian nhận</th>
                                                <th className="px-6 py-5 w-1/4">Khách hàng</th>
                                                <th className="px-6 py-5 w-1/4">Nhu cầu sản phẩm</th>
                                                <th className="px-6 py-5 text-center w-32">Trạng thái</th>
                                                <th className="px-6 py-5 text-center w-28">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {filteredQuotes.map((quote) => (
                                                <tr key={quote._id} className="border-b border-gray-100 hover:bg-[#E6F0ED]/30 transition-colors">
                                                    {/* Thời gian */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center font-bold text-[#111827]">
                                                                <FaCalendarAlt className="mr-2 text-[#006B4D] text-[10px]" />
                                                                {new Date(quote.createdAt).toLocaleDateString('vi-VN')}
                                                            </div>
                                                            <div className="flex items-center text-[11px] text-gray-400 mt-1">
                                                                <FaClock className="mr-2" />
                                                                {new Date(quote.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Khách hàng */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-extrabold text-[#111827] text-base leading-tight mb-1 truncate">{quote.name}</span>
                                                            <a href={`tel:${quote.phone}`} className="text-sm font-bold text-[#006B4D] hover:underline flex items-center">
                                                                <FaPhone className="mr-2 text-[10px]" /> {quote.phone}
                                                            </a>
                                                        </div>
                                                    </td>

                                                    {/* Sản phẩm */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-[#111827] text-sm flex items-center truncate">
                                                                <FaBoxOpen className="mr-2 text-gray-300 text-xs shrink-0" />
                                                                {quote.productName || 'Chưa rõ sản phẩm'}
                                                            </span>
                                                            <span className="text-xs font-medium text-gray-500 mt-1 ml-5">
                                                                Số lượng: <span className="font-extrabold text-gray-700">{quote.quantity ? quote.quantity.toLocaleString() : '?'}</span>
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Trạng thái */}
                                                    <td className="px-6 py-4 text-center">
                                                        {getStatusBadge(quote.status)}
                                                    </td>

                                                    {/* Hành động */}
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => openDetailHandler(quote)}
                                                            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#006B4D] hover:bg-[#E6F0ED] hover:border-[#006B4D]/20 transition-all shadow-sm active:scale-90"
                                                            title="Xem chi tiết & Xử lý"
                                                        >
                                                            <FaEye size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* ================= MOBILE CARD LIST ================= */}
                                <div className="lg:hidden flex flex-col gap-4">
                                    {filteredQuotes.map((quote) => (
                                        <div key={quote._id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm relative overflow-hidden">
                                            {/* Móc hiển thị trạng thái góc trên */}
                                            <div className="absolute top-0 right-0">
                                                {getStatusBadge(quote.status)}
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center">
                                                        <FaClock className="mr-1.5" /> {new Date(quote.createdAt).toLocaleDateString('vi-VN')} {new Date(quote.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <h3 className="font-extrabold text-[#111827] text-lg flex items-center gap-2">
                                                        <FaUser className="text-[#006B4D] text-sm" /> {quote.name}
                                                    </h3>
                                                    <a href={`tel:${quote.phone}`} className="text-sm font-bold text-[#006B4D] flex items-center mt-1">
                                                        <FaPhone className="mr-2 text-xs" /> {quote.phone}
                                                    </a>
                                                </div>

                                                <div className="bg-[#F9FAFB] p-3 rounded-xl border border-gray-100">
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Nhu cầu in ấn:</div>
                                                    <div className="font-bold text-[#111827] text-sm leading-tight mb-1">{quote.productName || 'Chưa rõ sản phẩm'}</div>
                                                    <div className="text-xs font-medium text-gray-500">Số lượng: <span className="font-extrabold">{quote.quantity ? quote.quantity.toLocaleString() : '?'}</span></div>
                                                </div>

                                                <button
                                                    onClick={() => openDetailHandler(quote)}
                                                    className="w-full bg-[#E6F0ED] text-[#006B4D] font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 border border-[#006B4D]/10"
                                                >
                                                    <FaEye /> Xem chi tiết & Phản hồi
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* MODAL CHI TIẾT - Giữ nguyên logic */}
            <QuoteDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                quote={selectedQuote}
                onUpdateStatus={updateStatusHandler}
            />
        </div>
    );
};

export default QuoteListScreen;