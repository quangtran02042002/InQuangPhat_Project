import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';

// 1. IMPORT VALIDATE
import { validatePhone, validateTaxCode, validateTextMixed } from '../../utils/validation';

const SupplierEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [address, setAddress] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [productsProvided, setProductsProvided] = useState('');
  const [note, setNote] = useState('');

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (isEditMode) {
      const fetchSupplier = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          const { data } = await axios.get(`/api/v1/suppliers/${id}`, config);
          setName(data.name);
          setPhone(data.phone);
          setContactName(data.contactName || '');
          setAddress(data.address || '');
          setTaxCode(data.taxCode || '');
          setProductsProvided(data.productsProvided || '');
          setNote(data.note || '');
        } catch (error) { toast.error('Lỗi tải dữ liệu'); }
      };
      fetchSupplier();
    }
  }, [id, isEditMode, userInfo.token]);

  // --- HÀM SUBMIT ĐÃ BỔ SUNG VALIDATE ---
  const submitHandler = async (e) => {
    e.preventDefault();

    // 1. Kiểm tra Tên Công Ty
    if (!validateTextMixed(name)) {
        toast.error('Tên nhà cung cấp không hợp lệ (cần ít nhất 2 ký tự)');
        return;
    }

    // 2. Kiểm tra Số điện thoại
    if (!validatePhone(phone)) {
        toast.error('Số điện thoại không đúng định dạng (VN: 10-11 số, đầu 03,05,07,08,09,02)');
        return;
    }

    // 3. Kiểm tra Mã số thuế (Nếu có nhập thì mới check)
    if (taxCode && !validateTaxCode(taxCode)) {
        toast.error('Mã số thuế không hợp lệ (10 hoặc 13 số)');
        return;
    }

    // Nếu thông qua hết thì mới đóng gói dữ liệu
    const formData = { name, phone, contactName, address, taxCode, productsProvided, note };
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    try {
      if (isEditMode) {
        await axios.put(`/api/v1/suppliers/${id}`, formData, config);
        toast.success('Cập nhật thành công');
      } else {
        await axios.post('/api/v1/suppliers', formData, config);
        toast.success('Thêm mới thành công');
      }
      navigate('/admin/supplierlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <Link to="/admin/supplierlist" className="flex items-center text-gray-600 mb-6 hover:text-blue-600">
            <FaArrowLeft className="mr-2"/> Quay lại danh sách
        </Link>
        <div className="bg-white rounded-xl shadow p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 uppercase border-b pb-4">
                {isEditMode ? 'Cập nhật Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp'}
            </h1>
            
            <form onSubmit={submitHandler} className="space-y-5">
                {/* Tên & MST */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tên Nhà Cung Cấp <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="VD: Công ty Giấy Lan Vi..." 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Mã Số Thuế</label>
                        <input 
                            type="text" 
                            value={taxCode} 
                            onChange={(e) => setTaxCode(e.target.value)} 
                            className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="VD: 0101234567"
                        />
                    </div>
                </div>

                {/* SĐT & Người liên hệ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="VD: 0905..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Người liên hệ</label>
                        <input 
                            type="text" 
                            value={contactName} 
                            onChange={(e) => setContactName(e.target.value)} 
                            className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="VD: Anh Nam Sale" 
                        />
                    </div>
                </div>

                {/* Các trường khác */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ</label>
                    <input 
                        type="text" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sản phẩm cung cấp</label>
                    <input 
                        type="text" 
                        value={productsProvided} 
                        onChange={(e) => setProductsProvided(e.target.value)} 
                        className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="VD: Giấy Coucher, Mực in Offset..." 
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú nội bộ</label>
                    <textarea 
                        rows="3" 
                        value={note} 
                        onChange={(e) => setNote(e.target.value)} 
                        className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Ghi chú về công nợ, thái độ phục vụ..." 
                    />
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 flex justify-center items-center shadow-lg transition transform active:scale-95">
                        <FaSave className="mr-2" /> {isEditMode ? 'LƯU CẬP NHẬT' : 'XÁC NHẬN THÊM'}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default SupplierEditScreen;