import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const SearchBox = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]); // Chứa danh sách gợi ý
  const [showSuggestions, setShowSuggestions] = useState(false); // Ẩn/Hiện gợi ý
  const wrapperRef = useRef(null); // Dùng để phát hiện click ra ngoài

  // --- KỸ THUẬT DEBOUNCE (CHỐNG SPAM API) ---
  useEffect(() => {
    // Chỉ chạy logic tìm kiếm nếu keyword có nội dung
    const timer = setTimeout(async () => {
      if (keyword.trim().length > 1) { // Gõ trên 1 ký tự mới tìm
        try {
          // Gọi API tìm kiếm (Lấy tối đa 5 kết quả thôi cho nhẹ)
          const { data } = await axios.get(`/api/products?keyword=${keyword}&pageNumber=1`);
          // Chỉ lấy 5 sản phẩm đầu tiên để gợi ý
          setSuggestions(data.products.slice(0, 5));
          setShowSuggestions(true);
        } catch (error) {
          console.error(error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500); // CHỜ 500ms SAU KHI NGỪNG GÕ MỚI GỌI API

    return () => clearTimeout(timer); // Xóa bộ đếm cũ nếu người dùng gõ tiếp
  }, [keyword]);

  // --- XỬ LÝ CLICK RA NGOÀI ĐỂ TẮT GỢI Ý ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Xử lý khi bấm nút Tìm kiếm hoặc Enter
  const submitHandler = (e) => {
    e.preventDefault();
    setShowSuggestions(false); // Tắt gợi ý
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
    } else {
      navigate('/');
    }
  };

  // Xử lý khi bấm xóa text
  const clearHandler = () => {
      setKeyword('');
      setSuggestions([]);
      setShowSuggestions(false);
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md mx-auto md:mx-0 z-50">
      {/* KHUNG INPUT */}
      <form onSubmit={submitHandler} className="flex bg-gray-100 rounded-full border border-gray-300 overflow-hidden relative">
        <input
          type="text"
          name="q"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true) }} // Bấm vào lại thì hiện lại
          placeholder="Tìm kiếm mẫu in (Hộp, Túi...)"
          className="px-4 py-2 w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-500 pl-5"
          autoComplete="off"
        />
        
        {/* Nút Xóa Text (Chỉ hiện khi có chữ) */}
        {keyword && (
            <button type="button" onClick={clearHandler} className="text-gray-400 hover:text-red-500 px-2 transition">
                <FaTimes />
            </button>
        )}

        <button type="submit" className="px-5 text-gray-600 hover:text-blue-600 transition bg-gray-200 hover:bg-gray-300 border-l border-gray-300">
          <FaSearch />
        </button>
      </form>

      {/* KHUNG GỢI Ý (BACKDROP DROPDOWN) */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white mt-2 rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-down">
          <ul>
            <li className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                Gợi ý sản phẩm
            </li>
            {suggestions.map((product) => (
              <li key={product._id} className="border-b border-gray-50 last:border-none">
                <Link 
                    to={`/product/${product._id}`} 
                    className="flex items-center px-4 py-3 hover:bg-blue-50 transition group"
                    onClick={() => setShowSuggestions(false)} // Click xong thì tắt
                >
                  {/* Ảnh nhỏ */}
                  <img 
                    src={product.images && product.images.length > 0 ? product.images[0].url : ''} 
                    alt={product.name} 
                    className="w-10 h-10 object-cover rounded border border-gray-200 mr-3"
                  />
                  
                  {/* Thông tin */}
                  <div>
                    <div className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition">
                        {product.name}
                    </div>
                    <div className="text-xs text-gray-500">
                        {product.priceTable && product.priceTable.length > 0 
                            ? `Từ ${product.priceTable[0].price.toLocaleString()}đ` 
                            : 'Liên hệ'}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
            {/* Nút xem tất cả */}
            <li>
                <button 
                    onClick={submitHandler}
                    className="w-full text-center py-3 text-sm text-blue-600 font-bold hover:bg-gray-100 transition"
                >
                    Xem tất cả kết quả cho "{keyword}"
                </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBox;