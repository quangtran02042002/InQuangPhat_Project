import React from 'react';
import { FaShippingFast, FaMoneyBillAlt, FaCheckCircle, FaPencilRuler } from 'react-icons/fa';

const WhyChooseUs = () => {
  const features = [
    {
      icon: <FaMoneyBillAlt />,
      title: 'GIÁ TẬN XƯỞNG',
      desc: 'Không qua trung gian, tiết kiệm tới 30% chi phí cho doanh nghiệp.',
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      icon: <FaPencilRuler />,
      title: 'MIỄN PHÍ THIẾT KẾ',
      desc: 'Đội ngũ Designer chuyên nghiệp hỗ trợ chỉnh sửa file in ấn miễn phí.',
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      icon: <FaShippingFast />,
      title: 'GIAO HÀNG ĐÚNG HẸN',
      desc: 'Cam kết tiến độ sản xuất, hỗ trợ giao hàng tận nơi tại Hà Nội.',
      color: 'text-[#006B4D]',
      bg: 'bg-[#E6F0ED]'
    },
    {
      icon: <FaCheckCircle />,
      title: 'CÔNG NGHỆ HIỆN ĐẠI',
      desc: 'Hệ thống máy in Offset 6 màu đời mới, cho bản in sắc nét, chuẩn màu.',
      color: 'text-red-600',
      bg: 'bg-red-100'
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 border border-gray-100 rounded-xl hover:shadow-xl transition duration-300 group">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 ${feature.bg} ${feature.color} group-hover:scale-110 transition`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 uppercase">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;