import React from 'react';
import CategoryGrid from '../components/CategoryGrid'; // Import component bạn vừa gửi

const AllProductsScreen = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* 1. Banner Giới thiệu */}
      <div className="bg-blue-900 text-white py-16 text-center">
        <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold uppercase mb-4">Danh mục sản phẩm & Dịch vụ</h1>
            <p className="text-blue-200 max-w-2xl mx-auto text-lg">
              Khám phá các giải pháp in ấn toàn diện của In Quang Phát: Từ bao bì giấy cao cấp đến công nghệ in vải xuất khẩu.
            </p>
        </div>
      </div>

      {/* 2. Hiển thị Lưới Danh mục (Tái sử dụng CategoryGrid) */}
      <div className="mt-8">
        {/* CategoryGrid đã có sẵn layout đẹp, ta chỉ cần gọi ra */}
        <CategoryGrid />
      </div>

      {/* 3. Phần SEO Text bổ sung (Optional) */}
      <div className="container mx-auto px-4 mt-12 max-w-5xl text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tại sao chọn In Quang Phát?</h2>
        <p className="text-gray-600 leading-relaxed">
            Chúng tôi tự hào là đơn vị tiên phong áp dụng công nghệ in Offset và in Vải hiện đại nhất miền Trung. 
            Với quy trình khép kín từ thiết kế đến gia công thành phẩm, Quang Phát cam kết mang lại sản phẩm chất lượng cao với chi phí tối ưu nhất cho doanh nghiệp của bạn.
        </p>
      </div>
    </div>
  );
};

export default AllProductsScreen;