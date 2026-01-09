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
import { FaArrowLeft, FaFilter, FaSearch,FaBoxOpen, FaTshirt, FaArrowRight, FaLayerGroup } from 'react-icons/fa';
import ServiceSplit from '../components/ServiceSplit';
import OrderProcess from '../components/OrderProcess';
import CategoryGrid from '../components/CategoryGrid';
import CategoryArticle from '../components/CategoryArticle';
import QuickSidebar from '../components/QuickSidebar'; // Import Sidebar

// Danh sách danh mục cố định (Cập nhật đầy đủ)
const OFFSET_CATEGORIES = [
  'Tem nhãn',
  'Hộp cứng',
  'Hộp giấy',
  'Kẹp file',
  'Catalogue',
  'Hang tag',
  'Túi giấy',
  'Phong bì'
];

const GARMENT_CATEGORIES = [
  'Waterbased',
  'In rubber',
  'In mực dầu',
  'In chuyển nhiệt',
  'High density',
  'In foil',
  'In silicone',
  'In puff'
];

const ALL_CATEGORIES = [...OFFSET_CATEGORIES, ...GARMENT_CATEGORIES, 'Khác'];

const HomeScreen = () => {
  const { keyword, pageNumber, category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeGroup = queryParams.get('group');

  // Xác định danh sách hiển thị dựa trên group
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
            if (keyword !== 'all') {
                apiUrl += `&keyword=${keyword}`;
            }
        }

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

    if (category) {
      setActiveCategory(category);
    } else {
      setActiveCategory('');
    }

    fetchProducts();
  }, [keyword, pageNumber, category]);

  const handleCategoryClick = (cat) => {
    if (activeCategory === cat) {
      // TRƯỜNG HỢP 1: Đang chọn -> Bấm lại để Bỏ chọn (Tắt bộ lọc)
      setActiveCategory('');
      
      // --- SỬA Ở ĐÂY ---
      // Thay vì navigate('/') để về trang chủ
      // Ta chuyển hướng về trang Danh sách tất cả sản phẩm
      navigate('/products'); 
      
    } else {
      // TRƯỜNG HỢP 2: Chọn danh mục mới
      setActiveCategory(cat);
      
      // Giữ lại tham số Group (Offset/Garment) nếu có để URL đẹp và đúng ngữ cảnh
      const groupParam = activeGroup ? `?group=${activeGroup}` : '';
      
      // Chuyển hướng sang trang chi tiết danh mục đó
      navigate(`/category/${cat}${groupParam}`);
    }
};

  return (
    <div className="min-h-screen bg-gray-50 relative">

      {!keyword && !category ? <Meta /> : <Meta title={`Danh mục: ${keyword || category} | In Quang Phát`} />}

      {/* --- SIDEBAR ĐIỀU HƯỚNG NHANH (Chỉ hiện ở Trang chủ) --- */}
      {!keyword && !category && (
          <QuickSidebar />
      )}

      {/* --- CÁC KHỐI INTRO (Chỉ hiện khi chưa lọc) --- */}
      {!keyword && !category && (
        <>
          {/* 1. Slider (Section Home) */}
          <div id="section-home">
              <HeroSlider />
          </div>

          {/* 2. Giới thiệu (Section Intro) */}
          <div id="section-intro">
              <AboutSection />
              <WhyChooseUs />
          </div>

          {/* 3. Lĩnh vực (Section Services) */}
          <div id="section-services">
              <ServiceSplit />
          </div>
          
          {/* 4. Quy trình (Section Process) */}
          <div id="section-process">
              <OrderProcess />
          </div>
        </>
      )}

      {/* --- CONTAINER CHÍNH (Section Categories) --- */}
      <div id="section-categories">
          
          {/* TRƯỜNG HỢP 1: Ở TRANG CHỦ -> Hiện lưới danh mục hình ảnh đẹp */}
          {!keyword && !category ? (
              <CategoryGrid /> 
          ) : (
              /* TRƯỜNG HỢP 2: ĐANG LỌC/TÌM KIẾM -> Hiện danh sách sản phẩm chi tiết */
              <div className="container mx-auto px-4 py-12">
                    
                    {/* 1. THANH NÚT BẤM LỌC NHANH */}
                    <div className="mb-10 text-center">
                        <h2 className="text-xl font-bold text-gray-800 uppercase mb-4 tracking-wide">
                            {activeGroup === 'offset' ? 'Danh mục Bao Bì - Offset' : 
                             activeGroup === 'garment' ? 'Danh mục May Mặc - In Lụa' : 
                             'Khám phá danh mục khác'}
                        </h2>
                        
                        <div className="flex flex-wrap justify-center gap-3">
                            {visibleCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border
                                        ${activeCategory === cat 
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                             
                            <button 
                                onClick={() => navigate('/products')}
                                className="px-5 py-2 rounded-full border border-red-200 text-red-500 font-medium hover:bg-red-50 transition"
                            >
                                 ✕ Thoát
                            </button>
                        </div>
                    </div>

                    {/* 2. BÀI VIẾT GIỚI THIỆU DỊCH VỤ */}
                    {category && (
                       <CategoryArticle categorySlug={category} />
                    )}

                    {/* 3. TIÊU ĐỀ DANH SÁCH SẢN PHẨM */}
                    <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center">
                           <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600">
                               {category ? <FaFilter /> : <FaSearch />}
                           </div>
                           <h2 className="text-lg text-gray-700">
                               Mẫu sản phẩm tham khảo: <span className="font-bold text-blue-800 uppercase">"{category || keyword}"</span>
                           </h2>
                        </div>
                        {/* Nút quay lại Grid danh mục */}
                        <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-blue-600 flex items-center font-medium transition">
                            <FaArrowLeft className="mr-1" /> Quay lại danh mục
                        </button> 
                    </div>

                    {/* 4. LƯỚI HIỂN THỊ SẢN PHẨM */}
                    {loading ? (
                        <div className="text-center py-32">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-blue-600">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <>
                          {products.length === 0 && (
                             <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm border-dashed">
                                 <div className="text-6xl mb-4">📦</div>
                                 <p className="text-gray-500 text-lg">Chưa có mẫu nào trong mục này.</p>
                                 <p className="text-sm text-gray-400 mt-2">Vui lòng liên hệ Zalo để xem thêm kho mẫu thực tế.</p>
                                 <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-bold hover:underline">Quay lại trang chủ</button>
                             </div>
                          )}

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
          )}
      </div>

      {/* --- MỤC TIN TỨC (Chỉ hiện trang chủ) --- */}
      {!keyword && !category && (
        <div id="section-news" className="mt-10 mb-20">
          <NewsSection />
        </div>
      )}

    </div>
  );
};

export default HomeScreen;