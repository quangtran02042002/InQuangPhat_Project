import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaPrint, FaAward, FaHistory } from 'react-icons/fa';

const CompanyStats = () => {
  return (
    <section>
      {/* 1. THỐNG KÊ (Màu xanh) */}
      <div className="bg-blue-900 py-16 text-white text-center">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="group hover:transform hover:scale-105 transition duration-300">
                <FaUsers className="text-5xl mx-auto mb-4 text-blue-300 group-hover:text-white transition" />
                <span className="text-4xl font-bold block mb-2">3000+</span>
                <span className="text-blue-200">Khách hàng tin cậy</span>
            </div>
            <div className="group hover:transform hover:scale-105 transition duration-300">
                <FaPrint className="text-5xl mx-auto mb-4 text-blue-300 group-hover:text-white transition" />
                <span className="text-4xl font-bold block mb-2">5M+</span>
                <span className="text-blue-200">Sản phẩm/năm</span>
            </div>
            <div className="group hover:transform hover:scale-105 transition duration-300">
                <FaAward className="text-5xl mx-auto mb-4 text-blue-300 group-hover:text-white transition" />
                <span className="text-4xl font-bold block mb-2">100%</span>
                <span className="text-blue-200">Hài lòng về chất lượng</span>
            </div>
            <div className="group hover:transform hover:scale-105 transition duration-300">
                <FaHistory className="text-5xl mx-auto mb-4 text-blue-300 group-hover:text-white transition" />
                <span className="text-4xl font-bold block mb-2">12+</span>
                <span className="text-blue-200">Năm kinh nghiệm</span>
            </div>
        </div>
      </div>

      {/* 2. KÊU GỌI HÀNH ĐỘNG (CTA) */}
      <div className="bg-gray-50 py-16 text-center border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Bạn đã sẵn sàng hợp tác cùng chúng tôi?</h2>
        <Link 
            to="/contact" 
            className="inline-block bg-red-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-red-700 hover:shadow-2xl transition transform hover:-translate-y-1"
        >
            LIÊN HỆ HỢP TÁC NGAY
        </Link>
      </div>
    </section>
  );
};

export default CompanyStats;