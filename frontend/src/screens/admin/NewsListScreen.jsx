import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaNewspaper, FaEye, FaSearch, FaTimes, FaCalendarAlt, FaImage, FaBars } from 'react-icons/fa';
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

  // === STATE QUẢN LÝ GIAO DIỆN MOBILE ===
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (userInfo) {
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
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827] relative">
      
      {/* ================= OVERLAY & SIDEBAR MOBILE ================= */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-[#111827]/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
            onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <div className={`fixed inset-y-0 left-0 z-50 h-full transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0 lg:block`}>
         <Sidebar />
      </div>

      <div className="flex-1 flex flex-col w-full overflow-hidden">
        
        {/* ================= GỌI ADMIN HEADER ĐỒNG BỘ ================= */}
        <AdminHeader 
            title="Tin tức & Sự kiện" 
            onMenuClick={() => setIsSidebarOpen(true)} 
        />

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                
                {/* --- KHU VỰC TIÊU ĐỀ & NÚT THÊM (DESKTOP) --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-xl md:text-2xl shadow-sm shrink-0">
                            <FaNewspaper />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Bài viết & Sự kiện</h2>
                            <p className="text-[#6B7280] text-xs md:text-sm mt-0.5 md:mt-1">Quản lý nội dung tin tức hiển thị trên website</p>
                        </div>
                    </div>
                    <Link to="/admin/news/create" className="hidden sm:flex items-center gap-2 bg-[#006B4D] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#00543c] transition active:scale-95 shrink-0">
                        <FaPlus /> Viết bài mới
                    </Link>
                </div>

                {/* --- THANH CÔNG CỤ TÌM KIẾM --- */}
                <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    
                    {/* Ô TÌM KIẾM */}
                    <div className="relative w-full sm:w-1/2 lg:w-1/3">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tiêu đề bài viết..." 
                            className="w-full bg-gray-50 border border-gray-200 text-[#111827] text-sm md:text-base rounded-xl pl-12 pr-10 py-3 outline-none focus:border-[#006B4D] focus:bg-white transition"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        {keyword && (
                            <button onClick={() => setKeyword('')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition">
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    {/* THỐNG KÊ NHANH */}
                    <div className="w-full sm:w-auto flex items-center justify-center bg-[#E6F0ED] text-[#006B4D] px-5 py-3 rounded-xl font-bold text-sm shadow-sm">
                        {filteredNews.length} <span className="font-medium ml-1">Bài viết</span>
                    </div>
                </div>

                {/* --- HIỂN THỊ DỮ LIỆU --- */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006B4D] mx-auto mb-4"></div>
                        <div className="text-gray-400 font-medium">Đang tải dữ liệu...</div>
                    </div>
                ) : filteredNews.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed text-gray-400 shadow-sm flex flex-col items-center">
                        <FaNewspaper className="text-4xl text-gray-300 mb-4"/>
                        <p className="text-lg font-bold text-[#111827]">Không tìm thấy bài viết nào</p>
                        <p className="text-sm mt-1">Hãy thử thay đổi từ khóa tìm kiếm</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-20 sm:mb-0">
                        
                        {/* ================= GIAO DIỆN DESKTOP (TABLE) ================= */}
                        <div className="hidden md:block overflow-x-auto custom-scrollbar max-h-[70vh]">
                            <table className="min-w-full leading-normal text-left align-middle">
                                <thead className="bg-[#F9FAFB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-5 text-center w-28">Hình ảnh</th>
                                        <th className="px-6 py-5 w-2/5">Tiêu đề bài viết</th>
                                        <th className="px-6 py-5 text-left w-1/5">Ngày đăng</th>
                                        <th className="px-6 py-5 text-center w-28">Lượt xem</th>
                                        <th className="px-6 py-5 text-center w-32">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filteredNews.map((news) => (
                                        <tr key={news._id} className="border-b border-gray-100 hover:bg-[#E6F0ED]/30 transition-colors">
                                            
                                            {/* 1. Hình ảnh */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="w-20 h-14 rounded-xl border border-gray-200 overflow-hidden mx-auto shadow-sm relative bg-gray-50 flex items-center justify-center group">
                                                    {news.image ? (
                                                        <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                                    ) : (
                                                        <FaImage className="text-gray-300 text-2xl" />
                                                    )}
                                                </div>
                                            </td>

                                            {/* 2. Tiêu đề */}
                                            <td className="px-6 py-4">
                                                <p className="font-extrabold text-[#111827] text-base line-clamp-2 leading-snug" title={news.title}>
                                                    {news.title}
                                                </p>
                                            </td>

                                            {/* 3. Ngày đăng */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-sm font-bold text-gray-500">
                                                    <FaCalendarAlt className="mr-2 text-gray-400 text-sm shrink-0" />
                                                    {new Date(news.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>

                                            {/* 4. Lượt xem */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center px-3 py-1 rounded-md text-xs font-extrabold bg-[#E6F0ED] text-[#006B4D] border border-[#006B4D]/20">
                                                    <FaEye className="mr-1.5 text-[#006B4D]" /> {news.views || 0}
                                                </div>
                                            </td>

                                            {/* 5. Hành động */}
                                            <td className="px-6 py-4 text-center align-middle">
                                                <div className="flex justify-center space-x-2">
                                                    <Link to={`/admin/news/${news._id}/edit`} className="text-gray-400 hover:text-[#006B4D] bg-white hover:bg-[#E6F0ED] p-2.5 rounded-lg transition-colors border border-transparent hover:border-[#006B4D]/20" title="Sửa bài viết"><FaEdit size={16} /></Link>
                                                    <button onClick={() => { setDeleteId(news._id); setIsModalOpen(true); }} className="text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 p-2.5 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Xóa bài viết"><FaTrash size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ================= GIAO DIỆN MOBILE (CARD LIST) ================= */}
                        <div className="md:hidden flex flex-col divide-y divide-gray-100">
                            {filteredNews.map((news) => (
                                <div key={news._id} className="p-4 bg-white flex flex-col gap-3">
                                    <div className="flex gap-3">
                                        {/* Hình ảnh bên trái */}
                                        <div className="w-24 h-20 rounded-xl border border-gray-200 overflow-hidden shrink-0 shadow-sm bg-gray-50 flex items-center justify-center">
                                            {news.image ? (
                                                <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <FaImage className="text-gray-300 text-2xl" />
                                            )}
                                        </div>
                                        
                                        {/* Thông tin bên phải */}
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <p className="font-extrabold text-[#111827] text-sm leading-snug line-clamp-2 mb-1.5" title={news.title}>
                                                {news.title}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs font-bold text-gray-500 mt-auto">
                                                <span className="flex items-center"><FaCalendarAlt className="mr-1.5 text-gray-400" /> {new Date(news.createdAt).toLocaleDateString('vi-VN')}</span>
                                                <span className="flex items-center text-[#006B4D]"><FaEye className="mr-1.5" /> {news.views || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mt-1">
                                        <Link to={`/admin/news/${news._id}/edit`} className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 text-gray-600 hover:text-[#006B4D] text-xs font-bold py-2.5 rounded-lg border border-gray-200 transition-colors"><FaEdit size={12} /> Sửa bài</Link>
                                        <button onClick={() => { setDeleteId(news._id); setIsModalOpen(true); }} className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 text-gray-600 hover:text-red-500 text-xs font-bold py-2.5 rounded-lg border border-gray-200 transition-colors"><FaTrash size={12} /> Xóa bài</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                )}
            </div>

            {/* Nút Floating Thêm mới cho Mobile */}
            <Link 
                to="/admin/news/create" 
                className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#006B4D] text-white rounded-full shadow-[0_4px_12px_rgba(0,107,77,0.4)] flex items-center justify-center z-30 hover:bg-[#00543c] transition-all active:scale-95"
            >
                <FaPlus size={20} />
            </Link>
        </main>
      </div>

      <ConfirmModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={deleteHandler}
        title="Xác nhận xóa" message="Bạn chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác."
      />
    </div>
  );
};

export default NewsListScreen;