import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaPhoneAlt, FaUser, FaSignOutAlt, FaCog, FaUserCircle, FaCaretDown, 
  FaChevronDown, FaBoxOpen, FaCogs, FaBars, FaTimes, FaInfoCircle, FaNewspaper 
} from 'react-icons/fa'; // <-- 1. Import thêm FaNewspaper
import SearchBox from './SearchBox';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [dropdownOpen, setDropdownOpen] = useState(false); 
  const [userMenuOpen, setUserMenuOpen] = useState(false); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); 

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
    setUserMenuOpen(false);
  };

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

  const isParentActive = () => {
    return location.pathname.includes('/products') || location.pathname.includes('/infrastructure') 
      ? 'text-[#006B4D] font-bold' 
      : 'text-gray-700 hover:text-[#006B4D]';
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path) && path !== '/'
    ? 'text-[#006B4D] font-bold' 
    : 'text-gray-700 hover:text-[#006B4D]';

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 font-sans">
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-3">
        <div className="flex flex-wrap justify-between items-center gap-4">

          {/* 1. LOGO & MENU BUTTON (MOBILE) */}
          <div className="flex items-center gap-4 flex-shrink-0">
             <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="lg:hidden text-gray-700 text-2xl focus:outline-none"
             >
                {mobileMenuOpen ? <FaTimes /> : <FaBars />}
             </button>

             <a href="/" onClick={handleHomeClick} className="flex items-center gap-2 cursor-pointer">
                <span className="text-2xl font-bold text-[#006B4D] tracking-tighter uppercase whitespace-nowrap">In Quang Phát</span>
             </a>
          </div>

          {/* 2. THANH TÌM KIẾM (Desktop) */}
          <div className="flex-1 max-w-3xl mx-auto hidden lg:block px-8">
            <SearchBox />
          </div>

          {/* 3. MENU DESKTOP BÊN PHẢI */}
          <div className="flex items-center space-x-4 md:space-x-6 flex-shrink-0">
            
            {/* A. NAV LINKS */}
            <nav className="hidden lg:flex space-x-6 xl:space-x-8 items-center font-medium text-gray-600 whitespace-nowrap">
              <a href="/" onClick={handleHomeClick} className="hover:text-[#006B4D] transition cursor-pointer">
                Trang chủ
              </a>

              <Link to="/about" className={isActive('/about')}>
                Về chúng tôi
              </Link>
              
              {/* DROPDOWN: NĂNG LỰC SẢN XUẤT */}
              <div 
                  className="relative group h-10 flex items-center cursor-pointer"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
              >
                  <div className={`flex items-center py-2 ${isParentActive()}`}>
                      Năng lực sản xuất <FaChevronDown className="ml-1 text-[10px] opacity-70" />
                  </div>
                  <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-80 bg-white shadow-xl border-t-4 border-[#006B4D] transition-all duration-200 ${dropdownOpen ? 'opacity-100 visible mt-0' : 'opacity-0 invisible mt-2'}`}>
                      <Link to="/products" className="flex items-start px-6 py-4 hover:bg-gray-50 border-b group/item transition">
                          <div className="bg-[#E6F0ED] p-3 rounded-full mr-4 text-[#006B4D] group-hover/item:bg-[#006B4D] group-hover/item:text-white transition mt-1 flex-shrink-0">
                              <FaBoxOpen size={18} />
                          </div>
                          <div>
                              <span className="block font-bold text-gray-800 text-base mb-1">Sản phẩm mẫu</span>
                              <span className="text-sm text-gray-500 font-normal leading-snug whitespace-normal block">
                                  Hộp cứng, Túi giấy, Tem nhãn & Bao bì
                              </span>
                          </div>
                      </Link>
                      <Link to="/infrastructure" className="flex items-start px-6 py-4 hover:bg-gray-50 group/item transition">
                           <div className="bg-orange-100 p-3 rounded-full mr-4 text-orange-600 group-hover/item:bg-orange-600 group-hover/item:text-white transition mt-1 flex-shrink-0">
                              <FaCogs size={18} />
                          </div>
                          <div>
                              <span className="block font-bold text-gray-800 text-base mb-1">Hệ thống máy móc</span>
                              <span className="text-sm text-gray-500 font-normal leading-snug whitespace-normal block">
                                  Video quy trình in ấn & Gia công tại xưởng
                              </span>
                          </div>
                      </Link>
                  </div>
              </div>

              {/* --- 2. THÊM NÚT TIN TỨC VÀO ĐÂY --- */}
              <Link to="/news" className={isActive('/news')}>
                Tin tức
              </Link>

              <Link to="/contact" className={isActive('/contact')}>
                Liên hệ
              </Link>
            </nav>

            {/* B. HOTLINE BUTTON */}
            <a href="tel:0935110639" className="hidden xl:flex bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-bold items-center transition shadow-md animate-pulse whitespace-nowrap">
              <FaPhoneAlt className="mr-2 text-sm" />
              <span>0935.110.639</span>
            </a>

            {/* C. USER DROPDOWN */}
            <div className="relative z-50">
              {userInfo ? (
                <div 
                    className="relative cursor-pointer py-2"
                    onMouseEnter={() => setUserMenuOpen(true)}
                    onMouseLeave={() => setUserMenuOpen(false)}
                > 
                  <div className="flex items-center gap-2 text-gray-700 hover:text-[#006B4D] transition">
                    <div className="w-10 h-10 rounded-full bg-[#E6F0ED] flex items-center justify-center text-[#006B4D] border border-[#006B4D]/10 shadow-sm">
                        <FaUser className="text-sm" />
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-tight">
                        <span className="font-bold text-sm max-w-[100px] truncate">{userInfo.name}</span>
                    </div>
                    <FaCaretDown className={`text-xs text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180 text-[#006B4D]' : ''}`} />
                  </div>

                  <div className={`absolute right-0 top-full pt-2 w-60 transition-all duration-200 transform ${userMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                    <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 border-b bg-gray-50 sm:hidden">
                            <p className="text-sm font-bold text-gray-800">{userInfo.name}</p>
                        </div>
                        <Link to="/profile" className="flex items-center px-4 py-3 text-gray-700 hover:bg-[#E6F0ED] hover:text-[#006B4D] transition">
                            <FaUserCircle className="mr-3 text-lg" /> Hồ sơ cá nhân
                        </Link>
                        {userInfo.isAdmin && (
                            <Link to="/admin/dashboard" className="flex items-center px-4 py-3 text-red-600 font-bold hover:bg-red-50 transition border-t border-b border-gray-100">
                                <FaCog className="mr-3 text-lg" /> Trang Quản Trị
                            </Link>
                        )}
                        <button onClick={logoutHandler} className="w-full text-left flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition">
                            <FaSignOutAlt className="mr-3 text-lg" /> Đăng xuất
                        </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-2 text-gray-600 hover:text-[#006B4D] font-medium transition py-2">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#E6F0ED] hover:text-[#006B4D] transition">
                    <FaUser />
                  </div>
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 4. MOBILE MENU & SEARCH */}
      <div className="lg:hidden border-t">
         <div className="px-4 py-3 bg-gray-50">
            <SearchBox />
         </div>
         {mobileMenuOpen && (
            <div className="bg-white px-4 pb-6 space-y-1 shadow-lg animate-fade-in-down">
                <Link to="/" className="block px-4 py-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                    Trang chủ
                </Link>
                <Link to="/about" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                    <FaInfoCircle className="mr-3 text-[#006B4D]" /> Về chúng tôi
                </Link>
                
                <div className="border-t border-b border-gray-100 py-2">
                    <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Hồ sơ năng lực</p>
                    <Link to="/products" className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                        <FaBoxOpen className="mr-3 text-[#006B4D]" /> Sản phẩm mẫu
                    </Link>
                    <Link to="/infrastructure" className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                        <FaCogs className="mr-3 text-orange-500" /> Máy móc & Công nghệ
                    </Link>
                </div>

                {/* --- 3. THÊM MỤC TIN TỨC VÀO MOBILE MENU --- */}
                <Link to="/news" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                    <FaNewspaper className="mr-3 text-green-600" /> Tin tức & Sự kiện
                </Link>

                <Link to="/contact" className="block px-4 py-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                    Liên hệ
                </Link>
                
                <div className="pt-2">
                    <a href="tel:0935110639" className="block w-full text-center bg-red-600 text-white py-3 rounded-lg font-bold">
                        <FaPhoneAlt className="inline mr-2" /> 0935.110.639
                    </a>
                </div>
            </div>
         )}
      </div>
    </header>
  );
};

export default Header;