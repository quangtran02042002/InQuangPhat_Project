import React from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaPencilRuler, FaFileInvoiceDollar, FaTruckMoving, FaArrowRight } from 'react-icons/fa';
import useScrollReveal from '../hooks/useScrollReveal';

const OrderProcess = () => {
  const sectionRef = useScrollReveal();

  const steps = [
    {
      num: '01',
      icon: <FaClipboardList size={22} />,
      title: 'Chọn quy cách sản phẩm',
      desc: 'Tham khảo mẫu mã trên website hoặc gửi trực tiếp mẫu cần in qua Zalo cho chúng tôi.',
      color: 'from-brand-600 to-teal-500',
      lightBg: 'bg-brand-50',
      textColor: 'text-brand-600',
    },
    {
      num: '02',
      icon: <FaPencilRuler size={22} />,
      title: 'Chốt thiết kế & Số lượng',
      desc: 'Designer lên mẫu demo miễn phí. Khách duyệt maket, chỉnh sửa thoải mái đến khi ưng ý.',
      color: 'from-violet-600 to-purple-500',
      lightBg: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
    {
      num: '03',
      icon: <FaFileInvoiceDollar size={22} />,
      title: 'Báo giá & Đặt cọc',
      desc: 'Nhận báo giá chi tiết. Đặt cọc 50% đơn hàng để xưởng bắt đầu lên lịch sản xuất.',
      color: 'from-amber-500 to-orange-400',
      lightBg: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      num: '04',
      icon: <FaTruckMoving size={22} />,
      title: 'Giao hàng & Thanh toán',
      desc: 'Hàng được giao tận nơi. Kiểm tra chất lượng và thanh toán phần còn lại khi nhận hàng.',
      color: 'from-green-600 to-emerald-500',
      lightBg: 'bg-green-50',
      textColor: 'text-green-600',
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-surface-low overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Section header */}
        <div className="text-center mb-16 reveal">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-600 uppercase tracking-widest border border-brand-100">
            Làm việc chuyên nghiệp
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900">
            Quy trình đặt hàng{' '}
            <span className="text-gradient-brand">đơn giản & nhanh chóng</span>
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Chỉ 4 bước đơn giản từ khi liên hệ đến khi nhận hàng. Toàn bộ quy trình được theo dõi minh bạch.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-10">

          {/* LEFT: Image showcase */}
          <div className="w-full lg:w-5/12 reveal-left">
            <div className="relative h-[320px] lg:h-full min-h-[400px] rounded-3xl overflow-hidden shadow-elevation">
              <img
                src="/images/about-factory.jpg"
                alt="Quy trình sản xuất In Quang Phát"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/30 to-transparent" />

              {/* Overlay content */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white">
                  <div className="text-2xl font-extrabold mb-1">Uy tín 15+ năm</div>
                  <div className="text-sm text-gray-200">Hơn 100 khách hàng đã tin tưởng hợp tác</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Steps */}
          <div className="w-full lg:w-7/12">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-brand-200 via-violet-200 to-green-200 hidden md:block" />

              <div className="space-y-5">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className="reveal flex items-start gap-5 bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-elevation hover:-translate-y-1 transition-all duration-300 group"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    {/* Step number + icon */}
                    <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                      {step.icon}
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-extrabold text-gray-700 shadow-sm border border-gray-100">
                        {step.num}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-extrabold text-gray-800 mb-1.5">{step.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="reveal mt-8">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-full font-bold shadow-ambient hover:shadow-floating transition-all duration-300 hover:-translate-y-0.5"
              >
                Bắt đầu đặt hàng ngay <FaArrowRight className="text-sm" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderProcess;