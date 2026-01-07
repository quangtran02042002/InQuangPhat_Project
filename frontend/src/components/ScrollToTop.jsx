import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // Lấy đường dẫn hiện tại (pathname)
  const { pathname } = useLocation();

  useEffect(() => {
    // Mỗi khi pathname thay đổi, cuộn màn hình lên toạ độ 0,0 (Góc trên cùng bên trái)
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Component này không hiển thị gì cả, chỉ chạy ngầm
};

export default ScrollToTop;