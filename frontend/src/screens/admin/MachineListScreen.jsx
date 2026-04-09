import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaCogs, FaSearch, FaFilter, FaTimes, FaImage, FaIndustry,FaChevronDown  } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';
import AdminHeader from '../../components/AdminHeader';

// Hàm lấy màu badge cho danh mục máy được thiết kế lại
const getCategoryBadge = (category) => {
    const cat = category ? category.toLowerCase() : '';
    if (cat.includes('offset')) return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#E6F0ED] text-[#006B4D] border border-[#006B4D]/20 uppercase tracking-wider">MÁY IN OFFSET</span>;
    if (cat.includes('lụa') || cat.includes('lưới')) return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 uppercase tracking-wider">IN LỤA / LƯỚI</span>;
    if (cat.includes('gia công') || cat.includes('bế')) return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100 uppercase tracking-wider">GIA CÔNG SAU IN</span>;
    return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wider">{category || 'KHÁC'}</span>;
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

  // === STATE QUẢN LÝ GIAO DIỆN MOBILE ===
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    fetchMachines();
  }, [navigate]);

  const fetchMachines = async () => {
    try {
      const { data } = await axios.get('/api/v1/machines'); 
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
    const searchLower = keyword.toLowerCase();
    const matchesKeyword = machine.name.toLowerCase().includes(searchLower) || 
                           (machine.category && machine.category.toLowerCase().includes(searchLower));
    
    const matchesCategory = filterCategory === 'all' || 
                            (machine.category && machine.category.toLowerCase().includes(filterCategory.toLowerCase()));

    return matchesKeyword && matchesCategory;
  });

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
        
        {/* ================= GỌI ADMIN HEADER ================= */}
        <AdminHeader 
            title="Quản lý Máy móc & Thiết bị" 
            onMenuClick={() => setIsSidebarOpen(true)} 
        />

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                
                {/* --- KHU VỰC TIÊU ĐỀ & NÚT THÊM (DESKTOP) --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-xl md:text-2xl shadow-sm shrink-0">
                            <FaCogs />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Danh sách Thiết bị</h2>
                            <p className="text-[#6B7280] text-xs md:text-sm mt-0.5 md:mt-1">Quản lý toàn bộ máy in và máy gia công tại xưởng</p>
                        </div>
                    </div>
                    <Link to="/admin/machine/new" className="hidden lg:flex items-center gap-2 bg-[#006B4D] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#00543c] transition active:scale-95 shrink-0">
                        <FaPlus /> Thêm Máy Mới
                    </Link>
                </div>

                {/* --- THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC --- */}
                <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
                    
                    {/* Ô TÌM KIẾM */}
                    <div className="relative w-full lg:w-1/2">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm máy theo tên..." 
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

                    {/* BỘ LỌC & THỐNG KÊ */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-3 md:gap-4 w-full lg:w-auto items-center">
                        <div className="relative flex-1 sm:flex-none">
                            <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <select 
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full sm:w-auto pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#006B4D] bg-white text-[#111827] text-sm md:text-base font-medium appearance-none cursor-pointer shadow-sm transition"
                            >
                                <option value="all">Tất cả danh mục</option>
                                <option value="offset">In Offset</option>
                                <option value="lụa">In Lụa / Lưới</option>
                                <option value="gia công">Gia công sau in</option>
                            </select>
                            <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                        </div>
                        
                        <div className="flex items-center justify-center bg-[#E6F0ED] text-[#006B4D] px-5 py-3 rounded-xl font-bold text-sm shadow-sm shrink-0">
                            {filteredMachines.length} <span className="font-medium ml-1">Máy</span>
                        </div>
                    </div>
                </div>

                {/* --- HIỂN THỊ DỮ LIỆU --- */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006B4D] mx-auto mb-4"></div>
                        <div className="text-gray-400 font-medium">Đang tải dữ liệu thiết bị...</div>
                    </div>
                ) : filteredMachines.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed text-gray-400 shadow-sm flex flex-col items-center">
                        <FaIndustry className="text-4xl text-gray-300 mb-4"/>
                        <p className="text-lg font-bold text-[#111827]">Không tìm thấy thiết bị nào</p>
                        <p className="text-sm mt-1">Hãy thử thay đổi từ khóa hoặc bộ lọc</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-20 md:mb-0">
                        
                        {/* ================= GIAO DIỆN DESKTOP (TABLE) ================= */}
                        <div className="hidden lg:block overflow-x-auto custom-scrollbar max-h-[70vh]">
                            <table className="min-w-full leading-normal text-left align-middle">
                                <thead className="bg-[#F9FAFB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-5 text-center w-28">Hình ảnh</th>
                                        <th className="px-6 py-5 w-1/3">Tên thiết bị & Thông số</th>
                                        <th className="px-6 py-5 text-center w-1/4">Phân loại</th>
                                        <th className="px-6 py-5 text-center w-32">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filteredMachines.map((machine) => (
                                        <tr key={machine._id} className="border-b border-gray-100 hover:bg-[#E6F0ED]/30 transition-colors">
                                            
                                            {/* 1. Hình ảnh */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="w-20 h-16 rounded-xl border border-gray-200 overflow-hidden mx-auto shadow-sm relative group bg-gray-50 flex items-center justify-center">
                                                    {machine.images && machine.images.length > 0 ? (
                                                        <img 
                                                            src={machine.images[0].url} 
                                                            alt={machine.name} 
                                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                        />
                                                    ) : (
                                                        <FaImage className="text-gray-300 text-2xl" />
                                                    )}
                                                </div>
                                            </td>

                                            {/* 2. Tên thiết bị */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col justify-center">
                                                    <span className="font-extrabold text-[#111827] text-base mb-1">{machine.name}</span>
                                                    <div className="text-xs text-gray-500 line-clamp-2 leading-relaxed" dangerouslySetContent={{ __html: machine.description || 'Chưa có mô tả chi tiết' }} />
                                                </div>
                                            </td>

                                            {/* 3. Phân loại */}
                                            <td className="px-6 py-4 text-center align-middle">
                                                {getCategoryBadge(machine.category)}
                                            </td>

                                            {/* 4. Hành động */}
                                            <td className="px-6 py-4 text-center align-middle">
                                                <div className="flex justify-center space-x-2">
                                                    <Link to={`/admin/machine/${machine._id}/edit`} className="text-gray-400 hover:text-[#006B4D] bg-white hover:bg-[#E6F0ED] p-2.5 rounded-lg transition-colors border border-transparent hover:border-[#006B4D]/20"><FaEdit size={16} /></Link>
                                                    <button onClick={() => { setDeleteId(machine._id); setIsModalOpen(true); }} className="text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 p-2.5 rounded-lg transition-colors border border-transparent hover:border-red-100"><FaTrash size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ================= GIAO DIỆN MOBILE (CARD LIST) ================= */}
                        <div className="lg:hidden flex flex-col divide-y divide-gray-100">
                            {filteredMachines.map((machine) => (
                                <div key={machine._id} className="p-4 bg-white flex items-start gap-4">
                                    {/* Hình ảnh bên trái */}
                                    <div className="w-24 h-24 rounded-xl border border-gray-200 overflow-hidden shrink-0 shadow-sm bg-gray-50 flex items-center justify-center">
                                        {machine.images && machine.images.length > 0 ? (
                                            <img 
                                                src={machine.images[0].url} 
                                                alt={machine.name} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FaImage className="text-gray-300 text-3xl" />
                                        )}
                                    </div>
                                    
                                    {/* Thông tin bên phải */}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="font-extrabold text-[#111827] text-base leading-tight mb-2 truncate">
                                            {machine.name}
                                        </div>
                                        <div className="mb-3 w-fit">
                                            {getCategoryBadge(machine.category)}
                                        </div>
                                        
                                        <div className="flex gap-2 mt-auto">
                                            <Link to={`/admin/machine/${machine._id}/edit`} className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 text-gray-600 hover:text-[#006B4D] text-xs font-bold py-2 rounded-lg border border-gray-200"><FaEdit size={12} /> Sửa</Link>
                                            <button onClick={() => { setDeleteId(machine._id); setIsModalOpen(true); }} className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 text-gray-600 hover:text-red-500 text-xs font-bold py-2 rounded-lg border border-gray-200"><FaTrash size={12} /> Xóa</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                )}
            </div>

            {/* Nút Floating Thêm mới cho Mobile */}
            <Link 
                to="/admin/machine/new" 
                className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#006B4D] text-white rounded-full shadow-[0_4px_12px_rgba(0,107,77,0.4)] flex items-center justify-center z-30 hover:bg-[#00543c] transition-all active:scale-95"
            >
                <FaPlus size={20} />
            </Link>
        </main>
      </div>

      <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={deleteHandler} title="Xác nhận xóa" message="Bạn có chắc chắn muốn xóa thiết bị này không? Hành động này không thể hoàn tác." />
    </div>
  );
};

export default MachineListScreen;