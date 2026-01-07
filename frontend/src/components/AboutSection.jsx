import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
// 1. IMPORT THƯ VIỆN SCROLL
import { scroller } from 'react-scroll';

const AboutSection = () => {
  
  // 2. HÀM XỬ LÝ CUỘN TRANG NÂNG CAO
  const scrollToProducts = () => {
    scroller.scrollTo('danh-muc-san-pham', {
      duration: 1000, // Thời gian trượt: 1000ms = 1 giây (Càng lớn càng chậm)
      delay: 0,
      smooth: 'easeInOutQuart', // Hiệu ứng trượt: Nhanh ở giữa, chậm dần khi tới đích (Rất mượt)
      offset: -100, // Trừ hao chiều cao của Header để không bị che mất tiêu đề
    });
  };

  return (
    <div className="py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* ... (GIỮ NGUYÊN PHẦN ẢNH BÊN TRÁI) ... */}
          <div className="w-full lg:w-1/2 relative">
             {/* ... Code ảnh giữ nguyên ... */}
             <img src="/images/about-factory.jpg" alt="Xưởng in" className="relative w-full rounded-xl shadow-lg z-10"/>
             {/* ... */}
          </div>

          {/* CỘT CHỮ (BÊN PHẢI) */}
          <div className="w-full lg:w-1/2">
            <h4 className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-2">Về chúng tôi</h4>
            
            {/* ... (GIỮ NGUYÊN CÁC ĐOẠN VĂN MÔ TẢ) ... */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
              Đối tác in ấn tin cậy của hơn <span className="text-blue-600">3000+</span> doanh nghiệp
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed text-justify">
              {/* ... nội dung cũ ... */}
              In Quang Phát tự hào là đơn vị sở hữu...
            </p>
            
            {/* ... */}

            <div className="flex gap-4 mt-8">
                {/* 3. NÚT BẤM GỌI HÀM SCROLL */}
                <button 
                    onClick={scrollToProducts}
                    className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition transform hover:-translate-y-1 flex items-center cursor-pointer"
                >
                    Xem mẫu sản phẩm ngay <FaArrowRight className="ml-2 animate-bounce-x"/>
                </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutSection;