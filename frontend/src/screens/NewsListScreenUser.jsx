import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaUser, FaArrowRight, FaNewspaper } from 'react-icons/fa';
import Meta from '../components/Meta';

const NewsListScreenUser = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await axios.get('/api/news');
        // Xử lý dữ liệu tùy theo API trả về
        const list = Array.isArray(data) ? data : (data.news || []); 
        setNewsList(list);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchNews();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-16">
      <Meta title="Tin tức & Sự kiện | In Quang Phát" description="Cập nhật tin tức mới nhất về ngành in ấn, bao bì và các hoạt động của In Quang Phát." />

      {/* 1. HEADER BANNER */}
      <div className="bg-blue-900 text-white py-20 text-center relative overflow-hidden">
        {/* Họa tiết trang trí nền (Optional) */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <FaNewspaper className="text-[20rem] absolute -bottom-10 -right-10 transform rotate-12" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold uppercase mb-4 tracking-wide">Tin tức & Sự kiện</h1>
            <p className="text-blue-200 text-lg max-w-2xl mx-auto font-medium">
              Chia sẻ kiến thức in ấn, cập nhật công nghệ mới và các hoạt động nổi bật tại Xưởng In Quang Phát.
            </p>
        </div>
      </div>

      {/* 2. DANH SÁCH TIN TỨC */}
      {/* --- SỬA LỖI Ở ĐÂY: Xóa bỏ '-mt-10' và thay bằng 'py-12' --- */}
      <div className="container mx-auto px-4 py-12 relative z-20">
        
        {loading ? (
           <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
               <p className="text-gray-500 text-lg animate-pulse">Đang tải tin tức...</p>
           </div>
        ) : newsList.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
               <p className="text-gray-500 text-lg">Chưa có bài viết nào.</p>
           </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsList.map((item) => (
                    <div key={item._id} className="bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group h-full transform hover:-translate-y-1">
                        
                        {/* Ảnh Thumb */}
                        <Link to={`/news/${item._id}`} className="relative h-56 overflow-hidden block bg-gray-100">
                             {item.image ? (
                                <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" 
                                />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <FaNewspaper size={64} />
                                </div>
                             )}
                             {/* Badge Ngày tháng */}
                             <div className="absolute top-4 left-4 bg-white/95 backdrop-blur text-blue-800 px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center">
                                 <FaCalendarAlt className="mr-2" /> 
                                 {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                             </div>
                        </Link>

                        {/* Nội dung Tóm tắt */}
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-center text-xs text-gray-500 mb-3 space-x-2 font-medium">
                                <span className="flex items-center"><FaUser className="mr-1" /> Admin</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-blue-600">Tin tức</span>
                            </div>

                            <Link to={`/news/${item._id}`} className="block mb-3">
                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
                                    {item.title}
                                </h3>
                            </Link>

                            <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                                {item.description}
                            </p>

                            <Link 
                                to={`/news/${item._id}`} 
                                className="inline-flex items-center text-blue-600 font-bold text-sm hover:underline mt-auto group/link"
                            >
                                ĐỌC TIẾP <FaArrowRight className="ml-2 text-xs transition-transform group-hover/link:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Phân trang (Optional - Giao diện tĩnh) */}
        {!loading && newsList.length > 0 && (
             <div className="mt-12 flex justify-center">
                 <button className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-full font-bold hover:bg-blue-50 transition shadow-sm">
                     Xem thêm tin cũ hơn
                 </button>
             </div>
        )}

      </div>
    </div>
  );
};

export default NewsListScreenUser;