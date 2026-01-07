import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFacebookF } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t-4 border-blue-600">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* CỘT 1: THÔNG TIN CÔNG TY */}
          <div>
            <h3 className="text-white text-xl font-bold uppercase mb-6 tracking-wider">In Quang Phát</h3>
            <p className="text-sm leading-loose mb-6 text-gray-400 text-justify">
              Đơn vị tiên phong trong lĩnh vực in ấn bao bì và ấn phẩm văn phòng tại Hà Nội. Cam kết chất lượng, tiến độ và giá thành tốt nhất tận xưởng.
            </p>
            <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white hover:bg-blue-600 transition shadow-lg">
                    <FaFacebookF />
                </a>
                <a href="https://zalo.me/0909123456" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-400 transition shadow-lg">
                    <SiZalo />
                </a>
            </div>
          </div>

          {/* CỘT 2: LIÊN HỆ */}
          <div>
            <h3 className="text-white text-lg font-bold uppercase mb-6">Thông tin liên hệ</h3>
            <ul className="space-y-4 text-sm">
                <li className="flex items-start">
                    <FaMapMarkerAlt className="mr-3 text-blue-500 mt-1 flex-shrink-0" />
                    <span>Số 123 Đường Cầu Giấy, Quận Cầu Giấy, TP. Hà Nội</span>
                </li>
                <li className="flex items-center">
                    <FaPhoneAlt className="mr-3 text-blue-500 flex-shrink-0" />
                    <span className="font-bold text-white">0909.123.456 (Mr. Quang)</span>
                </li>
                <li className="flex items-center">
                    <FaEnvelope className="mr-3 text-blue-500 flex-shrink-0" />
                    <span>inquangphat@gmail.com</span>
                </li>
            </ul>
          </div>

          {/* CỘT 3: ĐƯỜNG DẪN NHANH */}
          <div>
            <h3 className="text-white text-lg font-bold uppercase mb-6">Hỗ trợ khách hàng</h3>
            <ul className="space-y-3 text-sm">
                <li><Link to="/" className="hover:text-blue-500 transition">Trang chủ</Link></li>
                <li><Link to="/contact" className="hover:text-blue-500 transition">Liên hệ & Báo giá</Link></li>
                <li><Link to="/search/Hộp giấy" className="hover:text-blue-500 transition">Mẫu Hộp Giấy</Link></li>
                <li><Link to="/search/Túi giấy" className="hover:text-blue-500 transition">Mẫu Túi Giấy</Link></li>
                <li><Link to="#" className="hover:text-blue-500 transition">Chính sách bảo hành</Link></li>
            </ul>
          </div>

          {/* CỘT 4: FANPAGE (Hoặc Bản đồ nhỏ) */}
          <div>
            <h3 className="text-white text-lg font-bold uppercase mb-6">Kết nối Facebook</h3>
            {/* Ảnh demo Fanpage - Sau này có thể nhúng widget thật */}
            {/* <div className="bg-white h-32 rounded flex items-center justify-center text-gray-500 text-xs">
                Khu vực hiển thị Widget Fanpage
            </div> */}
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Công ty TNHH In Quang Phát. All rights reserved.</p>
            <p className="mt-2 text-xs">Thiết kế và vận hành bởi Admin.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;