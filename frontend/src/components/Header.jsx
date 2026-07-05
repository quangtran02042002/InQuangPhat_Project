import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaPhoneAlt, FaUser, FaSignOutAlt, FaCog, FaUserCircle, FaCaretDown,
  FaChevronDown, FaBoxOpen, FaCogs, FaBars, FaTimes, FaInfoCircle, FaNewspaper, FaArrowRight, FaTags
} from 'react-icons/fa';
import SearchBox from './SearchBox';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Glassmorphism on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
    setUserMenuOpen(false);
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      window.scrollTo(0, 0);
    }
  };

  const isParentActive = () =>
    location.pathname.includes('/products') || location.pathname.includes('/infrastructure')
      ? 'text-brand-600 font-bold'
      : 'text-gray-700 hover:text-brand-600';

  const isActive = (path) =>
    location.pathname === path || (location.pathname.startsWith(path) && path !== '/')
      ? 'text-brand-600 font-bold'
      : 'text-gray-700 hover:text-brand-600';

  return (
    <header
      className={`sticky top-0 z-50 font-display transition-all duration-300 ${scrolled
        ? 'glass-white shadow-elevation border-b border-white/60'
        : 'bg-white shadow-sm'
        }`}
    >
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-3">
        <div className="flex flex-wrap justify-between items-center gap-4">

          {/* 1. LOGO & MOBILE MENU BUTTON */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-700 text-2xl focus:outline-none p-1"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            <a href="/" onClick={handleHomeClick} className="flex items-center gap-2.5 cursor-pointer group">
              {/* Logo icon */}
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-ambient">
                <span className="text-white font-extrabold text-sm leading-none">IQ</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-extrabold text-brand-600 tracking-tight uppercase whitespace-nowrap group-hover:text-brand-700 transition-colors">
                  In Quang Phát
                </span>
                <span className="text-[9px] text-gray-400 font-medium uppercase tracking-widest hidden sm:block">
                  Printing & Packaging
                </span>
              </div>
            </a>
          </div>

          {/* 2. SEARCH (Desktop) */}
          <div className="flex-1 max-w-2xl mx-auto hidden lg:block px-6">
            <SearchBox />
          </div>

          {/* 3. DESKTOP NAV */}
          <div className="flex items-center space-x-4 md:space-x-6 flex-shrink-0">
            <nav className="hidden lg:flex space-x-6 xl:space-x-7 items-center font-medium text-[15px] text-gray-600 whitespace-nowrap">
              <a href="/" onClick={handleHomeClick} className="hover:text-brand-600 transition-colors duration-200 cursor-pointer">
                Trang chủ
              </a>

              <Link to="/about" className={`transition-colors duration-200 ${isActive('/about')}`}>
                Về chúng tôi
              </Link>

              {/* DROPDOWN */}
              <div
                className="relative group h-12 flex items-center cursor-pointer"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className={`flex items-center py-2 gap-1 transition-colors duration-200 ${isParentActive()}`}>
                  Năng lực sản xuất
                  <FaChevronDown className={`text-[10px] opacity-60 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Panel */}
                <div className={`absolute top-full left-1/2 -translate-x-1/2 w-[360px] bg-white rounded-2xl shadow-elevation border border-gray-100 transition-all duration-200 origin-top whitespace-normal ${dropdownOpen ? 'opacity-100 visible scale-100 mt-2' : 'opacity-0 invisible scale-95 mt-4'}`}>
                  <div className="p-2">
                    <Link to="/products/offset" className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-low transition-colors group/item">
                      <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 group-hover/item:bg-brand-600 group-hover/item:text-white transition-colors flex-shrink-0">
                        <FaBoxOpen size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm">In Offset & Bao Bì</div>
                        <div className="text-xs text-gray-400 mt-0.5">Hộp cứng, Túi giấy, Tem nhãn</div>
                      </div>
                      <FaArrowRight className="ml-auto text-gray-300 text-xs group-hover/item:text-brand-600 transition-colors" />
                    </Link>
                    <Link to="/products/garment" className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-low transition-colors group/item">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover/item:bg-blue-500 group-hover/item:text-white transition-colors flex-shrink-0">
                        <FaTags size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm">In Vải & Garment</div>
                        <div className="text-xs text-gray-400 mt-0.5">In lụa, Waterbased, Rubber</div>
                      </div>
                      <FaArrowRight className="ml-auto text-gray-300 text-xs group-hover/item:text-blue-500 transition-colors" />
                    </Link>
                    <Link to="/infrastructure" className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-low transition-colors group/item">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 group-hover/item:bg-orange-500 group-hover/item:text-white transition-colors flex-shrink-0">
                        <FaCogs size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm">Hệ thống máy móc</div>
                        <div className="text-xs text-gray-400 mt-0.5">Video quy trình in ấn & Gia công tại xưởng</div>
                      </div>
                      <FaArrowRight className="ml-auto text-gray-300 text-xs group-hover/item:text-orange-500 transition-colors" />
                    </Link>
                  </div>
                  {/* Accent line at bottom */}
                  <div className="h-1 bg-gradient-to-r from-brand-600 to-brand-400 rounded-b-2xl" />
                </div>
              </div>

              <Link to="/news" className={`transition-colors duration-200 ${isActive('/news')}`}>
                Tin tức
              </Link>

              <Link to="/contact" className={`transition-colors duration-200 ${isActive('/contact')}`}>
                Liên hệ
              </Link>
            </nav>

            {/* HOTLINE */}
            <div className="hidden xl:flex items-center gap-2 text-xs font-bold whitespace-nowrap">
              <a
                href="tel:0903597686"
                className="flex items-center gap-1.5 bg-accent text-white px-3.5 py-2.5 rounded-full transition-all duration-300 hover:bg-accent-dark hover:shadow-md"
              >
                <FaPhoneAlt className="text-[10px]" /> 0903597686 ( Tấn )
              </a>
              <a
                href="tel:0935110639"
                className="flex items-center gap-1.5 bg-accent text-white px-3.5 py-2.5 rounded-full transition-all duration-300 hover:bg-accent-dark hover:shadow-md"
              >
                <FaPhoneAlt className="text-[10px]" /> 0935110639 ( Quang )
              </a>
            </div>

            {/* USER MENU */}
            <div className="relative z-[60]">
              {userInfo ? (
                <div
                  className="relative cursor-pointer py-2"
                  onMouseEnter={() => setUserMenuOpen(true)}
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="flex items-center gap-2 text-gray-700 hover:text-brand-600 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 border border-brand-200 shadow-ambient">
                      <FaUser className="text-xs" />
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-tight">
                      <span className="font-bold text-sm max-w-[100px] truncate">{userInfo.name}</span>
                    </div>
                    <FaCaretDown className={`text-xs text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180 text-brand-600' : ''}`} />
                  </div>

                  <div className={`absolute right-0 top-full pt-2 w-56 transition-all duration-200 transform ${userMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                    <div className="bg-white rounded-2xl shadow-elevation border border-gray-100 overflow-hidden">
                      <div className="px-4 py-3 border-b bg-surface-low sm:hidden">
                        <p className="text-sm font-bold text-gray-800">{userInfo.name}</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors text-sm">
                        <FaUserCircle className="text-base" /> Hồ sơ cá nhân
                      </Link>
                      {(userInfo.isAdmin || ['director', 'accountant', 'production'].includes(userInfo.role)) && (
                        <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-accent font-bold hover:bg-red-50 transition-colors border-t border-b border-gray-100 text-sm">
                          <FaCog className="text-base" /> Trang Quản Trị
                        </Link>
                      )}
                      <button onClick={logoutHandler} className="w-full text-left flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors text-sm">
                        <FaSignOutAlt className="text-base" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-2 text-gray-600 hover:text-brand-600 font-medium transition-colors py-2">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                    <FaUser className="text-sm" />
                  </div>
                  <span className="hidden sm:inline text-sm">Đăng nhập</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className="lg:hidden border-t border-gray-100">
        <div className="px-4 py-3 bg-surface-low">
          <SearchBox />
        </div>
        {mobileMenuOpen && (
          <div className="bg-white px-4 pb-6 space-y-1 shadow-lg animate-fade-in">
            <Link to="/" className="block px-4 py-3 rounded-xl hover:bg-surface-low font-medium text-gray-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Trang chủ
            </Link>
            <Link to="/about" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-low font-medium text-gray-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              <FaInfoCircle className="text-brand-600" /> Về chúng tôi
            </Link>

            <div className="border-t border-b border-gray-100 py-2 my-1">
              <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hồ sơ năng lực</p>
              <Link to="/products/offset" className="flex items-center gap-3 px-4 py-3 hover:bg-surface-low text-gray-700 rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <FaBoxOpen className="text-brand-600" /> In Offset & Bao Bì
              </Link>
              <Link to="/products/garment" className="flex items-center gap-3 px-4 py-3 hover:bg-surface-low text-gray-700 rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <FaTags className="text-blue-500" /> In Vải & Garment
              </Link>
              <Link to="/infrastructure" className="flex items-center gap-3 px-4 py-3 hover:bg-surface-low text-gray-700 rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <FaCogs className="text-orange-500" /> Máy móc & Công nghệ
              </Link>
            </div>

            <Link to="/news" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-low font-medium text-gray-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              <FaNewspaper className="text-brand-500" /> Tin tức & Sự kiện
            </Link>
            <Link to="/contact" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-low font-medium text-gray-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Liên hệ
            </Link>

            <div className="pt-3 flex gap-2">
              <a href="tel:0903597686" className="flex-1 flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-xl font-bold text-sm">
                <FaPhoneAlt /> Tấn: 0903597686
              </a>
              <a href="tel:0935110639" className="flex-1 flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-xl font-bold text-sm">
                <FaPhoneAlt /> Quang: 0935110639
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;