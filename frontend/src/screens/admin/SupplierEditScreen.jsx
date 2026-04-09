import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSave, FaArrowLeft, FaTruck, FaPhoneAlt, FaUserTie, FaMapMarkerAlt, FaFileInvoice, FaInfoCircle, FaStickyNote } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
// 1. IMPORT VALIDATE
import { validatePhone, validateTaxCode, validateTextMixed } from '../../utils/validation';

const SupplierEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // === STATE QUẢN LÝ GIAO DIỆN MOBILE ===
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [address, setAddress] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [productsProvided, setProductsProvided] = useState('');
  const [note, setNote] = useState('');

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

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
        } catch (error) { toast.error('Lỗi tải dữ liệu đối tác'); }
      };
      fetchSupplier();
    }
  }, [id, isEditMode, navigate]);

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
      toast.error('Số điện thoại không đúng định dạng (VN: 10-11 số)');
      return;
    }

    // 3. Kiểm tra Mã số thuế (Nếu có nhập thì mới check)
    if (taxCode && !validateTaxCode(taxCode)) {
      toast.error('Mã số thuế không hợp lệ (10 hoặc 13 số)');
      return;
    }

    const formData = { name, phone, contactName, address, taxCode, productsProvided, note };
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    try {
      if (isEditMode) {
        await axios.put(`/api/v1/suppliers/${id}`, formData, config);
        toast.success('Cập nhật thông tin đối tác thành công');
      } else {
        await axios.post('/api/v1/suppliers', formData, config);
        toast.success('Thêm nhà cung cấp mới thành công');
      }
      navigate('/admin/supplierlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra trong quá trình lưu');
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

        {/* ================= ADMIN HEADER ================= */}
        <AdminHeader
          title={isEditMode ? 'Cập nhật Đối tác' : 'Thêm Nhà Cung Cấp'}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          <div className="max-w-4xl mx-auto">

            <Link to="/admin/supplierlist" className="inline-flex items-center text-sm font-bold text-[#6B7280] hover:text-[#006B4D] mb-6 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <FaArrowLeft className="mr-2" /> Quay lại danh sách
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-10">

              {/* Form Header */}
              <div className="bg-[#E6F0ED] px-6 md:px-8 py-5 md:py-6 border-b border-[#006B4D]/10">
                <h1 className="text-xl md:text-2xl font-extrabold text-[#006B4D] flex items-center">
                  <FaTruck className="mr-3 text-2xl" />
                  {isEditMode ? 'Chỉnh sửa thông tin đối tác' : 'Khai báo Nhà Cung Cấp mới'}
                </h1>
              </div>

              <form onSubmit={submitHandler} className="p-6 md:p-8 space-y-8">

                {/* 1. Thông tin pháp lý */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                    <span className="w-1.5 h-5 bg-[#006B4D] rounded-full inline-block"></span>
                    <h3 className="text-base md:text-lg font-bold text-[#111827]">Thông tin Doanh nghiệp</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    <div className="md:col-span-1">
                      <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Tên Nhà Cung Cấp <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-bold text-[#111827] shadow-sm transition"
                          placeholder="VD: Công ty Giấy Lan Vi..."
                        />
                      </div>
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2 flex items-center">
                        <FaFileInvoice className="mr-1.5 text-gray-400" /> Mã Số Thuế
                      </label>
                      <input
                        type="text"
                        value={taxCode}
                        onChange={(e) => setTaxCode(e.target.value)}
                        className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-medium text-[#111827] shadow-sm transition"
                        placeholder="VD: 0101234567"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Thông tin liên hệ */}
                <div className="bg-[#F9FAFB] p-5 md:p-6 rounded-2xl border border-gray-200 space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <FaPhoneAlt className="text-[#006B4D] text-lg" />
                    <h3 className="text-base md:text-lg font-bold text-[#111827]">Thông tin liên hệ</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-extrabold text-[#006B4D] shadow-sm bg-white transition"
                        placeholder="VD: 0905..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2 flex items-center">
                        <FaUserTie className="mr-1.5 text-gray-400" /> Người liên hệ chính
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-medium text-[#111827] shadow-sm bg-white transition"
                        placeholder="VD: Anh Nam Sale"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2 flex items-center">
                        <FaMapMarkerAlt className="mr-1.5 text-gray-400" /> Địa chỉ văn phòng / Kho
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-medium text-[#111827] shadow-sm bg-white transition"
                        placeholder="Số nhà, Tên đường, Quận/Huyện..."
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Sản phẩm & Ghi chú */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2 flex items-center">
                      <FaInfoCircle className="mr-1.5 text-gray-400" /> Nhóm sản phẩm cung ứng
                    </label>
                    <input
                      type="text"
                      value={productsProvided}
                      onChange={(e) => setProductsProvided(e.target.value)}
                      className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-medium text-[#111827] shadow-sm transition"
                      placeholder="VD: Giấy Coucher, Mực in Offset, Keo nhiệt..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2 flex items-center">
                      <FaStickyNote className="mr-1.5 text-gray-400" /> Ghi chú nội bộ
                    </label>
                    <textarea
                      rows="3"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-medium text-[#111827] shadow-sm transition custom-scrollbar"
                      placeholder="Lưu ý về chính sách công nợ, thời gian giao hàng, thái độ phục vụ..."
                    />
                  </div>
                </div>

                {/* Nút Submit Dưới Cùng */}
                <div className="pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    className="w-full bg-[#006B4D] hover:bg-[#00543c] text-white font-extrabold py-4 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center text-base uppercase tracking-widest"
                  >
                    <FaSave className="mr-2 text-xl" />
                    {isEditMode ? 'CẬP NHẬT THÔNG TIN ĐỐI TÁC' : 'XÁC NHẬN THÊM NHÀ CUNG CẤP'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SupplierEditScreen;