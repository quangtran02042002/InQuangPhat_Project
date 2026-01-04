import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBoxOpen, FaClipboardList, FaUsers, FaSignOutAlt, FaPhone, FaTimes } from 'react-icons/fa';

const QuoteListScreen = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]); // Chứa danh sách báo giá
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy thông tin Admin đang đăng nhập
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // 1. Hàm Đăng xuất (Dùng chung)
  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  // 2. Gọi API lấy dữ liệu khi vào trang
  useEffect(() => {
    // Nếu chưa đăng nhập thì đá về trang login ngay
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
      return;
    }

    const fetchQuotes = async () => {
      try {
        // Cấu hình Header chứa Token (Chìa khóa)
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`, 
          },
        };

        // Gọi API với chìa khóa
        const { data } = await axios.get('/api/quotes', config);
        
        setQuotes(data);
        setLoading(false);
      } catch (err) {
        setError(err.response && err.response.data.message ? err.response.data.message : err.message);
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [navigate, userInfo]); // Chạy lại nếu user thay đổi

  return (
    <div className="flex h-screen bg-gray-100">
      {/* --- SIDEBAR (Giống Dashboard) --- */}
      <div className="w-64 bg-blue-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6 text-2xl font-bold border-b border-blue-800">ADMIN PANEL</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="flex items-center px-4 py-3 text-gray-300 hover:bg-blue-800 hover:text-white rounded-lg transition">
            <FaBoxOpen className="mr-3" /> Tổng quan
          </Link>
          <Link to="/admin/quotes" className="flex items-center px-4 py-3 bg-blue-800 text-white rounded-lg transition">
            <FaClipboardList className="mr-3" /> Quản lý Báo giá
          </Link>
          <Link to="/admin/productlist" className="flex items-center px-4 py-3 text-gray-300 hover:bg-blue-800 hover:text-white rounded-lg transition">
            <FaBoxOpen className="mr-3" /> Quản lý Sản phẩm
          </Link>
          <Link to="/admin/users" className="flex items-center px-4 py-3 text-gray-300 hover:bg-blue-800 hover:text-white rounded-lg transition">
            <FaUsers className="mr-3" /> Quản lý User
          </Link>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button onClick={logoutHandler} className="flex items-center text-red-300 hover:text-white transition w-full">
            <FaSignOutAlt className="mr-3" /> Đăng xuất
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT (NỘI DUNG CHÍNH) --- */}
      <div className="flex-1 overflow-y-auto p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 uppercase">Danh sách yêu cầu báo giá</h1>

        {loading ? (
           <div className="text-blue-600 font-medium">Đang tải dữ liệu từ Server...</div>
        ) : error ? (
           <div className="bg-red-100 text-red-600 p-4 rounded">{error}</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                  <th className="py-4 px-6 text-left">Ngày gửi</th>
                  <th className="py-4 px-6 text-left">Khách hàng</th>
                  <th className="py-4 px-6 text-left">Sản phẩm / Yêu cầu</th>
                  <th className="py-4 px-6 text-center">Số lượng</th>
                  <th className="py-4 px-6 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {quotes.map((quote) => (
                  <tr key={quote._id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                    <td className="py-4 px-6 whitespace-nowrap">
                      {new Date(quote.createdAt).toLocaleDateString('vi-VN')}
                      <div className="text-xs text-gray-400">{new Date(quote.createdAt).toLocaleTimeString('vi-VN')}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-800">{quote.name}</div>
                      <div className="flex items-center text-blue-600 mt-1 font-medium">
                         <FaPhone className="mr-1 text-xs" /> {quote.phone}
                      </div>
                      {quote.email && <div className="text-xs text-gray-400 mt-1">{quote.email}</div>}
                    </td>
                    <td className="py-4 px-6">
                        <div className="font-medium">{quote.productName || 'Chung chung'}</div>
                        <div className="text-xs text-gray-500 mt-1 italic max-w-xs truncate">{quote.message}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{quote.quantity || '-'}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                            {quote.status === 'New' ? 'Mới' : quote.status}
                        </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {quotes.length === 0 && (
                <div className="p-10 text-center text-gray-500">Chưa có yêu cầu nào. Hãy thử gửi form liên hệ!</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteListScreen;