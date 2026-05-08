import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaWarehouse, FaWallet, FaBuilding, FaBoxOpen, FaClipboardList,
  FaUsers, FaSignOutAlt, FaChartLine, FaUserCog, FaNewspaper,
  FaCogs, FaTruck, FaHome, FaFlask, FaBars, FaTimes,
  FaChevronDown, FaChevronRight, FaCopy, FaFillDrip, FaLayerGroup,
  FaMoneyCheckAlt, FaBriefcase, FaIndustry, FaGlobe, FaHandshake, FaBookOpen, FaFileAlt, FaFileInvoiceDollar
} from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Lấy thông tin user để phân quyền
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
  const isAdmin = userInfo.isAdmin === true;
  const role = userInfo.role || 'user';

  // Xác định quyền hiển thị từng nhóm
  const canViewBusiness = isAdmin || role === 'accountant';
  const canViewProduction = isAdmin || role === 'production';
  const canViewContent = isAdmin; // Giám đốc
  const canViewPartners = isAdmin || role === 'accountant';

  // 5 Nhóm theo yêu cầu
  const [expanded, setExpanded] = useState({
    overview: true,
    business: false,
    production: false,
    content: false,
    partners: false
  });

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard') || path.includes('/admin/profile')) {
      setExpanded({ overview: true, business: false, production: false, content: false, partners: false });
    } else if (path.includes('/admin/quotes') || path.includes('/admin/print-price-calc') || path.includes('/admin/customer') || path.includes('/admin/finance') || path.includes('/admin/debts') || path.includes('/admin/finishing-prices') || path.includes('/admin/quotations')) {
      setExpanded({ overview: false, business: true, production: false, content: false, partners: false });
    } else if (path.includes('/admin/materials') || path.includes('/admin/chemicals') || path.includes('/admin/print-formulas') || path.includes('/admin/production-orders') || path.includes('/admin/inventory')) {
      setExpanded({ overview: false, business: false, production: true, content: false, partners: false });
    } else if (path.includes('/admin/news') || path.includes('/admin/user') || path.includes('/admin/product') || path.includes('/admin/machine')) {
      setExpanded({ overview: false, business: false, production: false, content: true, partners: false });
    } else if (path.includes('/admin/supplier') || path.includes('/admin/paper-prices') || path.includes('/admin/ink-prices') || path.includes('/admin/material-prices')) {
      setExpanded({ overview: false, business: false, production: false, content: false, partners: true });
    }
  }, [location.pathname]);

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname.includes(path)
      ? 'bg-[#E6F0ED] text-[#006B4D] font-extrabold'
      : 'text-[#6B7280] hover:bg-gray-100 hover:text-[#111827] font-medium';
  };

  const closeSidebar = () => {
    if (isOpen) setIsOpen(false);
  };

  const toggleGroup = (group) => {
    setExpanded(prev => ({
      /* Optional: close others if you want accordion effect by setting all to false then [group]: !prev[group] */
      ...prev, [group]: !prev[group]
    }));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 bg-[#006B4D] text-white p-4 rounded-full shadow-2xl hover:bg-[#00543c] transition transform hover:scale-105 active:scale-95"
      >
        <FaBars className="text-xl" />
      </button>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-[#111827]/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        ></div>
      )}

      <div className={`w-64 bg-white text-[#111827] border-r border-gray-200 flex flex-col flex-shrink-0 h-screen fixed md:sticky top-0 left-0 shadow-lg md:shadow-none z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

        <style>{`
          .sidebar-scroll::-webkit-scrollbar { width: 4px; }
          .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background-color: #E5E7EB; 
            border-radius: 10px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background-color: #D1D5DB;
          }
          .sidebar-scroll {
            scrollbar-width: thin;
            scrollbar-color: #E5E7EB transparent;
          }
        `}</style>

        <div className="p-6 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-wider text-[#111827]">ADMIN <span className="text-[#006B4D]">PANEL</span></h2>
            <p className="text-[10px] text-[#6B7280] font-bold mt-1 uppercase tracking-[0.2em]">In Quang Phát</p>
          </div>
          <button onClick={closeSidebar} className="md:hidden text-gray-400 hover:text-red-500 bg-gray-100 p-2 rounded-full transition">
            <FaTimes size={14} />
          </button>
        </div>

        <nav className="flex-1 p-4 pt-0 overflow-y-auto sidebar-scroll pb-10">

          <Link to="/" onClick={closeSidebar} className="flex items-center justify-center px-3 py-3 mb-6 bg-[#111827] text-white rounded-xl hover:bg-gray-800 transition shadow-md group">
            <FaHome className="mr-2 text-lg shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm whitespace-nowrap">Xem Website chính</span>
          </Link>

          {/* NHÓM 1: TỔNG QUAN */}
          <button onClick={() => toggleGroup('overview')} className="w-full flex items-center justify-between px-2 py-3 text-[10px] font-bold text-[#9CA3AF] hover:text-[#111827] uppercase tracking-widest transition rounded-xl">
            <div className="flex items-center"><FaChartLine className="mr-2" /> <span>Tổng Quan</span></div>
            {expanded.overview ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
          </button>
          {expanded.overview && (
            <div className="space-y-1 mb-4 animate-fade-in-down">
              <Link to="/admin/dashboard" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/dashboard')}`}>
                <span className="text-sm ml-6">Thống kê chung</span>
              </Link>
              <Link to="/admin/profile" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/profile')}`}>
                <span className="text-sm ml-6">Hồ sơ cá nhân</span>
              </Link>
            </div>
          )}

          <div className="border-t border-gray-100 my-2"></div>

          {/* NHÓM 2: KINH DOANH */}
          {canViewBusiness && (
            <>
              <button onClick={() => toggleGroup('business')} className="w-full flex items-center justify-between px-2 py-3 text-[10px] font-bold text-[#9CA3AF] hover:text-[#111827] uppercase tracking-widest transition rounded-xl">
                <div className="flex items-center"><FaBriefcase className="mr-2" /> <span>Kinh Doanh & Tài Chính</span></div>
                {expanded.business ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
              </button>
              {expanded.business && (
            <div className="space-y-1 mb-4 animate-fade-in-down">
              <Link to="/admin/quotes" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/quotes')}`}>
                <FaClipboardList className="mr-3 text-gray-400" /> <span className="text-sm">Yêu cầu Báo giá</span>
              </Link>
              <Link to="/admin/print-price-calc" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/print-price-calc')}`}>
                <FaChartLine className="mr-3 text-gray-400" /> <span className="text-sm">Tính Giá In Báo Giá</span>
              </Link>
              <Link to="/admin/quotations" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/quotations')}`}>
                <FaFileInvoiceDollar className="mr-3 text-gray-400" /> <span className="text-sm">Bảng Báo Giá</span>
              </Link>
              <Link to="/admin/customerlist" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/customer')}`}>
                <FaBuilding className="mr-3 text-gray-400" /> <span className="text-sm">Quản lý Khách hàng</span>
              </Link>
              <div className="border-t border-gray-100 my-2 mx-1"></div>
              <Link to="/admin/finance" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/finance')}`}>
                <FaWallet className="mr-3 text-gray-400" /> <span className="text-sm">Quản lý Dòng tiền</span>
              </Link>

            </div>
          )}
          </>
          )}

          {canViewProduction && (
            <>
              <div className="border-t border-gray-100 my-2"></div>

              {/* NHÓM 3: SẢN XUẤT & KHO */}
              <button onClick={() => toggleGroup('production')} className="w-full flex items-center justify-between px-2 py-3 text-[10px] font-bold text-[#9CA3AF] hover:text-[#111827] uppercase tracking-widest transition rounded-xl">
                <div className="flex items-center"><FaIndustry className="mr-2" /> <span>Sản Xuất & Kho</span></div>
                {expanded.production ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
              </button>
              {expanded.production && (
                <div className="space-y-1 mb-4 animate-fade-in-down">
                  <Link to="/admin/materials" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/materials')}`}>
                    <FaWarehouse className="mr-3 text-gray-400" /> <span className="text-sm">Kho Vật tư (Giấy/Kẽm)</span>
                  </Link>
                  <Link to="/admin/chemicals" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/chemicals')}`}>
                    <FaFlask className="mr-3 text-gray-400" /> <span className="text-sm">Kho Hóa chất & Mực</span>
                  </Link>
                  <Link to="/admin/inventory" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/inventory')}`}>
                    <FaBoxOpen className="mr-3 text-gray-400" /> <span className="text-sm">Xuất Nhập Hàng (BTP)</span>
                  </Link>
                  <Link to="/admin/print-formulas" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/print-formulas')}`}>
                    <FaBookOpen className="mr-3 text-gray-400" /> <span className="text-sm">Phát triển Mẫu</span>
                  </Link>
                  <Link to="/admin/production-orders" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/production-orders')}`}>
                    <FaFileAlt className="mr-3 text-gray-400" /> <span className="text-sm">Lệnh Sản Xuất</span>
                  </Link>
                </div>
              )}
            </>
          )}

          {canViewContent && (
            <>
              <div className="border-t border-gray-100 my-2"></div>

              {/* NHÓM 4: HỆ THỐNG & NỘI DUNG */}
              <button onClick={() => toggleGroup('content')} className="w-full flex items-center justify-between px-2 py-3 text-[10px] font-bold text-[#9CA3AF] hover:text-[#111827] uppercase tracking-widest transition rounded-xl">
                <div className="flex items-center"><FaGlobe className="mr-2" /> <span>Nội Dung & Cài Đặt</span></div>
                {expanded.content ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
              </button>
              {expanded.content && (
                <div className="space-y-1 mb-4 animate-fade-in-down">
                  <Link to="/admin/productlist" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/product')}`}>
                    <FaBoxOpen className="mr-3 text-gray-400" /> <span className="text-sm">Sản phẩm Website</span>
                  </Link>
                  <Link to="/admin/machinelist" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/machine')}`}>
                    <FaCogs className="mr-3 text-gray-400" /> <span className="text-sm">Năng lực Máy móc</span>
                  </Link>
                  <Link to="/admin/newslist" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/news')}`}>
                    <FaNewspaper className="mr-3 text-gray-400" /> <span className="text-sm">Tin tức & Bài viết</span>
                  </Link>
                  <Link to="/admin/users" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/user')}`}>
                    <FaUsers className="mr-3 text-gray-400" /> <span className="text-sm">Tài khoản & Phân quyền</span>
                  </Link>
                </div>
              )}
            </>
          )}

          {canViewPartners && (
            <>
              <div className="border-t border-gray-100 my-2"></div>

              {/* NHÓM 5: ĐỐI TÁC & BẢNG GIÁ */}
              <button onClick={() => toggleGroup('partners')} className="w-full flex items-center justify-between px-2 py-3 text-[10px] font-bold text-[#9CA3AF] hover:text-[#111827] uppercase tracking-widest transition rounded-xl">
                <div className="flex items-center"><FaHandshake className="mr-2" /> <span>Đối Tác & Bảng Giá</span></div>
                {expanded.partners ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
              </button>
              {expanded.partners && (
                <div className="space-y-1 mb-4 animate-fade-in-down">
                  <Link to="/admin/supplierlist" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/supplierlist')}`}>
                    <FaTruck className="mr-3 text-gray-400" /> <span className="text-sm">Nhà Cung Cấp</span>
                  </Link>
                  <Link to="/admin/paper-prices" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/paper-prices')}`}>
                    <FaCopy className="mr-3 text-gray-400" /> <span className="text-sm">Bảng giá Giấy</span>
                  </Link>
                  <Link to="/admin/ink-prices" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/ink-prices')}`}>
                    <FaFillDrip className="mr-3 text-gray-400" /> <span className="text-sm">Bảng giá Mực</span>
                  </Link>
                  <Link to="/admin/material-prices" onClick={closeSidebar} className={`flex items-center px-3 py-2.5 rounded-xl transition ${isActive('/admin/material-prices')}`}>
                    <FaLayerGroup className="mr-3 text-gray-400" /> <span className="text-sm">Vật liệu khác</span>
                  </Link>
                </div>
              )}
            </>
          )}

        </nav>

        {/* FOOTER SIDEBAR */}
        <div className="p-4 border-t border-gray-100 bg-[#F9FAFB] shrink-0">
          <button onClick={logoutHandler} className="flex items-center justify-center w-full px-4 py-2.5 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition font-bold text-sm shadow-sm border border-red-100 hover:border-transparent">
            <FaSignOutAlt className="mr-2" /> Đăng xuất
          </button>
        </div>

      </div>
    </>
  );
};

export default Sidebar;