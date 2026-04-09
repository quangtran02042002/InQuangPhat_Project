import React from 'react';
import { Link } from 'react-router-dom';
// Dùng bộ icon FA phổ biến, chắc chắn có sẵn
import { FaBoxOpen, FaTshirt, FaArrowRight, FaPrint, FaIndustry } from 'react-icons/fa';

const ServiceSplit = () => {
  // Style "thuốc đặc trị": Ép nền trắng mờ 20%, bất chấp Bootstrap hay Tailwind
  const glassStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Màu trắng, độ trong suốt 0.2
    backdropFilter: 'blur(4px)', // Hiệu ứng mờ kính
  };

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 uppercase tracking-wide">
              Lĩnh vực sản xuất chủ lực
            </h2>
            <div className="w-24 h-1 bg-[#006B4D] mx-auto rounded mt-4 mb-6"></div>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Chúng tôi sở hữu dây chuyền khép kín hiện đại cho cả hai lĩnh vực in ấn công nghiệp mũi nhọn.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* === KHỐI 1: IN OFFSET === */}
            <div className="group relative h-96 rounded-3xl overflow-hidden shadow-xl cursor-pointer transform hover:-translate-y-2 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-[#004D38] to-[#006B4D] opacity-95"></div>
                
                {/* Icon nền trang trí */}
                <div className="absolute -bottom-12 -right-12 text-[#004D38] opacity-20 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700">
                    <FaPrint size={300} /> 
                </div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                    {/* --- SỬA LỖI TẠI ĐÂY --- */}
                    {/* Bỏ class bg-white bg-opacity-20, thay bằng style={glassStyle} */}
                    <div 
                        className="w-24 h-24 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:bg-[#006B4D] transition-colors duration-500"
                        style={glassStyle} 
                    >
                        <FaBoxOpen size={48} /> {/* Tăng size lên 48 cho rõ */}
                    </div>
                    {/* ----------------------- */}

                    <h3 className="text-3xl font-bold text-white uppercase mb-3 tracking-wider">
                        In Offset & Bao Bì
                    </h3>
                    <p className="text-emerald-100 text-base mb-8 max-w-sm leading-relaxed font-light">
                        Chuyên hộp giấy, túi giấy, catalogue. Công nghệ in 6 màu cho hình ảnh sắc nét.
                    </p>
                    <Link to="/category/Hộp giấy?group=offset" className="bg-white text-[#004D38] px-8 py-3 rounded-full font-bold hover:bg-emerald-50 hover:shadow-lg transition flex items-center group-hover:gap-2">
                        Xem mẫu bao bì <FaArrowRight className="ml-2"/>
                    </Link>
                </div>
            </div>

            {/* === KHỐI 2: IN ÁO === */}
            <div className="group relative h-96 rounded-3xl overflow-hidden shadow-xl cursor-pointer transform hover:-translate-y-2 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-700 to-red-600 opacity-95"></div>

                {/* Icon nền trang trí */}
                <div className="absolute -bottom-12 -left-12 text-orange-900 opacity-20 transform -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700">
                      <FaIndustry size={320} />
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                    {/* --- SỬA LỖI TẠI ĐÂY --- */}
                    <div 
                        className="w-24 h-24 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:bg-orange-500 transition-colors duration-500"
                        style={glassStyle}
                    >
                        <FaTshirt size={48} />
                    </div>
                    {/* ----------------------- */}

                    <h3 className="text-3xl font-bold text-white uppercase mb-3 tracking-wider">
                        In Áo Xuất Khẩu
                    </h3>
                    <p className="text-orange-100 text-base mb-8 max-w-sm leading-relaxed font-light">
                        Hệ thống máy in Oval tự động, in lụa cao cấp, in trạm xoay tiêu chuẩn xuất khẩu.
                    </p>
                    <Link to="/category/In áo xuất khẩu?group=garment" className="bg-white text-orange-800 px-8 py-3 rounded-full font-bold hover:bg-orange-50 hover:shadow-lg transition flex items-center group-hover:gap-2">
                        Xem mẫu áo in <FaArrowRight className="ml-2"/>
                    </Link>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ServiceSplit;