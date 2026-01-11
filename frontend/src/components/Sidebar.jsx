import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// Thêm FaCogs vào danh sách import icon
import { FaBoxOpen, FaClipboardList, FaUsers, FaSignOutAlt, FaChartLine, FaUserCog, FaNewspaper, FaCogs,FaTruck } from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname.includes(path)
      ? 'bg-blue-800 text-white shadow-md'
      : 'text-gray-300 hover:bg-blue-800 hover:text-white';
  };

  return (
    <div className="w-64 bg-blue-900 text-white flex flex-col flex-shrink-0 h-screen sticky top-0 left-0">
      {/* HEADER SIDEBAR */}
      <div className="p-6 text-2xl font-bold border-b border-blue-800 flex items-center justify-center">
        ADMIN PANEL
      </div>

      {/* MENU LIST */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link to="/admin/dashboard" className={`flex items-center px-4 py-3 rounded-lg transition ${isActive('/admin/dashboard')}`}>
          <FaChartLine className="mr-3 text-lg" />
          <span className="font-medium">Tổng quan</span>
        </Link>

        <Link to="/admin/quotes" className={`flex items-center px-4 py-3 rounded-lg transition ${isActive('/admin/quotes')}`}>
          <FaClipboardList className="mr-3 text-lg" />
          <span className="font-medium">Quản lý Báo giá</span>
        </Link>

        <Link to="/admin/productlist" className={`flex items-center px-4 py-3 rounded-lg transition ${isActive('/admin/productlist')}`}>
          <FaBoxOpen className="mr-3 text-lg" />
          <span className="font-medium">Quản lý Sản phẩm</span>
        </Link>

        {/* --- MENU QUẢN LÝ MÁY MÓC (MỚI THÊM) --- */}
        <Link to="/admin/machinelist" className={`flex items-center px-4 py-3 rounded-lg transition ${isActive('/admin/machinelist')}`}>
          <FaCogs className="mr-3 text-lg" />
          <span className="font-medium">Quản lý Máy móc</span>
        </Link>
        {/* -------------------------------------- */}
<Link to="/admin/supplierlist" className={`flex items-center px-4 py-3 rounded-lg transition ${isActive('/admin/supplierlist')}`}>
    <FaTruck className="mr-3 text-lg" />
    <span className="font-medium">Nhà Cung Cấp</span>
</Link>
        <Link to="/admin/newslist" className={`flex items-center px-4 py-3 rounded-lg transition ${isActive('/admin/news')}`}>
          <FaNewspaper className="mr-3 text-lg" />
          <span className="font-medium">Quản lý Tin tức</span>
        </Link>

        <Link to="/admin/users" className={`flex items-center px-4 py-3 rounded-lg transition ${isActive('/admin/users')}`}>
          <FaUsers className="mr-3 text-lg" />
          <span className="font-medium">Quản lý User</span>
        </Link>

        <Link to="/admin/profile" className={`flex items-center px-4 py-3 rounded-lg transition ${isActive('/admin/profile')}`}>
          <FaUserCog className="mr-3 text-lg" />
          <span className="font-medium">Hồ sơ cá nhân</span>
        </Link>
      </nav>
      
      {/* FOOTER SIDEBAR */}
      <div className="p-4 border-t border-blue-800">
        <button onClick={logoutHandler} className="flex items-center justify-center w-full px-4 py-2 text-red-300 hover:text-white hover:bg-red-600 rounded-lg transition">
          <FaSignOutAlt className="mr-2" /> Đăng xuất
        </button>
      </div>

    </div>
  );
};

export default Sidebar;