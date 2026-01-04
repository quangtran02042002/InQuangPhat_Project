import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheckDouble, FaEye, FaPhone, FaCalendarAlt } from 'react-icons/fa';

import Sidebar from '../../components/Sidebar';
import QuoteDetailModal from '../../components/QuoteDetailModal'; // Import Modal mới

const QuoteListScreen = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
      
      // 1. Gọi API
      const { data } = await axios.put(`/api/quotes/${id}/status`, { status: newStatus }, config);

      // 2. Cập nhật giao diện list ngay lập tức (không load lại trang)
      setQuotes(quotes.map(q => q._id === id ? { ...q, status: newStatus } : q));
      
      // 3. Cập nhật giao diện trong Modal (nếu đang mở)
      setSelectedQuote(data);

      toast.success(`Đã cập nhật trạng thái: ${newStatus}`);
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center uppercase">
            <FaCheckDouble className="mr-3 text-blue-600" /> Quản lý Yêu cầu báo giá
        </h1>

        {loading ? (
            <div className="text-blue-600 font-medium">Đang tải dữ liệu...</div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                            <th className="py-4 px-6 text-left">Ngày gửi</th>
                            <th className="py-4 px-6 text-left">Khách hàng</th>
                            <th className="py-4 px-6 text-left">Nhu cầu</th>
                            <th className="py-4 px-6 text-center">Trạng thái</th>
                            <th className="py-4 px-6 text-center">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                        {quotes.map((quote) => (
                            <tr key={quote._id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                                <td className="py-4 px-6 whitespace-nowrap text-gray-500">
                                    <div className="flex items-center">
                                        <FaCalendarAlt className="mr-2 text-gray-400" />
                                        {new Date(quote.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="text-xs pl-6 mt-1">{new Date(quote.createdAt).toLocaleTimeString('vi-VN')}</div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="font-bold text-gray-800 text-base">{quote.name}</div>
                                    <div className="flex items-center text-blue-600 mt-1 font-medium cursor-pointer hover:underline">
                                        <FaPhone className="mr-1 text-xs" /> <a href={`tel:${quote.phone}`}>{quote.phone}</a>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="font-medium text-gray-800">{quote.productName || 'Chưa rõ'}</div>
                                    <div className="text-xs text-gray-500 mt-1">SL: {quote.quantity || '?'}</div>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                        quote.status === 'New' ? 'bg-green-100 text-green-700 border-green-200' :
                                        quote.status === 'Contacted' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                        'bg-blue-100 text-blue-700 border-blue-200'
                                    }`}>
                                        {quote.status === 'New' ? 'Mới' : 
                                         quote.status === 'Contacted' ? 'Đang xử lý' : 'Hoàn thành'}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <button 
                                        onClick={() => openDetailHandler(quote)}
                                        className="text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 p-2 rounded-full transition shadow-sm"
                                        title="Xem chi tiết & Xử lý"
                                    >
                                        <FaEye />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {quotes.length === 0 && (
                    <div className="p-10 text-center text-gray-500">Chưa có yêu cầu báo giá nào.</div>
                )}
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