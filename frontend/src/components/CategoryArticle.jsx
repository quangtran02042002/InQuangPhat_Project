import React from 'react';
import { categoryContent } from '../data/categoryContent';
import { FaCheckCircle, FaCogs, FaHandshake, FaInfoCircle } from 'react-icons/fa';

const CategoryArticle = ({ categorySlug }) => {
    // Lấy dữ liệu từ file data, nếu không có thì dùng nội dung mặc định
    const content = categoryContent[categorySlug] || {
        title: `Dịch Vụ ${categorySlug} Chuyên Nghiệp Tại Hà Nội`,
        intro: `In Quang Phát chuyên cung cấp dịch vụ ${categorySlug} uy tín, chất lượng cao. Với hệ thống máy móc hiện đại và đội ngũ kỹ thuật lành nghề, chúng tôi cam kết mang đến sản phẩm tốt nhất cho khách hàng.`,
        role: [
            'Thiết kế đẹp mắt, sáng tạo theo yêu cầu.',
            'Công nghệ in ấn hiện đại, chuẩn màu.',
            'Giá thành cạnh tranh tận xưởng.',
            'Tiến độ sản xuất nhanh chóng.'
        ],
        types: 'Đa dạng mẫu mã, kích thước và chất liệu theo yêu cầu của quý khách.',
        process: [
            { step: 1, text: 'Tư vấn & Báo giá' },
            { step: 2, text: 'Thiết kế & Duyệt mẫu' },
            { step: 3, text: 'Tiến hành sản xuất' },
            { step: 4, text: 'Giao hàng & Thanh toán' }
        ],
        commitment: 'Cam kết chất lượng sản phẩm đầu ra. Hỗ trợ đổi trả nếu có lỗi từ nhà sản xuất. Miễn phí giao hàng nội thành cho đơn hàng lớn.'
    };

    return (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-12">

            {/* 1. TIÊU ĐỀ & MỞ BÀI */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 border-l-8 border-[#006B4D] pl-6">
                {content.title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-8 text-justify">
                {content.intro}
            </p>
            <div className="mb-10 rounded-xl overflow-hidden shadow-lg">
                <img
                    src={content.image}
                    alt={content.title}
                    className="w-full h-[400px] object-cover transform hover:scale-105 transition duration-700"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x600?text=Dang+Cap+Nhat+Anh' }}
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* 2. VAI TRÒ / LỢI ÍCH (Cột Trái) */}
                <div>
                    <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4 uppercase">
                        <FaInfoCircle className="text-[#006B4D] mr-2" /> Vai trò & Lợi ích
                    </h3>
                    <ul className="space-y-3">
                        {content.role.map((item, index) => (
                            <li key={index} className="flex items-start text-gray-600">
                                <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6 bg-[#E6F0ED] p-4 rounded-lg border border-[#006B4D]/10">
                        <h4 className="font-bold text-[#004D38] text-sm mb-2 uppercase">Phân loại phổ biến:</h4>
                        <p className="text-gray-700 text-sm">{content.types}</p>
                    </div>
                </div>

                {/* 3. QUY TRÌNH & CAM KẾT (Cột Phải) */}
                <div>
                    <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4 uppercase">
                        <FaCogs className="text-orange-600 mr-2" /> Quy trình sản xuất
                    </h3>
                    <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                        {content.process.map((step) => (
                            <div key={step.step} className="ml-6 relative">
                                <span className="absolute -left-[31px] bg-white border-2 border-orange-500 text-orange-600 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                    {step.step}
                                </span>
                                <p className="text-gray-700 font-medium">{step.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 bg-green-50 p-5 rounded-xl border border-green-100 flex items-start">
                        <FaHandshake className="text-green-600 text-3xl mr-4 mt-1" />
                        <div>
                            <h4 className="font-bold text-green-800 mb-1 uppercase">Lời cam kết vàng</h4>
                            <p className="text-gray-600 text-sm text-justify">{content.commitment}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryArticle;