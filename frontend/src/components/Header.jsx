import React from 'react';
import { FaShoppingCart, FaUser, FaBars, FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  
  // Lấy thông tin user từ bộ nhớ trình duyệt (nếu có)
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const logoutHandler = () => {
    localStorage.removeItem('userInfo'); // Xóa token
    navigate('/login'); // Quay về trang đăng nhập
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-800 tracking-tighter uppercase">In Quang Phát</span>
        </Link>

        <nav className="hidden md:flex space-x-8 items-center font-medium text-gray-600">
            <Link to="/" className="hover:text-blue-600 transition">Trang chủ</Link>
            <Link to="/products" className="hover:text-blue-600 transition">Sản phẩm</Link>
            {/* Nếu là Admin thì hiện thêm menu Quản trị */}
            {userInfo && userInfo.isAdmin && (
               <Link to="/admin/dashboard" className="text-red-600 font-bold hover:text-red-800">Quản trị viên</Link>
            )}
            <Link to="/contact" className="hover:text-blue-600 transition">Liên hệ</Link>
        </nav>

        <div className="flex items-center space-x-5 text-gray-600">
          {userInfo ? (
            // NẾU ĐÃ ĐĂNG NHẬP
            <div className="flex items-center gap-3">
                <span className="font-medium text-blue-800">Hi, {userInfo.name}</span>
                <button onClick={logoutHandler} className="text-gray-500 hover:text-red-600" title="Đăng xuất">
                    <FaSignOutAlt className="text-xl" />
                </button>
            </div>
          ) : (
            // NẾU CHƯA ĐĂNG NHẬP
            <Link to="/login" className="flex items-center gap-1 hover:text-blue-600 transition">
                <FaUser className="text-xl" /> <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;