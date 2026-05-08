import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaBars, FaSignOutAlt, FaUserCircle, FaChevronDown } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// Đã thêm prop onMenuClick để nhận sự kiện mở Sidebar từ các trang
const AdminHeader = ({ title, onMenuClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevUnreadCountRef = useRef(0); // Để biết có thông báo MỚI không
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Xin quyền Notification của trình duyệt khi load web
  useEffect(() => {
     if ('Notification' in window && Notification.permission !== 'granted') {
         Notification.requestPermission();
     }
  }, []);

  // Hàm lấy thông báo từ API
  const fetchNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/notifications', config);
      setNotifications(data);
      
      const currentUnread = data.filter(n => !n.isRead).length;
      
      // Nếu có thông báo MỚI so với lần check trước
      if (currentUnread > prevUnreadCountRef.current) {
         const newNotifs = data.filter(n => !n.isRead).slice(0, currentUnread - prevUnreadCountRef.current);
         newNotifs.forEach(n => {
            // Hiển thị Toast trong Web
            toast.info(`🔔 ${n.title}`, { position: 'top-right', autoClose: 5000 });
            
            // Đẩy Push Notification ra ngoài Window/Chrome
            if ('Notification' in window && Notification.permission === 'granted') {
               new Notification(n.title, { body: n.message, icon: '/favicon.ico' });
            }
         });
      }
      
      setUnreadCount(currentUnread);
      prevUnreadCountRef.current = currentUnread;
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    }
  };

  useEffect(() => {
    if (userInfo) {
        fetchNotifications();
        // Tự động check thông báo mới mỗi 10 giây (giảm từ 30s để Realtime hơn)
        const interval = setInterval(fetchNotifications, 10000);
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
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef, userDropdownRef]);

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
    setShowUserDropdown(false);
  };

  // Helper chọn icon theo loại
  const getIcon = (type) => {
      switch(type) {
          case 'quote': return '💰';
          case 'stock': return '📦';
          case 'debt': return '💵';
          case 'order': return '⛔';
          case 'process': return '🔄';
          default: return '🔔';
      }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 shrink-0 flex items-center justify-between sticky top-0 z-20">
      
      {/* 1. KHU VỰC BÊN TRÁI: NÚT MOBILE & TIÊU ĐỀ */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Nút Hamburger cho Mobile (Chỉ hiện trên màn hình nhỏ) */}
        {onMenuClick && (
            <button 
                onClick={onMenuClick} 
                className="lg:hidden text-gray-500 hover:text-[#006B4D] transition-colors p-1"
            >
                <FaBars size={20}/>
            </button>
        )}
        
        <h1 className="text-lg md:text-xl font-extrabold text-[#111827] whitespace-nowrap truncate max-w-[200px] sm:max-w-md">
          {title}
        </h1>
      </div>

      {/* 2. KHU VỰC BÊN PHẢI: THÔNG BÁO & USER */}
      <div className="flex items-center gap-4 md:gap-6" ref={dropdownRef}>
        
        {/* CÁI CHUÔNG */}
        <div className="relative cursor-pointer" onClick={handleBellClick}>
          <button className={`p-1.5 md:p-2 rounded-full transition-colors ${showDropdown ? 'bg-[#E6F0ED]' : 'hover:bg-gray-100'}`}>
              <FaBell className={`text-[20px] transition-colors ${unreadCount > 0 ? 'text-[#006B4D] animate-pulse' : 'text-gray-400'}`} />
          </button>
          
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 md:-top-1 md:-right-1 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}

          {/* DROPDOWN MENU THÔNG BÁO */}
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-[300px] sm:w-80 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50 origin-top-right animate-fade-in-down">
                <div className="px-5 py-3.5 border-b border-gray-100 bg-[#F9FAFB] flex justify-between items-center">
                    <span className="font-extrabold text-sm text-[#111827]">Thông báo ({notifications.length})</span>
                    <span className="text-xs text-[#006B4D] font-bold cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); fetchNotifications(); }}>Làm mới</span>
                </div>
                
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm font-medium flex flex-col items-center">
                            <FaBell className="text-3xl mb-3 text-gray-200" />
                            Không có thông báo mới
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <Link 
                                key={notif._id} 
                                to={notif.link || '#'} 
                                onClick={() => setShowDropdown(false)}
                                className={`block px-5 py-4 border-b border-gray-50 hover:bg-[#E6F0ED]/50 transition-colors ${!notif.isRead ? 'bg-[#E6F0ED]/30' : ''}`}
                            >
                                <div className="flex items-start">
                                    <div className="mr-3 mt-0.5 text-lg shrink-0">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm leading-tight ${!notif.isRead ? 'font-extrabold text-[#111827]' : 'font-medium text-gray-600'}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 mt-2">
                                            {new Date(notif.createdAt).toLocaleDateString('vi-VN')} • {new Date(notif.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                    {/* Chấm xanh nhỏ báo chưa đọc */}
                                    {!notif.isRead && (
                                        <div className="w-2 h-2 bg-[#006B4D] rounded-full shrink-0 ml-2 mt-1.5"></div>
                                    )}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
                {/* Nút Xem tất cả (Optional - có thể bỏ nếu không có trang này) */}
                {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-100 bg-[#F9FAFB] text-center">
                        <span className="text-xs font-bold text-[#006B4D] cursor-pointer hover:underline">Đánh dấu tất cả đã đọc</span>
                    </div>
                )}
            </div>
          )}
        </div>

        {/* Gạch dọc phân cách */}
        <div className="hidden sm:block w-px h-6 bg-gray-200"></div>

        {/* THÔNG TIN USER & AVATAR */}
        <div className="relative" ref={userDropdownRef}>
            <div 
                className="flex items-center gap-3 cursor-pointer group px-2 py-1 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
                <div className="text-right hidden md:block">
                    <div className="text-sm font-extrabold text-[#111827] group-hover:text-[#006B4D] transition-colors">{userInfo?.name}</div>
                    <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                        {userInfo?.role === 'director' ? 'Giám đốc' : 
                         userInfo?.role === 'accountant' ? 'Kế toán' : 
                         userInfo?.role === 'production' ? 'Sản xuất' : 'Nhân viên'}
                    </div>
                </div>
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#E6F0ED] flex items-center justify-center text-[#006B4D] font-extrabold text-sm border-2 border-white shadow-sm group-hover:bg-[#006B4D] group-hover:text-white transition-all">
                    {userInfo?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <FaChevronDown className={`text-[10px] text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
            </div>

            {/* DROPDOWN USER */}
            {showUserDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50 origin-top-right animate-fade-in-down">
                    <div className="px-5 py-4 border-b border-gray-50 bg-[#F9FAFB] md:hidden">
                        <div className="text-sm font-extrabold text-[#111827]">{userInfo?.name}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase">{userInfo?.role}</div>
                    </div>
                    <div className="p-2">
                        <Link 
                            to="/profile" 
                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-[#E6F0ED] hover:text-[#006B4D] rounded-xl transition-colors"
                            onClick={() => setShowUserDropdown(false)}
                        >
                            <FaUserCircle className="text-base opacity-70" /> Hồ sơ cá nhân
                        </Link>
                        <button 
                            onClick={logoutHandler}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1"
                        >
                            <FaSignOutAlt className="text-base opacity-70" /> Đăng xuất
                        </button>
                    </div>
                </div>
            )}
        </div>

      </div>
    </header>
  );
};

export default AdminHeader;