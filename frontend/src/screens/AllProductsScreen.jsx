import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaBoxOpen, FaFilter, FaArrowRight, FaChevronRight, FaTags, FaLayerGroup } from 'react-icons/fa';

import Paginate from '../components/Paginate';
import Loader from '../components/Loader';
import { categoryContent } from '../data/categoryContent'; 
import CategoryDetail from '../components/CategoryDetail';

const CATEGORY_GROUPS = [
    {
        title: "IN OFFSET & BAO BÌ",
        items: [
            { name: "Hộp Cứng, Hộp Quà", keywords: ["hộp cứng", "hộp quà", "carton lạnh", "quà tặng"] },
            { name: "In Hộp Mềm", keywords: ["hộp mềm", "hộp giấy", "ivory", "duplex", "bao bì giấy"] },
            { name: "In Decal, Tem Nhãn", keywords: ["decal", "tem", "nhãn", "sticker"] },
            { name: "Kẹp File / Folder", keywords: ["kẹp file", "folder", "tài liệu"] },
            { name: "Sách / Catalogue", keywords: ["sách", "tạp chí", "catalogue", "kỷ yếu"] },
            { name: "In Túi Xách Giấy", keywords: ["túi", "kraft", "shop"] },
            { name: "In Phong Bì", keywords: ["phong bì", "bao thư"] },
            { name: "In Hang Tag", keywords: ["tag", "thẻ", "mác"] }
        ]
    },
    {
        title: "IN VẢI & CÔNG NGHỆ",
        items: [
            { name: "In Lụa / Vải", keywords: ["lụa", "vải", "áo"] },
            { name: "In Chuyển Nhiệt (Pet)", keywords: ["chuyển nhiệt", "pet"] },
            { name: "In Cao Thành (High Density)", keywords: ["cao thành", "nổi", "3d"] },
            { name: "In Foil (Ép Kim/Nhũ)", keywords: ["ép kim", "nhũ", "foil"] },
            { name: "In Rubber (Mực Cao Su)", keywords: ["rubber", "cao su"] },
            { name: "In Silicone", keywords: ["silicone"] },
            { name: "In Puff (In Nổi Phồng)", keywords: ["puff", "nổi phồng"] },
            { name: "Mực nước (Waterbased)", keywords: ["mực nước", "waterbased"] }
        ]
    }
];

const AllProductsScreen = () => {
  const { pageNumber } = useParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({ 0: true, 1: false }); // Default: Offset expanded, Vải collapsed
  
  const toggleGroup = (index) => {
    setExpandedGroups(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  const [activeCategory, setActiveCategory] = useState({ name: 'Tất cả', keywords: [] });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/products?pageNumber=${pageNumber || 1}`);
        setProducts(data.products);
        setPage(data.page);
        setPages(data.pages);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [pageNumber]);

  const filteredProducts = activeCategory.name === 'Tất cả'
    ? products
    : products.filter(p => {
        const dbCategory = p.category ? p.category.toLowerCase() : '';
        return activeCategory.keywords.some(k => dbCategory.includes(k.toLowerCase()));
    });

  const currentContent = categoryContent[activeCategory.name];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-16 font-sans">
      
      {/* Banner */}
      <div className="bg-[#006B4D] text-white py-12">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
             <div className="text-xs text-[#E6F0ED] mb-3 uppercase font-extrabold tracking-widest opacity-80">Trang chủ / Sản phẩm</div>
             <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight">Kho Sản Phẩm & Mẫu In</h1>
        </div>
      </div>

      {/* MOBILE MENU (Hiện khi màn hình < 1024px) */}
      <div className="lg:hidden sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
          <div className="px-4 py-4 flex items-center justify-between">
              <span className="font-extrabold text-[#111827] flex items-center gap-2 truncate pr-2 uppercase tracking-wide">
                  <FaFilter className="text-[#006B4D] shrink-0"/> 
                  <span className="truncate">{activeCategory.name}</span>
              </span>
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-sm font-bold text-[#006B4D] border-2 border-[#006B4D] px-4 py-2 rounded-xl hover:bg-[#E6F0ED] transition-colors shrink-0"
              >
                  {showMobileMenu ? 'Đóng Menu' : 'Chọn danh mục'}
              </button>
          </div>
          
          {showMobileMenu && (
              <div className="absolute top-full left-0 w-full bg-white shadow-xl border-b border-gray-100 max-h-[70vh] overflow-y-auto animate-fade-in-down">
                  <div className="p-4 space-y-6">
                        <button 
                            onClick={() => { setActiveCategory({ name: 'Tất cả', keywords: [] }); setShowMobileMenu(false); }}
                            className={`w-full text-left px-5 py-4 rounded-xl font-bold border transition-colors ${activeCategory.name === 'Tất cả' ? 'bg-[#E6F0ED] border-transparent text-[#006B4D]' : 'bg-[#F9FAFB] border-gray-100 text-[#111827]'}`}
                        >
                            Tất cả sản phẩm
                        </button>
                        {CATEGORY_GROUPS.map((group, index) => (
                            <div key={index} className="border-b border-gray-100 last:border-none pb-4 last:pb-0">
                                <button 
                                    onClick={() => toggleGroup(index)}
                                    className="w-full flex items-center justify-between py-3 px-2 text-sm font-extrabold text-[#111827] uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    <span className="flex items-center">
                                        {index === 0 ? <FaBoxOpen className="mr-3 text-[#006B4D]"/> : <FaTags className="mr-3 text-[#006B4D]"/>} 
                                        {group.title}
                                    </span>
                                    <FaChevronRight className={`transition-transform duration-300 ${expandedGroups[index] ? 'rotate-90' : ''}`} />
                                </button>
                                
                                {expandedGroups[index] && (
                                    <div className="grid grid-cols-1 gap-2 mt-2 ml-2 animate-fade-in-down">
                                        {group.items.map((item) => (
                                            <button
                                                key={item.name}
                                                onClick={() => { setActiveCategory(item); setShowMobileMenu(false); }}
                                                className={`text-left px-5 py-4 rounded-xl text-sm border transition-all font-bold ${
                                                    activeCategory.name === item.name 
                                                    ? 'bg-[#E6F0ED] border-transparent text-[#006B4D]' 
                                                    : 'bg-white border-gray-100 text-[#6B7280]'
                                                }`}
                                            >
                                                {item.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                  </div>
              </div>
          )}
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
            
            {/* SIDEBAR DESKTOP (Rộng 25%) */}
            <div className="hidden lg:block w-1/4 shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                    <div className="flex items-center gap-3 font-extrabold text-[#111827] text-xl border-b border-gray-100 pb-4 mb-6 uppercase tracking-wider">
                        <FaFilter className="text-[#006B4D]"/> DANH MỤC
                    </div>
                    
                    <button 
                        onClick={() => setActiveCategory({ name: 'Tất cả', keywords: [] })}
                        className={`w-full text-left px-5 py-4 rounded-xl flex items-center justify-between transition-all duration-200 mb-4 border-l-4 ${
                            activeCategory.name === 'Tất cả' 
                            ? 'bg-[#E6F0ED] text-[#006B4D] font-bold border-[#006B4D]' 
                            : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#006B4D] border-transparent font-medium'
                        }`}
                    >
                        <span className="font-bold">Tất cả sản phẩm</span>
                        <FaLayerGroup className="shrink-0 ml-2" />
                    </button>

                    <div className="space-y-8 mt-8">
                        {CATEGORY_GROUPS.map((group, index) => (
                            <div key={index} className="border-b border-gray-50 last:border-none pb-4 last:pb-0">
                                <button 
                                    onClick={() => toggleGroup(index)}
                                    className="w-full flex items-center justify-between py-2 px-2 group hover:bg-[#F9FAFB] rounded-xl transition-all duration-300"
                                >
                                    <h4 className="text-[11px] font-extrabold text-[#6B7280] group-hover:text-[#006B4D] uppercase tracking-[0.15em] flex items-center transition-colors">
                                        {index === 0 ? <FaBoxOpen className="mr-3 text-[#006B4D] text-sm"/> : <FaTags className="mr-3 text-[#006B4D] text-sm"/>} 
                                        {group.title}
                                    </h4>
                                    <FaChevronRight className={`text-[10px] text-[#6B7280] transition-transform duration-500 ${expandedGroups[index] ? 'rotate-90' : ''}`} />
                                </button>
                                
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedGroups[index] ? 'max-h-[1000px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                                    <ul className="space-y-1 ml-1 pl-2 border-l border-[#006B4D]/10">
                                        {group.items.map((item) => (
                                            <li key={item.name}>
                                                <button
                                                    onClick={() => setActiveCategory(item)}
                                                    className={`group w-full text-left px-4 py-2.5 rounded-lg text-xs flex items-center justify-between transition-all duration-200 font-bold border-l-2 ${
                                                        activeCategory.name === item.name 
                                                        ? 'bg-[#E6F0ED] text-[#006B4D] border-[#006B4D] pl-4' 
                                                        : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#006B4D] border-transparent'
                                                    }`}
                                                >
                                                    <span className="whitespace-normal leading-tight pr-2 block w-full">{item.name}</span> 
                                                    
                                                    {activeCategory.name === item.name && (
                                                        <FaChevronRight className="text-[8px] shrink-0" />
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CONTENT (Rộng 75%) */}
            <div className="w-full lg:w-3/4">
                
                {activeCategory.name !== 'Tất cả' && (
                    <CategoryDetail content={currentContent} />
                )}

                {/* Header Kết quả */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="p-3 bg-[#E6F0ED] text-[#006B4D] rounded-xl shrink-0">
                            <FaLayerGroup size={20} />
                        </div>
                        <h2 className="text-lg text-[#111827] flex flex-wrap items-center gap-2">
                            <span className="font-bold text-[#6B7280] uppercase tracking-wider text-sm hidden sm:inline">Hiển thị:</span> 
                            <span className="font-extrabold text-[#006B4D] text-lg sm:text-xl">
                                {activeCategory.name}
                            </span>
                        </h2>
                    </div>

                    <div className="flex items-center w-full sm:w-auto justify-end">
                         <span className={`text-sm font-bold uppercase tracking-wider px-5 py-2 rounded-xl border ${
                             filteredProducts.length > 0 
                             ? 'bg-[#E6F0ED] text-[#006B4D] border-transparent' 
                             : 'bg-[#F9FAFB] text-[#6B7280] border-gray-100'
                         }`}>
                            {filteredProducts.length > 0 ? `TÌM THẤY ${filteredProducts.length} MẪU` : '0 mẫu'}
                        </span>
                    </div>
                </div>

                {/* Loading / Empty / Grid (Giữ nguyên) */}
                {loading ? (
                    <div className="flex justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100"><Loader /></div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
                        <div className="text-6xl mb-4 text-[#E6F0ED] mx-auto w-fit">📦</div>
                        <p className="text-[#6B7280] text-lg font-bold">Chưa tìm thấy mẫu nào trong mục này.</p>
                        <p className="text-sm text-gray-400 mt-2 px-4">Đang tìm từ khóa: <span className="italic">{activeCategory.keywords.join(', ')}</span></p>
                        <button 
                            onClick={() => setActiveCategory({ name: 'Tất cả', keywords: [] })} 
                            className="mt-8 px-8 py-3 bg-[#006B4D] text-white rounded-xl font-bold hover:bg-[#00553d] transition-colors shadow-sm"
                        >
                            Quay lại xem tất cả
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {filteredProducts.map((product) => (
                                <div key={product._id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#006B4D]/30 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
                                    <Link to={`/product/${product._id}`} className="block relative">
                                        <div className="h-40 sm:h-56 overflow-hidden bg-[#F9FAFB] relative">
                                            <img 
                                                src={product.images && product.images.length > 0 ? product.images[0].url : ''} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            />
                                            {product.category && (
                                                <span className="absolute bottom-0 left-0 bg-[#006B4D] text-white text-[9px] sm:text-[10px] px-3 py-1.5 rounded-tr-lg uppercase font-extrabold tracking-widest shadow-sm truncate max-w-[80%]">
                                                    {product.category}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                    
                                    <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                                        <div>
                                            <Link to={`/product/${product._id}`}>
                                                <h3 className="font-extrabold text-[#111827] text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-[#006B4D] transition-colors leading-snug" title={product.name}>
                                                    {product.name}
                                                </h3>
                                            </Link>
                                        </div>

                                        <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-50">
                                            <div>
                                                <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider mb-0.5">Giá tham khảo</p>
                                                <p className="text-red-500 font-extrabold text-sm sm:text-base tracking-tight">
                                                    {product.priceTable && product.priceTable.length > 0 
                                                        ? `${product.priceTable[0].price.toLocaleString()}đ` 
                                                        : 'Liên hệ'}
                                                </p>
                                            </div>
                                            <Link to={`/product/${product._id}`} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#F9FAFB] border border-gray-100 flex items-center justify-center text-[#006B4D] group-hover:bg-[#006B4D] group-hover:text-white transition-colors">
                                                <FaArrowRight className="text-sm" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {activeCategory.name === 'Tất cả' && (
                            <div className="mt-12 flex justify-center">
                                <Paginate pages={pages} page={page} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AllProductsScreen;