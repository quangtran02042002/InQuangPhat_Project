import React, { useEffect } from 'react';
import { FaAward, FaUsers, FaPrint, FaHistory, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Meta from '../components/Meta';

const AboutScreen = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans">
      <Meta title="Về chúng tôi | In Quang Phát - Lịch sử hình thành & Phát triển" />

      {/* 1. BANNER GIỚI THIỆU */}
      <div className="relative bg-blue-900 text-white py-24">
        <div className="absolute inset-0 opacity-20">
            {/* Bạn có thể thay bằng ảnh background nhà xưởng làm mờ */}
            <img src="https://via.placeholder.com/1920x600" alt="Background" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase mb-4 tracking-wide">Câu chuyện của chúng tôi</h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                Hơn 10 năm nỗ lực không ngừng nghỉ để trở thành biểu tượng niềm tin trong ngành in ấn & bao bì tại Việt Nam.
            </p>
        </div>
      </div>

      {/* 2. GIỚI THIỆU CHUNG (Sứ mệnh - Tầm nhìn) */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6 uppercase border-l-4 border-blue-600 pl-4">
                    Tầm nhìn & Sứ mệnh
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed text-lg">
                    Được thành lập từ những năm đầu 2010, <strong>In Quang Phát</strong> khởi đầu là một xưởng in nhỏ với khát khao mang lại những sản phẩm bao bì "Made in Vietnam" chất lượng quốc tế.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                    Chúng tôi không chỉ in lên giấy, chúng tôi in lên đó <strong>uy tín thương hiệu</strong> của khách hàng. Sứ mệnh của chúng tôi là nâng tầm giá trị sản phẩm Việt thông qua bao bì chuyên nghiệp.
                </p>
                
                <div className="space-y-3">
                    <div className="flex items-center">
                        <FaCheckCircle className="text-green-500 mr-3 text-xl" />
                        <span className="font-medium text-gray-700">Công nghệ in Offset 6 màu hiện đại nhất.</span>
                    </div>
                    <div className="flex items-center">
                        <FaCheckCircle className="text-green-500 mr-3 text-xl" />
                        <span className="font-medium text-gray-700">Quy trình khép kín: Thiết kế - In - Gia công.</span>
                    </div>
                    <div className="flex items-center">
                        <FaCheckCircle className="text-green-500 mr-3 text-xl" />
                        <span className="font-medium text-gray-700">Cam kết tiến độ & Chất lượng tuyệt đối.</span>
                    </div>
                </div>
            </div>
            <div className="relative">
                {/* Ảnh minh hoạt động đội ngũ */}
                <img 
                    src="https://via.placeholder.com/600x400" 
                    alt="Team Quang Phat" 
                    className="rounded-lg shadow-2xl transform md:rotate-3 hover:rotate-0 transition duration-500" 
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-xl border-l-4 border-red-600 hidden md:block">
                    <p className="text-4xl font-bold text-blue-900">12+</p>
                    <p className="text-sm text-gray-500 uppercase">Năm kinh nghiệm</p>
                </div>
            </div>
        </div>
      </div>

      {/* 3. LỊCH SỬ HÌNH THÀNH (TIMELINE) - Điểm nhấn */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12 uppercase">
                <FaHistory className="inline-block mr-2 text-blue-600" /> Chặng đường phát triển
            </h2>

            <div className="relative border-l-4 border-blue-200 ml-4 md:ml-1/2 space-y-12">
                
                {/* Mốc 1: 2012 */}
                <div className="relative flex flex-col md:flex-row items-center">
                    <div className="absolute -left-3 md:left-1/2 md:-ml-3 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow"></div>
                    <div className="ml-8 md:ml-0 md:w-1/2 md:pr-12 text-left md:text-right">
                        <h3 className="text-2xl font-bold text-blue-900">2012</h3>
                        <h4 className="font-bold text-gray-700">Thành lập Xưởng in Quang Phát</h4>
                        <p className="text-gray-500 mt-2">Khởi đầu với 02 máy in Offset 1 màu và đội ngũ 5 nhân sự tâm huyết tại Hà Nội.</p>
                    </div>
                    <div className="hidden md:block md:w-1/2"></div>
                </div>

                {/* Mốc 2: 2015 */}
                <div className="relative flex flex-col md:flex-row items-center">
                    <div className="absolute -left-3 md:left-1/2 md:-ml-3 w-6 h-6 bg-red-600 rounded-full border-4 border-white shadow"></div>
                    <div className="hidden md:block md:w-1/2"></div>
                    <div className="ml-8 md:ml-0 md:w-1/2 md:pl-12 text-left">
                        <h3 className="text-2xl font-bold text-red-600">2015</h3>
                        <h4 className="font-bold text-gray-700">Mở rộng quy mô nhà xưởng</h4>
                        <p className="text-gray-500 mt-2">Chuyển sang nhà xưởng 500m2, đầu tư hệ thống máy in Komori 4 màu Nhật Bản.</p>
                    </div>
                </div>

                {/* Mốc 3: 2019 */}
                <div className="relative flex flex-col md:flex-row items-center">
                    <div className="absolute -left-3 md:left-1/2 md:-ml-3 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow"></div>
                    <div className="ml-8 md:ml-0 md:w-1/2 md:pr-12 text-left md:text-right">
                        <h3 className="text-2xl font-bold text-blue-900">2019</h3>
                        <h4 className="font-bold text-gray-700">Đạt mốc 1000 Khách hàng</h4>
                        <p className="text-gray-500 mt-2">Trở thành đối tác tin cậy của nhiều thương hiệu lớn trong lĩnh vực Bao bì & May mặc.</p>
                    </div>
                    <div className="hidden md:block md:w-1/2"></div>
                </div>

                {/* Mốc 4: 2024 - Nay */}
                <div className="relative flex flex-col md:flex-row items-center">
                    <div className="absolute -left-3 md:left-1/2 md:-ml-3 w-6 h-6 bg-yellow-500 rounded-full border-4 border-white shadow"></div>
                    <div className="hidden md:block md:w-1/2"></div>
                    <div className="ml-8 md:ml-0 md:w-1/2 md:pl-12 text-left">
                        <h3 className="text-2xl font-bold text-yellow-600">2024 - Nay</h3>
                        <h4 className="font-bold text-gray-700">Tiếp tục mở rộng quy mô sản xuất, nâng cao năng lực</h4>
                        <p className="text-gray-500 mt-2">Chuyển đến nhà xưởng mới 2000m2 với nhiều máy móc hiện đại, đạt chuẩn, hướng đến sự đáp ứng cao hơn cho khách hàng.</p>
                    </div>
                </div>

            </div>
        </div>
      </div>



    </div>
  );
};

export default AboutScreen;