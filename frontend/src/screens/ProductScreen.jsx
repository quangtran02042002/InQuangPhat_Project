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
        phone: "0903597686",
        zaloLink: "https://zalo.me/0903597686"
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
        <div className="bg-[#F9FAFB] min-h-screen font-sans text-[#111827] pb-16">

            {/* --- SEO --- */}
            <Meta
                title={`${product.name} | In Quang Phát`}
                description={product.description ? product.description.replace(/<[^>]+>/g, '').substring(0, 160) : product.name}
            />

            {/* 1. BREADCRUMB (Thanh điều hướng) */}
            <div className="bg-white border-b border-gray-100 py-4 text-sm">
                <div className="container mx-auto px-4 max-w-6xl flex items-center text-[#6B7280]">
                    <Link to="/" className="hover:text-[#006B4D] font-bold flex items-center transition-colors"><FaHome className="mr-2" /> Trang chủ</Link>
                    <span className="mx-3 opacity-50">/</span>
                    <Link to="/products" className="hover:text-[#006B4D] font-bold transition-colors">Sản phẩm mẫu</Link>
                    <span className="mx-3 opacity-50">/</span>
                    <span className="text-[#111827] font-bold truncate max-w-xs">{product.name}</span>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* === CỘT TRÁI: NỘI DUNG CHÍNH (Chiếm 8 phần) === */}
                    <div className="lg:col-span-8">

                        {/* Header Bài viết */}
                        <h1 className="text-3xl md:text-5xl font-extrabold text-[#111827] tracking-tight leading-tight mb-6">
                            {product.name}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280] mb-8 border-b border-gray-100 pb-6">
                            <span className="flex items-center text-[#006B4D] font-extrabold bg-[#E6F0ED] px-3 py-1.5 rounded-md uppercase tracking-widest text-xs border border-[#006B4D]/10">
                                <FaTag className="mr-2" /> {product.category}
                            </span>
                            <span className="hidden sm:inline">|</span>
                            <span className="font-mono text-[#6B7280]">Mã SP: #{product._id.slice(-6).toUpperCase()}</span>
                            <span className="hidden sm:inline">|</span>
                            <span className="flex items-center text-green-600 font-bold">
                                <FaCheckCircle className="mr-2" /> Sẵn sàng sản xuất
                            </span>
                        </div>

                        {/* KHU VỰC GALLERY (Feature Image) */}
                        <div className="mb-10">
                            {/* Ảnh lớn */}
                            <div className="w-full aspect-video bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group p-2">
                                <img
                                    src={activeImage}
                                    alt={product.name}
                                    className="w-full h-full object-contain group-hover:scale-105 transition duration-500 rounded-xl"
                                />
                                <div className="absolute bottom-6 left-6 bg-black/80 text-white text-xs px-4 py-2 font-bold uppercase tracking-wider rounded backdrop-blur-sm">
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
                                                className={`relative w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${activeImage === imgUrl ? 'border-[#006B4D] ring-4 ring-[#006B4D]/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
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
                            <div className="mb-10 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                                <h3 className="text-xl font-extrabold text-[#111827] mb-4 flex items-center uppercase tracking-wide">
                                    <span className="bg-[#E6F0ED] text-[#006B4D] p-2 rounded-lg mr-3 text-base">
                                        <FaPercent />
                                    </span>
                                    Chính Sách Giá & Chiết Khấu
                                </h3>
                                <p className="text-sm text-[#6B7280] mb-6 italic">
                                    * Chính sách giá linh hoạt dựa trên số lượng đặt in. Mức chiết khấu (%) thể hiện mức độ giảm giá so với đơn hàng số lượng ít. Quý khách vui lòng liên hệ để nhận báo giá chi tiết bằng VNĐ.
                                </p>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-left bg-white rounded-xl overflow-hidden border border-gray-100">
                                        <thead className="bg-[#F9FAFB] text-[#6B7280] uppercase font-bold text-xs tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4 border-b border-gray-100">Số lượng đặt in (Từ)</th>
                                                <th className="px-6 py-4 border-b border-gray-100 text-center">Tỉ lệ giá</th>
                                                <th className="px-6 py-4 border-b border-gray-100 text-right">Lợi ích cho bạn</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-[#111827]">
                                            {product.priceTable.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                                                    <td className="px-6 py-4 font-bold text-base">
                                                        {item.minQuantity.toLocaleString()} <span className="text-xs font-normal text-[#6B7280] uppercase ml-1">Sản phẩm</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`font-bold px-4 py-1.5 rounded-full text-xs tracking-wider border ${item.price >= 100 ? 'bg-gray-50 text-[#6B7280] border-gray-200' : 'bg-[#E6F0ED] text-[#006B4D] border-[#006B4D]/20'}`}>
                                                            {item.price}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold">
                                                        {item.price >= 100
                                                            ? <span className="text-gray-400 font-medium">Giá cơ sở</span>
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
                        <div className="mb-6 border-l-4 border-[#006B4D] pl-6 mt-10">
                            <h3 className="text-xl font-extrabold text-[#111827] flex items-center uppercase tracking-wide">
                                Thông số kỹ thuật & Quy cách
                            </h3>
                        </div>

                        {/* Sử dụng class 'prose' của Tailwind Typography để format HTML */}
                        {product.description && product.description !== '<p><br></p>' ? (
                            <article className="prose prose-lg prose-[#006B4D] max-w-none text-[#111827] leading-relaxed bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <div dangerouslySetInnerHTML={{ __html: product.description }}></div>
                            </article>
                        ) : (
                            <p className="text-[#6B7280] italic">Nội dung chi tiết đang được cập nhật...</p>
                        )}

                        {/* Footer Bài viết: Nút CTA */}
                        <div className="mt-12 bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <h3 className="text-2xl font-extrabold text-[#111827] mb-6">Bạn quan tâm đến mẫu sản phẩm này?</h3>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a href={`tel:${CONTACT_INFO.phone}`} className="flex items-center justify-center bg-red-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700 transition">
                                    <FaPhoneAlt className="mr-3 animate-pulse" /> GỌI BÁO GIÁ NGAY
                                </a>
                                <a href={CONTACT_INFO.zaloLink} target="_blank" rel="noreferrer" className="flex items-center justify-center bg-[#006B4D] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#00553d] transition">
                                    <FaCommentDots className="mr-3" /> CHAT ZALO HỖ TRỢ
                                </a>
                            </div>
                        </div>

                    </div>

                    {/* === CỘT PHẢI: SIDEBAR (Chiếm 4 phần) === */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Widget 1: Hỗ trợ (Sticky) */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
                            <h3 className="text-lg font-extrabold text-[#111827] mb-4 uppercase tracking-wider text-center">
                                Hỗ trợ khách hàng
                            </h3>
                            <div className="text-center py-6 bg-[#F9FAFB] rounded-xl mb-6">
                                <div className="w-16 h-16 bg-[#E6F0ED] rounded-full flex items-center justify-center text-[#006B4D] text-2xl mx-auto mb-4">
                                    <FaPhoneAlt />
                                </div>
                                <p className="text-[#6B7280] text-sm mb-2 font-bold uppercase tracking-wider">Hotline tư vấn 24/7</p>
                                <p className="text-3xl font-extrabold text-red-600 tracking-tight">{CONTACT_INFO.phone}</p>
                                <p className="text-xs text-[#6B7280] mt-3 font-medium">Miễn phí thiết kế & Giao hàng nội thành</p>
                            </div>
                            <a href={CONTACT_INFO.zaloLink} className="block w-full text-center bg-[#006B4D] text-white py-4 rounded-xl font-bold hover:bg-[#00553d] transition shadow-sm">
                                Gửi yêu cầu qua Zalo
                            </a>
                        </div>

                        {/* Widget 2: Sản phẩm liên quan */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-extrabold text-[#111827] mb-6 uppercase tracking-wider flex items-center">
                                <FaBoxOpen className="mr-3 text-[#006B4D] text-xl" /> Cùng danh mục
                            </h3>

                            <div className="flex flex-col gap-6">
                                {relatedProducts.length === 0 ? (
                                    <p className="text-[#6B7280] text-sm italic">Đang cập nhật thêm mẫu...</p>
                                ) : (
                                    relatedProducts.map((item) => (
                                        <Link key={item._id} to={`/product/${item._id}`} className="group flex gap-4 items-center bg-white p-2 rounded-xl border border-transparent hover:border-gray-100 hover:shadow-sm transition-all duration-300">
                                            {/* Ảnh Thumb */}
                                            <div className="w-20 h-20 flex-shrink-0 bg-[#F9FAFB] rounded-lg overflow-hidden border border-gray-100">
                                                <img
                                                    src={item.images && item.images[0] ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url) : 'https://via.placeholder.com/150'}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-[#111827] group-hover:text-[#006B4D] transition-colors line-clamp-2 leading-snug mb-1">
                                                    {item.name}
                                                </h4>
                                                <div className="flex items-center">
                                                    <span className="text-[10px] bg-[#E6F0ED] text-[#006B4D] px-2 py-1 rounded border border-[#006B4D]/10 font-bold uppercase tracking-wider">
                                                        {item.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                                <Link to="/products" className="text-sm text-[#006B4D] font-bold hover:underline inline-flex items-center transition-all">
                                    Xem tất cả mẫu <FaArrowRight className="ml-2" />
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