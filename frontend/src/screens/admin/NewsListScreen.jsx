import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaNewspaper, FaEye } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';

const NewsListScreen = () => {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 uppercase flex items-center">
                <FaNewspaper className="mr-3 text-blue-600" /> Quản lý Tin tức
            </h1>
            <Link to="/admin/news/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center shadow-lg transition">
                <FaPlus className="mr-2" /> Viết bài mới
            </Link>
        </div>

        {loading ? <div className="text-blue-600">Đang tải...</div> : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                            <th className="py-3 px-6 text-left">Hình ảnh</th>
                            <th className="py-3 px-6 text-left">Tiêu đề</th>
                            <th className="py-3 px-6 text-left">Ngày đăng</th>
                            <th className="py-3 px-6 text-center">Lượt xem</th>
                            <th className="py-3 px-6 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                        {newsList.map((news) => (
                            <tr key={news._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-6">
                                    <img src={news.image} alt={news.title} className="w-16 h-12 object-cover rounded border" />
                                </td>
                                <td className="py-3 px-6 font-bold text-gray-800 max-w-xs truncate" title={news.title}>{news.title}</td>
                                <td className="py-3 px-6 text-gray-500">{new Date(news.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td className="py-3 px-6 text-center text-blue-600 font-bold"><FaEye className="inline mr-1"/> {news.views}</td>
                                <td className="py-3 px-6 text-center flex justify-center space-x-4">
                                    <Link to={`/admin/news/${news._id}/edit`} className="text-yellow-500 hover:text-yellow-700 text-lg"><FaEdit /></Link>
                                    <button onClick={() => { setDeleteId(news._id); setIsModalOpen(true); }} className="text-red-500 hover:text-red-700 text-lg"><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {newsList.length === 0 && <div className="p-6 text-center text-gray-500">Chưa có bài viết nào.</div>}
            </div>
        )}
      </div>
      <ConfirmModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={deleteHandler}
        title="Xóa bài viết" message="Bạn chắc chắn muốn xóa bài viết này không?"
      />
    </div>
  );
};

export default NewsListScreen;