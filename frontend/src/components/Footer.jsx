import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
            <h3 className="text-white text-lg font-bold mb-4">IN QUANG PHÁT</h3>
            <p className="text-sm">Chuyên cung cấp giải pháp in ấn bao bì, tem nhãn chất lượng cao với công nghệ hiện đại nhất.</p>
        </div>
        <div>
            <h3 className="text-white text-lg font-bold mb-4">LIÊN HỆ</h3>
            <p className="text-sm mb-2">📍 Địa chỉ: Hà Nội, Việt Nam</p>
            <p className="text-sm mb-2">📞 Hotline: 0909.xxx.xxx</p>
            <p className="text-sm">📧 Email: contact@inquangphat.com</p>
        </div>
        <div>
             <h3 className="text-white text-lg font-bold mb-4">CHÍNH SÁCH</h3>
             <ul className="text-sm space-y-2">
                 <li><a href="#" className="hover:text-white">Chính sách bảo mật</a></li>
                 <li><a href="#" className="hover:text-white">Quy định đổi trả</a></li>
             </ul>
        </div>
      </div>
      <div className="text-center text-sm text-gray-500 mt-10 pt-5 border-t border-gray-800">
        Copyright &copy; {new Date().getFullYear()} In Quang Phát. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;