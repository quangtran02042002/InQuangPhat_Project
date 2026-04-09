import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaBuilding, FaUserPlus, FaTrash, FaUserTie, FaLayerGroup } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';

const CustomerEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [generalEmail, setGeneralEmail] = useState('');
  
  const [group, setGroup] = useState('offset'); 
  const [productsInterested, setProductsInterested] = useState('');

  const [contacts, setContacts] = useState([{ name: '', position: '', phone: '', email: '' }]);
  const [loading, setLoading] = useState(false);

  // === STATE QUẢN LÝ SIDEBAR MOBILE ===
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    if (isEditMode) {
      const fetchCustomer = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`/api/customers/${id}`, config);
            setName(data.name);
            setAddress(data.address);
            setTaxCode(data.taxCode || '');
            setGeneralEmail(data.generalEmail || '');
            setGroup(data.group || 'offset');
            setProductsInterested(data.productsInterested || '');

            if (data.contacts && data.contacts.length > 0) setContacts(data.contacts);
        } catch (error) {
            toast.error('Lỗi tải dữ liệu');
        }
      };
      fetchCustomer();
    }
  }, [id, isEditMode, navigate]);

  const handleContactChange = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const addContactRow = () => setContacts([...contacts, { name: '', position: '', phone: '', email: '' }]);
  const removeContactRow = (index) => setContacts(contacts.filter((_, i) => i !== index));

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.warning("Chưa nhập tên công ty");
    if (contacts.length === 0) return toast.warning("Cần ít nhất 1 người liên hệ");
    for (let c of contacts) if (!c.name || !c.phone) return toast.warning("Điền Tên và SĐT cho người liên hệ");

    setLoading(true);
    try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const customerData = { name, address, taxCode, generalEmail, contacts, group, productsInterested };
        
        if (isEditMode) {
            await axios.put(`/api/customers/${id}`, customerData, config);
            toast.success('Cập nhật thành công');
        } else {
            await axios.post('/api/customers', customerData, config);
            toast.success('Thêm mới thành công');
        }
        navigate('/admin/customerlist');
    } catch (error) {
        toast.error('Có lỗi xảy ra');
        setLoading(false);
    }
  };

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
            title="Thông Tin Khách Hàng" 
            onMenuClick={() => setIsSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto">
                <Link to="/admin/customerlist" className="inline-flex items-center text-sm font-bold text-[#6B7280] hover:text-[#006B4D] mb-6 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                    <FaArrowLeft className="mr-2" /> Quay lại danh sách
                </Link>
                
                <form onSubmit={submitHandler} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    
                    {/* Form Header */}
                    <div className="bg-[#E6F0ED] px-6 md:px-8 py-5 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#006B4D]/10">
                        <h1 className="text-xl md:text-2xl font-extrabold text-[#006B4D] flex items-center">
                            <FaBuilding className="mr-3" /> {isEditMode ? 'Cập nhật Khách hàng' : 'Thêm Khách hàng mới'}
                        </h1>
                        <button type="submit" disabled={loading} className="bg-[#006B4D] text-white hover:bg-[#00543c] font-bold py-2.5 px-6 rounded-xl shadow-md transition flex items-center justify-center sm:w-auto disabled:opacity-50 active:scale-95">
                            <FaSave className="mr-2" /> {loading ? 'Đang lưu...' : 'Lưu lại'}
                        </button>
                    </div>

                    <div className="p-6 md:p-8 space-y-8 md:space-y-10">
                        
                        {/* 1. THÔNG TIN CHUNG */}
                        <div className="space-y-5">
                             <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                                 <span className="w-1.5 h-5 bg-[#006B4D] rounded-full inline-block"></span>
                                 <h3 className="text-base md:text-lg font-bold text-[#111827]">Thông tin Doanh nghiệp</h3>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Tên Đơn vị <span className="text-red-500">*</span></label>
                                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-bold text-[#111827] shadow-sm transition" placeholder="Công ty TNHH..." />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Địa chỉ <span className="text-red-500">*</span></label>
                                    <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-medium text-[#111827] shadow-sm transition" placeholder="Số nhà, Tên đường..." />
                                </div>
                                <div>
                                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Mã số thuế</label>
                                    <input type="text" value={taxCode} onChange={(e) => setTaxCode(e.target.value)} className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-medium text-[#111827] shadow-sm transition" placeholder="Nhập MST..." />
                                </div>
                                <div>
                                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Email chung</label>
                                    <input type="email" value={generalEmail} onChange={(e) => setGeneralEmail(e.target.value)} className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-medium text-[#111827] shadow-sm transition" placeholder="email@congty.com" />
                                </div>
                            </div>
                        </div>

                        {/* 2. PHÂN LOẠI KHÁCH HÀNG */}
                        <div className="bg-[#F9FAFB] p-5 md:p-6 rounded-2xl border border-gray-200 space-y-5">
                            <div className="flex items-center gap-2 mb-2">
                                <FaLayerGroup className="text-[#006B4D] text-lg"/>
                                <h3 className="text-base md:text-lg font-bold text-[#111827]">Phân loại & Nhu cầu</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                <div>
                                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Nhóm Khách hàng</label>
                                    <select value={group} onChange={(e) => setGroup(e.target.value)} className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] bg-white font-medium text-[#111827] shadow-sm cursor-pointer transition">
                                        <option value="offset">In Offset & Bao bì (Giấy)</option>
                                        <option value="garment">In Vải & Garment (Vải)</option>
                                        <option value="mixed">Đa năng (Cả hai)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Sản phẩm hay đặt</label>
                                    <input type="text" value={productsInterested} onChange={(e) => setProductsInterested(e.target.value)} className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-medium text-[#111827] shadow-sm bg-white transition" placeholder="VD: Hộp cứng, Tag treo..." />
                                </div>
                            </div>
                        </div>

                        {/* 3. LIÊN HỆ */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-2 mb-4">
                                <div className="flex items-center gap-2">
                                    <FaUserTie className="text-[#006B4D] text-lg"/>
                                    <h3 className="text-base md:text-lg font-bold text-[#111827]">Danh sách Người liên hệ</h3>
                                </div>
                                <button type="button" onClick={addContactRow} className="text-xs md:text-sm bg-white border border-[#006B4D] text-[#006B4D] hover:bg-[#E6F0ED] px-4 py-2.5 rounded-xl font-bold flex items-center justify-center shadow-sm transition active:scale-95">
                                    <FaUserPlus className="mr-2" /> Thêm người liên hệ
                                </button>
                            </div>

                            <div className="space-y-4 md:space-y-5">
                                {contacts.map((contact, index) => (
                                    <div key={index} className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 relative shadow-sm hover:shadow-md hover:border-[#006B4D]/30 transition-all">
                                        <div className="absolute -top-3 left-4 md:left-6 bg-[#006B4D] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                            Liên hệ #{index + 1}
                                        </div>
                                        <button type="button" onClick={() => removeContactRow(index)} className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-300 hover:text-red-500 p-2 md:p-2.5 rounded-full hover:bg-red-50 transition" disabled={contacts.length === 1}>
                                            <FaTrash />
                                        </button>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Họ tên <span className="text-red-500">*</span></label>
                                                <input type="text" required value={contact.name} onChange={(e) => handleContactChange(index, 'name', e.target.value)} className="w-full border-b-2 border-gray-200 p-2 text-sm font-bold text-[#111827] focus:border-[#006B4D] outline-none bg-transparent transition-colors" placeholder="Tên nhân viên" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Chức vụ</label>
                                                <input type="text" value={contact.position} onChange={(e) => handleContactChange(index, 'position', e.target.value)} className="w-full border-b-2 border-gray-200 p-2 text-sm font-medium text-[#111827] focus:border-[#006B4D] outline-none bg-transparent transition-colors" placeholder="VD: Mua hàng" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">SĐT <span className="text-red-500">*</span></label>
                                                <input type="text" required value={contact.phone} onChange={(e) => handleContactChange(index, 'phone', e.target.value)} className="w-full border-b-2 border-gray-200 p-2 text-sm font-extrabold text-[#006B4D] focus:border-[#006B4D] outline-none bg-transparent transition-colors" placeholder="0909..." />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Email</label>
                                                <input type="email" value={contact.email} onChange={(e) => handleContactChange(index, 'email', e.target.value)} className="w-full border-b-2 border-gray-200 p-2 text-sm font-medium text-[#111827] focus:border-[#006B4D] outline-none bg-transparent transition-colors" placeholder="email@..." />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerEditScreen;