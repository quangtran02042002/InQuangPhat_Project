import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaCogs, FaSearch, FaFilter, FaTimes, FaImage, FaIndustry } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';

// Hàm lấy màu badge cho danh mục máy (Giả sử bạn có các danh mục này)
const getCategoryBadge = (category) => {
    const cat = category ? category.toLowerCase() : '';
    if (cat.includes('offset')) return <span className="px-2 py-1 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase">MÁY IN OFFSET</span>;
    if (cat.includes('lụa') || cat.includes('lưới')) return <span className="px-2 py-1 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 uppercase">IN LỤA / LƯỚI</span>;
    if (cat.includes('gia công') || cat.includes('bế')) return <span className="px-2 py-1 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 uppercase">GIA CÔNG SAU IN</span>;
    return <span className="px-2 py-1 rounded text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase">{category || 'KHÁC'}</span>;
};

const MachineListScreen = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE TÌM KIẾM & LỌC ---
  const [keyword, setKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  // ----------------------------

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
      return;
    }
    fetchMachines();
  }, [navigate]);

  const fetchMachines = async () => {
    try {
      // Dùng endpoint public hoặc admin tùy backend của bạn
      const { data } = await axios.get('/api/v1/machines'); 
      // API của bạn trả về { machines: [...] } hay mảng [...]? 
      // Dựa code cũ: setMachines(data.machines)
      setMachines(data.machines || data); 
      setLoading(false);
    } catch (error) {
      toast.error('Không thể tải danh sách máy móc');
      setLoading(false);
    }
  };

  const deleteHandler = async () => {
    try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/v1/admin/machine/${deleteId}`, config);
        setMachines(machines.filter((m) => m._id !== deleteId));
        toast.success('Đã xóa máy thành công');
        setIsModalOpen(false);
    } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa máy');
    }
  };

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredMachines = machines.filter((machine) => {
    // 1. Tìm theo tên hoặc mô tả
    const searchLower = keyword.toLowerCase();
    const matchesKeyword = machine.name.toLowerCase().includes(searchLower) || 
                           (machine.category && machine.category.toLowerCase().includes(searchLower));
    
    // 2. Lọc theo Danh mục (Nếu bạn muốn làm dropdown lọc cứng)
    // Ở đây tôi so sánh tương đối text vì danh mục máy thường nhập tay
    const matchesCategory = filterCategory === 'all' || 
                            (machine.category && machine.category.toLowerCase().includes(filterCategory));

    return matchesKeyword && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      
      <div className="flex-1 p-8 overflow-y-auto h-screen pb-24">
        
        {/* HEADER & NÚT THÊM */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center uppercase tracking-wide">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3"><FaCogs /></span>
                Quản lý Máy móc & Thiết bị
            </h1>
            <Link to="/admin/machine/new" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center shadow-lg font-bold text-sm transition transform active:scale-95">
                <FaPlus className="mr-2" /> Thêm Máy Mới
            </Link>
        </div>

        {/* --- THANH CÔNG CỤ TÌM KIẾM --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Ô TÌM KIẾM */}
            <div className="relative w-full md:w-1/2">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm máy theo tên..." 
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

            {/* BỘ LỌC & THỐNG KÊ */}
            <div className="flex gap-4 w-full md:w-auto items-center">
                <div className="relative">
                    <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700 font-medium appearance-none cursor-pointer"
                    >
                        <option value="all">Tất cả danh mục</option>
                        <option value="offset">In Offset</option>
                        <option value="lụa">In Lụa / Lưới</option>
                        <option value="gia công">Gia công sau in</option>
                    </select>
                </div>
                
                <div className="bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap border border-blue-100">
                    {filteredMachines.length} Thiết bị
                </div>
            </div>
        </div>

        {/* BẢNG DANH SÁCH */}
        {loading ? <div className="text-center mt-20 text-gray-500 animate-pulse font-medium">Đang tải dữ liệu...</div> : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <table className="min-w-full leading-normal table-fixed">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                    <tr className="text-xs font-bold uppercase tracking-wider">
                        <th className="px-5 py-4 text-center w-24">Hình ảnh</th>
                        <th className="px-5 py-4 text-left w-1/3">Tên thiết bị</th>
                        <th className="px-5 py-4 text-center w-1/4">Phân loại</th>
                        <th className="px-5 py-4 text-center w-32">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {filteredMachines.map((machine) => (
                        <tr key={machine._id} className="border-b border-gray-100 hover:bg-blue-50/60 transition duration-200">
                            
                            {/* 1. Hình ảnh */}
                            <td className="px-5 py-4 text-center">
                                <div className="w-16 h-12 rounded-lg border border-gray-200 overflow-hidden mx-auto shadow-sm relative group bg-gray-50 flex items-center justify-center">
                                    {machine.images && machine.images.length > 0 ? (
                                        <img 
                                            src={machine.images[0].url} 
                                            alt={machine.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                        />
                                    ) : (
                                        <FaImage className="text-gray-300 text-xl" />
                                    )}
                                </div>
                            </td>

                            {/* 2. Tên thiết bị */}
                            <td className="px-5 py-4">
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-800 text-sm">{machine.name}</span>
                                    <span className="text-xs text-gray-500 mt-1 truncate max-w-xs">{machine.description || 'Chưa có mô tả'}</span>
                                </div>
                            </td>

                            {/* 3. Phân loại */}
                            <td className="px-5 py-4 text-center">
                                {getCategoryBadge(machine.category)}
                            </td>

                            {/* 4. Hành động */}
                            <td className="px-5 py-4 text-center">
                                <div className="flex justify-center space-x-2">
                                    <Link to={`/admin/machine/${machine._id}/edit`} className="text-amber-500 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition" title="Sửa"><FaEdit size={16} /></Link>
                                    <button onClick={() => { setDeleteId(machine._id); setIsModalOpen(true); }} className="text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition" title="Xóa"><FaTrash size={16} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    
                    {filteredMachines.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center py-16 text-gray-400">
                                <div className="flex flex-col items-center">
                                    <FaIndustry size={40} className="mb-4 opacity-20"/>
                                    <p>Không tìm thấy máy móc nào.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        )}
      </div>
      <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={deleteHandler} title="Xác nhận xóa" message="Bạn có chắc chắn muốn xóa thiết bị này không?" />
    </div>
  );
};

export default MachineListScreen;