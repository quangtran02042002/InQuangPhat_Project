import React from 'react';
import { FaFacebookF, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaChevronRight, FaArrowUp } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CompanyStats from './CompanyStats';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      window.scrollTo(0, 0);
    }
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  const navLinks = [
    { to: '/', label: 'Trang chủ', onClick: handleHomeClick },
    { to: '/about', label: 'Về chúng tôi' },
    { to: '/products', label: 'Sản phẩm mẫu' },
    { to: '/infrastructure', label: 'Máy móc & Công nghệ' },
    { to: '/news', label: 'Tin tức' },
    { to: '/contact', label: 'Liên hệ & Báo giá' },
  ];

  return (
    <footer>
      {!isAdminRoute && <CompanyStats />}

      <div
        className="text-gray-300 pt-16 pb-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0d1f17 0%, #111827 100%)' }}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-brand-900/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-900/10 rounded-full translate-x-1/4 translate-y-1/4 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Col 1: Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-floating flex-shrink-0">
                  <span className="text-white font-extrabold text-sm">IQ</span>
                </div>
                <span className="text-white text-xl font-extrabold tracking-tight uppercase">In Quang Phát</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Đơn vị tiên phong trong lĩnh vực in ấn bao bì và áo quần xuất khẩu tại Huế. Cam kết chất lượng — Tiến độ — Giá thành hợp lý.
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all duration-300"
                  aria-label="Facebook"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                  aria-label="YouTube"
                >
                  <FaYoutube />
                </a>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
                <div className="w-4 h-0.5 bg-brand-500 rounded" />
                Điều hướng
              </h4>
              <ul className="space-y-3">
                {navLinks.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.to}
                      onClick={link.onClick}
                      className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors duration-200 group"
                    >
                      <FaChevronRight className="text-[8px] text-brand-500 group-hover:translate-x-1 transition-transform duration-200" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Products */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
                <div className="w-4 h-0.5 bg-brand-500 rounded" />
                Sản phẩm nổi bật
              </h4>
              <ul className="space-y-3">
                {['Hộp giấy cao cấp', 'Túi giấy quà tặng', 'Tem nhãn & Sticker', 'Catalogue', 'In áo Waterbased', 'In áo Offset'].map((item, i) => (
                  <li key={i}>
                    <Link to="/products" className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors duration-200 group">
                      <FaChevronRight className="text-[8px] text-brand-500 group-hover:translate-x-1 transition-transform duration-200" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Contact */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
                <div className="w-4 h-0.5 bg-brand-500 rounded" />
                Thông tin liên hệ
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaMapMarkerAlt className="text-rose-400 text-xs" />
                  </div>
                  <span className="text-sm text-gray-400 leading-relaxed">Số 5, Đường Số 4, Cụm CN An Hoà, P.Hương An, Huế</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <FaPhoneAlt className="text-green-400 text-xs" />
                  </div>
                  <a href="tel:0935110639" className="text-sm text-gray-400 hover:text-white transition-colors">0935.110.639</a>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-yellow-400 text-xs" />
                  </div>
                  <span className="text-sm text-gray-400">inquangphat@gmail.com</span>
                </li>
              </ul>

              {/* Working hours */}
              <div className="mt-5 bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-bold">Giờ làm việc</div>
                <div className="text-sm text-white font-medium">Thứ 2 — Thứ 7</div>
                <div className="text-brand-400 font-bold">7:30 — 17:00</div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Công ty TNHH In Ấn & Bao Bì Quang Phát. All rights reserved.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white bg-white/10 hover:bg-brand-600 border border-white/10 px-4 py-2 rounded-full transition-all duration-300"
            >
              <FaArrowUp className="text-[10px]" /> Về đầu trang
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;