import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaTruck, FaSearch, FaTimes, FaPhoneAlt, FaBoxOpen, FaUserTie } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';

// Hàm chọn màu Avatar ngẫu nhiên
const getAvatarColor = (name) => {
    const colors = ['bg-red-100 text-red-600', 'bg-orange-100 text-orange-600', 'bg-amber-100 text-amber-600', 'bg-green-100 text-green-600', 'bg-teal-100 text-teal-600', 'bg-blue-100 text-blue-600', 'bg-indigo-100 text-indigo-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash % colors.length)];
};

const SupplierListScreen = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE TÌM KIẾM ---
  const [keyword, setKeyword] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
      return;
    }
    fetchSuppliers();
  }, [navigate]);

  const fetchSuppliers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/v1/suppliers', config);
      // Kiểm tra cấu trúc dữ liệu trả về (data.suppliers hay data trực tiếp)
      setSuppliers(data.suppliers || data);
      setLoading(false);
    } catch (error) {
      toast.error('Lỗi tải danh sách nhà cung cấp');
      setLoading(false);
    }
  };

  const deleteHandler = async () => {
    try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/v1/suppliers/${deleteId}`, config); // API xóa của bạn có thể khác, check lại route
        setSuppliers(suppliers.filter((s) => s._id !== deleteId));
        toast.success('Đã xóa nhà cung cấp');
        setIsModalOpen(false);
    } catch (error) {
        toast.error('Lỗi khi xóa');
    }
  };

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredSuppliers = suppliers.filter((sup) => {
    const searchLower = keyword.toLowerCase();
    return (
        sup.name.toLowerCase().includes(searchLower) ||
        (sup.productsProvided && sup.productsProvided.toLowerCase().includes(searchLower)) ||
        (sup.contactName && sup.contactName.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto h-screen pb-24">
        
        {/* HEADER & NÚT THÊM */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center uppercase tracking-wide">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3"><FaTruck /></span>
                Quản lý Nhà Cung Cấp
            </h1>
            <Link to="/admin/supplier/new" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center shadow-lg font-bold text-sm transition transform active:scale-95">
                <FaPlus className="mr-2" /> Thêm NCC Mới
            </Link>
        </div>

        {/* --- THANH CÔNG CỤ TÌM KIẾM --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Ô TÌM KIẾM */}
            <div className="relative w-full md:w-1/2">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Tìm theo tên NCC, sản phẩm, người liên hệ..." 
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
                {filteredSuppliers.length} Đối tác
            </div>
        </div>

        {/* BẢNG DANH SÁCH */}
        {loading ? <div className="text-center mt-20 text-gray-500 animate-pulse font-medium">Đang tải dữ liệu...</div> : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <table className="min-w-full leading-normal table-fixed">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                    <tr className="text-xs font-bold uppercase tracking-wider">
                        <th className="px-5 py-4 text-left w-1/4">Tên Nhà Cung Cấp</th>
                        <th className="px-5 py-4 text-left w-1/3">Sản phẩm cung cấp</th>
                        <th className="px-5 py-4 text-left w-1/4">Thông tin liên hệ</th>
                        <th className="px-5 py-4 text-center w-28">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {filteredSuppliers.map((sup) => (
                        <tr key={sup._id} className="border-b border-gray-100 hover:bg-blue-50/60 transition duration-200">
                            
                            {/* 1. Tên NCC */}
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${getAvatarColor(sup.name)}`}>
                                        {sup.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-slate-800 text-base truncate" title={sup.name}>
                                            {sup.name}
                                        </p>
                                        {sup.taxCode && (
                                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-100 text-gray-600 border border-gray-200">
                                                MST: {sup.taxCode}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </td>

                            {/* 2. Sản phẩm cung cấp */}
                            <td className="px-5 py-4">
                                {sup.productsProvided ? (
                                    <div className="flex items-start text-sm text-gray-600" title={sup.productsProvided}>
                                        <FaBoxOpen className="mr-2 text-blue-400 mt-0.5 shrink-0" />
                                        <span className="line-clamp-2">{sup.productsProvided}</span>
                                    </div>
                                ) : <span className="text-gray-400 italic text-sm">--</span>}
                            </td>

                            {/* 3. Liên hệ */}
                            <td className="px-5 py-4">
                                <div className="space-y-1">
                                    <div className="flex items-center text-sm font-bold text-slate-700">
                                        <FaPhoneAlt className="mr-2 text-green-500 text-xs" /> 
                                        {sup.phone}
                                    </div>
                                    {sup.contactName && (
                                        <div className="flex items-center text-xs text-gray-500">
                                            <FaUserTie className="mr-2 text-gray-400" /> 
                                            {sup.contactName}
                                        </div>
                                    )}
                                </div>
                            </td>

                            {/* 4. Hành động */}
                            <td className="px-5 py-4 text-center">
                                <div className="flex justify-center space-x-2">
                                    <Link to={`/admin/supplier/${sup._id}/edit`} className="text-amber-500 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition" title="Sửa"><FaEdit size={16} /></Link>
                                    <button onClick={() => { setDeleteId(sup._id); setIsModalOpen(true); }} className="text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition" title="Xóa"><FaTrash size={16} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    
                    {filteredSuppliers.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center py-16 text-gray-400">
                                <div className="flex flex-col items-center">
                                    <FaTruck size={40} className="mb-4 opacity-20"/>
                                    <p>Không tìm thấy nhà cung cấp nào.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        )}
      </div>
      <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={deleteHandler} title="Xác nhận xóa" message="Bạn có chắc chắn muốn xóa nhà cung cấp này không?" />
    </div>
  );
};

export default SupplierListScreen;