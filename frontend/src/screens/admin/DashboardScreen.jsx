import React from 'react';
import Sidebar from '../../components/Sidebar'; // <--- Import Sidebar vào
import { FaMoneyBillWave, FaBox, FaUserPlus } from 'react-icons/fa';

const DashboardScreen = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* --- 1. GẮN SIDEBAR VÀO ĐÂY --- */}
      <Sidebar /> 

      {/* --- 2. NỘI DUNG CHÍNH --- */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Xin chào, {userInfo?.name}!</h1>
        <p className="text-gray-500 mb-8">Chào mừng trở lại trang quản trị hệ thống.</p>
        
        {/* Thống kê nhanh */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
               <FaMoneyBillWave className="text-2xl" />
            </div>
            <div>
               <div className="text-gray-500 text-xs uppercase font-bold">Yêu cầu báo giá</div>
               <div className="text-2xl font-bold text-gray-800">0</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center">
             <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
               <FaBox className="text-2xl" />
             </div>
             <div>
               <div className="text-gray-500 text-xs uppercase font-bold">Tổng sản phẩm</div>
               <div className="text-2xl font-bold text-gray-800">3</div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 flex items-center">
             <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
               <FaUserPlus className="text-2xl" />
             </div>
             <div>
               <div className="text-gray-500 text-xs uppercase font-bold">User đăng ký</div>
               <div className="text-2xl font-bold text-gray-800">2</div>
             </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Hướng dẫn quản trị</h2>
          <div className="space-y-3 text-gray-600">
             <p>Chọn các mục bên thanh menu trái để bắt đầu quản lý dữ liệu:</p>
             <ul className="list-disc pl-5 space-y-1">
                <li><strong>Quản lý Báo giá:</strong> Xem danh sách khách hàng vừa gửi form liên hệ.</li>
                <li><strong>Quản lý Sản phẩm:</strong> Thêm, sửa, xóa các mẫu in ấn trên website.</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;