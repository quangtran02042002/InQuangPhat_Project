import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaChevronDown, FaUserTie, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaTags, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';
import AdminHeader from '../../components/AdminHeader'; // GỌI ADMIN HEADER

// Hàm chọn màu Avatar ngẫu nhiên
const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-100 text-gray-600';
    const colors = ['bg-red-100 text-red-600', 'bg-orange-100 text-orange-600', 'bg-amber-100 text-amber-600', 'bg-green-100 text-green-600', 'bg-teal-100 text-teal-600', 'bg-blue-100 text-blue-600', 'bg-indigo-100 text-indigo-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash % colors.length)];
};

// Hàm lấy Badge cho nhóm KH
const getGroupBadge = (group) => {
    switch (group) {
        case 'garment': return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-100">Garment / Vải</span>;
        case 'mixed': return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-100">Đa năng</span>;
        default: return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#E6F0ED] text-[#006B4D] border border-[#006B4D]/20">Offset / Bao bì</span>;
    }
};

const CustomerListScreen = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE TÌM KIẾM & BỘ LỌC ---
  const [keyword, setKeyword] = useState('');
  const [filterGroup, setFilterGroup] = useState('all'); 
  
  const [expandedId, setExpandedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // === STATE QUẢN LÝ SIDEBAR MOBILE ===
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo) {
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
    const searchLower = keyword.toLowerCase();
    const matchesKeyword = 
        customer.name.toLowerCase().includes(searchLower) ||
        (customer.taxCode && customer.taxCode.includes(searchLower)) ||
        (customer.address && customer.address.toLowerCase().includes(searchLower)) ||
        (customer.contacts && customer.contacts.some(c => c.phone.includes(searchLower) || c.name.toLowerCase().includes(searchLower)));

    const matchesGroup = filterGroup === 'all' || customer.group === filterGroup;

    return matchesKeyword && matchesGroup;
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
        
        {/* ================= GỌI ADMIN HEADER ĐỒNG BỘ ================= */}
        <AdminHeader 
            title="Danh sách Khách hàng" 
            onMenuClick={() => setIsSidebarOpen(true)} 
        />

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                
                {/* --- THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC --- */}
                <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
                    
                    {/* Ô TÌM KIẾM */}
                    <div className="relative w-full lg:w-1/2">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm Tên, MST, SĐT nhân sự..." 
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
                                value={filterGroup}
                                onChange={(e) => setFilterGroup(e.target.value)}
                                className="w-full sm:w-auto pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#006B4D] bg-white text-[#111827] text-sm md:text-base font-medium appearance-none cursor-pointer shadow-sm transition"
                            >
                                <option value="all">Tất cả Nhóm KH</option>
                                <option value="offset">Offset / Bao bì</option>
                                <option value="garment">Garment / Vải</option>
                                <option value="mixed">Đa năng</option>
                            </select>
                            <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                        </div>
                        
                        <div className="flex items-center justify-center bg-[#E6F0ED] text-[#006B4D] px-5 py-3 rounded-xl font-bold text-sm shadow-sm shrink-0">
                            {filteredCustomers.length} <span className="font-medium ml-1">KH</span>
                        </div>
                        
                        {/* Thêm mới Khách hàng - Desktop */}
                        <Link 
                            to="/admin/customer/create" 
                            className="hidden lg:flex items-center justify-center bg-[#006B4D] text-white hover:bg-[#00543c] px-5 py-3 rounded-xl font-bold text-sm shadow-sm shrink-0 transition duration-150 active:scale-95 gap-2"
                        >
                            <FaPlus /> Thêm khách hàng
                        </Link>
                    </div>
                </div>

                {/* --- HIỂN THỊ DỮ LIỆU --- */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006B4D] mx-auto mb-4"></div>
                        <div className="text-gray-400 font-medium">Đang tải dữ liệu...</div>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed text-gray-400 shadow-sm flex flex-col items-center">
                        <FaSearch className="text-4xl text-gray-300 mb-4"/>
                        <p className="text-lg font-bold text-[#111827]">Không tìm thấy khách hàng nào</p>
                        <p className="text-sm mt-1">Thử thay đổi từ khóa hoặc bộ lọc</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-20 md:mb-0">
                        
                        {/* ================= GIAO DIỆN DESKTOP (TABLE) ================= */}
                        <div className="hidden lg:block overflow-x-auto custom-scrollbar max-h-[70vh]">
                            <table className="min-w-full leading-normal text-left">
                                <thead className="bg-[#F9FAFB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-5 w-1/4">Tên đơn vị</th>
                                        <th className="px-6 py-5 text-center w-32">Mã số thuế</th>
                                        <th className="px-6 py-5 w-1/4">Phân loại & Nhu cầu</th>
                                        <th className="px-6 py-5 w-1/4">Địa chỉ trụ sở</th>
                                        <th className="px-6 py-5 text-center w-28">Nhân sự</th>
                                        <th className="px-6 py-5 text-center w-24">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filteredCustomers.map((customer) => (
                                        <React.Fragment key={customer._id}>
                                            <tr 
                                                onClick={() => toggleExpand(customer._id)} 
                                                className={`border-b border-gray-100 cursor-pointer transition-colors ${expandedId === customer._id ? 'bg-[#E6F0ED]/30' : 'hover:bg-gray-50'}`}
                                            >
                                                {/* Tên đơn vị */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`text-gray-300 transition-transform duration-300 ${expandedId === customer._id ? 'rotate-180 text-[#006B4D]' : ''}`}>
                                                            <FaChevronDown size={14} />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <div className="font-extrabold text-base truncate text-[#111827]" title={customer.name}>{customer.name}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Mã số thuế */}
                                                <td className="px-6 py-4 text-center">
                                                    {customer.taxCode ? (
                                                        <div className="inline-block px-2 py-1 rounded text-xs font-mono font-bold bg-gray-100 text-[#6B7280] select-all">
                                                            {customer.taxCode}
                                                        </div>
                                                    ) : <span className="text-gray-300 italic text-xs">--</span>}
                                                </td>

                                                {/* Phân loại */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-start gap-2">
                                                        {getGroupBadge(customer.group)}
                                                        {customer.productsInterested && (
                                                            <div className="text-xs font-medium text-gray-500 flex items-center" title={customer.productsInterested}>
                                                                <FaTags className="mr-1.5 text-gray-400 shrink-0" size={10} />
                                                                <span className="truncate max-w-[200px]">{customer.productsInterested}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Địa chỉ */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start text-gray-500 text-xs leading-relaxed" title={customer.address}>
                                                        <FaMapMarkerAlt className="mr-2 text-gray-400 shrink-0 mt-0.5" />
                                                        <span className="line-clamp-2">{customer.address}</span>
                                                    </div>
                                                </td>

                                                {/* Nhân sự */}
                                                <td className="px-6 py-4 text-center">
                                                    <div className={`inline-flex items-center justify-center min-w-[40px] px-3 py-1 rounded-full text-xs font-bold border transition-colors ${expandedId === customer._id ? 'bg-[#006B4D] text-white border-[#006B4D]' : 'bg-gray-100 text-[#6B7280] border-gray-200'}`}>
                                                        <FaUserTie className="mr-1.5" />
                                                        {customer.contacts?.length || 0}
                                                    </div>
                                                </td>

                                                {/* Thao tác */}
                                                <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex justify-center gap-2">
                                                        <Link to={`/admin/customer/${customer._id}/edit`} className="text-gray-400 hover:text-[#006B4D] bg-white hover:bg-[#E6F0ED] p-2 rounded-lg transition-colors border border-transparent hover:border-[#006B4D]/20"><FaEdit size={16} /></Link>
                                                        <button onClick={() => { setDeleteId(customer._id); setIsModalOpen(true); }} className="text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-100"><FaTrash size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* DROPDOWN CHI TIẾT LIÊN HỆ */}
                                            {expandedId === customer._id && (
                                                <tr className="bg-gray-50/50 shadow-inner border-b border-gray-200">
                                                    <td colSpan="6" className="px-8 py-6">
                                                        <div className="ml-6 border-l-2 border-[#006B4D]/20 pl-6">
                                                            <h4 className="text-[10px] font-extrabold text-[#6B7280] uppercase mb-4 tracking-wider flex items-center">
                                                                <FaUserTie className="mr-2 text-[#006B4D]"/> Danh sách liên hệ ({customer.contacts?.length || 0})
                                                            </h4>
                                                            
                                                            {(!customer.contacts || customer.contacts.length === 0) ? (
                                                                <div className="text-gray-400 text-sm italic py-2">Chưa có thông tin nhân sự.</div>
                                                            ) : (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                                    {customer.contacts.map((contact, idx) => (
                                                                        <div key={idx} className="flex flex-col p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#006B4D]/40 hover:shadow-md transition-all group">
                                                                            <div className="flex items-center mb-3">
                                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 mr-3 shadow-sm ${getAvatarColor(contact.name)}`}>
                                                                                    {contact.name ? contact.name.charAt(0).toUpperCase() : '?'}
                                                                                </div>
                                                                                <div className="overflow-hidden">
                                                                                    <p className="font-extrabold text-[#111827] text-sm truncate">{contact.name || 'Chưa cập nhật'}</p>
                                                                                    {contact.position && <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-wide">{contact.position}</span>}
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-2 mt-auto pt-2 border-t border-gray-50">
                                                                                <p className="text-xs text-[#006B4D] font-bold flex items-center">
                                                                                    <FaPhoneAlt className="mr-2 text-gray-400" /> {contact.phone || '---'}
                                                                                </p>
                                                                                {contact.email && (
                                                                                    <p className="text-xs text-gray-500 font-medium flex items-center truncate" title={contact.email}>
                                                                                        <FaEnvelope className="mr-2 text-gray-400 shrink-0" /> {contact.email}
                                                                                    </p>
                                                                                )}
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
                                </tbody>
                            </table>
                        </div>

                        {/* ================= GIAO DIỆN MOBILE (CARD LIST) ================= */}
                        <div className="lg:hidden flex flex-col divide-y divide-gray-100">
                            {filteredCustomers.map((customer) => (
                                <div key={customer._id} className="p-4 bg-white flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-extrabold text-[#111827] text-base leading-tight pr-2">{customer.name}</div>
                                        <div className="flex gap-2 shrink-0">
                                            <Link to={`/admin/customer/${customer._id}/edit`} className="text-gray-400 hover:text-[#006B4D] p-1.5 bg-gray-50 rounded-lg"><FaEdit size={14} /></Link>
                                            <button onClick={() => { setDeleteId(customer._id); setIsModalOpen(true); }} className="text-gray-400 hover:text-red-500 p-1.5 bg-gray-50 rounded-lg"><FaTrash size={14} /></button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {getGroupBadge(customer.group)}
                                        {customer.taxCode && <span className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-gray-100 text-gray-600 border border-gray-200">MST: {customer.taxCode}</span>}
                                    </div>

                                    <div className="flex items-start text-gray-500 text-xs mb-4">
                                        <FaMapMarkerAlt className="mr-2 mt-0.5 text-gray-400 shrink-0" />
                                        <span className="line-clamp-2">{customer.address || 'Chưa cập nhật địa chỉ'}</span>
                                    </div>

                                    {/* Mở rộng liên hệ trên Mobile */}
                                    <div className="mt-auto border-t border-gray-100 pt-3">
                                        <button 
                                            onClick={() => toggleExpand(customer._id)}
                                            className="flex items-center justify-between w-full text-sm font-bold text-[#6B7280]"
                                        >
                                            <span className="flex items-center"><FaUserTie className="mr-2 text-[#006B4D]"/> Liên hệ ({customer.contacts?.length || 0})</span>
                                            <FaChevronDown className={`transition-transform duration-300 ${expandedId === customer._id ? 'rotate-180 text-[#006B4D]' : ''}`}/>
                                        </button>

                                        {expandedId === customer._id && (
                                            <div className="mt-3 space-y-3 pl-2 border-l-2 border-[#006B4D]/20 animate-fade-in-down">
                                                {(!customer.contacts || customer.contacts.length === 0) ? (
                                                    <p className="text-xs text-gray-400 italic">Chưa có thông tin.</p>
                                                ) : customer.contacts.map((contact, idx) => (
                                                    <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                        <div className="flex items-center mb-1.5">
                                                            <span className="font-extrabold text-[#111827] text-sm mr-2">{contact.name}</span>
                                                            {contact.position && <span className="text-[9px] bg-white px-1.5 py-0.5 rounded text-gray-500 border border-gray-200 font-bold uppercase">{contact.position}</span>}
                                                        </div>
                                                        <div className="text-xs font-bold text-[#006B4D] flex items-center mb-1"><FaPhoneAlt className="mr-1.5 text-gray-400" size={10}/> {contact.phone || '---'}</div>
                                                        {contact.email && <div className="text-xs text-gray-500 font-medium flex items-center truncate"><FaEnvelope className="mr-1.5 text-gray-400 shrink-0" size={10}/> {contact.email}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                )}
            </div>

            {/* Nút Floating Thêm mới cho Mobile */}
            <Link 
                to="/admin/customer/create" 
                className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#006B4D] text-white rounded-full shadow-[0_4px_12px_rgba(0,107,77,0.4)] flex items-center justify-center z-30 hover:bg-[#00543c] transition-all active:scale-95"
            >
                <FaPlus size={20} />
            </Link>

        </main>
      </div>

      <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={deleteHandler} title="Xác nhận xóa" message="Bạn có chắc chắn muốn xóa khách hàng này không? Hành động này không thể hoàn tác." />
    </div>
  );
};

export default CustomerListScreen;