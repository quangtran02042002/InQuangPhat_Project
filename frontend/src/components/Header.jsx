import React from 'react';
import { FaShoppingCart, FaUser, FaBars, FaSignOutAlt, FaPhoneAlt } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SearchBox from './SearchBox';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  // --- HÀM TÙY CHỈNH CUỘN MƯỢT (SLOW SCROLL) ---
  const scrollToTopSlowly = (duration) => {
    const startPosition = window.scrollY; // Vị trí hiện tại
    const startTime = performance.now();

    const animation = (currentTime) => {
      const timeElapsed = currentTime - startTime;

      // Hàm Easing (làm mượt chuyển động): easeInOutQuad
      // Giúp lúc bắt đầu chậm -> giữa nhanh -> kết thúc chậm lại
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
        window.scrollTo(0, 0); // Đảm bảo về đích chính xác
      }
    };

    requestAnimationFrame(animation);
  };

  // --- XỬ LÝ SỰ KIỆN CLICK ---
  const handleHomeClick = (e) => {
    e.preventDefault();

    if (location.pathname === '/') {
      // Nếu đang ở trang chủ -> Lướt từ từ trong 1500ms (1.5 giây)
      // Bạn có thể sửa số 1500 thành 2000 nếu muốn chậm hơn nữa
      scrollToTopSlowly(1000
      );
    } else {
      // Nếu ở trang khác -> Về trang chủ ngay lập tức
      navigate('/');
      window.scrollTo(0, 0);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">

        {/* LOGO: Đã áp dụng sự kiện click */}
        <a
          href="/"
          onClick={handleHomeClick}
          className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <span className="text-2xl font-bold text-blue-800 tracking-tighter uppercase">In Quang Phát</span>
        </a>

        {/* --- THANH TÌM KIẾM (Desktop) --- */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
          <SearchBox />
        </div>

        {/* Menu & User */}
        <div className="flex items-center space-x-5 text-gray-600">
          <nav className="hidden lg:flex space-x-6 items-center font-medium mr-4">

            {/* LINK TRANG CHỦ: Đã áp dụng sự kiện click */}
            <a
              href="/"
              onClick={handleHomeClick}
              className="hover:text-blue-600 transition cursor-pointer"
            >
              Trang chủ
            </a>
            <Link to="/contact" className="hover:text-blue-600 transition">Liên hệ</Link>
            {userInfo && userInfo.isAdmin && (
              <Link to="/admin/dashboard" className="text-red-600 font-bold hover:text-red-800">Quản trị</Link>
            )}


          </nav>

          <a href="tel:0935110639" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold flex items-center transition shadow-md ml-4 animate-pulse">
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