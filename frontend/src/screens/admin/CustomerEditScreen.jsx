import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaBuilding, FaUserPlus, FaTrash, FaUserTie, FaLayerGroup } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar';

const CustomerEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [generalEmail, setGeneralEmail] = useState('');
  
  // State mới
  const [group, setGroup] = useState('offset'); 
  const [productsInterested, setProductsInterested] = useState('');

  const [contacts, setContacts] = useState([{ name: '', position: '', phone: '', email: '' }]);
  const [loading, setLoading] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
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
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto h-screen pb-24">
        <div className="max-w-5xl mx-auto">
            <Link to="/admin/customerlist" className="flex items-center text-gray-500 hover:text-blue-600 mb-6 font-medium"><FaArrowLeft className="mr-2" /> Quay lại danh sách</Link>
            
            <form onSubmit={submitHandler} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-8 py-5 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-white uppercase flex items-center">
                        <FaBuilding className="mr-3" /> {isEditMode ? 'Cập nhật Khách hàng' : 'Thêm Khách hàng mới'}
                    </h1>
                    <button type="submit" disabled={loading} className="bg-white text-blue-800 hover:bg-blue-50 font-bold py-2 px-6 rounded-lg shadow transition flex items-center">
                        <FaSave className="mr-2" /> {loading ? 'Đang lưu...' : 'Lưu lại'}
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    
                    {/* THÔNG TIN CHUNG */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="md:col-span-2 border-b pb-2 mb-2"><h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide">1. Thông tin Doanh nghiệp</h3></div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tên Đơn vị <span className="text-red-500">*</span></label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-3 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition" placeholder="Công ty TNHH..." />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ <span className="text-red-500">*</span></label>
                            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border p-3 rounded-lg outline-none focus:border-blue-500" placeholder="Số 123 Đường..." />
                        </div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Mã số thuế</label><input type="text" value={taxCode} onChange={(e) => setTaxCode(e.target.value)} className="w-full border p-3 rounded-lg outline-none focus:border-blue-500" /></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Email chung</label><input type="email" value={generalEmail} onChange={(e) => setGeneralEmail(e.target.value)} className="w-full border p-3 rounded-lg outline-none focus:border-blue-500" /></div>
                    </div>

                    {/* PHÂN LOẠI KHÁCH HÀNG (MỚI) */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 flex items-center text-blue-800 font-bold uppercase text-sm mb-2"><FaLayerGroup className="mr-2"/> 2. Phân loại & Nhu cầu</div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nhóm Khách hàng</label>
                            <select value={group} onChange={(e) => setGroup(e.target.value)} className="w-full border p-3 rounded-lg outline-none focus:border-blue-500 bg-white cursor-pointer">
                                <option value="offset">In Offset & Bao bì (Giấy)</option>
                                <option value="garment">In Vải & Garment (Vải)</option>
                                <option value="mixed">Đa năng (Cả hai)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Sản phẩm hay đặt</label>
                            <input type="text" value={productsInterested} onChange={(e) => setProductsInterested(e.target.value)} className="w-full border p-3 rounded-lg outline-none focus:border-blue-500" placeholder="VD: Hộp cứng, Tag treo..." />
                        </div>
                    </div>

                    {/* LIÊN HỆ */}
                    <div>
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center uppercase tracking-wide"><FaUserTie className="mr-2 text-blue-600"/> 3. Danh sách Người liên hệ</h3>
                            <button type="button" onClick={addContactRow} className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold flex items-center shadow transition active:scale-95"><FaUserPlus className="mr-2" /> Thêm người</button>
                        </div>
                        <div className="space-y-4">
                            {contacts.map((contact, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative shadow-sm group hover:bg-white hover:border-blue-300 transition">
                                    <div className="absolute -top-2.5 left-4 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 uppercase">Liên hệ #{index + 1}</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                                        <div><label className="text-xs font-bold text-gray-500 mb-1 block">Họ tên <span className="text-red-500">*</span></label><input type="text" value={contact.name} onChange={(e) => handleContactChange(index, 'name', e.target.value)} className="w-full border p-2 rounded text-sm font-bold focus:border-blue-500 outline-none" placeholder="Tên nhân viên" /></div>
                                        <div><label className="text-xs font-bold text-gray-500 mb-1 block">Chức vụ</label><input type="text" value={contact.position} onChange={(e) => handleContactChange(index, 'position', e.target.value)} className="w-full border p-2 rounded text-sm focus:border-blue-500 outline-none" placeholder="VD: Kế toán" /></div>
                                        <div><label className="text-xs font-bold text-gray-500 mb-1 block">SĐT <span className="text-red-500">*</span></label><input type="text" value={contact.phone} onChange={(e) => handleContactChange(index, 'phone', e.target.value)} className="w-full border p-2 rounded text-sm text-blue-600 font-medium focus:border-blue-500 outline-none" /></div>
                                        <div><label className="text-xs font-bold text-gray-500 mb-1 block">Email</label><input type="text" value={contact.email} onChange={(e) => handleContactChange(index, 'email', e.target.value)} className="w-full border p-2 rounded text-sm focus:border-blue-500 outline-none" /></div>
                                    </div>
                                    <button type="button" onClick={() => removeContactRow(index)} className="absolute top-2 right-2 text-red-300 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition" disabled={contacts.length === 1}><FaTrash /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerEditScreen;