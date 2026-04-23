import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaEye } from 'react-icons/fa';

const Product = ({ product }) => {
  const displayPrice = product.priceTable && product.priceTable.length > 0
    ? product.priceTable[0].price.toLocaleString('vi-VN')
    : 'Liên hệ';

  const imageUrl = product.images && product.images.length > 0
    ? product.images[0].url
    : '/images/slide2.jpg';

  return (
    <div className="bg-white rounded-2xl shadow-ambient hover:shadow-elevation transition-all duration-400 border border-gray-100 overflow-hidden group hover:-translate-y-1">

      {/* Image container */}
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden h-60 w-full bg-surface-low">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* HOT Badge */}
          {product.isFeatured && (
            <div className="absolute top-3 left-3">
              <span className="bg-gradient-to-r from-rose-500 to-red-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-md">
                🔥 HOT
              </span>
            </div>
          )}

          {/* Quick-view overlay */}
          <div className="absolute inset-0 bg-brand-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-white text-brand-700 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
              <FaEye /> Xem chi tiết
            </span>
          </div>
        </div>
      </Link>

      {/* Card content */}
      <div className="p-5">
        {/* Category */}
        <div className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-2 bg-brand-50 px-2 py-0.5 rounded-full inline-block">
          {product.category}
        </div>

        {/* Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-base font-bold text-gray-800 hover:text-brand-600 line-clamp-2 mb-3 leading-snug transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {/* Contact CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div>
            <span className="text-[10px] text-gray-400 block mb-0.5">Báo giá</span>
            <div className="text-sm font-semibold text-brand-600">Vui lòng liên hệ</div>
          </div>
          <Link
            to={`/product/${product._id}`}
            className="flex items-center gap-1.5 bg-brand-50 hover:bg-brand-600 text-brand-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300"
          >
            Chi tiết <FaArrowRight className="text-[10px]" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Product;