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
    <div className="bg-gray-50 min-h-screen pb-12 font-sans">
      
      {/* Banner */}
      <div className="bg-blue-900 text-white py-8 shadow-md">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
             <div className="text-xs text-blue-300 mb-2 uppercase font-bold tracking-widest">Trang chủ / Sản phẩm</div>
             <h1 className="text-2xl md:text-3xl font-bold uppercase">Kho Sản Phẩm & Mẫu In</h1>
        </div>
      </div>

      {/* MOBILE MENU (Hiện khi màn hình < 1024px) */}
      <div className="lg:hidden sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-gray-700 flex items-center gap-2 truncate pr-2">
                  <FaFilter className="text-blue-600 shrink-0"/> 
                  <span className="truncate">{activeCategory.name}</span>
              </span>
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-sm font-bold text-blue-600 border border-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition shrink-0"
              >
                  {showMobileMenu ? 'Đóng Menu' : 'Chọn danh mục'}
              </button>
          </div>
          
          {showMobileMenu && (
              <div className="absolute top-full left-0 w-full bg-white shadow-xl border-b border-gray-200 max-h-[70vh] overflow-y-auto animate-fade-in-down">
                  <div className="p-4 space-y-6">
                        <button 
                            onClick={() => { setActiveCategory({ name: 'Tất cả', keywords: [] }); setShowMobileMenu(false); }}
                            className={`w-full text-left px-4 py-3 rounded-lg font-bold border ${activeCategory.name === 'Tất cả' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-gray-50 border-gray-100 text-gray-700'}`}
                        >
                            Tất cả sản phẩm
                        </button>
                        {CATEGORY_GROUPS.map((group, index) => (
                            <div key={index}>
                                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                                    {group.title}
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {group.items.map((item) => (
                                        <button
                                            key={item.name}
                                            onClick={() => { setActiveCategory(item); setShowMobileMenu(false); }}
                                            className={`text-left px-4 py-3 rounded-lg text-sm border transition-all ${
                                                activeCategory.name === item.name 
                                                ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold' 
                                                : 'bg-white border-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                  </div>
              </div>
          )}
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* SIDEBAR DESKTOP (Rộng 25%) */}
            <div className="hidden lg:block w-1/4 shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
                    <div className="flex items-center gap-2 font-bold text-gray-800 text-lg border-b border-gray-100 pb-3 mb-4">
                        <FaFilter className="text-blue-600"/> DANH MỤC
                    </div>
                    
                    <button 
                        onClick={() => setActiveCategory({ name: 'Tất cả', keywords: [] })}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all duration-200 mb-2 border-l-4 ${
                            activeCategory.name === 'Tất cả' 
                            ? 'bg-blue-50 text-blue-700 font-bold border-blue-600 shadow-sm' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 border-transparent'
                        }`}
                    >
                        <span>Tất cả sản phẩm</span>
                        <FaLayerGroup className="shrink-0 ml-2" />
                    </button>

                    <div className="space-y-8 mt-6">
                        {CATEGORY_GROUPS.map((group, index) => (
                            <div key={index}>
                                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3 ml-2 flex items-center border-b border-gray-50 pb-1">
                                    {index === 0 ? <FaBoxOpen className="mr-2"/> : <FaTags className="mr-2"/>} 
                                    {group.title}
                                </h4>
                                <ul className="space-y-1">
                                    {group.items.map((item) => (
                                        <li key={item.name}>
                                            <button
                                                onClick={() => setActiveCategory(item)}
                                                className={`group w-full text-left px-4 py-2.5 rounded-lg text-sm flex items-start justify-between transition-all duration-200 border-l-4 ${
                                                    activeCategory.name === item.name 
                                                    ? 'bg-blue-50 text-blue-700 font-bold border-blue-600 pl-3' 
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 border-transparent'
                                                }`}
                                            >
                                                {/* SỬA LỖI CỤT CHỮ: Dùng whitespace-normal */}
                                                <span className="whitespace-normal leading-tight pr-2 block w-full">{item.name}</span> 
                                                
                                                {activeCategory.name === item.name && (
                                                    <FaChevronRight className="text-xs shrink-0 mt-1" />
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
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
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100 gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                            <FaLayerGroup />
                        </div>
                        <h2 className="text-lg text-gray-800 flex flex-wrap items-center gap-2">
                            <span className="font-medium text-gray-500 hidden sm:inline">Đang xem:</span> 
                            <span className="font-bold text-blue-700 text-lg sm:text-xl border-b-2 border-blue-100 pb-0.5">
                                {activeCategory.name}
                            </span>
                        </h2>
                    </div>

                    <div className="flex items-center w-full sm:w-auto justify-end">
                         <span className={`text-sm font-medium px-4 py-1.5 rounded-full border ${
                             filteredProducts.length > 0 
                             ? 'bg-green-50 text-green-700 border-green-100' 
                             : 'bg-gray-100 text-gray-500 border-gray-200'
                         }`}>
                            {filteredProducts.length > 0 ? `Tìm thấy ${filteredProducts.length} mẫu` : '0 mẫu'}
                        </span>
                    </div>
                </div>

                {/* Loading / Empty / Grid (Giữ nguyên) */}
                {loading ? (
                    <div className="flex justify-center py-20 bg-white rounded-xl shadow-sm"><Loader /></div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="text-6xl mb-4 text-gray-200 mx-auto w-fit">📦</div>
                        <p className="text-gray-500 text-lg font-medium">Chưa tìm thấy mẫu nào trong mục này.</p>
                        <p className="text-sm text-gray-400 mt-2 px-4">Đang tìm từ khóa: <span className="italic">{activeCategory.keywords.join(', ')}</span></p>
                        <button 
                            onClick={() => setActiveCategory({ name: 'Tất cả', keywords: [] })} 
                            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Quay lại xem tất cả
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {filteredProducts.map((product) => (
                                <div key={product._id} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
                                    <Link to={`/product/${product._id}`} className="block relative">
                                        <div className="h-40 sm:h-56 overflow-hidden bg-gray-100 relative">
                                            <img 
                                                src={product.images && product.images.length > 0 ? product.images[0].url : ''} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                            />
                                            {product.category && (
                                                <span className="absolute bottom-0 left-0 bg-blue-600 text-white text-[9px] sm:text-[10px] px-2 sm:px-3 py-1 rounded-tr-lg uppercase font-bold tracking-wide shadow-sm truncate max-w-[80%]">
                                                    {product.category}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                    
                                    <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
                                        <div>
                                            <Link to={`/product/${product._id}`}>
                                                <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-blue-600 transition" title={product.name}>
                                                    {product.name}
                                                </h3>
                                            </Link>
                                        </div>

                                        <div className="flex items-end justify-between mt-2 pt-2 border-t border-gray-50">
                                            <div>
                                                <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold">Giá tham khảo</p>
                                                <p className="text-red-600 font-bold text-xs sm:text-sm">
                                                    {product.priceTable && product.priceTable.length > 0 
                                                        ? `${product.priceTable[0].price.toLocaleString()}đ` 
                                                        : 'Liên hệ'}
                                                </p>
                                            </div>
                                            <Link to={`/product/${product._id}`} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition transform group-hover:rotate-45 shadow-sm">
                                                <FaArrowRight className="text-xs" />
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