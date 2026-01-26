import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaNewspaper, FaEye, FaSearch, FaTimes, FaCalendarAlt, FaImage } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';
import AdminHeader from '../../components/AdminHeader';
const NewsListScreen = () => {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE TÌM KIẾM ---
  const [keyword, setKeyword] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
        fetchNews();
    } else {
        navigate('/login');
    }
  }, [navigate]);

  const fetchNews = async () => {
    try {
      const { data } = await axios.get('/api/news');
      setNewsList(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Lỗi tải tin tức');
    }
  };

  const deleteHandler = async () => {
    try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/news/${deleteId}`, config);
        setNewsList(newsList.filter((x) => x._id !== deleteId));
        toast.success('Đã xóa bài viết');
        setIsModalOpen(false);
    } catch (error) {
        toast.error('Lỗi khi xóa');
    }
  };

  // --- LOGIC LỌC BÀI VIẾT ---
  const filteredNews = newsList.filter(news => 
    news.title.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto h-screen pb-24">
        
        {/* HEADER & NÚT THÊM */}
        
            <AdminHeader title="Quản Lí Tin Tức  & Sự Kiện" />
            <div className="flex justify-between items-center mb-6">
            <Link to="/admin/news/create" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center shadow-lg font-bold text-sm transition transform active:scale-95">
                <FaPlus className="mr-2" /> Viết bài mới
            </Link>
        </div>

        {/* --- THANH CÔNG CỤ TÌM KIẾM --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Ô TÌM KIẾM */}
            <div className="relative w-full md:w-1/2">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm theo tiêu đề bài viết..." 
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                {keyword && (
                    <button onClick={() => setKeyword('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <FaTimes />
                    </button>
                )}
            </div>

            {/* THỐNG KÊ NHANH */}
            <div className="bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap border border-blue-100">
                {filteredNews.length} Bài viết
            </div>
        </div>

        {/* BẢNG DANH SÁCH */}
        {loading ? <div className="text-center mt-20 text-gray-500 animate-pulse font-medium">Đang tải dữ liệu...</div> : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <table className="min-w-full leading-normal table-fixed">
                    <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                        <tr className="text-xs font-bold uppercase tracking-wider">
                            <th className="px-5 py-4 text-center w-24">Hình ảnh</th>
                            <th className="px-5 py-4 text-left w-2/5">Tiêu đề bài viết</th>
                            <th className="px-5 py-4 text-left w-1/5">Ngày đăng</th>
                            <th className="px-5 py-4 text-center w-28">Lượt xem</th>
                            <th className="px-5 py-4 text-center w-32">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {filteredNews.map((news) => (
                            <tr key={news._id} className="border-b border-gray-100 hover:bg-blue-50/60 transition duration-200">
                                {/* 1. Hình ảnh */}
                                <td className="px-5 py-4 text-center">
                                    <div className="w-16 h-12 rounded-lg border border-gray-200 overflow-hidden mx-auto shadow-sm relative bg-gray-50 flex items-center justify-center group">
                                        {news.image ? (
                                            <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                                        ) : (
                                            <FaImage className="text-gray-300 text-xl" />
                                        )}
                                    </div>
                                </td>

                                {/* 2. Tiêu đề */}
                                <td className="px-5 py-4">
                                    <p className="font-bold text-slate-800 text-sm line-clamp-2" title={news.title}>
                                        {news.title}
                                    </p>
                                </td>

                                {/* 3. Ngày đăng */}
                                <td className="px-5 py-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FaCalendarAlt className="mr-2 text-gray-400 text-xs" />
                                        {new Date(news.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                </td>

                                {/* 4. Lượt xem */}
                                <td className="px-5 py-4 text-center">
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                        <FaEye className="mr-1.5" /> {news.views}
                                    </div>
                                </td>

                                {/* 5. Hành động */}
                                <td className="px-5 py-4 text-center">
                                    <div className="flex justify-center space-x-2">
                                        <Link to={`/admin/news/${news._id}/edit`} className="text-amber-500 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition" title="Sửa bài viết"><FaEdit size={16} /></Link>
                                        <button onClick={() => { setDeleteId(news._id); setIsModalOpen(true); }} className="text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition" title="Xóa bài viết"><FaTrash size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        
                        {filteredNews.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-16 text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <FaNewspaper size={40} className="mb-4 opacity-20"/>
                                        <p>Không tìm thấy bài viết nào.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>
      <ConfirmModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={deleteHandler}
        title="Xác nhận xóa" message="Bạn chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác."
      />
    </div>
  );
};

export default NewsListScreen;