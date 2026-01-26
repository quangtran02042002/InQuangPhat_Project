import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaBuilding, FaChevronDown, FaUserTie, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaTags, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';
import AdminHeader from '../../components/AdminHeader';
// Hàm chọn màu Avatar ngẫu nhiên
const getAvatarColor = (name) => {
    const colors = ['bg-red-100 text-red-600', 'bg-orange-100 text-orange-600', 'bg-amber-100 text-amber-600', 'bg-green-100 text-green-600', 'bg-teal-100 text-teal-600', 'bg-blue-100 text-blue-600', 'bg-indigo-100 text-indigo-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash % colors.length)];
};

// Hàm lấy Badge cho nhóm
const getGroupBadge = (group) => {
    switch (group) {
        case 'garment': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">GARMENT / VẢI</span>;
        case 'mixed': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">ĐA NĂNG</span>;
        default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">OFFSET / BAO BÌ</span>;
    }
};

const CustomerListScreen = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE CHO TÌM KIẾM & BỘ LỌC ---
  const [keyword, setKeyword] = useState('');
  const [filterGroup, setFilterGroup] = useState('all'); // all, offset, garment, mixed
  // ------------------------------------

  const [expandedId, setExpandedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
      return;
    }
    fetchCustomers();
  }, [navigate]);

  const fetchCustomers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/customers', config);
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      toast.error('Lỗi tải danh sách');
      setLoading(false);
    }
  };

  const deleteHandler = async () => {
    try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/customers/${deleteId}`, config);
        setCustomers(customers.filter((c) => c._id !== deleteId));
        toast.success('Đã xóa khách hàng');
        setIsModalOpen(false);
    } catch (error) {
        toast.error('Lỗi khi xóa');
    }
  };

  const toggleExpand = (id) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredCustomers = customers.filter((customer) => {
    // 1. Lọc theo Từ khóa (Tên, MST, Địa chỉ, SĐT nhân viên, Tên nhân viên)
    const searchLower = keyword.toLowerCase();
    const matchesKeyword = 
        customer.name.toLowerCase().includes(searchLower) ||
        (customer.taxCode && customer.taxCode.includes(searchLower)) ||
        customer.address.toLowerCase().includes(searchLower) ||
        // Tìm sâu trong danh sách liên hệ (SĐT hoặc Tên)
        customer.contacts.some(c => c.phone.includes(searchLower) || c.name.toLowerCase().includes(searchLower));

    // 2. Lọc theo Nhóm
    const matchesGroup = filterGroup === 'all' || customer.group === filterGroup;

    return matchesKeyword && matchesGroup;
  });

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto h-screen pb-24">
        
        {/* HEADER & NÚT THÊM */}
        <div className="flex justify-between items-center mb-6">
            <AdminHeader title="Quản Lí Khách Hàng" />
            <Link to="/admin/customer/create" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center shadow-lg font-bold text-sm transition transform active:scale-95">
                <FaPlus className="mr-2" /> Thêm Doanh nghiệp
            </Link>
        </div>

        {/* --- THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC (MỚI) --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Ô TÌM KIẾM */}
            <div className="relative w-full md:w-1/2">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Tìm theo Tên công ty, MST, SĐT nhân sự..." 
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
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                        className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700 font-medium appearance-none cursor-pointer"
                    >
                        <option value="all">Tất cả nhóm</option>
                        <option value="offset">Offset / Bao bì</option>
                        <option value="garment">Garment / Vải</option>
                        <option value="mixed">Đa năng</option>
                    </select>
                </div>
                
                <div className="bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap border border-blue-100">
                    {filteredCustomers.length} Kết quả
                </div>
            </div>
        </div>
        {/* ------------------------------------------- */}

        {loading ? <div className="text-center mt-20 text-gray-500 animate-pulse font-medium">Đang tải dữ liệu...</div> : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <table className="min-w-full leading-normal table-fixed">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                    <tr className="text-xs font-bold uppercase tracking-wider">
                        <th className="px-5 py-4 text-left w-1/5">Tên đơn vị</th>
                        <th className="px-4 py-4 text-center w-32">Mã số thuế</th>
                        <th className="px-5 py-4 text-left w-1/5">Phân loại & Sản phẩm</th>
                        <th className="px-5 py-4 text-left w-1/4">Địa chỉ trụ sở</th>
                        <th className="px-5 py-4 text-center w-28">Nhân sự</th>
                        <th className="px-5 py-4 text-center w-24">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {/* Render danh sách ĐÃ LỌC (filteredCustomers) */}
                    {filteredCustomers.map((customer) => (
                        <React.Fragment key={customer._id}>
                            <tr 
                                onClick={() => toggleExpand(customer._id)} 
                                className={`border-b border-gray-100 cursor-pointer transition duration-200 text-sm ${expandedId === customer._id ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
                            >
                                {/* 1. Tên đơn vị */}
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`text-slate-400 transition-transform duration-300 ${expandedId === customer._id ? 'rotate-180 text-blue-600' : ''}`}>
                                            <FaChevronDown size={12} />
                                        </div>
                                        <div className="overflow-hidden">
                                            {/* Highlight từ khóa tìm kiếm nếu cần (Advanced) - Ở đây giữ nguyên text */}
                                            <p className={`font-bold text-base truncate transition ${expandedId === customer._id ? 'text-blue-700' : 'text-slate-800'}`} title={customer.name}>
                                                {customer.name}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* 2. Mã số thuế */}
                                <td className="px-4 py-4 text-center">
                                    {customer.taxCode ? (
                                        <div className="inline-block px-2 py-1 rounded text-[11px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-100 select-all">
                                            {customer.taxCode}
                                        </div>
                                    ) : <span className="text-gray-300 text-xs italic">--</span>}
                                </td>

                                {/* 3. Phân loại & Sản phẩm */}
                                <td className="px-5 py-4 align-top">
                                    <div className="flex flex-col items-start gap-1.5">
                                        {getGroupBadge(customer.group)}
                                        {customer.productsInterested && (
                                            <div className="text-xs text-gray-600 flex items-center" title={customer.productsInterested}>
                                                <FaTags className="mr-1.5 text-gray-400 shrink-0" size={10} />
                                                <span className="truncate max-w-[150px]">{customer.productsInterested}</span>
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* 4. Địa chỉ */}
                                <td className="px-5 py-4">
                                    <div className="flex items-start text-slate-500" title={customer.address}>
                                        <FaMapMarkerAlt className="mr-2 text-slate-400 text-xs shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{customer.address}</span>
                                    </div>
                                </td>

                                {/* 5. Nhân sự */}
                                <td className="px-5 py-4 text-center">
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border transition-colors ${expandedId === customer._id ? 'bg-teal-100 text-teal-800 border-teal-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                        <FaUserTie className="mr-1.5" />
                                        {customer.contacts ? customer.contacts.length : 0}
                                    </div>
                                </td>

                                {/* 6. Hành động */}
                                <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-center space-x-2">
                                        <Link to={`/admin/customer/${customer._id}/edit`} className="text-amber-500 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition"><FaEdit size={16} /></Link>
                                        <button onClick={() => { setDeleteId(customer._id); setIsModalOpen(true); }} className="text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition"><FaTrash size={16} /></button>
                                    </div>
                                </td>
                            </tr>

                            {/* DROPDOWN CHI TIẾT */}
                            {expandedId === customer._id && (
                                <tr className="bg-slate-50 shadow-inner border-b border-gray-100">
                                    <td colSpan="6" className="px-6 py-6">
                                        <div className="ml-8 border-l-2 border-blue-200 pl-6">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">
                                                Danh sách người liên hệ ({customer.contacts?.length || 0})
                                            </h4>
                                            
                                            {(!customer.contacts || customer.contacts.length === 0) ? (
                                                <div className="text-slate-400 text-sm italic py-2">Chưa có dữ liệu liên hệ.</div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {customer.contacts.map((contact, idx) => (
                                                        <div key={idx} className="flex items-start p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition duration-200 group">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mr-3 shadow-sm ${getAvatarColor(contact.name)}`}>
                                                                {contact.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="overflow-hidden w-full">
                                                                <div className="flex justify-between items-start">
                                                                    <p className="font-bold text-slate-800 text-sm truncate pr-2">{contact.name}</p>
                                                                    {contact.position && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium border border-gray-200 shrink-0">{contact.position}</span>}
                                                                </div>
                                                                <div className="mt-2 space-y-1.5">
                                                                    <p className="text-xs text-blue-600 font-semibold flex items-center bg-blue-50 w-fit px-2 py-0.5 rounded">
                                                                        <FaPhoneAlt className="mr-2 text-[10px]" /> {contact.phone}
                                                                    </p>
                                                                    {contact.email && (
                                                                        <p className="text-xs text-slate-500 flex items-center truncate group-hover:text-slate-700" title={contact.email}>
                                                                            <FaEnvelope className="mr-2 text-[10px]" /> {contact.email}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                    
                    {/* THÔNG BÁO KHI KHÔNG TÌM THẤY */}
                    {filteredCustomers.length === 0 && (
                        <tr>
                            <td colSpan="6" className="text-center py-16">
                                <div className="flex flex-col items-center text-gray-400">
                                    <FaSearch size={40} className="mb-4 opacity-20"/>
                                    <p className="text-lg font-medium">Không tìm thấy kết quả nào</p>
                                    <p className="text-sm mt-1">Thử thay đổi từ khóa hoặc bộ lọc</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        )}
      </div>
      <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={deleteHandler} title="Xác nhận xóa" message="Bạn có chắc chắn muốn xóa khách hàng này không?" />
    </div>
  );
};

export default CustomerListScreen;