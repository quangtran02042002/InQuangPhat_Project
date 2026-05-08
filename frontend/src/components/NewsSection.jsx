import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaArrowRight, FaNewspaper } from 'react-icons/fa';

const NewsSection = () => {
    const [newsList, setNewsList] = useState([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const { data } = await axios.get('/api/news');
                // Xử lý dữ liệu trả về (tùy API trả về mảng hay object {news: []})
                const list = Array.isArray(data) ? data : (data.news || []);
                setNewsList(list.slice(0, 3)); // Chỉ lấy 3 bài mới nhất
            } catch (error) {
                console.error(error);
            }
        };
        fetchNews();
    }, []);

    if (newsList.length === 0) return null;

    return (
        <div className="py-16 bg-white border-t border-gray-100">
            <div className="container mx-auto px-4">

                {/* 1. TIÊU ĐỀ SECTION */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 uppercase mb-3">Tin tức & Sự kiện</h2>
                    <div className="w-24 h-1 bg-[#006B4D] mx-auto mb-4 rounded-full"></div>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Cập nhật những kiến thức in ấn, công nghệ mới và các chương trình ưu đãi hấp dẫn từ In Quang Phát.
                    </p>
                </div>

                {/* 2. DANH SÁCH BÀI VIẾT (GRID) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {newsList.map((item) => (
                        <div key={item._id} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition duration-300 flex flex-col h-full">
                            {/* Ảnh thumbnail */}
                            <div className="overflow-hidden h-52 relative">
                                <Link to={`/news/${item._id}`}>
                                    <img
                                        src={item.image || 'https://via.placeholder.com/400x300'}
                                        alt={item.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                                    />
                                </Link>
                                <div className="absolute top-0 right-0 bg-[#006B4D] text-white text-xs px-3 py-1 font-bold rounded-bl-lg shadow-sm">
                                    MỚI
                                </div>
                            </div>

                            {/* Nội dung tóm tắt */}
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-center text-xs text-gray-400 mb-3 font-medium">
                                    <FaCalendarAlt className="mr-1 text-[#006B4D]" />
                                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                </div>

                                <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-[#006B4D] transition leading-snug">
                                    <Link to={`/news/${item._id}`}>{item.title}</Link>
                                </h3>

                                <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                                    {item.description}
                                </p>

                                <Link to={`/news/${item._id}`} className="inline-flex items-center text-[#006B4D] font-bold text-sm hover:underline mt-auto">
                                    XEM CHI TIẾT <FaArrowRight className="ml-1 text-xs transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. NÚT XEM TẤT CẢ (ĐẶT Ở DƯỚI CÙNG) */}
                <div className="mt-12 flex justify-center">
                    <Link
                        to="/news"
                        className="inline-flex items-center bg-white text-[#006B4D] border-2 border-[#006B4D] px-8 py-3 rounded-full font-bold text-lg shadow-sm hover:bg-[#E6F0ED] hover:shadow-md transition transform hover:-translate-y-1"
                    >
                        <FaNewspaper className="mr-2" /> XEM TẤT CẢ TIN TỨC
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default NewsSection;