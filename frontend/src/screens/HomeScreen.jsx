import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Thư viện gọi API
import Product from '../components/Product';

const HomeScreen = () => {
  const [products, setProducts] = useState([]); // Biến chứa danh sách sản phẩm
  const [loading, setLoading] = useState(true); // Biến trạng thái đang tải
  const [error, setError] = useState(null); // Biến báo lỗi

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Gọi API: Nhờ cấu hình Proxy, /api/products sẽ tự hiểu là http://localhost:5000/api/products
        const { data } = await axios.get('/api/products');
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Sản Phẩm In Ấn</h1>
            <p className="text-gray-500 max-w-2xl mx-auto">Giải pháp bao bì chuyên nghiệp giúp nâng tầm thương hiệu của bạn.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-xl text-blue-600 font-semibold animate-pulse">Đang tải sản phẩm...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 bg-red-50 rounded-lg border border-red-200">Lỗi: {error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Product key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;