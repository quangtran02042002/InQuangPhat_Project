import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    FaBuilding, FaBoxOpen, FaClipboardList, FaUsers, FaSignOutAlt, 
    FaChartLine, FaUserCog, FaNewspaper, FaCogs, FaTruck, FaHome 
} from 'react-icons/fa';

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
    <div className="w-64 bg-blue-900 text-white flex flex-col flex-shrink-0 h-screen sticky top-0 left-0 shadow-xl z-50">
      
      {/* CSS TÙY CHỈNH THANH CUỘN (SCROLLBAR) */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px; /* Thanh cuộn siêu mỏng */
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent; /* Nền trong suốt */
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1); /* Màu thanh cuộn mờ */
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.3); /* Sáng lên khi di chuột vào */
        }
        /* Firefox */
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
      `}</style>

      {/* HEADER SIDEBAR */}
      <div className="p-6 border-b border-blue-800 flex flex-col items-center justify-center shrink-0">
        <h2 className="text-2xl font-bold tracking-wider">ADMIN PANEL</h2>
        <p className="text-[10px] text-blue-300 mt-1 uppercase tracking-[0.2em]">In Quang Phát</p>
      </div>

      {/* MENU LIST (ÁP DỤNG CLASS sidebar-scroll) */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto sidebar-scroll">
        
        {/* NÚT VỀ TRANG CHỦ WEBSITE */}
        <Link to="/" className="flex items-center px-4 py-3 mb-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition shadow-lg border border-indigo-400 group">
            <FaHome className="mr-3 text-lg group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm">Xem Website chính</span>
        </Link>
        
        <div className="border-b border-blue-800/50 mb-4 mx-2"></div>

        <Link to="/admin/dashboard" className={`flex items-center px-4 py-3 rounded-lg transition mb-1 ${isActive('/admin/dashboard')}`}>
          <FaChartLine className="mr-3 text-lg" />
          <span className="font-medium text-sm">Tổng quan</span>
        </Link>

        <Link to="/admin/quotes" className={`flex items-center px-4 py-3 rounded-lg transition mb-1 ${isActive('/admin/quotes')}`}>
          <FaClipboardList className="mr-3 text-lg" />
          <span className="font-medium text-sm">Quản lý Báo giá</span>
        </Link>

        <Link to="/admin/productlist" className={`flex items-center px-4 py-3 rounded-lg transition mb-1 ${isActive('/admin/productlist')}`}>
          <FaBoxOpen className="mr-3 text-lg" />
          <span className="font-medium text-sm">Quản lý Sản phẩm</span>
        </Link>

        <Link to="/admin/machinelist" className={`flex items-center px-4 py-3 rounded-lg transition mb-1 ${isActive('/admin/machinelist')}`}>
          <FaCogs className="mr-3 text-lg" />
          <span className="font-medium text-sm">Quản lý Máy móc</span>
        </Link>
        
        <Link to="/admin/supplierlist" className={`flex items-center px-4 py-3 rounded-lg transition mb-1 ${isActive('/admin/supplierlist')}`}>
          <FaTruck className="mr-3 text-lg" />
          <span className="font-medium text-sm">Nhà Cung Cấp</span>
        </Link>

        <Link to="/admin/customerlist" className={`flex items-center px-4 py-3 rounded-lg transition mb-1 ${isActive('/admin/customer')}`}>
            <FaBuilding className="mr-3 text-lg" />
            <span className="font-medium text-sm">Quản lý Khách hàng</span>
        </Link>

        <Link to="/admin/newslist" className={`flex items-center px-4 py-3 rounded-lg transition mb-1 ${isActive('/admin/news')}`}>
          <FaNewspaper className="mr-3 text-lg" />
          <span className="font-medium text-sm">Quản lý Tin tức</span>
        </Link>

        <Link to="/admin/users" className={`flex items-center px-4 py-3 rounded-lg transition mb-1 ${isActive('/admin/users')}`}>
          <FaUsers className="mr-3 text-lg" />
          <span className="font-medium text-sm">Quản lý User</span>
        </Link>

        <Link to="/admin/profile" className={`flex items-center px-4 py-3 rounded-lg transition mb-1 ${isActive('/admin/profile')}`}>
          <FaUserCog className="mr-3 text-lg" />
          <span className="font-medium text-sm">Hồ sơ cá nhân</span>
        </Link>
      </nav>

      {/* FOOTER SIDEBAR */}
      <div className="p-4 border-t border-blue-800 bg-blue-900 shrink-0">
        <button onClick={logoutHandler} className="flex items-center justify-center w-full px-4 py-2 text-red-300 hover:text-white hover:bg-red-600/80 rounded-lg transition border border-transparent hover:border-red-400 text-sm font-bold">
          <FaSignOutAlt className="mr-2" /> Đăng xuất
        </button>
      </div>

    </div>
  );
};

export default Sidebar;