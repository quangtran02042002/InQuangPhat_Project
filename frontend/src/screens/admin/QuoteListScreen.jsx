import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPhone, FaCheckDouble, FaTimes } from 'react-icons/fa';

const QuoteListScreen = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      // Lấy token từ bộ nhớ ra để kẹp vào "phong bì" gửi đi
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`, // Kẹp thẻ bài vào đây
        },
      };

      try {
        const { data } = await axios.get('/api/quotes', config);
        setQuotes(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chúng ta dùng lại cấu trúc sidebar ở App.jsx hoặc copy vào đây nếu muốn nhanh */}
      {/* Để đơn giản, ta chỉ render phần nội dung chính, Sidebar đã có DashboardScreen lo (nhưng đúng ra nên tách Sidebar thành component riêng) */}
      
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaCheckDouble className="mr-3 text-blue-600" /> QUẢN LÝ YÊU CẦU BÁO GIÁ
        </h1>

        {loading ? (
            <div className="text-blue-600">Đang tải dữ liệu...</div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Ngày gửi</th>
                            <th className="py-3 px-6 text-left">Khách hàng</th>
                            <th className="py-3 px-6 text-left">Sản phẩm quan tâm</th>
                            <th className="py-3 px-6 text-center">Số lượng</th>
                            <th className="py-3 px-6 text-center">Trạng thái</th>
                            <th className="py-3 px-6 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {quotes.map((quote) => (
                            <tr key={quote._id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-6 text-left whitespace-nowrap">
                                    {new Date(quote.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="py-3 px-6 text-left">
                                    <div className="font-bold">{quote.name}</div>
                                    <div className="text-xs text-blue-500 flex items-center mt-1">
                                        <FaPhone className="mr-1" /> {quote.phone}
                                    </div>
                                </td>
                                <td className="py-3 px-6 text-left">
                                    {quote.productName || 'Chưa rõ'}
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <span className="bg-purple-100 text-purple-600 py-1 px-3 rounded-full text-xs">
                                        {quote.quantity || '?'}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <span className={`py-1 px-3 rounded-full text-xs ${quote.status === 'New' ? 'bg-green-200 text-green-600' : 'bg-gray-200 text-gray-600'}`}>
                                        {quote.status === 'New' ? 'Mới' : quote.status}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <button className="text-red-500 hover:text-red-700 transform hover:scale-110">
                                        <FaTimes />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {quotes.length === 0 && (
                    <div className="p-10 text-center text-gray-400">Chưa có yêu cầu báo giá nào.</div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default QuoteListScreen;