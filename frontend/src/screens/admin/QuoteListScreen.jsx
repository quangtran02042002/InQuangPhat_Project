import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheckDouble, FaEye, FaPhone, FaCalendarAlt, FaSearch, FaFilter, FaTimes, FaClipboardList, FaBoxOpen } from 'react-icons/fa';

import Sidebar from '../../components/Sidebar';
import QuoteDetailModal from '../../components/QuoteDetailModal'; 
import AdminHeader from '../../components/AdminHeader';
const QuoteListScreen = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- SEARCH & FILTER STATE ---
  const [keyword, setKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, New, Contacted, Done
  
  // State cho Modal
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Lấy danh sách
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
  }, []);

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

      // Cập nhật state local
      setQuotes(quotes.map(q => q._id === id ? { ...q, status: newStatus } : q));
      setSelectedQuote(data);

      toast.success(`Đã cập nhật trạng thái: ${newStatus}`);
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredQuotes = quotes.filter((quote) => {
    // 1. Tìm kiếm (Tên, SĐT, Tên sản phẩm)
    const searchLower = keyword.toLowerCase();
    const matchesKeyword = 
        quote.name.toLowerCase().includes(searchLower) ||
        quote.phone.includes(searchLower) ||
        (quote.productName && quote.productName.toLowerCase().includes(searchLower));

    // 2. Lọc theo Trạng thái
    const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;

    return matchesKeyword && matchesStatus;
  });

  // Helper render Badge trạng thái
  const getStatusBadge = (status) => {
      switch (status) {
          case 'New':
              return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700 border border-green-200 uppercase animate-pulse">Mới</span>;
          case 'Contacted':
              return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase">Đang xử lý</span>;
          case 'Done':
              return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase">Hoàn thành</span>;
          default:
              return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">{status}</span>;
      }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <div className="flex-1 p-8 overflow-y-auto h-screen pb-24">
        
        {/* HEADER */}
        <AdminHeader title="Quản lý Yêu cầu Báo giá" />

        {/* --- TOOLBAR (SEARCH & FILTER) --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* SEARCH */}
            <div className="relative w-full md:w-1/2">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Tìm theo tên khách, SĐT, tên sản phẩm..." 
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                {keyword && (
                    <button onClick={() => setKeyword('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <FaTimes />
                    </button>
                )}
            </div>

            {/* FILTER & STATS */}
            <div className="flex gap-4 w-full md:w-auto items-center">
                <div className="relative">
                    <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700 font-medium appearance-none cursor-pointer"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="New">Mới (Chưa xử lý)</option>
                        <option value="Contacted">Đang xử lý</option>
                        <option value="Done">Hoàn thành</option>
                    </select>
                </div>
                
                <div className="bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap border border-blue-100">
                    {filteredQuotes.length} Yêu cầu
                </div>
            </div>
        </div>

        {/* TABLE */}
        {loading ? (
            <div className="text-center mt-20 text-gray-500 animate-pulse font-medium">Đang tải dữ liệu...</div>
        ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <table className="min-w-full leading-normal table-fixed">
                    <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                        <tr className="text-xs font-bold uppercase tracking-wider">
                            <th className="px-5 py-4 text-left w-1/5">Thời gian</th>
                            <th className="px-5 py-4 text-left w-1/4">Khách hàng</th>
                            <th className="px-5 py-4 text-left w-1/4">Nhu cầu sản phẩm</th>
                            <th className="px-5 py-4 text-center w-32">Trạng thái</th>
                            <th className="px-5 py-4 text-center w-24">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {filteredQuotes.map((quote) => (
                            <tr key={quote._id} className="border-b border-gray-100 hover:bg-blue-50/60 transition duration-200">
                                
                                {/* 1. Thời gian */}
                                <td className="px-5 py-4">
                                    <div className="flex flex-col text-sm text-gray-600">
                                        <div className="flex items-center font-medium text-slate-700">
                                            <FaCalendarAlt className="mr-2 text-gray-400 text-xs" />
                                            {new Date(quote.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                        <span className="text-xs text-gray-400 pl-5 mt-0.5">
                                            {new Date(quote.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </td>

                                {/* 2. Khách hàng */}
                                <td className="px-5 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800 text-base line-clamp-1">{quote.name}</span>
                                        <a href={`tel:${quote.phone}`} className="text-sm text-blue-600 hover:underline flex items-center mt-1">
                                            <FaPhone className="mr-1.5 text-xs" /> {quote.phone}
                                        </a>
                                    </div>
                                </td>

                                {/* 3. Nhu cầu */}
                                <td className="px-5 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-700 text-sm flex items-center">
                                            <FaBoxOpen className="mr-2 text-gray-400 text-xs"/>
                                            {quote.productName || 'Chưa rõ sản phẩm'}
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1 pl-5">
                                            Số lượng: <span className="font-bold">{quote.quantity ? quote.quantity.toLocaleString() : '?'}</span>
                                        </span>
                                    </div>
                                </td>

                                {/* 4. Trạng thái */}
                                <td className="px-5 py-4 text-center">
                                    {getStatusBadge(quote.status)}
                                </td>

                                {/* 5. Hành động */}
                                <td className="px-5 py-4 text-center">
                                    <button 
                                        onClick={() => openDetailHandler(quote)}
                                        className="text-amber-500 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition shadow-sm"
                                        title="Xem chi tiết & Xử lý"
                                    >
                                        <FaEye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {filteredQuotes.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-16 text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <FaClipboardList size={40} className="mb-4 opacity-20"/>
                                        <p>Không tìm thấy yêu cầu báo giá nào.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* MODAL CHI TIẾT */}
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