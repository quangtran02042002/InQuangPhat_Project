import React from 'react';
import { FaShippingFast, FaMoneyBillAlt, FaCheckCircle, FaPencilRuler } from 'react-icons/fa';
import useScrollReveal from '../hooks/useScrollReveal';

const WhyChooseUs = () => {
  const sectionRef = useScrollReveal();

  const features = [
    {
      icon: <FaMoneyBillAlt size={28} />,
      title: 'Giá tận xưởng',
      desc: 'Không qua trung gian, tiết kiệm tới 30% chi phí. Báo giá minh bạch, chi tiết ngay lần đầu.',
      gradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      accentColor: 'bg-emerald-600',
    },
    {
      icon: <FaPencilRuler size={28} />,
      title: 'Thiết kế miễn phí',
      desc: 'Đội ngũ Designer chuyên nghiệp hỗ trợ chỉnh sửa file in ấn miễn phí đến khi ưng ý.',
      gradient: 'from-violet-50 to-purple-50',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      accentColor: 'bg-violet-600',
    },
    {
      icon: <FaShippingFast size={28} />,
      title: 'Giao hàng đúng hẹn',
      desc: 'Cam kết tiến độ sản xuất. Giao hàng tận nơi toàn quốc, theo dõi trạng thái đơn hàng.',
      gradient: 'from-brand-50 to-teal-50',
      iconBg: 'bg-brand-100',
      iconColor: 'text-brand-600',
      accentColor: 'bg-brand-600',
    },
    {
      icon: <FaCheckCircle size={28} />,
      title: 'Công nghệ hiện đại',
      desc: 'Máy in Offset 6 màu đời mới, in lụa Oval tự động — hình ảnh sắc nét, chuẩn màu quốc tế.',
      gradient: 'from-rose-50 to-orange-50',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      accentColor: 'bg-rose-600',
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-surface-low">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Section header */}
        <div className="text-center mb-14 reveal">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-600 uppercase tracking-widest border border-brand-100">
            Tại sao chọn chúng tôi
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900">
            Cam kết mang lại{' '}
            <span className="text-gradient-brand">giá trị tốt nhất</span>
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Chúng tôi không chỉ in ấn — chúng tôi tạo ra những sản phẩm truyền tải thương hiệu của bạn.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`reveal bg-gradient-to-br ${feature.gradient} rounded-3xl p-7 border border-white hover:shadow-elevation transition-all duration-400 hover:-translate-y-2 group cursor-default`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 ${feature.iconBg} ${feature.iconColor} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-ambient`}>
                {feature.icon}
              </div>

              {/* Accent bar */}
              <div className={`w-8 h-1 ${feature.accentColor} rounded-full mb-4 group-hover:w-14 transition-all duration-300`} />

              {/* Title */}
              <h3 className="text-lg font-extrabold text-gray-800 mb-2">{feature.title}</h3>

              {/* Desc */}
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;