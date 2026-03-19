import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, FaPhoneAlt, FaCommentDots, FaCheckCircle, 
  FaHome, FaTag, FaBoxOpen, FaInfoCircle, FaArrowRight, FaPrint, FaPercent 
} from 'react-icons/fa';
import Meta from '../components/Meta';

const ProductScreen = () => {
  const { id } = useParams();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); // Sản phẩm liên quan
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(''); // Ảnh đang chọn

  const CONTACT_INFO = {
    phone: "0935.110.639",
    zaloLink: "https://zalo.me/0935110639" 
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Lấy chi tiết sản phẩm hiện tại
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        
        // Set ảnh mặc định
        if (data.images && data.images.length > 0) {
            // Xử lý trường hợp ảnh là object {url: '...'} hoặc chỉ là string URL
            setActiveImage(typeof data.images[0] === 'string' ? data.images[0] : data.images[0].url);
        } else {
            setActiveImage('https://via.placeholder.com/500'); 
        }

        // 2. Lấy danh sách sản phẩm để lọc ra "Sản phẩm liên quan"
        const { data: allProducts } = await axios.get('/api/products');
        
        // Lọc sản phẩm cùng danh mục (trừ chính nó)
        const related = allProducts.products
            .filter(p => p.category === data.category && p._id !== id)
            .slice(0, 5);
            
        setRelatedProducts(related);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="h-screen flex justify-center items-center text-blue-600 font-medium">Đang tải dữ liệu mẫu in...</div>;
  if (!product) return <div className="h-screen flex justify-center items-center text-red-500">Không tìm thấy mẫu sản phẩm.</div>;

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800 pb-16">
      
      {/* --- SEO --- */}
      <Meta 
        title={`${product.name} | In Quang Phát`} 
        description={product.description ? product.description.replace(/<[^>]+>/g, '').substring(0, 160) : product.name}
      />

      {/* 1. BREADCRUMB (Thanh điều hướng) */}
      <div className="bg-gray-50 border-b border-gray-100 py-3 text-sm">
        <div className="container mx-auto px-4 max-w-6xl flex items-center text-gray-500">
            <Link to="/" className="hover:text-blue-600 flex items-center"><FaHome className="mr-1" /> Trang chủ</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-blue-600">Sản phẩm mẫu</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* === CỘT TRÁI: NỘI DUNG CHÍNH (Chiếm 8 phần) === */}
            <div className="lg:col-span-8">
                
                {/* Header Bài viết */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                    {product.name}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
                    <span className="flex items-center text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full">
                        <FaTag className="mr-2" /> {product.category}
                    </span>
                    <span className="hidden sm:inline">|</span>
                    <span className="font-mono text-gray-600">Mã SP: #{product._id.slice(-6).toUpperCase()}</span>
                    <span className="hidden sm:inline">|</span>
                    <span className="flex items-center text-green-600 font-medium">
                        <FaCheckCircle className="mr-1" /> Sẵn sàng sản xuất
                    </span>
                </div>

                {/* KHU VỰC GALLERY (Feature Image) */}
                <div className="mb-8">
                    {/* Ảnh lớn */}
                    <div className="w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group">
                        <img 
                            src={activeImage} 
                            alt={product.name} 
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-500" 
                        />
                        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-1 rounded backdrop-blur-sm">
                            Hình ảnh thực tế tại xưởng
                        </div>
                    </div>
                    
                    {/* Thumbnails */}
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                            {product.images.map((img, index) => {
                                const imgUrl = typeof img === 'string' ? img : img.url;
                                return (
                                    <button 
                                        key={index}
                                        onClick={() => setActiveImage(imgUrl)}
                                        className={`relative w-20 h-20 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${activeImage === imgUrl ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-400'}`}
                                    >
                                        <img src={imgUrl} alt="thumb" className="w-full h-full object-cover" />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ======================================================== */}
                {/* BẢNG TỈ LỆ CHIẾT KHẤU (%) - ĐÃ NÂNG CẤP */}
                {/* ======================================================== */}
                {product.priceTable && product.priceTable.length > 0 && (
                    <div className="mb-8 bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                        <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center uppercase">
                            <span className="bg-blue-600 text-white p-1.5 rounded mr-2 text-sm">
                                <FaPercent />
                            </span> 
                            Bảng Chính Sách Giá & Chiết Khấu
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 italic">
                            * Chính sách giá linh hoạt dựa trên số lượng đặt in. Mức chiết khấu (%) thể hiện mức độ giảm giá so với đơn hàng số lượng ít. Quý khách vui lòng liên hệ để nhận báo giá chi tiết bằng VNĐ.
                        </p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                                <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-xs">
                                    <tr>
                                        <th className="px-5 py-3 border-b">Số lượng đặt in (Từ)</th>
                                        <th className="px-5 py-3 border-b text-center">Tỉ lệ giá</th>
                                        <th className="px-5 py-3 border-b text-right">Lợi ích cho bạn</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-800">
                                    {product.priceTable.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/50 transition">
                                            <td className="px-5 py-3 font-bold text-base">
                                                {item.minQuantity.toLocaleString()} <span className="text-xs font-normal text-gray-500 uppercase">Sản phẩm</span>
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <span className={`font-bold px-3 py-1 rounded text-sm ${item.price >= 100 ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                                                    {item.price}%
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right font-medium">
                                                {item.price >= 100 
                                                    ? <span className="text-gray-400">Giá cơ sở</span> 
                                                    : <span className="text-red-500">Giảm {100 - item.price}% chi phí</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {/* ======================================================== */}

                {/* NỘI DUNG CHI TIẾT (Rich Text) */}
                <div className="mb-6 border-l-4 border-blue-600 pl-4 mt-8">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        Thông số kỹ thuật & Quy cách
                    </h3>
                </div>

                {/* Sử dụng class 'prose' của Tailwind Typography để format HTML */}
                {product.description && product.description !== '<p><br></p>' ? (
                    <article className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed bg-white">
                        <div dangerouslySetInnerHTML={{ __html: product.description }}></div>
                    </article>
                ) : (
                    <p className="text-gray-500 italic">Nội dung chi tiết đang được cập nhật...</p>
                )}

                {/* Footer Bài viết: Nút CTA */}
                <div className="mt-12 border-t border-gray-200 pt-8 text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Bạn quan tâm đến mẫu sản phẩm này?</h3>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={`tel:${CONTACT_INFO.phone}`} className="flex items-center justify-center bg-red-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-red-700 transition transform hover:-translate-y-1">
                            <FaPhoneAlt className="mr-2 animate-pulse" /> GỌI BÁO GIÁ NGAY
                        </a>
                        <a href={CONTACT_INFO.zaloLink} target="_blank" rel="noreferrer" className="flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1">
                            <FaCommentDots className="mr-2" /> CHAT ZALO HỖ TRỢ
                        </a>
                    </div>
                </div>

            </div>

            {/* === CỘT PHẢI: SIDEBAR (Chiếm 4 phần) === */}
            <div className="lg:col-span-4 space-y-8">
                
                {/* Widget 1: Hỗ trợ (Sticky) */}
                <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-md sticky top-24">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 border-b pb-2 uppercase text-center text-blue-800">
                        Hỗ trợ khách hàng
                    </h3>
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl mx-auto mb-3">
                            <FaPhoneAlt />
                        </div>
                        <p className="text-gray-600 text-sm mb-1">Hotline tư vấn 24/7</p>
                        <p className="text-2xl font-extrabold text-red-600">{CONTACT_INFO.phone}</p>
                        <p className="text-xs text-gray-400 mt-2">Miễn phí thiết kế & Giao hàng nội thành</p>
                    </div>
                    <a href={CONTACT_INFO.zaloLink} className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
                        Gửi yêu cầu qua Zalo
                    </a>
                </div>

                {/* Widget 2: Sản phẩm liên quan */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-5 border-b pb-2 flex items-center uppercase">
                        <FaBoxOpen className="mr-2 text-orange-500" /> Cùng danh mục
                    </h3>
                    
                    <div className="flex flex-col gap-4">
                        {relatedProducts.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">Đang cập nhật thêm mẫu...</p>
                        ) : (
                            relatedProducts.map((item) => (
                                <Link key={item._id} to={`/product/${item._id}`} className="group flex gap-3 items-start hover:bg-gray-50 p-2 rounded-lg transition">
                                    {/* Ảnh Thumb */}
                                    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                        <img 
                                            src={item.images && item.images[0] ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url) : 'https://via.placeholder.com/150'} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300" 
                                        />
                                    </div>
                                    
                                    {/* Info */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 line-clamp-2 leading-snug">
                                            {item.name}
                                        </h4>
                                        <div className="flex items-center mt-1">
                                            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t text-center">
                        <Link to="/products" className="text-sm text-blue-600 font-bold hover:underline inline-flex items-center">
                            Xem tất cả mẫu <FaArrowRight className="ml-1" />
                        </Link>
                    </div>
                </div>

            </div>

        </div>
      </div>
    </div>
  );
};

export default ProductScreen;