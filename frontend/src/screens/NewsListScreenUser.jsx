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
    <div className="bg-[#F9FAFB] min-h-screen font-sans pb-16">
      <Meta title="Tin tức & Sự kiện | In Quang Phát" description="Cập nhật tin tức mới nhất về ngành in ấn, bao bì và các hoạt động của In Quang Phát." />

      {/* 1. HEADER BANNER */}
      <div className="bg-[#006B4D] text-white py-24 text-center relative overflow-hidden">
        {/* Họa tiết trang trí nền (Optional) */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none flex items-center justify-center">
            <FaNewspaper className="text-[30rem] absolute transform rotate-12 text-[#E6F0ED]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold uppercase mb-6 tracking-tight">Tin tức & Sự kiện</h1>
            <p className="text-[#E6F0ED] text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Chia sẻ kiến thức in ấn, cập nhật công nghệ mới và các hoạt động nổi bật tại Xưởng In Quang Phát.
            </p>
        </div>
      </div>

      {/* 2. DANH SÁCH TIN TỨC */}
      <div className="container mx-auto px-4 py-16 relative z-20">
        
        {loading ? (
           <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
               <p className="text-[#6B7280] text-lg font-bold animate-pulse">Đang tải tin tức...</p>
           </div>
        ) : newsList.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
               <p className="text-[#6B7280] text-lg font-bold">Chưa có bài viết nào.</p>
           </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {newsList.map((item) => (
                    <div key={item._id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group h-full transform hover:-translate-y-2">
                        
                        {/* Ảnh Thumb */}
                        <Link to={`/news/${item._id}`} className="relative h-64 overflow-hidden block bg-[#F9FAFB]">
                             {item.image ? (
                                <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" 
                                />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                    <FaNewspaper size={80} />
                                </div>
                             )}
                             {/* Badge Ngày tháng */}
                             <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-sm text-[#006B4D] px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm flex items-center tracking-wider uppercase border border-gray-100/50">
                                 <FaCalendarAlt className="mr-2" /> 
                                 {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                             </div>
                        </Link>

                        {/* Nội dung Tóm tắt */}
                        <div className="p-8 flex flex-col flex-1">
                            <div className="flex items-center text-xs text-[#6B7280] mb-4 space-x-3 font-bold uppercase tracking-widest">
                                <span className="flex items-center"><FaUser className="mr-2 text-gray-400" /> Admin</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-[#006B4D] bg-[#E6F0ED] px-2 py-1 rounded">Tin tức</span>
                            </div>

                            <Link to={`/news/${item._id}`} className="block mb-4">
                                <h3 className="text-2xl font-extrabold text-[#111827] group-hover:text-[#006B4D] transition-colors line-clamp-2 leading-tight">
                                    {item.title}
                                </h3>
                            </Link>

                            <p className="text-[#6B7280] mb-8 line-clamp-3 leading-relaxed flex-1 text-base">
                                {item.description}
                            </p>

                            <Link 
                                to={`/news/${item._id}`} 
                                className="inline-flex items-center text-[#006B4D] font-extrabold text-sm hover:text-[#00553d] transition-colors mt-auto group/link tracking-wider"
                            >
                                ĐỌC TIẾP <FaArrowRight className="ml-2 text-sm transition-transform group-hover/link:translate-x-2" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Phân trang (Optional - Giao diện tĩnh) */}
        {!loading && newsList.length > 0 && (
             <div className="mt-16 flex justify-center">
                 <button className="px-10 py-4 bg-white text-[#006B4D] border-2 border-[#006B4D] rounded-xl font-bold hover:bg-[#006B4D] hover:text-white transition-all shadow-sm tracking-wider uppercase">
                     Xem thêm tin cũ hơn
                 </button>
             </div>
        )}

      </div>
    </div>
  );
};

export default NewsListScreenUser;