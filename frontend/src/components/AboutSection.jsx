import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import useScrollReveal from '../hooks/useScrollReveal';

const AboutSection = () => {
  const sectionRef = useScrollReveal();

  const stats = [
    { value: '15+', label: 'Năm kinh nghiệm' },
    { value: '100+', label: 'Khách hàng tin cậy' },
    { value: '5M+', label: 'Sản phẩm/năm' },
  ];

  const highlights = [
    'Công nghệ in Offset 4 màu — sắc nét, chuẩn màu quốc tế',
    'Quy trình khép kín: Thiết kế → In → Gia công → Giao hàng',
    'Miễn phí thiết kế — Giá tận xưởng, không qua trung gian',
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-14 xl:gap-20">

          {/* IMAGE COLUMN */}
          <div className="w-full lg:w-1/2 relative reveal-left">
            <div className="relative">
              {/* Decorative background blobs */}
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-brand-100 rounded-full opacity-50 blur-3xl -z-10" />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-brand-200 rounded-full opacity-30 blur-2xl -z-10" />

              {/* Main image */}
              <img
                src="/images/about-factory.jpg"
                alt="Đội ngũ In Quang Phát"
                className="w-full rounded-3xl shadow-elevation object-cover h-[400px] lg:h-[500px]"
              />

              {/* Floating achievement card */}
              <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-floating px-5 py-4 flex items-center gap-4 border border-gray-100">
                <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-extrabold text-sm">✓</span>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cam kết</div>
                  <div className="font-extrabold text-gray-800 text-sm">100% hài lòng</div>
                </div>
              </div>

              {/* Experience badge */}
              <div className="absolute -top-4 -left-4 bg-brand-600 text-white rounded-2xl px-4 py-3 shadow-floating">
                <div className="text-2xl font-extrabold leading-none">15+</div>
                <div className="text-[10px] text-brand-200 uppercase tracking-wider">Năm kinh nghiệm</div>
              </div>
            </div>
          </div>

          {/* TEXT COLUMN */}
          <div className="w-full lg:w-1/2">
            {/* Label */}
            <div className="reveal delay-100">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-600 uppercase tracking-widest border border-brand-100">
                Về chúng tôi
              </span>
            </div>

            {/* Heading */}
            <h2 className="reveal delay-200 mt-4 text-3xl md:text-4xl lg:text-[2.6rem] font-extrabold text-gray-900 leading-tight">
              Đối tác in ấn tin cậy của hơn{' '}
              <span className="text-gradient-brand">100+ doanh nghiệp</span>
            </h2>

            {/* Desc */}
            <p className="reveal delay-300 mt-5 text-gray-500 leading-relaxed text-base">
              In Quang Phát tự hào sở hữu hệ thống máy in Offset khổ lớn hiện đại và dây chuyền in lụa Garment tự động, cam kết mang lại giải pháp bao bì & in ấn toàn diện từ thiết kế đến thành phẩm.
            </p>

            {/* Highlights */}
            <ul className="reveal delay-300 mt-6 space-y-3">
              {highlights.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <FaCheckCircle className="text-brand-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            {/* Mini stats */}
            <div className="reveal delay-400 mt-8 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {stats.map((stat, i) => (
                <div key={i} className={`bg-surface-low rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-gray-100 ${i === 2 ? 'col-span-2 md:col-span-1' : ''}`}>
                  <div className="text-xl sm:text-2xl font-extrabold text-brand-600">{stat.value}</div>
                  <div className="text-[11px] text-gray-500 mt-1 leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="reveal delay-500 mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-7 py-3.5 rounded-full font-bold shadow-ambient hover:shadow-floating transition-all duration-300 hover:-translate-y-0.5"
              >
                Xem mẫu sản phẩm
                <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 border-2 border-brand-600 text-brand-600 px-7 py-3.5 rounded-full font-bold hover:bg-brand-50 transition-all duration-300"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;