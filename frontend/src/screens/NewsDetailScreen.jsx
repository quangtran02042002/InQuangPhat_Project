import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaUser, FaArrowLeft, FaEye } from 'react-icons/fa';
import Meta from '../components/Meta';

const NewsDetailScreen = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await axios.get(`/api/news/${id}`);
        setNews(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (!news) return <div className="text-center py-20">Bài viết không tồn tại.</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <Meta title={`${news.title} | Tin tức In Quang Phát`} description={news.description} />
      
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 font-medium">
            <FaArrowLeft className="mr-2" /> Quay lại trang chủ
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">{news.title}</h1>
            
            <div className="flex items-center text-sm text-gray-500 mb-8 border-b border-gray-100 pb-4 space-x-6">
                <span className="flex items-center"><FaCalendarAlt className="mr-2" /> {new Date(news.createdAt).toLocaleDateString('vi-VN')}</span>
                <span className="flex items-center"><FaUser className="mr-2" /> Admin</span>
                <span className="flex items-center"><FaEye className="mr-2" /> {news.views} lượt xem</span>
            </div>

            {/* Nội dung bài viết (HTML) */}
            <div className="ql-editor-display text-gray-800 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: news.content }}></div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailScreen;