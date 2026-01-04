import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Product from '../components/Product';
import Paginate from '../components/Paginate';
import { FaArrowLeft } from 'react-icons/fa';

const HomeScreen = () => {
  const { keyword, pageNumber } = useParams(); // Lấy tham số từ URL
  
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Gọi API với tham số
        const { data } = await axios.get(`/api/products?keyword=${keyword || ''}&pageNumber=${pageNumber || 1}`);
        
        setProducts(data.products);
        setPage(data.page);
        setPages(data.pages);
        
        setLoading(false);
      } catch (error) {
        console.error("Lỗi:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, pageNumber]); // Chạy lại khi URL thay đổi

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      
      {/* Nút quay lại nếu đang tìm kiếm */}
      {keyword && (
        <div className="mb-6">
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 transition">
                <FaArrowLeft className="mr-2" /> Quay lại tất cả sản phẩm
            </Link> 
            <h2 className="mt-4 text-xl text-gray-700">Kết quả tìm kiếm cho: <span className="font-bold text-blue-800">"{keyword}"</span></h2>
        </div>
      )}

      {!keyword && (
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 uppercase">Sản phẩm nổi bật</h1>
            <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
          </div>
      )}

      {loading ? (
        <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-blue-600 font-semibold">Đang tải sản phẩm...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Product key={product._id} product={product} />
            ))}
          </div>
          
          {products.length === 0 && (
             <div className="text-center py-20 text-gray-500 text-lg">Không tìm thấy sản phẩm nào phù hợp.</div>
          )}

          {/* Thanh Phân Trang */}
          <Paginate pages={pages} page={page} keyword={keyword ? keyword : ''} />
        </>
      )}
    </div>
  );
};

export default HomeScreen;