import React from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
// Import CSS của thư viện slider
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HeroSlider = () => {
  // Cấu hình cho Slider
  const settings = {
    dots: true,            // Hiện dấu chấm tròn bên dưới
    infinite: true,        // Chạy vòng lặp vô tận
    speed: 800,            // Tốc độ chuyển slide (ms)
    slidesToShow: 1,       // Hiện 1 ảnh 1 lần
    slidesToScroll: 1,
    autoplay: true,        // Tự động chạy
    autoplaySpeed: 5000,   // 5 giây đổi ảnh 1 lần
    arrows: false,         // Ẩn mũi tên 2 bên cho gọn
  };

  // Dữ liệu Banner (Bạn có thể sửa chữ ở đây)
  const banners = [
    {
      id: 1,
      image: 'public/images/banner1.jpg', 
      title: 'XƯỞNG IN OFFSET CÔNG NGHIỆP',
      subtitle: 'Chuyên in hộp giấy, túi giấy giá rẻ tận xưởng - Uy tín 10 năm kinh nghiệm',
      link: '/search/Hộp giấy',
      btnText: 'XEM MẪU HỘP'
    },
    {
      id: 2,
      image: 'public/images/banner2.jpg',
      title: 'THIẾT KẾ MIỄN PHÍ - LẤY NGAY',
      subtitle: 'Hệ thống máy in hiện đại, cam kết chất lượng sắc nét, giao hàng đúng hẹn',
      link: '/contact',
      btnText: 'LIÊN HỆ BÁO GIÁ'
    }
  ];

  return (
    <div className="hero-slider mb-10 shadow-xl overflow-hidden group">
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner.id} className="relative h-[400px] md:h-[500px] lg:h-[600px] outline-none">
            
            {/* Lớp phủ đen mờ để chữ dễ đọc hơn */}
            <div className="absolute inset-0 bg-black bg-opacity-40 z-10 transition duration-500 group-hover:bg-opacity-30"></div>
            
            {/* Ảnh nền */}
            <img 
              src={banner.image} 
              alt={banner.title} 
              className="w-full h-full object-cover transition-transform duration-[5000ms] transform hover:scale-105" // Hiệu ứng zoom nhẹ
            />
            
            {/* Nội dung chữ ở giữa */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 uppercase tracking-wider drop-shadow-lg">
                {banner.title}
              </h2>
              <p className="text-gray-100 text-lg md:text-xl mb-8 max-w-2xl drop-shadow-md font-light">
                {banner.subtitle}
              </p>
              <Link 
                to={banner.link}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-full transition transform hover:-translate-y-1 hover:shadow-2xl border-2 border-transparent hover:border-white"
              >
                {banner.btnText}
              </Link>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroSlider;