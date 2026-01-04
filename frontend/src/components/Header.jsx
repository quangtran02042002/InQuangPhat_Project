import React from 'react';
import { FaShoppingCart, FaUser, FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-800 tracking-tighter uppercase">In Quang Phát</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-8 items-center font-medium text-gray-600">
            <Link to="/" className="hover:text-blue-600 transition">Trang chủ</Link>
            <Link to="/products" className="hover:text-blue-600 transition">Sản phẩm</Link>
            <Link to="/about" className="hover:text-blue-600 transition">Giới thiệu</Link>
            <Link to="/contact" className="hover:text-blue-600 transition">Liên hệ</Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-5 text-gray-600">
          <Link to="/cart" className="relative hover:text-blue-600 transition">
            <FaShoppingCart className="text-2xl" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">0</span>
          </Link>
          <Link to="/login" className="flex items-center gap-1 hover:text-blue-600 transition">
            <FaUser className="text-xl" />
          </Link>
          <button className="md:hidden text-2xl">
              <FaBars />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;