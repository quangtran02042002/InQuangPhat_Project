import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaClipboardList, FaUsers, FaSignOutAlt, FaChartLine } from 'react-icons/fa';

const DashboardScreen = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* --- SIDEBAR (THANH MENU TRÁI) --- */}
      <div className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-blue-800">
          ADMIN PANEL
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="flex items-center px-4 py-3 bg-blue-800 rounded-lg transition">
            <FaChartLine className="mr-3" /> Tổng quan
          </Link>
          
          <Link to="/admin/quotes" className="flex items-center px-4 py-3 hover:bg-blue-800 rounded-lg transition text-gray-300 hover:text-white">
            <FaClipboardList className="mr-3" /> Quản lý Báo giá
          </Link>

          <Link to="/admin/productlist" className="flex items-center px-4 py-3 hover:bg-blue-800 rounded-lg transition text-gray-300 hover:text-white">
            <FaBoxOpen className="mr-3" /> Quản lý Sản phẩm
          </Link>

          <Link to="/admin/users" className="flex items-center px-4 py-3 hover:bg-blue-800 rounded-lg transition text-gray-300 hover:text-white">
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Xin chào, {userInfo?.name}!</h1>
        
        {/* Thẻ thống kê nhanh (Placeholder) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <div className="text-gray-500 text-sm uppercase font-bold">Yêu cầu báo giá mới</div>
            <div className="text-3xl font-bold text-gray-800 mt-2">0</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <div className="text-gray-500 text-sm uppercase font-bold">Tổng sản phẩm</div>
            <div className="text-3xl font-bold text-gray-800 mt-2">3</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <div className="text-gray-500 text-sm uppercase font-bold">User đăng ký</div>
            <div className="text-3xl font-bold text-gray-800 mt-2">2</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">Hướng dẫn quản trị</h2>
          <p className="text-gray-600">
            Chọn các mục bên thanh menu trái để bắt đầu quản lý dữ liệu.
            <br/>- <strong>Quản lý Báo giá:</strong> Xem danh sách khách hàng gửi form.
            <br/>- <strong>Quản lý Sản phẩm:</strong> Thêm/Sửa/Xóa sản phẩm in ấn.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;