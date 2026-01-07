import React from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HeroSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    fade: true,
  };

  const banners = [
    {
      id: 1,
      image: '/images/slide1.jpg', 
      title: 'XƯỞNG IN OFFSET CÔNG NGHIỆP',
      subtitle: 'Chuyên in hộp giấy, túi giấy giá rẻ tận xưởng - Uy tín 10 năm kinh nghiệm',
      link: '/category/Hộp giấy?group=offset',
      btnText: 'XEM MẪU HỘP'
    },
    {
      id: 2,
      image: '/images/slide2.jpg',
      title: 'THIẾT KẾ MIỄN PHÍ - LẤY NGAY',
      subtitle: 'Hệ thống máy in hiện đại, cam kết chất lượng sắc nét, giao hàng đúng hẹn',
      link: '/contact',
      btnText: 'LIÊN HỆ BÁO GIÁ'
    }
  ];

  return (
    // Outer container giữ nguyên overflow-hidden
    <div className="hero-slider relative z-0 shadow-2xl overflow-hidden group">
      
      <style>
        {`
          .hero-slider .slick-slider { margin-bottom: 0 !important; }
          .hero-slider .slick-dots { bottom: 25px !important; z-index: 20; }
          .hero-slider .slick-dots li button:before { font-size: 12px !important; color: white !important; opacity: 0.5 !important; }
          .hero-slider .slick-dots li.slick-active button:before { opacity: 1 !important; }
        `}
      </style>

      <Slider {...settings}>
        {banners.map((banner) => (
          // --- THAY ĐỔI 1: Thêm overflow-hidden vào thẻ chứa slide ---
          <div key={banner.id} className="relative h-[400px] md:h-[500px] lg:h-[600px] outline-none bg-gray-900 overflow-hidden">
            
            <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>
            
            {/* --- THAY ĐỔI 2 & 3: Tăng blur và scale --- */}
            <img 
              src={banner.image} 
              alt={banner.title} 
              // blur-[2px] -> blur-[4px] (Mờ hơn)
              // scale-105 -> scale-115 (Phóng to hơn để che mép)
              // hover:scale-110 -> hover:scale-125 (Hiệu ứng zoom khi di chuột cũng tăng theo)
              className="!w-full !h-full object-cover blur-[4px] opacity-90 scale-115 transform transition-transform duration-[10s] hover:scale-125"
              style={{ display: 'block' }} 
            />
            
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 uppercase tracking-wider drop-shadow-2xl">
                {banner.title}
              </h2>
              <p className="text-gray-100 text-lg md:text-xl mb-8 max-w-2xl drop-shadow-md font-light bg-black/20 p-2 rounded-lg backdrop-blur-sm">
                {banner.subtitle}
              </p>
              <Link 
                to={banner.link}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-full transition transform hover:-translate-y-1 hover:shadow-2xl border-2 border-transparent"
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