import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaTimes, FaBoxOpen, FaTags, FaArrowRight, FaFire } from 'react-icons/fa';
import axios from 'axios';

// --- 1. DANH SÁCH DANH MỤC CHUẨN (Dựa trên website của bạn) ---
// Slug là đường dẫn bạn muốn trỏ tới khi bấm vào danh mục đó
const STATIC_CATEGORIES = [
    // Nhóm Offset & Bao bì
    { name: 'In Decal, Tem Nhãn', keywords: ['decal', 'tem', 'nhãn', 'sticker'], slug: 'in-decal-tem-nhan' },
    { name: 'Hộp Cứng, Hộp Quà', keywords: ['hộp cứng', 'hộp quà', 'quà tặng', 'carton lạnh'], slug: 'hop-cung-hop-qua' },
    { name: 'In Hộp Mềm', keywords: ['hộp mềm', 'hộp giấy', 'ivory', 'duplex'], slug: 'in-hop-mem' },
    { name: 'Kẹp File / Folder', keywords: ['kẹp file', 'folder', 'tài liệu', 'profile'], slug: 'kep-file-folder' },
    { name: 'Sách / Catalogue', keywords: ['sách', 'tạp chí', 'catalogue', 'kỷ yếu'], slug: 'sach-catalogue' },
    { name: 'In Hang Tag', keywords: ['tag', 'thẻ treo', 'mác', 'quần áo'], slug: 'in-hang-tag' },
    { name: 'In Túi Xách Giấy', keywords: ['túi', 'túi giấy', 'kraft', 'shop'], slug: 'in-tui-xach-giay' },
    { name: 'In Phong Bì', keywords: ['phong bì', 'thư', 'bao thư'], slug: 'in-phong-bi' },
    
    // Nhóm Vải & Công nghệ
    { name: 'In Lụa / Vải', keywords: ['vải', 'áo', 'thun', 'lụa'], slug: 'in-vai-cong-nghe' },
    { name: 'In Chuyển Nhiệt (Pet)', keywords: ['chuyển nhiệt', 'pet', 'ép nhiệt'], slug: 'in-chuyen-nhiet' },
    { name: 'In Cao Thành (High Density)', keywords: ['cao thành', 'nổi', '3d'], slug: 'high-density' },
    { name: 'In Foil (Ép Kim/Nhũ)', keywords: ['ép kim', 'nhũ', 'vàng', 'bạc'], slug: 'in-foil' },
];

const SearchBox = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  
  const [productSuggestions, setProductSuggestions] = useState([]); 
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (keyword.trim().length > 1) {
        const searchLower = keyword.toLowerCase();

        // --- A. TÌM DANH MỤC (Lọc từ danh sách tĩnh) ---
        // Logic: Nếu tên danh mục HOẶC từ khóa phụ chứa từ khóa tìm kiếm
        const matchedCategories = STATIC_CATEGORIES.filter(cat => 
            cat.name.toLowerCase().includes(searchLower) || 
            cat.keywords.some(k => k.includes(searchLower))
        ).slice(0, 4); // Lấy tối đa 4 danh mục
        
        setCategorySuggestions(matchedCategories);

        // --- B. TÌM SẢN PHẨM (Gọi API) ---
        try {
          const { data } = await axios.get(`/api/products?keyword=${keyword}&pageNumber=1`);
          setProductSuggestions(data.products.slice(0, 5)); // Lấy 5 sản phẩm
        } catch (error) {
          console.error(error);
          setProductSuggestions([]);
        }

        setShowSuggestions(true);

      } else {
        setProductSuggestions([]);
        setCategorySuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // Giảm thời gian chờ xuống 300ms cho nhạy hơn

    return () => clearTimeout(timer);
  }, [keyword]);

  // Click ra ngoài để đóng
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [wrapperRef]);

  const submitHandler = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (keyword.trim()) navigate(`/search/${keyword}`);
    else navigate('/');
  };

  const clearHandler = () => {
      setKeyword('');
      setProductSuggestions([]);
      setCategorySuggestions([]);
      setShowSuggestions(false);
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-lg mx-auto md:mx-0 z-50">
      
      {/* INPUT BAR */}
      <form onSubmit={submitHandler} className="flex bg-gray-50 rounded-full border border-gray-300 overflow-hidden relative shadow-inner focus-within:ring-2 focus-within:ring-[#006B4D]/30 focus-within:border-[#006B4D] transition-all">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => { if(keyword.length > 1) setShowSuggestions(true) }}
          placeholder="Tìm: Hộp, Túi, Tem, Decal..."
          className="px-5 py-2.5 w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 font-medium"
          autoComplete="off"
        />
        
        {keyword && (
            <button type="button" onClick={clearHandler} className="text-gray-400 hover:text-red-500 px-3 transition flex items-center">
                <FaTimes />
            </button>
        )}

        <button type="submit" className="px-6 text-white bg-[#006B4D] hover:bg-[#004D38] transition flex items-center justify-center font-bold">
          <FaSearch />
        </button>
      </form>

      {/* RESULT DROPDOWN */}
      {showSuggestions && (productSuggestions.length > 0 || categorySuggestions.length > 0) && (
        <div className="absolute top-full left-0 w-full bg-white mt-2 rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in-up">
          
          {/* 1. PHẦN DANH MỤC (HIỂN THỊ RÕ RÀNG) */}
          {categorySuggestions.length > 0 && (
            <div className="bg-[#E6F0ED]/50">
                <div className="px-4 py-2 text-[10px] font-extrabold text-[#006B4D] uppercase tracking-wider border-b border-[#006B4D]/10 flex items-center">
                    <FaTags className="mr-2" /> Danh mục phù hợp
                </div>
                <ul>
                    {categorySuggestions.map((cat, index) => (
                        <li key={index} className="border-b border-[#E6F0ED] last:border-none">
                            <Link 
                                // Nếu bạn chưa có route category cụ thể, có thể trỏ về search keyword
                                // Hoặc dùng: to={`/category/${cat.slug}`} nếu đã làm trang danh mục
                                to={`/search/${cat.name}`} 
                                className="block px-4 py-2.5 text-sm font-bold text-gray-700 hover:text-[#006B4D] hover:bg-white transition flex justify-between items-center group cursor-pointer"
                                onClick={() => setShowSuggestions(false)}
                            >
                                <span className="flex items-center"><FaFire className="text-orange-500 mr-2 text-xs"/> {cat.name}</span>
                                <FaArrowRight className="text-xs text-gray-300 group-hover:text-[#006B4D] -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
          )}

          {/* 2. PHẦN SẢN PHẨM */}
          {productSuggestions.length > 0 && (
            <div>
                <div className="px-4 py-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100 border-t flex items-center bg-white">
                    <FaBoxOpen className="mr-2" /> Sản phẩm gợi ý
                </div>
                <ul>
                    {productSuggestions.map((product) => (
                    <li key={product._id} className="border-b border-gray-50 last:border-none hover:bg-gray-50 transition">
                        <Link 
                            to={`/product/${product._id}`} 
                            className="flex items-center px-4 py-3 group"
                            onClick={() => setShowSuggestions(false)}
                        >
                        {/* Ảnh nhỏ */}
                        <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden mr-3 bg-white flex-shrink-0">
                             <img 
                                src={product.images && product.images.length > 0 ? product.images[0].url : ''} 
                                alt={product.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            />
                        </div>
                        
                        {/* Thông tin */}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-800 group-hover:text-[#006B4D] transition truncate">
                                {product.name}
                            </div>
                            <div className="flex items-center mt-0.5">
                                <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 rounded mr-2">
                                    {product.category || 'Sản phẩm'}
                                </span>
                                <span className="text-xs font-bold text-red-500">
                                    {product.priceTable && product.priceTable.length > 0 
                                        ? `Từ ${product.priceTable[0].price.toLocaleString()}đ` 
                                        : 'Liên hệ'}
                                </span>
                            </div>
                        </div>
                        </Link>
                    </li>
                    ))}
                </ul>
            </div>
          )}

          {/* NÚT XEM TẤT CẢ */}
          <div className="bg-gray-50 p-2 border-t border-gray-100">
            <button 
                onClick={submitHandler}
                className="w-full text-center py-2 text-sm text-[#006B4D] font-bold hover:bg-[#E6F0ED] rounded-lg transition"
            >
                Xem tất cả kết quả cho "{keyword}"
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default SearchBox;