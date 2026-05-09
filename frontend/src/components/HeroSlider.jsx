import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaArrowRight, FaShieldAlt } from 'react-icons/fa';

const HeroSlider = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 1200,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    arrows: false,
    fade: true,
    pauseOnHover: false,
  };

  const banners = [
    {
      id: 1,
      image: '/images/slide1.jpg',
      badge: 'Xưởng in hiện đại',
      title: 'In Offset & Bao Bì',
      titleAccent: 'Chuẩn Quốc Tế',
      subtitle: 'Máy in 4 màu Shinohara khổ lớn — Cam kết chất lượng sắc nét, giao đúng hẹn từ xưởng trực tiếp.',
      link: '/products/offset',
      btnText: 'Xem mẫu bao bì',
      btnSecondary: '/contact',
      btnSecondaryText: 'Báo giá ngay',
      overlay: 'from-gray-900/80 via-gray-900/50 to-transparent',
    },
    {
      id: 2,
      image: '/images/oval-24-machine.png',
      badge: 'In áo xuất khẩu',
      title: 'In Lụa & Garment',
      titleAccent: 'Tiêu Chuẩn Xuất Khẩu',
      subtitle: 'Hệ thống máy Oval tự động, trạm xoay 24 màu — Đối tác tin cậy của các thương hiệu lớn.',
      link: '/products/garment',
      btnText: 'Xem mẫu áo in',
      btnSecondary: '/contact',
      btnSecondaryText: 'Liên hệ ngay',
      overlay: 'from-gray-900/75 via-gray-900/45 to-transparent',
    },
  ];

  return (
    <div className="hero-slider relative z-0 overflow-hidden group">
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner.id} className="relative h-[520px] md:h-[620px] lg:h-[720px] outline-none bg-gray-900 overflow-hidden">

            {/* Background Image with subtle zoom */}
            <img
              src={banner.image}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-[10s] group-hover:scale-110"
              style={{ display: 'block' }}
            />

            {/* Gradient Overlay — left-focused for text legibility */}
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.overlay} z-10 pointer-events-none`} />

            {/* Bottom vignette */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900/60 to-transparent z-10 pointer-events-none" />

            {/* Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-4xl">

              {/* Badge */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-white border border-white/30 backdrop-blur-sm bg-white/10 mb-5 w-fit transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: '200ms' }}
              >
                <FaShieldAlt className="text-brand-400" />
                {banner.badge}
              </div>

              {/* Headline */}
              <h1
                className={`text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-2 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: '350ms' }}
              >
                {banner.title}
                <span className="block text-brand-300">{banner.titleAccent}</span>
              </h1>

              {/* Subtitle */}
              <p
                className={`text-gray-200 text-base md:text-lg max-w-xl mb-8 leading-relaxed font-light transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: '500ms' }}
              >
                {banner.subtitle}
              </p>

              {/* CTA Buttons */}
              <div
                className={`flex flex-wrap gap-4 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: '650ms' }}
              >
                <Link
                  to={banner.link}
                  className="group/btn inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-8 rounded-full transition-all duration-300 shadow-floating hover:shadow-glow-brand hover:-translate-y-0.5"
                >
                  {banner.btnText}
                  <FaArrowRight className="text-sm group-hover/btn:translate-x-1 transition-transform duration-300" />
                </Link>
                <Link
                  to={banner.btnSecondary}
                  className="inline-flex items-center gap-2 glass border border-white/40 text-white font-bold py-3.5 px-8 rounded-full hover:bg-white/25 transition-all duration-300"
                >
                  {banner.btnSecondaryText}
                </Link>
              </div>
            </div>

            {/* Trust indicator — bottom right */}
            <div className="absolute bottom-10 right-8 z-20 hidden lg:flex flex-col gap-2 items-end">
              <div className="glass border border-white/20 rounded-2xl px-4 py-3 text-white text-right">
                <div className="text-2xl font-extrabold leading-none">100+</div>
                <div className="text-xs text-gray-300 mt-0.5">Khách hàng tin cậy</div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroSlider;