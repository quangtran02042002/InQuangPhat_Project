import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaPhoneAlt, FaCommentDots, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import Meta from '../components/Meta'; // Import SEO

const ProductScreen = () => {
  const { id } = useParams();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // STATE MỚI: Lưu đường link của ảnh đang được chọn để phóng to
  const [activeImage, setActiveImage] = useState('');

  const CONTACT_INFO = {
    phone: "0909123456",
    zaloLink: "https://zalo.me/0909123456" 
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        
        // Mặc định chọn ảnh đầu tiên trong mảng images làm ảnh hiển thị chính
        if (data.images && data.images.length > 0) {
            setActiveImage(data.images[0].url);
        } else {
            // Fallback nếu sản phẩm không có ảnh (hoặc dữ liệu cũ)
            setActiveImage('/images/sample.jpg'); 
        }
        
        setLoading(false);
      } catch (err) {
        setError('Không tìm thấy mẫu sản phẩm này.');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-20 font-medium text-blue-600">Đang tải dữ liệu mẫu in...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      
      {/* --- SEO --- */}
      <Meta 
        title={`${product.name} | In Quang Phát`} 
        description={product.description ? product.description.replace(/<[^>]+>/g, '').substring(0, 160) : product.name}
      />
      {/* ----------- */}

      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-blue-700 mb-6 transition font-medium">
        <FaArrowLeft className="mr-2" /> Quay lại danh sách mẫu
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          
          {/* --- CỘT TRÁI: THƯ VIỆN ẢNH (GALLERY) --- */}
          <div className="p-8 bg-gray-100 flex flex-col items-center">
            
            {/* 1. ẢNH LỚN (MAIN IMAGE) */}
            <div className="relative w-full max-w-lg bg-white shadow-xl rounded-lg overflow-hidden border-4 border-white mb-4 aspect-square flex items-center justify-center">
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-contain" // Dùng contain để thấy toàn bộ chi tiết, cover để lấp đầy
              />
              <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-xs px-3 py-1 font-bold z-10">
                MẪU ĐÃ SẢN XUẤT
              </div>
            </div>

            {/* 2. DANH SÁCH ẢNH NHỎ (THUMBNAILS) */}
            {product.images && product.images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto p-2 w-full justify-center scrollbar-hide">
                    {product.images.map((img, index) => (
                        <button 
                            key={index}
                            onClick={() => setActiveImage(img.url)}
                            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-md border-2 overflow-hidden flex-shrink-0 transition-all duration-200 
                                ${activeImage === img.url 
                                    ? 'border-blue-600 opacity-100 ring-2 ring-blue-100 scale-105' 
                                    : 'border-gray-300 opacity-60 hover:opacity-100 hover:border-gray-400'
                                }`}
                        >
                            <img src={img.url} alt={`Thumb ${index}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
          </div>

          {/* --- CỘT PHẢI: THÔNG TIN CHI TIẾT --- */}
          <div className="p-8 lg:p-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 leading-tight">{product.name}</h1>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
               <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold text-xs uppercase tracking-wide">
                 {product.category}
               </span>
               <span>|</span>
               <span>Mã mẫu: <span className="font-mono text-gray-700">#{product._id.slice(-6).toUpperCase()}</span></span>
               <span>|</span>
               <span className="flex items-center text-green-600 font-medium">
                   <FaCheckCircle className="mr-1" /> Còn hàng
               </span>
            </div>

            {/* BẢNG GIÁ */}
            {product.priceTable && product.priceTable.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Bảng giá tham khảo:</h3>
                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
                        {product.priceTable.map((item, idx) => (
                            <div key={idx} className="border border-blue-100 rounded-lg p-3 bg-blue-50 hover:bg-blue-100 transition">
                                <div className="text-gray-500 text-xs mb-1">Số lượng &ge; {item.minQuantity}</div>
                                <div className="font-bold text-blue-900 text-base">{item.price.toLocaleString()}đ</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MÔ TẢ (RICH TEXT) */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center border-b pb-2">
                <FaInfoCircle className="mr-2 text-blue-600" /> Chi tiết quy cách:
              </h3>
              
              <div 
                  className="ql-editor-display text-sm text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.description }}
              ></div>
            </div>

            {/* NÚT LIÊN HỆ */}
            <div className="border-t border-gray-200 pt-8 mt-auto">
                <p className="text-gray-800 font-medium mb-4 text-center">Quý khách cần tư vấn hoặc báo giá nhanh?</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <a href={`tel:${CONTACT_INFO.phone}`} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center py-4 rounded-xl font-bold shadow-lg shadow-red-100 transition flex items-center justify-center gap-2 transform hover:-translate-y-1">
                        <FaPhoneAlt className="animate-pulse" /> GỌI NGAY: {CONTACT_INFO.phone}
                    </a>
                    <a href={CONTACT_INFO.zaloLink} target="_blank" rel="noreferrer" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-xl font-bold shadow-lg shadow-blue-100 transition flex items-center justify-center gap-2 transform hover:-translate-y-1">
                        <FaCommentDots /> CHAT ZALO BÁO GIÁ
                    </a>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductScreen;