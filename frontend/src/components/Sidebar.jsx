import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaWarehouse, FaWallet, FaBuilding, FaBoxOpen, FaClipboardList,
  FaUsers, FaSignOutAlt, FaChartLine, FaUserCog, FaNewspaper,
  FaCogs, FaTruck, FaHome, FaFlask, FaBars, FaTimes,
  FaChevronDown, FaChevronRight,FaCopy
} from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // State mở/đóng menu trên mobile

  // State quản lý việc đóng/mở các nhóm menu
  const [expanded, setExpanded] = useState({
    management: true,
    warehouse: false,
    supplier: false
  });

  // Tự động mở nhóm chứa trang hiện tại đang xem
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/materials') || path.includes('/admin/chemicals')) {
      setExpanded({ management: false, warehouse: true, supplier: false });
    } else if (path.includes('/admin/supplierlist') || path.includes('/admin/paper-prices')) {
      setExpanded({ management: false, warehouse: false, supplier: true });
    } else {
      setExpanded({ management: true, warehouse: false, supplier: false });
    }
  }, [location.pathname]);

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname.includes(path)
      ? 'bg-blue-800 text-white shadow-md'
      : 'text-gray-300 hover:bg-blue-800 hover:text-white';
  };

  const closeSidebar = () => {
    if (isOpen) setIsOpen(false);
  };

  const toggleGroup = (group) => {
    setExpanded(prev => ({
      ...prev,
      [group]: !prev[group] // Bấm vào để đóng/mở nhóm đó
    }));
  };

  return (
    <>
      {/* 1. NÚT MỞ MENU TRÊN MOBILE */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 bg-blue-700 text-white p-4 rounded-full shadow-2xl border-2 border-white hover:bg-blue-800 transition transform hover:scale-105"
      >
        <FaBars className="text-xl" />
      </button>

      {/* 2. MÀN TỐI (OVERLAY) KHI MỞ MENU TRÊN MOBILE */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity"
          onClick={closeSidebar}
        ></div>
      )}

      {/* 3. SIDEBAR CHÍNH */}
      <div className={`w-64 bg-blue-900 text-white flex flex-col flex-shrink-0 h-screen fixed md:sticky top-0 left-0 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

        {/* CSS TÙY CHỈNH THANH CUỘN */}
        <style>{`
          .sidebar-scroll::-webkit-scrollbar { width: 4px; }
          .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.1); 
            border-radius: 10px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background-color: rgba(255, 255, 255, 0.3);
          }
          .sidebar-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
          }
        `}</style>

        {/* HEADER SIDEBAR */}
        <div className="p-6 border-b border-blue-800 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-bold tracking-wider">ADMIN PANEL</h2>
            <p className="text-[10px] text-blue-300 mt-1 uppercase tracking-[0.2em]">In Quang Phát</p>
          </div>
          <button onClick={closeSidebar} className="md:hidden text-gray-400 hover:text-white transition">
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* MENU LIST */}
        <nav className="flex-1 p-4 overflow-y-auto sidebar-scroll pb-10">

          <Link to="/" onClick={closeSidebar} className="flex items-center px-3 py-3 mb-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition shadow-lg border border-indigo-400 group overflow-hidden">
            <FaHome className="mr-2 text-lg shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm whitespace-nowrap">Xem Website chính</span>
          </Link>

          <div className="border-b border-blue-800/50 mb-2 mx-2"></div>

          {/* ========================================================================= */}
          {/* NHÓM 1: QUẢN LÝ CHUNG */}
          {/* ========================================================================= */}
          <button
            onClick={() => toggleGroup('management')}
            className="w-full flex items-center justify-between px-2 py-3 text-[10px] font-extrabold text-blue-300 hover:text-white uppercase tracking-widest transition rounded-lg hover:bg-blue-800/50"
          >
            <span>Nhóm Quản Lý</span>
            {expanded.management ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
          </button>

          {expanded.management && (
            <div className="space-y-1 mb-2 animate-fade-in-down pl-1 border-l-2 border-blue-800/50 ml-2">
              <Link to="/admin/dashboard" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-lg transition ${isActive('/admin/dashboard')}`}>
                <FaChartLine className="mr-3 text-lg" />
                <span className="font-medium text-sm">Tổng quan</span>
              </Link>
              <Link to="/admin/quotes" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-lg transition ${isActive('/admin/quotes')}`}>
                <FaClipboardList className="mr-3 text-lg" />
                <span className="font-medium text-sm">Quản lý Báo giá</span>
              </Link>
              <Link to="/admin/productlist" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-lg transition ${isActive('/admin/productlist')}`}>
                <FaBoxOpen className="mr-3 text-lg" />
                <span className="font-medium text-sm">Quản lý Sản phẩm</span>
              </Link>
              <Link to="/admin/machinelist" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-lg transition ${isActive('/admin/machinelist')}`}>
                <FaCogs className="mr-3 text-lg" />
                <span className="font-medium text-sm">Quản lý Máy móc</span>
              </Link>
              <Link to="/admin/customerlist" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-lg transition ${isActive('/admin/customer')}`}>
                <FaBuilding className="mr-3 text-lg" />
                <span className="font-medium text-sm">Quản lý Khách hàng</span>
              </Link>
              <Link to="/admin/newslist" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-lg transition ${isActive('/admin/news')}`}>
                <FaNewspaper className="mr-3 text-lg" />
                <span className="font-medium text-sm">Quản lý Tin tức</span>
              </Link>
              <Link to="/admin/finance" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-lg transition ${isActive('/admin/finance')}`}>
                <FaWallet className="mr-3 text-lg" />
                <span className="font-medium text-sm">Quản lý Thu Chi</span>
              </Link>
              <Link to="/admin/users" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-lg transition ${isActive('/admin/users')}`}>
                <FaUsers className="mr-3 text-lg" />
                <span className="font-medium text-sm">Quản lý User</span>
              </Link>
              <Link to="/admin/profile" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-lg transition ${isActive('/admin/profile')}`}>
                <FaUserCog className="mr-3 text-lg" />
                <span className="font-medium text-sm">Hồ sơ cá nhân</span>
              </Link>
            </div>
          )}

          <div className="border-b border-blue-800/50 my-2 mx-2"></div>

          {/* ========================================================================= */}
          {/* NHÓM 2: KHO BÃI */}
          {/* ========================================================================= */}
          <button
            onClick={() => toggleGroup('warehouse')}
            className="w-full flex items-center justify-between px-2 py-3 text-[10px] font-extrabold text-blue-300 hover:text-white uppercase tracking-widest transition rounded-lg hover:bg-blue-800/50"
          >
            <span>Quản lý Kho bãi</span>
            {expanded.warehouse ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
          </button>

          {expanded.warehouse && (
            <div className="space-y-1 mb-2 animate-fade-in-down pl-1 border-l-2 border-blue-800/50 ml-2">
              <Link to="/admin/materials" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-lg transition ${isActive('/admin/materials')}`}>
                <FaWarehouse className="mr-3 text-lg" />
                <span className="font-medium text-sm">Kho Vật Tư (Giấy/Kẽm)</span>
              </Link>
              <Link to="/admin/chemicals" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-lg transition ${isActive('/admin/chemicals')}`}>
                <FaFlask className="mr-3 text-lg" />
                <span className="font-medium text-sm">Kho Hóa Chất & Mực</span>
              </Link>
            </div>
          )}

          <div className="border-b border-blue-800/50 my-2 mx-2"></div>

          {/* ========================================================================= */}
          {/* NHÓM 3: NHÀ CUNG CẤP */}
          {/* ========================================================================= */}
          <button
            onClick={() => toggleGroup('supplier')}
            className="w-full flex items-center justify-between px-2 py-3 text-[10px] font-extrabold text-blue-300 hover:text-white uppercase tracking-widest transition rounded-lg hover:bg-blue-800/50"
          >
            <span>Nhà Cung Cấp</span>
            {expanded.supplier ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
          </button>

          {expanded.supplier && (
            <div className="space-y-1 mb-2 animate-fade-in-down pl-1 border-l-2 border-blue-800/50 ml-2">
              <Link to="/admin/supplierlist" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-lg transition ${isActive('/admin/supplierlist')}`}>
                <FaTruck className="mr-3 text-lg" />
                <span className="font-medium text-sm">Danh sách Đối tác</span>
              </Link>
              {/* THÊM NÚT QUẢN LÝ GIÁ GIẤY MỚI NÀY VÀO */}
              <Link to="/admin/paper-prices" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-lg transition ${isActive('/admin/paper-prices')}`}>
                <FaCopy className="mr-3 text-lg" />
                <span className="font-medium text-sm">Bảng Giá Giấy In</span>
              </Link>
            </div>
          )}

        </nav>

        {/* FOOTER SIDEBAR */}
        <div className="p-4 border-t border-blue-800 bg-blue-900 shrink-0">
          <button onClick={logoutHandler} className="flex items-center justify-center w-full px-4 py-2 text-red-300 hover:text-white hover:bg-red-600/80 rounded-lg transition border border-transparent hover:border-red-400 text-sm font-bold">
            <FaSignOutAlt className="mr-2" /> Đăng xuất
          </button>
        </div>

      </div>
    </>
  );
};

export default Sidebar;