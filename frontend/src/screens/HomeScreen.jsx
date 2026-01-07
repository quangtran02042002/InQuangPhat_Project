import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Product from '../components/Product';
import Paginate from '../components/Paginate';
import Meta from '../components/Meta';
import NewsSection from '../components/NewsSection';
import HeroSlider from '../components/HeroSlider';
import WhyChooseUs from '../components/WhyChooseUs';
import AboutSection from '../components/AboutSection';
import { FaArrowLeft, FaFilter, FaSearch } from 'react-icons/fa';
import ServiceSplit from '../components/ServiceSplit';
import OrderProcess from '../components/OrderProcess';
// Danh sách danh mục cố định
const OFFSET_CATEGORIES = [
  'Hộp giấy',
  'Túi giấy',
  'Tem nhãn',
  'Catalogue',
  'Namecard',
  'Tờ rơi'
];

const GARMENT_CATEGORIES = [
  'In áo thun',
  'In áo xuất khẩu',
  'In lụa gia công',
  'In chuyển nhiệt'
];
const ALL_CATEGORIES = [...OFFSET_CATEGORIES, ...GARMENT_CATEGORIES, 'Khác'];
const HomeScreen = () => {
  const { keyword, pageNumber, category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeGroup = queryParams.get('group');
  let visibleCategories = ALL_CATEGORIES;
  if (activeGroup === 'offset') {
    visibleCategories = OFFSET_CATEGORIES;
  } else if (activeGroup === 'garment') {
    visibleCategories = GARMENT_CATEGORIES;
  }
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let apiUrl = `/api/products?pageNumber=${pageNumber || 1}`;
        
        if (category) {
            apiUrl += `&category=${category}`; 
        } else if (keyword) {
            // --- SỬA ĐOẠN NÀY ---
            // Nếu từ khóa khác 'all' thì mới tìm kiếm. Còn bằng 'all' thì lờ đi (coi như lấy hết)
            if (keyword !== 'all') {
                apiUrl += `&keyword=${keyword}`;
            }
        }
        // -----------------------------

        const { data } = await axios.get(apiUrl);
        setProducts(data.products);
        setPage(data.page);
        setPages(data.pages);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        setLoading(false);
      }
    };

    // Cập nhật trạng thái nút bấm đang active
    if (category) {
      setActiveCategory(category);
    } else {
      setActiveCategory('');
    }

    fetchProducts();
  }, [keyword, pageNumber, category]);

  const handleCategoryClick = (cat) => {
    // Nếu đang bấm vào cái đã chọn -> Hủy chọn -> Về trang chủ sạch
    if (activeCategory === cat) {
      setActiveCategory('');
      navigate('/');
    } else {
      // Nếu chọn mới -> Chuyển hướng nhưng KÈM THEO GROUP (nếu có)
      setActiveCategory(cat);
      const groupParam = activeGroup ? `?group=${activeGroup}` : '';
      navigate(`/category/${cat}${groupParam}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {!keyword && !category ? <Meta /> : <Meta title={`Danh mục: ${keyword || category} | In Quang Phát`} />}

      {/* --- CÁC KHỐI INTRO (SLIDER, ABOUT...) --- */}
      {/* SỬA LOGIC Ở ĐÂY: Thêm điều kiện !category */}
      {!keyword && !category && (
        <>
          <HeroSlider />
          <WhyChooseUs />
          <ServiceSplit />
          <OrderProcess />
          <AboutSection />
        </>
      )}

      {/* --- CONTAINER CHÍNH --- */}
      <div className="container mx-auto px-4 py-12">

        {/* --- KHU VỰC BỘ LỌC DANH MỤC (ĐÃ SỬA GIAO DIỆN) --- */}
        <div id="danh-muc-san-pham" className="text-center mb-12 scroll-mt-24">
          {!keyword && (
            <>
              <h2 className="text-3xl font-bold text-gray-800 uppercase mb-3 tracking-wide">
                {/* Đổi tiêu đề linh hoạt */}
                {activeGroup === 'offset' ? 'Danh mục Bao Bì - Offset' :
                  activeGroup === 'garment' ? 'Danh mục May Mặc - In Lụa' :
                    'Danh mục sản phẩm'}
              </h2>
              <div className="w-20 h-1 bg-blue-600 mx-auto rounded mb-8"></div>
            </>
          )}

          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {/* 5. HIỂN THỊ DANH SÁCH ĐÃ ĐƯỢC LỌC (visibleCategories) */}
            {visibleCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-6 py-2.5 rounded-full text-sm md:text-base font-semibold transition-all duration-300 shadow-sm border
                            ${activeCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-blue-300 shadow-md transform scale-105'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:shadow-md'
                  }`}
              >
                {cat}
              </button>
            ))}

            {/* Nút xem tất cả (để thoát chế độ lọc group) */}
            {activeGroup && (
              <button
                /* SỬA DÒNG NÀY: Chuyển hướng sang /search/all */
                onClick={() => navigate('/search/all')}
                className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-500 font-medium hover:bg-gray-100 transition"
              >
                Xem tất cả lĩnh vực
              </button>
            )}
          </div>
        </div>


        {(keyword || category) && !loading && (
            <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center">
                   <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600">
                       {category ? <FaFilter /> : <FaSearch />}
                   </div>
                   <h2 className="text-lg text-gray-700">
                       {/* --- LOGIC HIỂN THỊ MỚI --- */}
                       {category ? 'Đang lọc danh mục: ' : (keyword === 'all' ? 'Danh sách: ' : 'Kết quả tìm kiếm: ')} 
                       
                       <span className="font-bold text-blue-800">
                           {category ? `"${category}"` : (keyword === 'all' ? "Tất cả sản phẩm" : `"${keyword}"`)}
                       </span>
                   </h2>
                </div>
            {/* Nút quay lại trang chủ */}
            <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 flex items-center font-medium">
              <FaArrowLeft className="mr-1" /> Quay lại tất cả
            </Link>
          </div>
        )}
        {/* --- TIÊU ĐỀ KẾT QUẢ TÌM KIẾM (Nếu đang tìm kiếm) --- */}

        {/* --- GRID SẢN PHẨM --- */}
        {loading ? (
          <div className="text-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-blue-600 font-medium animate-pulse">Đang tìm kiếm mẫu in phù hợp...</p>
          </div>
        ) : (
          <>
            {/* Nếu không có sản phẩm */}
            {products.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500 text-lg">Chưa có sản phẩm nào thuộc danh mục <strong>"{keyword}"</strong>.</p>
                <button onClick={() => navigate('/')} className="mt-6 text-blue-600 font-bold hover:underline">Xem tất cả sản phẩm</button>
              </div>
            )}

            {/* Lưới sản phẩm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <Product key={product._id} product={product} />
              ))}
            </div>

            <div className="mt-12">
              <Paginate pages={pages} page={page} keyword={keyword ? keyword : ''} />
            </div>
          </>
        )}
      </div>

      {/* --- MỤC TIN TỨC (Chỉ hiện trang chủ) --- */}
      {!keyword && (
        <div className="mt-10">
          <NewsSection />
        </div>
      )}

    </div>
  );
};

export default HomeScreen;