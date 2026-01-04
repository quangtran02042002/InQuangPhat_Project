import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaPhoneAlt, FaCommentDots, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const ProductScreen = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const CONTACT_INFO = {
    phone: "0909123456",
    zaloLink: "https://zalo.me/0909123456" 
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
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
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-blue-700 mb-6 transition font-medium">
        <FaArrowLeft className="mr-2" /> Quay lại danh sách mẫu
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          
          {/* CỘT TRÁI: ẢNH */}
          <div className="p-8 bg-gray-100 flex items-center justify-center">
            <div className="relative w-full max-w-lg shadow-2xl rounded-lg overflow-hidden border-4 border-white">
              <img 
                src={product.images && product.images.length > 0 ? product.images[0].url : ''} 
                alt={product.name} 
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-xs px-3 py-1 font-bold">
                MẪU ĐÃ SẢN XUẤT
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div className="p-8 lg:p-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 leading-tight">{product.name}</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
               <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold text-xs uppercase tracking-wide">
                 {product.category}
               </span>
               <span>|</span>
               <span>Mã mẫu: <span className="font-mono text-gray-700">#{product._id.slice(-6).toUpperCase()}</span></span>
            </div>

            <div className="bg-blue-50 rounded-xl p-5 mb-8 border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                <FaInfoCircle className="mr-2" /> Chi tiết mẫu in:
              </h3>
              
              {/* --- KHU VỰC HIỂN THỊ NỘI DUNG HTML --- */}
              <div 
                  className="ql-editor-display text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: product.description }}
              ></div>
              {/* --------------------------------------- */}

            </div>

            {product.priceTable && product.priceTable.length > 0 && (
                <div className="mb-8 opacity-75 hover:opacity-100 transition">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Đơn giá tham khảo:</h3>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        {product.priceTable.map((item, idx) => (
                            <div key={idx} className="border rounded p-2 bg-gray-50">
                                <div className="text-gray-500 text-xs">SL &ge; {item.minQuantity}</div>
                                <div className="font-bold text-gray-800">{item.price.toLocaleString()}đ</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="border-t border-gray-200 pt-8">
                <p className="text-gray-800 font-medium mb-4 text-center">Quý khách muốn in sản phẩm tương tự mẫu này?</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <a href={`tel:${CONTACT_INFO.phone}`} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center py-4 rounded-lg font-bold shadow-lg shadow-red-200 transition flex items-center justify-center gap-2">
                        <FaPhoneAlt /> GỌI TƯ VẤN NGAY
                    </a>
                    <a href={CONTACT_INFO.zaloLink} target="_blank" rel="noreferrer" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-lg font-bold shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2">
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