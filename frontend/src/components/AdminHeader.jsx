import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminHeader = ({ title }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Hàm lấy thông báo từ API
  const fetchNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/notifications', config);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    }
  };

  useEffect(() => {
    if (userInfo) {
        fetchNotifications();
        // Tự động check thông báo mới mỗi 30 giây
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }
  }, []);

  // Xử lý khi bấm vào chuông
  const handleBellClick = async () => {
    setShowDropdown(!showDropdown);
    if (unreadCount > 0 && !showDropdown) {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            // Gọi API đánh dấu đã đọc
            await axios.put('/api/notifications/mark-read', {}, config);
            setUnreadCount(0); 
            // Cập nhật lại list local để chữ hết đậm
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) { console.error(error); }
    }
  };

  // Click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Helper chọn icon theo loại
  const getIcon = (type) => {
      switch(type) {
          case 'quote': return '💰';
          case 'stock': return '⚠️';
          default: return '🔔';
      }
  }

  return (
    <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      {/* 1. TIÊU ĐỀ TRANG */}
      <h1 className="text-2xl font-bold text-gray-800 uppercase flex items-center">
        {title}
      </h1>

      {/* 2. KHU VỰC THÔNG BÁO & USER */}
      <div className="flex items-center gap-6" ref={dropdownRef}>
        
        {/* CÁI CHUÔNG */}
        <div className="relative cursor-pointer" onClick={handleBellClick}>
          <FaBell className={`text-2xl transition ${unreadCount > 0 ? 'text-blue-600 animate-pulse' : 'text-gray-400'}`} />
          
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
              {unreadCount}
            </span>
          )}

          {/* DROPDOWN MENU */}
          {showDropdown && (
            <div className="absolute right-0 mt-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 origin-top-right">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <span className="font-bold text-sm text-gray-700">Thông báo ({notifications.length})</span>
                    <span className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={fetchNotifications}>Làm mới</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Không có thông báo mới.</div>
                    ) : (
                        notifications.map((notif) => (
                            <Link 
                                key={notif._id} 
                                to={notif.link || '#'} 
                                className={`block px-4 py-3 border-b border-gray-50 hover:bg-blue-50 transition ${!notif.isRead ? 'bg-blue-50/40' : ''}`}
                            >
                                <div className="flex items-start">
                                    <div className="mr-3 mt-1 text-lg">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div>
                                        <p className={`text-sm ${!notif.isRead ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{notif.title}</p>
                                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{notif.message}</p>
                                        <p className="text-[10px] text-gray-400 mt-1 text-right">
                                            {new Date(notif.createdAt).toLocaleDateString('vi-VN')} {new Date(notif.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
          )}
        </div>

        {/* THÔNG TIN USER */}
        <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
             <div className="text-right hidden md:block">
                 <div className="text-sm font-bold text-gray-800">{userInfo?.name}</div>
                 <div className="text-xs text-gray-500">Admin</div>
             </div>
             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                 {userInfo?.name?.charAt(0).toUpperCase()}
             </div>
        </div>

      </div>
    </div>
  );
};

export default AdminHeader;