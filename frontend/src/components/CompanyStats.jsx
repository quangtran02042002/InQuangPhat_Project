import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaPrint, FaAward, FaHistory, FaArrowRight } from 'react-icons/fa';
import useScrollReveal from '../hooks/useScrollReveal';

const CompanyStats = () => {
  const sectionRef = useScrollReveal();

  const stats = [
    { icon: <FaUsers size={36} />, value: '3000+', label: 'Khách hàng tin cậy' },
    { icon: <FaPrint size={36} />, value: '5M+', label: 'Sản phẩm/năm' },
    { icon: <FaAward size={36} />, value: '100%', label: 'Hài lòng về chất lượng' },
    { icon: <FaHistory size={36} />, value: '12+', label: 'Năm kinh nghiệm' },
  ];

  return (
    <section ref={sectionRef}>
      {/* STATS BAND */}
      <div className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #004D38 0%, #006B4D 50%, #00875f 100%)' }}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center mb-12 reveal">
            <p className="text-brand-200 font-medium uppercase tracking-widest text-sm">Những con số ấn tượng</p>
            <h2 className="text-white text-2xl md:text-3xl font-extrabold mt-2">Hơn 1 thập kỷ không ngừng phát triển</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="reveal text-center group"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-brand-200 group-hover:bg-white/20 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">{stat.value}</div>
                <div className="text-brand-200 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="bg-white py-16 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center max-w-3xl reveal">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">
            Sẵn sàng hợp tác cùng chúng tôi?
          </h2>
          <p className="text-gray-500 mb-8">
            Đội ngũ tư vấn của In Quang Phát luôn sẵn sàng hỗ trợ bạn 24/7. Liên hệ ngay để nhận báo giá miễn phí!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-full font-bold text-base shadow-floating hover:shadow-glow-brand transition-all duration-300 hover:-translate-y-0.5"
            >
              Nhận báo giá miễn phí <FaArrowRight />
            </Link>
            <a
              href="tel:0935110639"
              className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-700 hover:border-brand-600 hover:text-brand-600 px-8 py-4 rounded-full font-bold text-base transition-all duration-300"
            >
              📞 0935.110.639
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyStats;