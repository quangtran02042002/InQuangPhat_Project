import React from 'react';
import { Link } from 'react-router-dom';

const Paginate = ({ pages, page, isAdmin = false, keyword = '', basePath = '/products' }) => {
  if (pages <= 1) return null;

  const getLink = (pageNum) => {
    if (isAdmin) return `/admin/productlist/${pageNum}`;
    if (keyword) return `/search/${keyword}/page/${pageNum}`;
    return `${basePath}/page/${pageNum}`;
  };

  return (
    <div className="flex justify-center mt-10 space-x-2">
      {[...Array(pages).keys()].map((x) => (
        <Link key={x + 1} to={getLink(x + 1)}>
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition duration-300 ${
              x + 1 === page
                ? 'bg-[#006B4D] text-white shadow-lg transform scale-110'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-[#006B4D]/30'
            }`}
          >
            {x + 1}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Paginate;