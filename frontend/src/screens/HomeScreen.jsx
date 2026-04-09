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
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#111827] relative">

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
              <div className="container mx-auto px-4 py-16 max-w-7xl">
                    
                    {/* 1. THANH NÚT BẤM LỌC NHANH */}
                    <div className="mb-12 text-center">
                        <h2 className="text-lg md:text-xl font-extrabold text-[#111827] uppercase mb-6 tracking-wider">
                            {activeGroup === 'offset' ? 'Danh mục Bao Bì - Offset' : 
                             activeGroup === 'garment' ? 'Danh mục May Mặc - In Lụa' : 
                             'Khám phá danh mục khác'}
                        </h2>
                        
                        <div className="flex flex-wrap justify-center gap-3">
                            {visibleCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border
                                        ${activeCategory === cat 
                                            ? 'bg-[#006B4D] text-white border-[#006B4D] shadow-sm' 
                                            : 'bg-white text-[#6B7280] border-gray-200 hover:border-[#006B4D] hover:text-[#006B4D]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                             
                            <button 
                                onClick={() => navigate('/products')}
                                className="px-5 py-2.5 rounded-full border border-gray-200 text-[#6B7280] font-bold hover:bg-gray-100 transition-colors"
                            >
                                 ✕ Bỏ lọc
                            </button>
                        </div>
                    </div>

                    {/* 2. BÀI VIẾT GIỚI THIỆU DỊCH VỤ */}
                    {category && (
                       <CategoryArticle categorySlug={category} />
                    )}

                    {/* 3. TIÊU ĐỀ DANH SÁCH SẢN PHẨM */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-[#E6F0ED] rounded-xl flex items-center justify-center text-[#006B4D] text-lg shrink-0 border border-[#006B4D]/10">
                               {category ? <FaFilter /> : <FaSearch />}
                           </div>
                           <h2 className="text-lg md:text-xl text-[#111827] font-bold">
                               Mẫu sản phẩm tham khảo: <span className="font-extrabold text-[#006B4D] uppercase tracking-wide">"{category || keyword}"</span>
                           </h2>
                        </div>
                        {/* Nút quay lại Grid danh mục */}
                        <button onClick={() => navigate('/')} className="text-sm text-[#6B7280] hover:text-[#006B4D] flex items-center font-bold bg-[#F9FAFB] px-4 py-2 rounded-xl border border-gray-100 transition-colors">
                            <FaArrowLeft className="mr-2" /> Quay lại danh mục
                        </button> 
                    </div> 

                    {/* 4. LƯỚI HIỂN THỊ SẢN PHẨM */}
                    {loading ? (
                        <div className="text-center py-24 flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-[#E6F0ED] border-t-[#006B4D] rounded-full animate-spin mb-4"></div>
                            <p className="text-[#6B7280] font-medium">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <>
                          {products.length === 0 && (
                             <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm border-dashed">
                                 <div className="text-6xl mb-4 opacity-50">📦</div>
                                 <p className="text-[#111827] font-bold text-lg">Chưa có mẫu nào trong mục này.</p>
                                 <p className="text-sm text-[#6B7280] mt-2">Vui lòng liên hệ Zalo để xem thêm kho mẫu thực tế.</p>
                                 <button onClick={() => navigate('/')} className="mt-6 text-[#006B4D] font-bold hover:underline bg-[#E6F0ED] px-6 py-2 rounded-full">Quay lại trang chủ</button>
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