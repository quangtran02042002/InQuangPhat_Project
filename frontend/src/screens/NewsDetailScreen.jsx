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
    <div className="bg-white min-h-screen font-sans text-gray-800 pb-16">
      <Meta title={`${news.title} | Tin tức In Quang Phát`} description={news.description} />

      {/* 1. BREADCRUMB (Thanh điều hướng) */}
      <div className="bg-gray-50 border-b border-gray-100 py-3 text-sm">
        <div className="container mx-auto px-4 max-w-6xl flex items-center text-gray-500">
            <Link to="/" className="hover:text-blue-600 flex items-center"><FaHome className="mr-1" /> Trang chủ</Link>
            <span className="mx-2">/</span>
            <Link to="/news" className="hover:text-blue-600">Tin tức & Sự kiện</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium truncate max-w-xs">{news.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* === CỘT TRÁI: NỘI DUNG BÀI VIẾT (Chiếm 8 phần) === */}
            <div className="lg:col-span-8">
                
                {/* Tiêu đề chính */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                    {news.title}
                </h1>

                {/* Meta Data (Ngày, Tác giả, View) */}
                <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-4 mb-6 gap-4">
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center"><FaCalendarAlt className="mr-2 text-blue-500" /> {new Date(news.createdAt).toLocaleDateString('vi-VN')}</span>
                        <span className="flex items-center"><FaUser className="mr-2 text-blue-500" /> Admin</span>
                        <span className="flex items-center"><FaEye className="mr-2 text-blue-500" /> {news.views || 0} lượt xem</span>
                    </div>
                    
                    {/* Nút chia sẻ giả lập */}
                    <button className="flex items-center text-gray-600 hover:text-blue-600 text-sm font-medium transition">
                        <FaShareAlt className="mr-2" /> Chia sẻ
                    </button>
                </div>

                {/* Sapo (Mô tả ngắn - In đậm làm dẫn nhập) */}
                {news.description && (
                    <div className="text-lg md:text-xl font-semibold text-gray-700 leading-relaxed mb-8 italic border-l-4 border-blue-600 pl-4 bg-gray-50 py-3 rounded-r">
                        {news.description}
                    </div>
                )}

                {/* NỘI DUNG CHÍNH (Sử dụng Tailwind Typography) */}
                <article className="prose prose-lg prose-blue max-w-none text-gray-800">
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
                <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-6 rounded-xl text-white shadow-lg text-center">
                    <h3 className="text-lg font-bold mb-2 uppercase tracking-wide">Hỗ trợ khách hàng</h3>
                    <p className="text-blue-100 text-sm mb-6">Bạn cần tư vấn in ấn hoặc báo giá nhanh?</p>
                    
                    <a href="tel:0935110639" className="block bg-white text-blue-800 font-bold py-3 rounded-full shadow hover:bg-gray-100 transition mb-3">
                        <FaPhoneAlt className="inline mr-2 animate-pulse" /> 0935.110.639
                    </a>
                    <p className="text-xs text-blue-200">Phục vụ 24/7 (Cả T7 & CN)</p>
                </div>

                {/* Widget 2: Bài viết mới nhất */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                    <h3 className="text-lg font-bold text-gray-800 mb-5 border-b pb-2 flex items-center">
                        <FaNewspaper className="mr-2 text-blue-600" /> TIN TỨC MỚI
                    </h3>
                    
                    <div className="flex flex-col gap-5">
                        {recentNews.length === 0 ? (
                            <p className="text-gray-500 text-sm">Chưa có tin tức khác.</p>
                        ) : (
                            recentNews.map((item) => (
                                <Link key={item._id} to={`/news/${item._id}`} className="group flex gap-3 items-start">
                                    {/* Ảnh thumbnail (Nếu bài viết có ảnh cover - giả sử field là image) */}
                                    {/* Nếu không có ảnh thì hiển thị icon mặc định */}
                                    <div className="w-20 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                                        {item.image ? (
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                                        ) : (
                                            <FaNewspaper className="text-gray-300 text-2xl" />
                                        )}
                                    </div>
                                    
                                    {/* Tiêu đề & Ngày */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 line-clamp-2 leading-snug transition">
                                            {item.title}
                                        </h4>
                                        <span className="text-xs text-gray-400 mt-1 block">
                                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t text-center">
                        <Link to="/news" className="text-sm text-blue-600 font-bold hover:underline inline-flex items-center">
                            Xem tất cả tin tức <FaArrowRight className="ml-1" />
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