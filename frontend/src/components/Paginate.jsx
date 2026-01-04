import React from 'react';
import { Link } from 'react-router-dom';

const Paginate = ({ pages, page, isAdmin = false, keyword = '' }) => {
  if (pages <= 1) return null;

  return (
    <div className="flex justify-center mt-10 space-x-2">
      {[...Array(pages).keys()].map((x) => (
        <Link
          key={x + 1}
          to={
            !isAdmin
              ? keyword
                ? `/search/${keyword}/page/${x + 1}`
                : `/page/${x + 1}`
              : `/admin/productlist/${x + 1}`
          }
        >
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition duration-300 ${
              x + 1 === page
                ? 'bg-blue-600 text-white shadow-lg transform scale-110'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-blue-300'
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