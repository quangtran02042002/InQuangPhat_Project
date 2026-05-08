import React, { useEffect } from 'react';
import { FaAward, FaUsers, FaPrint, FaHistory, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Meta from '../components/Meta';
import useScrollReveal from '../hooks/useScrollReveal';

const AboutScreen = () => {
  const sectionRef = useScrollReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const timeline = [
    {
      year: '2011',
      title: 'Thành lập Xưởng',
      desc: 'Khởi đầu với 02 máy in Offset và đội ngũ nhân sự tâm huyết tại Huế.',
    },
    {
      year: '2015',
      title: 'Mở rộng quy mô',
      desc: 'Chuyển sang nhà xưởng 500m², đầu tư hệ thống máy in Shinohara 4 màu nhập khẩu từ Nhật Bản.',
    },
    {
      year: '2019',
      title: 'Mốc 1000 Khách hàng',
      desc: 'Trở thành đối tác tin cậy của nhiều thương hiệu lớn trong lĩnh vực Bao bì & May mặc.',
    },
    {
      year: '2024 — Nay',
      title: 'Nâng tầm năng lực',
      desc: 'Chuyển đến nhà xưởng mới 2000m² với máy móc hiện đại, hướng đến chuẩn mực quốc tế.',
    },
  ];

  const highlights = [
    'Công nghệ in Offset 4 màu — sắc nét, chuẩn màu quốc tế',
    'Quy trình khép kín: Thiết kế → In → Gia công → Giao hàng',
    'Miễn phí thiết kế — Giá tận xưởng, không qua trung gian',
    'Cam kết tiến độ & Chất lượng tuyệt đối mọi đơn hàng',
  ];

  return (
    <div ref={sectionRef} className="bg-surface min-h-screen font-display text-gray-900">
      <Meta title="Về chúng tôi | In Quang Phát - Lịch sử hình thành & Phát triển" />

      {/* 1. HERO BANNER */}
      <div className="relative bg-white border-b border-gray-100 py-20 md:py-28 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50 rounded-full opacity-60 translate-x-1/3 -translate-y-1/4 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-100 rounded-full opacity-40 -translate-x-1/3 translate-y-1/4 blur-2xl pointer-events-none" />

        <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
          <div className="reveal">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-brand-50 text-brand-600 uppercase tracking-widest border border-brand-100 mb-6">
              Giới thiệu công ty
            </span>
          </div>
          <h1 className="reveal delay-100 text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Câu chuyện của{' '}
            <span className="text-gradient-brand">chúng tôi</span>
          </h1>
          <p className="reveal delay-200 text-gray-500 text-lg leading-relaxed">
            Hơn 15 năm nỗ lực không ngừng nghỉ để trở thành biểu tượng niềm tin trong ngành in ấn bao bì & may mặc tại Việt Nam.
          </p>
        </div>
      </div>

      {/* 2. MISSION & VISION */}
      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-white p-8 md:p-12 rounded-3xl shadow-ambient border border-gray-100">

          {/* Text side */}
          <div>
            <div className="reveal flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                <FaUsers />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                Tầm nhìn & Sứ mệnh
              </h2>
            </div>

            <p className="reveal delay-100 text-gray-500 mb-4 leading-relaxed">
              Được thành lập từ năm 2011, <strong className="text-gray-800 font-bold">In Quang Phát</strong> khởi đầu là một xưởng in nhỏ với khát khao mang lại những sản phẩm bao bì "Made in Vietnam" chất lượng quốc tế.
            </p>
            <p className="reveal delay-200 text-gray-500 mb-7 leading-relaxed">
              Chúng tôi không chỉ in lên giấy — chúng tôi in lên đó <strong className="text-gray-800 font-bold">uy tín thương hiệu</strong> của khách hàng. Sứ mệnh của chúng tôi là nâng tầm giá trị sản phẩm Việt thông qua bao bì chuyên nghiệp và in ấn đẳng cấp.
            </p>

            <ul className="reveal delay-300 space-y-3 mb-7">
              {highlights.map((item, i) => (
                <li key={i} className="flex items-center gap-3 bg-surface-low p-3 rounded-xl border border-gray-100">
                  <FaCheckCircle className="text-brand-600 flex-shrink-0" />
                  <span className="text-gray-600 text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <div className="reveal delay-400">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-7 py-3.5 rounded-full font-bold shadow-ambient hover:shadow-floating transition-all duration-300 hover:-translate-y-0.5"
              >
                Liên hệ hợp tác <FaArrowRight className="text-sm" />
              </Link>
            </div>
          </div>

          {/* Image side */}
          <div className="reveal-right">
            <img
              src="/images/about-factory.jpg"
              alt="Đội ngũ In Quang Phát"
              className="rounded-2xl w-full object-cover h-[360px] shadow-elevation"
            />
          </div>
        </div>
      </div>

      {/* 3. STATS BAR */}
      <div className="py-14" style={{ background: 'linear-gradient(135deg, #004D38 0%, #006B4D 100%)' }}>
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <FaUsers />, value: '3000+', label: 'Khách hàng' },
              { icon: <FaPrint />, value: '5M+', label: 'Sản phẩm/năm' },
              { icon: <FaAward />, value: '100%', label: 'Hài lòng' },
              { icon: <FaHistory />, value: '15+', label: 'Năm kinh nghiệm' },
            ].map((stat, i) => (
              <div key={i} className="reveal text-center text-white" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="text-brand-200 text-3xl mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-4xl font-extrabold mb-1">{stat.value}</div>
                <div className="text-brand-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. TIMELINE */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-14 reveal">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
              <FaHistory className="text-brand-600" />
              Chặng đường phát triển
            </h2>
            <div className="w-16 h-1 bg-brand-600 rounded mx-auto mt-3" />
          </div>

          <div className="relative">
            {/* Center line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-200 to-brand-50" />

            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div
                  key={i}
                  className={`reveal relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {/* Content */}
                  <div className={`w-full md:w-5/12 ${i % 2 === 0 ? 'md:pr-10 md:text-right' : 'md:pl-10'}`}>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-ambient hover:shadow-elevation transition-shadow duration-300 inline-block w-full">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-brand-50 text-brand-600 font-bold text-[10px] uppercase tracking-widest mb-2">
                        {item.year}
                      </span>
                      <h4 className="font-extrabold text-gray-800 text-base mb-1">{item.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="hidden md:flex md:w-2/12 justify-center">
                    <div className="w-5 h-5 bg-brand-600 rounded-full ring-4 ring-brand-100 border-2 border-white shadow-md" />
                  </div>

                  <div className="hidden md:block md:w-5/12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;