import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaArrowRight } from 'react-icons/fa';

const NewsSection = () => {
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await axios.get('/api/news');
        setNewsList(data.slice(0, 3)); // Chỉ lấy 3 bài mới nhất
      } catch (error) {
        console.error(error);
      }
    };
    fetchNews();
  }, []);

  if (newsList.length === 0) return null;

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Tiêu đề section giống inhuongphat */}
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 uppercase mb-2">Tin tức & Sự kiện</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cập nhật những kiến thức in ấn và ưu đãi mới nhất từ In Quang Phát</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsList.map((item) => (
                <div key={item._id} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition duration-300">
                    {/* Ảnh thumbnail có hiệu ứng zoom khi hover */}
                    <div className="overflow-hidden h-48 relative">
                        <Link to={`/news/${item._id}`}>
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" 
                            />
                        </Link>
                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-3 py-1 font-bold rounded-bl-lg">
                            MỚI
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="flex items-center text-xs text-gray-400 mb-3">
                            <FaCalendarAlt className="mr-1" />
                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition">
                            <Link to={`/news/${item._id}`}>{item.title}</Link>
                        </h3>
                        
                        <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                            {item.description}
                        </p>
                        
                        <Link to={`/news/${item._id}`} className="inline-flex items-center text-blue-600 font-bold text-sm hover:underline">
                            XEM CHI TIẾT <FaArrowRight className="ml-1 text-xs" />
                        </Link>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default NewsSection;