import React from 'react';
import { Link } from 'react-scroll';
import { FaHome, FaInfoCircle, FaLayerGroup, FaCogs, FaListUl, FaNewspaper } from 'react-icons/fa';

const QuickSidebar = () => {
  // Danh sách các mục điều hướng
  const navItems = [
    { id: 'section-home', label: 'Trang chủ', icon: <FaHome /> },
    { id: 'section-intro', label: 'Về chúng tôi', icon: <FaInfoCircle /> },
    { id: 'section-services', label: 'Lĩnh vực', icon: <FaLayerGroup /> },
    { id: 'section-process', label: 'Quy trình', icon: <FaCogs /> },
    { id: 'section-categories', label: 'Danh mục', icon: <FaListUl /> },
    { id: 'section-news', label: 'Tin tức', icon: <FaNewspaper /> },
  ];

  return (
    // Chỉ hiện trên màn hình lớn (hidden on mobile), cố định bên trái
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 hidden xl:flex flex-col gap-4">
      
      {navItems.map((item) => (
        <Link
          key={item.id}
          activeClass="active-sidebar" // Class này sẽ tự động được thêm khi cuộn đến
          to={item.id} // ID của section cần đến
          spy={true} // Theo dõi vị trí cuộn
          smooth={true} // Cuộn mượt
          duration={800} // Thời gian cuộn
          offset={-100} // Trừ hao thanh Header
          className="group flex items-center cursor-pointer"
        >
          {/* ICON TRÒN */}
          <div className="w-10 h-10 rounded-full bg-gray border border-gray-200 shadow-md flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:border-blue-600 transition-all duration-300 relative z-10 sidebar-icon">
            {item.icon}
          </div>

          {/* LABEL (Hiện ra khi hover hoặc active) */}
          <div className="absolute left-4 pl-8 pr-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-r-full opacity-0 group-hover:opacity-100 -z-0 transition-all duration-300 transform -translate-x-full group-hover:translate-x-0 shadow-lg whitespace-nowrap sidebar-label">
            {item.label}
          </div>
        </Link>
      ))}

      {/* CSS RIÊNG CHO TRẠNG THÁI ACTIVE (Sáng đèn khi cuộn tới) */}
      <style jsx>{`
        .active-sidebar .sidebar-icon {
          background-color: #2563EB; /* blue-600 */
          color: white;
          border-color: #2563EB;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
      `}</style>
    </div>
  );
};

export default QuickSidebar;