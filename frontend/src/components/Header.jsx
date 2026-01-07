import React from 'react';
import { FaShoppingCart, FaUser, FaBars, FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import SearchBox from './SearchBox'; // Import ô tìm kiếm
import { FaPhoneAlt } from 'react-icons/fa';
const Header = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl font-bold text-blue-800 tracking-tighter uppercase">In Quang Phát</span>
        </Link>

        {/* --- THANH TÌM KIẾM (Desktop) --- */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
          <SearchBox />
        </div>

        {/* Menu & User */}
        <div className="flex items-center space-x-5 text-gray-600">
          <nav className="hidden lg:flex space-x-6 items-center font-medium mr-4">
            <Link to="/" className="hover:text-blue-600 transition">Trang chủ</Link>
            {userInfo && userInfo.isAdmin && (
              <Link to="/admin/dashboard" className="text-red-600 font-bold hover:text-red-800">Quản trị</Link>
            )}
            <Link to="/contact" className="hover:text-blue-600 transition">Liên hệ</Link>
          </nav>
          <a href="tel:0909123456" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold flex items-center transition shadow-md ml-4 animate-pulse">
            <FaPhoneAlt className="mr-2 text-sm" />
            <span className="hidden md:inline">0935110639</span>
          </a>
          {userInfo ? (
            <div className="flex items-center gap-3">
              <span className="font-medium text-blue-800 hidden sm:block">Hi, {userInfo.name}</span>
              <button onClick={logoutHandler} className="text-gray-500 hover:text-red-600" title="Đăng xuất">
                <FaSignOutAlt className="text-xl" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1 hover:text-blue-600 transition">
              <FaUser className="text-xl" /> <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>

      {/* --- THANH TÌM KIẾM (Mobile) --- */}
      <div className="md:hidden px-4 pb-4">
        <SearchBox />
      </div>
    </header>
  );
};

export default Header;