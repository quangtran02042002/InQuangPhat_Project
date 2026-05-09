import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    FaCalendarAlt, FaUser, FaEye, FaArrowRight, FaShareAlt,
    FaHome, FaNewspaper, FaPhoneAlt
} from 'react-icons/fa';
import Meta from '../components/Meta';

const NewsDetailScreen = () => {
    const { id } = useParams();
    const [news, setNews] = useState(null);
    const [recentNews, setRecentNews] = useState([]); // Tin mới nhất cho Sidebar
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Lấy chi tiết bài viết hiện tại
                const { data: currentNews } = await axios.get(`/api/news/${id}`);
                setNews(currentNews);

                // 2. Lấy danh sách tin tức để làm Sidebar "Tin mới nhất"
                // (Giả sử API lấy list là /api/news)
                const { data: allNews } = await axios.get('/api/news');

                // Lọc bỏ bài hiện tại và lấy 5 bài mới nhất
                const related = allNews.news ? allNews.news : allNews; // Tùy cấu trúc trả về của backend
                const filtered = Array.isArray(related)
                    ? related.filter(item => item._id !== id).slice(0, 5)
                    : [];

                setRecentNews(filtered);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi tải tin tức:", error);
                setLoading(false);
            }
        };

        fetchData();
        window.scrollTo(0, 0); // Cuộn lên đầu trang
    }, [id]);

    if (loading) return <div className="h-screen flex justify-center items-center text-gray-500">Đang tải bài viết...</div>;
    if (!news) return <div className="h-screen flex justify-center items-center text-red-500">Bài viết không tồn tại.</div>;

    return (
        <div className="bg-[#F9FAFB] min-h-screen font-sans text-[#111827] pb-16">
            <Meta title={`${news.title} | Tin tức In Quang Phát`} description={news.description} />

            {/* 1. BREADCRUMB (Thanh điều hướng) */}
            <div className="bg-white border-b border-gray-100 py-4 text-sm">
                <div className="container mx-auto px-4 max-w-6xl flex items-center text-[#6B7280]">
                    <Link to="/" className="hover:text-[#006B4D] font-bold flex items-center transition-colors"><FaHome className="mr-2" /> Trang chủ</Link>
                    <span className="mx-3 opacity-50">/</span>
                    <Link to="/news" className="hover:text-[#006B4D] font-bold transition-colors">Tin tức & Sự kiện</Link>
                    <span className="mx-3 opacity-50">/</span>
                    <span className="text-[#111827] font-bold truncate max-w-xs">{news.title}</span>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* === CỘT TRÁI: NỘI DUNG BÀI VIẾT (Chiếm 8 phần) === */}
                    <div className="lg:col-span-8">

                        {/* Tiêu đề chính */}
                        <h1 className="text-3xl md:text-5xl font-extrabold text-[#111827] tracking-tight leading-tight mb-6">
                            {news.title}
                        </h1>

                        {/* Meta Data (Ngày, Tác giả, View) */}
                        <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-6 mb-8 gap-4">
                            <div className="flex items-center text-sm text-[#6B7280] space-x-6 font-medium">
                                <span className="flex items-center"><FaCalendarAlt className="mr-2 text-[#006B4D]" /> {new Date(news.createdAt).toLocaleDateString('vi-VN')}</span>
                                <span className="flex items-center"><FaUser className="mr-2 text-[#006B4D]" /> Admin</span>
                                <span className="flex items-center"><FaEye className="mr-2 text-[#006B4D]" /> {news.views || 0} lượt xem</span>
                            </div>

                            {/* Nút chia sẻ giả lập */}
                            <button className="flex items-center text-[#6B7280] hover:text-[#006B4D] text-sm font-bold transition-colors">
                                <FaShareAlt className="mr-2" /> Chia sẻ
                            </button>
                        </div>

                        {/* Sapo (Mô tả ngắn - In đậm làm dẫn nhập) */}
                        {news.description && (
                            <div className="text-lg md:text-xl font-bold text-[#111827] leading-relaxed mb-10 italic border-l-4 border-[#006B4D] pl-6 bg-white p-6 rounded-r-2xl shadow-sm border-r border-y border-gray-100">
                                {news.description}
                            </div>
                        )}

                        {/* NỘI DUNG CHÍNH (Sử dụng Tailwind Typography) */}
                        <article className="prose prose-lg prose-[#006B4D] max-w-none text-[#111827] bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100 relative break-words overflow-hidden">
                            {/* Render HTML từ ReactQuill */}
                            <div dangerouslySetInnerHTML={{ __html: news.content }}></div>
                        </article>

                        {/* Tags hoặc Footer bài viết (Nếu có) */}
                        <div className="mt-12 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500 italic">
                                Bài viết thuộc bản quyền của <strong>In Quang Phát</strong>. Vui lòng ghi rõ nguồn khi phát lại.
                            </p>
                        </div>
                    </div>

                    {/* === CỘT PHẢI: SIDEBAR (Chiếm 4 phần) === */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Widget 1: Hỗ trợ trực tuyến */}
                        <div className="bg-[#006B4D] p-8 rounded-2xl text-white shadow-xl text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none"></div>

                            <h3 className="text-lg font-extrabold mb-3 uppercase tracking-widest text-[#E6F0ED] relative z-10">Hỗ trợ khách hàng</h3>
                            <p className="text-white/90 text-sm mb-8 font-medium relative z-10">Bạn cần tư vấn in ấn hoặc báo giá nhanh?</p>

                            <a href="tel:0903597686" className="block bg-white text-[#006B4D] font-extrabold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-[#F9FAFB] transition-all transform hover:-translate-y-1 mb-4 relative z-10">
                                <FaPhoneAlt className="inline mr-3 animate-pulse text-lg" /> 0903.597.686
                            </a>
                            <p className="text-xs text-[#E6F0ED] font-bold tracking-wider relative z-10 uppercase">Phục vụ 24/7 (Cả T7 & CN)</p>
                        </div>

                        {/* Widget 2: Bài viết mới nhất */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
                            <h3 className="text-lg font-extrabold text-[#111827] mb-6 border-b border-gray-100 pb-4 flex items-center uppercase tracking-wider">
                                <FaNewspaper className="mr-3 text-[#006B4D] text-xl" /> TIN TỨC MỚI
                            </h3>

                            <div className="flex flex-col gap-6">
                                {recentNews.length === 0 ? (
                                    <p className="text-[#6B7280] text-sm">Chưa có tin tức khác.</p>
                                ) : (
                                    recentNews.map((item) => (
                                        <Link key={item._id} to={`/news/${item._id}`} className="group flex gap-4 items-center bg-white p-2 rounded-xl border border-transparent hover:border-gray-100 hover:shadow-sm transition-all duration-300">
                                            {/* Ảnh thumbnail */}
                                            <div className="w-24 h-20 flex-shrink-0 bg-[#F9FAFB] rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                                ) : (
                                                    <FaNewspaper className="text-gray-300 text-3xl" />
                                                )}
                                            </div>

                                            {/* Tiêu đề & Ngày */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-[#111827] group-hover:text-[#006B4D] transition-colors line-clamp-2 leading-snug mb-2">
                                                    {item.title}
                                                </h4>
                                                <span className="text-xs text-[#6B7280] font-medium tracking-wider uppercase">
                                                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                                <Link to="/news" className="text-sm text-[#006B4D] font-bold hover:underline inline-flex items-center transition-all">
                                    Xem tất cả tin tức <FaArrowRight className="ml-2" />
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsDetailScreen;