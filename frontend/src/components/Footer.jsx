import React from 'react';
import { FaFacebookF, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// 1. IMPORT COMPONENT MỚI TẠO
import CompanyStats from './CompanyStats';

const Footer = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const scrollToTopSlowly = (duration) => {
    const startPosition = window.scrollY;
    const startTime = performance.now();
    const animation = (currentTime) => {
      const timeElapsed = currentTime - startTime;
      const ease = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      };
      const nextScrollY = ease(timeElapsed, startPosition, -startPosition, duration);
      window.scrollTo(0, nextScrollY);
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        window.scrollTo(0, 0);
      }
    };
    requestAnimationFrame(animation);
  };
  const handleHomeClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      scrollToTopSlowly(1000);
    } else {
      navigate('/');
      window.scrollTo(0, 0);
    }
  };
  const isAdminRoute = location.pathname.startsWith('/admin');
  return (
    <footer>
      {/* 2. ĐẶT NÓ Ở ĐÂY (Trên cùng của Footer) */}
{!isAdminRoute && <CompanyStats />}
      {/* --- Phần nội dung Footer cũ bên dưới --- */}
      <div className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Cột 1: Thông tin công ty */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 uppercase">In Quang Phát</h3>
            <p className="mb-4 text-sm leading-relaxed">
              Đơn vị tiên phong trong lĩnh vực in ấn bao bì và áo quần xuất khẩu văn phòng tại Huế.
              Cam kết chất lượng - Tiến độ - Giá thành hợp lý.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"><FaFacebookF /></a>
              <a href="#" className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"><FaYoutube /></a>
            </div>
          </div>

          {/* Cột 2: Liên hệ */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 uppercase">Thông tin liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mr-2 mt-1 text-red-500" />
                <span>Số 5, Đường Số 4, Cụm Công Nghiệp An Hoà, P. Hương An, Huế</span>
              </li>
              <li className="flex items-center">
                <FaPhoneAlt className="mr-2 text-green-500" />
                <span>0935.110.639</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-2 text-yellow-500" />
                <span>inquangphat@quangphat.com</span>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 uppercase">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              <a href="/" onClick={handleHomeClick} className="hover:text-blue-600 transition cursor-pointer">
                Trang chủ
              </a>
              <li><Link to="/about" className="hover:text-white transition">Về chúng tôi</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Liên hệ & Báo giá</Link></li>
              {/* <li><Link to="/policy" className="hover:text-white transition">Chính sách bảo mật</Link></li> */}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-950 text-gray-500 py-4 text-center text-xs">
        &copy; {new Date().getFullYear()} Công ty TNHH In Ấn & Bao Bì Quang Phát. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;