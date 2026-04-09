import React from 'react';
import { FaCheckCircle, FaCogs, FaInfoCircle, FaStar, FaMedal } from 'react-icons/fa';

const CategoryDetail = ({ content }) => {
  if (!content) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#006B4D]/10 overflow-hidden mb-8 animate-fade-in-down">
      
      {/* 1. Header & Intro */}
      <div className="p-8 pb-0">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-[#004D38] border-l-4 border-[#006B4D] pl-4">
          {content.title}
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed mb-6 italic border-b border-gray-100 pb-6">
          "{content.intro}"
        </p>
      </div>

      {/* 2. Body Content */}
      <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Cột Trái: Vai trò & Loại hình */}
        <div className="space-y-6">
            <div className="bg-[#E6F0ED] p-6 rounded-xl">
                <h3 className="font-bold text-[#006B4D] mb-4 flex items-center text-lg">
                    <FaInfoCircle className="mr-2"/> VAI TRÒ & LỢI ÍCH
                </h3>
                <ul className="space-y-3">
                    {content.role.map((r, i) => (
                        <li key={i} className="flex items-start text-gray-700">
                            <FaCheckCircle className="text-[#006B4D] mr-3 mt-1 shrink-0"/> 
                            <span>{r}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                    <FaStar className="text-yellow-500 mr-2"/> CÁC LOẠI PHỔ BIẾN:
                </h3>
                <p className="text-gray-600 pl-6">{content.types}</p>
            </div>
        </div>

        {/* Cột Phải: Quy trình & Cam kết */}
        <div className="space-y-6">
            <div className="bg-orange-50 p-6 rounded-xl">
                <h3 className="font-bold text-orange-700 mb-4 flex items-center text-lg">
                    <FaCogs className="mr-2"/> QUY TRÌNH SẢN XUẤT
                </h3>
                <div className="space-y-3">
                    {content.process.map((p, i) => (
                        <div key={i} className="flex items-start text-gray-700">
                            <span className="bg-orange-200 text-orange-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shrink-0">
                                {p.step}
                            </span>
                            <span>{p.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-start bg-green-50 p-4 rounded-lg border border-green-100">
                <FaMedal className="text-green-600 text-2xl mr-3 mt-1"/>
                <div>
                    <span className="font-bold text-green-700 block mb-1">CAM KẾT CHẤT LƯỢNG:</span>
                    <span className="text-gray-600 text-sm">{content.commitment}</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default CategoryDetail;