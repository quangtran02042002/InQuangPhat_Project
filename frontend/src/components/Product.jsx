import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const Product = ({ product }) => {
  // Lấy giá thấp nhất để hiển thị (vì chúng ta dùng bảng giá theo số lượng)
  const displayPrice = product.priceTable && product.priceTable.length > 0
    ? product.priceTable[0].price.toLocaleString('vi-VN')
    : 'Liên hệ';

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden h-64 w-full">
            {/* Hiển thị ảnh đầu tiên trong mảng images */}
            <img 
              src={product.images[0]?.url} 
              alt={product.name} 
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
            />
             {product.isFeatured && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">HOT</span>
            )}
        </div>
      </Link>

      <div className="p-4">
        <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{product.category}</div>
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-bold text-gray-800 hover:text-blue-600 truncate mb-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center mb-3">
             {[...Array(5)].map((_, i) => (
                 <FaStar key={i} className="text-yellow-400 text-xs" />
             ))}
             <span className="text-xs text-gray-400 ml-1">(0 đánh giá)</span>
        </div>

        <div className="flex justify-between items-end">
            <div>
                <span className="text-xs text-gray-500">Giá từ:</span>
                <div className="text-xl font-bold text-blue-700">{displayPrice}₫</div>
            </div>
            <Link to={`/product/${product._id}`} className="bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-800 p-2 rounded-lg transition-colors text-sm font-medium">
                Xem chi tiết
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Product;