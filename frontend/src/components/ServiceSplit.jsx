import React from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaTshirt, FaArrowRight } from 'react-icons/fa';
import useScrollReveal from '../hooks/useScrollReveal';

const ServiceSplit = () => {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Section Header */}
        <div className="text-center mb-14 reveal">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-600 uppercase tracking-widest border border-brand-100">
            Lĩnh vực chủ lực
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900">
            Hai ngành nghề —{' '}
            <span className="text-gradient-brand">Một tiêu chuẩn</span>
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Dây chuyền sản xuất khép kín hiện đại cho cả hai lĩnh vực in ấn công nghiệp mũi nhọn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* CARD 1: OFFSET */}
          <div className="reveal reveal-left group relative h-[420px] rounded-3xl overflow-hidden shadow-elevation cursor-pointer">
            {/* Background Image */}
            <img
              src="/images/slide1.jpg"
              alt="In Offset & Bao Bì"
              className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-800/60 to-transparent" />

            {/* Badge */}
            <div className="absolute top-5 left-5 z-10">
              <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                In Offset & Bao Bì
              </span>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-7">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-center text-white">
                  <FaBoxOpen size={20} />
                </div>
                <h3 className="text-2xl font-extrabold text-white">In Offset & Bao Bì</h3>
              </div>
              <p className="text-brand-100 text-sm mb-5 leading-relaxed">
                Hộp cứng, túi giấy, tem nhãn, catalogue. Công nghệ in 4 màu Shinohara cho màu sắc sắc nét nhất.
              </p>
              <Link
                to="/products/offset"
                className="inline-flex items-center gap-2 bg-white text-brand-700 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-brand-50 transition-colors duration-300 shadow-lg"
              >
                Xem mẫu bao bì <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* CARD 2: GARMENT */}
          <div className="reveal reveal-right group relative h-[420px] rounded-3xl overflow-hidden shadow-elevation cursor-pointer" style={{ transitionDelay: '150ms' }}>
            {/* Background Image */}
            <img
              src="/images/garment-printing.jpg"
              alt="In Áo Xuất Khẩu"
              className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-orange-900/90 via-orange-800/60 to-transparent" />

            {/* Badge */}
            <div className="absolute top-5 left-5 z-10">
              <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                In Áo & Garment
              </span>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-7">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-center text-white">
                  <FaTshirt size={20} />
                </div>
                <h3 className="text-2xl font-extrabold text-white">In Áo Xuất Khẩu</h3>
              </div>
              <p className="text-orange-100 text-sm mb-5 leading-relaxed">
                Máy in Oval tự động, trạm xoay 10 màu. Tiêu chuẩn xuất khẩu cho các thương hiệu quốc tế.
              </p>
              <Link
                to="/products/garment"
                className="inline-flex items-center gap-2 bg-white text-orange-700 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-orange-50 transition-colors duration-300 shadow-lg"
              >
                Xem mẫu áo in <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ServiceSplit;