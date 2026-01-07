import React from 'react';
import { Link } from 'react-router-dom';
// Import thêm các icon mới phù hợp hơn
import { FaBoxOpen, FaTshirt, FaArrowRight, FaLayerGroup } from 'react-icons/fa';
import { GiSewingMachine } from 'react-icons/gi';

const ServiceSplit = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 uppercase tracking-wide">
              Lĩnh vực sản xuất chủ lực
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded mt-4 mb-6"></div>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Chúng tôi sở hữu dây chuyền khép kín hiện đại cho cả hai lĩnh vực in ấn công nghiệp mũi nhọn.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* === KHỐI 1: IN OFFSET - BAO BÌ (Tông màu Xanh) === */}
            <div className="group relative h-96 rounded-3xl overflow-hidden shadow-xl cursor-pointer transform hover:-translate-y-2 transition-all duration-300">
                {/* Lớp nền Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-700 opacity-95"></div>
                
                {/* ICON NỀN KHỔNG LỒ (Graphic Background) */}
                <div className="absolute -bottom-12 -right-12 text-blue-800 opacity-20 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700">
                    <FaLayerGroup size={300} /> {/* Icon tượng trưng cho các lớp in offset */}
                </div>
                
                {/* Nội dung chính (Nổi bên trên) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                    <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-4xl mb-6 shadow-lg group-hover:bg-blue-500 transition-colors duration-500">
                        <FaBoxOpen />
                    </div>
                    <h3 className="text-3xl font-bold text-white uppercase mb-3 tracking-wider">
                        In Offset & Bao Bì
                    </h3>
                    <p className="text-blue-100 text-base mb-8 max-w-sm leading-relaxed font-light">
                        Chuyên hộp giấy, túi giấy, catalogue. Công nghệ in 6 màu cho hình ảnh sắc nét, chuẩn màu thiết kế.
                    </p>
                    <Link to="/category/Hộp giấy?group=offset" className="bg-white text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-blue-50 hover:shadow-lg transition flex items-center group-hover:gap-2">
                        Xem mẫu bao bì <FaArrowRight className="ml-2 transition-all"/>
                    </Link>
                </div>
            </div>

            {/* === KHỐI 2: IN LỤA - ÁO XUẤT KHẨU (Tông màu Cam/Đỏ) === */}
            <div className="group relative h-96 rounded-3xl overflow-hidden shadow-xl cursor-pointer transform hover:-translate-y-2 transition-all duration-300">
                {/* Lớp nền Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-700 to-red-600 opacity-95"></div>

                {/* ICON NỀN KHỔNG LỒ (Graphic Background) */}
                <div className="absolute -bottom-12 -left-12 text-orange-900 opacity-20 transform -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700">
                     <GiSewingMachine size={320} /> {/* Icon tượng trưng cho máy móc ngành may */}
                </div>

                {/* Nội dung chính (Nổi bên trên) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                    <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-4xl mb-6 shadow-lg group-hover:bg-orange-500 transition-colors duration-500">
                        <FaTshirt />
                    </div>
                    <h3 className="text-3xl font-bold text-white uppercase mb-3 tracking-wider">
                        In Áo Xuất Khẩu
                    </h3>
                    <p className="text-orange-100 text-base mb-8 max-w-sm leading-relaxed font-light">
                        Hệ thống máy in Oval tự động, in lụa cao cấp, in trạm xoay. Đạt tiêu chuẩn xuất khẩu Âu/Mỹ.
                    </p>
                    <Link to="/category/In áo xuất khẩu?group=garment" className="bg-white text-orange-800 px-8 py-3 rounded-full font-bold hover:bg-orange-50 hover:shadow-lg transition flex items-center group-hover:gap-2">
                        Xem mẫu áo in <FaArrowRight className="ml-2 transition-all"/>
                    </Link>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ServiceSplit;