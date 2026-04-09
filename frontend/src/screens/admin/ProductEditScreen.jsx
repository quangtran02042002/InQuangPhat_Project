import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCloudUploadAlt, FaSave, FaTimes, FaBoxOpen, FaPlus, FaTrash, FaImage, FaBars } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar'; 
import AdminHeader from '../../components/AdminHeader';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useImagePaste } from '../../hooks/useImagePaste';

const CATEGORY_DATA = {
  offset: [
    'Tem nhãn', 'Hộp cứng', 'Hộp giấy', 'Kẹp file',
    'Catalogue', 'Hang tag', 'Túi giấy', 'Phong bì', 'Namecard', 'Tờ rơi'
  ],
  garment: [
    'Waterbased', 'In rubber', 'In mực dầu', 'In chuyển nhiệt',
    'High density', 'In foil', 'In silicone', 'In puff'
  ]
};

const ProductEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // === STATE QUẢN LÝ GIAO DIỆN MOBILE ===
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- STATE ---
  const [name, setName] = useState('');
  
  // Bảng giá nhiều mức (Mặc định 100%)
  const [priceTable, setPriceTable] = useState([{ minQuantity: 1, price: 100 }]);
  
  const [images, setImages] = useState([]); 
  const [category, setCategory] = useState('');
  const [group, setGroup] = useState('offset');
  const [description, setDescription] = useState('');

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // === HOOK: DÁN ẢNH TỪ CLIPBOARD ===
  useImagePaste({
    onImageUploaded: (url) => {
      setImages((prev) => [...prev, url]);
    },
    enabled: true
  });

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'], ['clean']
    ],
  };

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('userInfo'));
    
    if (!currentUser || !currentUser.isAdmin) {
      navigate('/login');
      return;
    }

    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const { data } = await axios.get(`/api/products/${id}`);
          setName(data.name);
          
          if (data.priceTable && data.priceTable.length > 0) {
            setPriceTable(data.priceTable);
          } else {
            setPriceTable([{ minQuantity: 1, price: 100 }]);
          }
          
          if (data.images && data.images.length > 0) {
              const imgUrls = data.images.map(img => typeof img === 'string' ? img : img.url);
              setImages(imgUrls);
          } else {
              setImages([]);
          }

          setCategory(data.category);
          setGroup(data.group || 'offset');
          setDescription(data.description);
        } catch (error) {
          toast.error('Không tải được dữ liệu sản phẩm');
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode, navigate]); 

  const handleCategoryChange = (e) => {
    const selectedCat = e.target.value;
    setCategory(selectedCat);
    if (CATEGORY_DATA.offset.includes(selectedCat)) setGroup('offset');
    else if (CATEGORY_DATA.garment.includes(selectedCat)) setGroup('garment');
  };

  // --- HÀM XỬ LÝ PRICE TABLE ---
  const handlePriceChange = (index, field, value) => {
    const updatedTable = priceTable.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value === '' ? '' : Number(value) };
      }
      return item;
    });
    setPriceTable(updatedTable);
  };

  const addPriceRow = () => {
    const lastPrice = priceTable.length > 0 ? priceTable[priceTable.length - 1].price : 100;
    setPriceTable([...priceTable, { minQuantity: 0, price: lastPrice }]);
  };

  const removePriceRow = (index) => {
    const newPriceTable = priceTable.filter((_, i) => i !== index);
    setPriceTable(newPriceTable);
  };
  // -----------------------------

  const uploadFileHandler = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]); 
    }

    setUploading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${currentUser.token}`
        },
      };
      
      const { data } = await axios.post('/api/upload', formData, config);
      
      if(Array.isArray(data)){
          setImages((prev) => [...prev, ...data]);
      } else {
          setImages((prev) => [...prev, data]); 
      }

      setUploading(false);
      toast.success('Upload ảnh thành công!');
    } catch (error) {
      console.error(error);
      setUploading(false);
      toast.error('Lỗi khi upload ảnh');
    }
  };

  const removeImageHandler = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.warning("Tên sản phẩm không được để trống");
    if (images.length === 0) return toast.warning("Vui lòng upload ít nhất 1 ảnh");
    if (!category) return toast.warning("Vui lòng chọn danh mục");
    
    if (priceTable.length === 0) return toast.warning("Vui lòng nhập ít nhất 1 mức giá");
    for (let item of priceTable) {
        if (item.minQuantity === '' || item.minQuantity <= 0) {
            return toast.warning("Số lượng tối thiểu phải lớn hơn 0");
        }
        if (item.price === '' || item.price <= 0 || item.price > 100) {
            return toast.warning("Tỉ lệ giá (%) phải nằm trong khoảng từ 1 đến 100");
        }
    }

    setLoading(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };

      const imagesToSend = images.map(url => ({ url }));

      const productData = {
        name,
        priceTable, 
        images: imagesToSend, 
        category,
        group,          
        description,
      };

      if (isEditMode) {
        await axios.put(`/api/products/${id}`, productData, config);
        toast.success('Cập nhật thành công!');
      } else {
        await axios.post('/api/products', productData, config);
        toast.success('Thêm mới thành công!');
      }
      navigate('/admin/productlist');

    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
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
        
        {/* ================= ADMIN HEADER ================= */}
        <AdminHeader 
            title={isEditMode ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'} 
            onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto">
                <Link to="/admin/productlist" className="inline-flex items-center text-sm font-bold text-[#6B7280] hover:text-[#006B4D] mb-6 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                    <FaArrowLeft className="mr-2" /> Quay lại danh sách sản phẩm
                </Link>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    
                    {/* Form Header */}
                    <div className="bg-[#E6F0ED] px-6 md:px-8 py-5 md:py-6 border-b border-[#006B4D]/10">
                        <h1 className="text-xl md:text-2xl font-extrabold text-[#006B4D] flex items-center">
                            <FaBoxOpen className="mr-3 text-2xl"/>
                            {isEditMode ? 'Cập nhật thông tin sản phẩm' : 'Đăng sản phẩm mới lên Website'}
                        </h1>
                    </div>

                    <form onSubmit={submitHandler} className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                        
                        {/* ================= CỘT TRÁI: THÔNG TIN CHI TIẾT ================= */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Tên sản phẩm */}
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Tên sản phẩm <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-extrabold text-[#111827] text-lg shadow-sm transition" 
                                    placeholder="Nhập tên sản phẩm..." 
                                />
                            </div>

                            {/* Danh mục & Nhóm */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-[#F9FAFB] p-5 rounded-2xl border border-gray-200 shadow-inner">
                                <div>
                                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Danh mục <span className="text-red-500">*</span></label>
                                    <select 
                                        value={category} 
                                        onChange={handleCategoryChange} 
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none bg-white focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-bold text-[#111827] shadow-sm cursor-pointer transition"
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        <optgroup label="IN OFFSET & BAO BÌ">
                                            {CATEGORY_DATA.offset.map(c => <option key={c} value={c}>{c}</option>)}
                                        </optgroup>
                                        <optgroup label="IN VẢI / GARMENT">
                                            {CATEGORY_DATA.garment.map(c => <option key={c} value={c}>{c}</option>)}
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Nhóm sản xuất</label>
                                    <input 
                                        type="text" 
                                        value={group === 'offset' ? 'In Offset & Bao Bì' : 'In Vải & Garment'} 
                                        readOnly 
                                        className={`w-full border rounded-xl px-4 py-3 font-extrabold text-sm cursor-not-allowed ${group === 'offset' ? 'bg-[#E6F0ED] text-[#006B4D] border-[#006B4D]/20' : 'bg-orange-50 text-orange-600 border-orange-200'}`}
                                    />
                                </div>
                            </div>

                            {/* --- BẢNG GIÁ THEO TỈ LỆ CHIẾT KHẤU (%) --- */}
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="bg-[#F9FAFB] px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <label className="block text-sm font-extrabold text-[#111827] uppercase tracking-wide">Bảng Chiết Khấu Theo Số Lượng <span className="text-red-500">*</span></label>
                                    <button 
                                        type="button" 
                                        onClick={addPriceRow} 
                                        className="text-xs bg-white border border-[#006B4D] text-[#006B4D] px-4 py-2 rounded-xl hover:bg-[#E6F0ED] font-bold flex items-center shadow-sm transition active:scale-95"
                                    >
                                        <FaPlus className="mr-1.5" /> Thêm mốc giá
                                    </button>
                                </div>
                                
                                <div className="p-5 space-y-4">
                                    {priceTable.map((item, index) => (
                                        <div key={index} className="flex items-end gap-4 bg-[#F9FAFB] p-4 rounded-xl border border-gray-200">
                                            <div className="flex-1 relative">
                                                <label className="text-[10px] text-gray-500 mb-1.5 block uppercase font-bold">Số lượng đặt in (&ge;)</label>
                                                <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#006B4D] focus-within:ring-1 focus-within:ring-[#006B4D] transition-all">
                                                    <span className="bg-gray-50 px-3 py-2 text-gray-500 font-bold border-r border-gray-200">&ge;</span>
                                                    <input 
                                                        type="number" 
                                                        value={item.minQuantity} 
                                                        onChange={(e) => handlePriceChange(index, 'minQuantity', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm outline-none font-bold text-[#111827]"
                                                        placeholder="VD: 1000"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 relative">
                                                <label className="text-[10px] text-gray-500 mb-1.5 block uppercase font-bold">Tỉ lệ giá (%)</label>
                                                <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#006B4D] focus-within:ring-1 focus-within:ring-[#006B4D] transition-all">
                                                    <input 
                                                        type="number" 
                                                        min="1" max="100"
                                                        value={item.price} 
                                                        onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm outline-none font-extrabold text-[#006B4D]"
                                                        placeholder="VD: 100"
                                                    />
                                                    <span className="bg-gray-50 px-3 py-2 text-gray-500 font-bold border-l border-gray-200">%</span>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                type="button" 
                                                onClick={() => removePriceRow(index)}
                                                className="text-gray-400 hover:text-red-500 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 h-[38px] w-[38px] rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                disabled={priceTable.length === 1} 
                                                title="Xóa mốc giá này"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    <div className="mt-4 p-4 bg-[#E6F0ED]/50 border border-[#006B4D]/20 rounded-xl text-xs text-[#006B4D] leading-relaxed">
                                        <p className="font-extrabold mb-1.5 flex items-center"><FaBoxOpen className="mr-1.5"/> Hướng dẫn thiết lập tỉ lệ %:</p>
                                        <ul className="list-disc pl-5 space-y-1 font-medium">
                                            <li>Mốc số lượng nhỏ nhất (VD: 1 sản phẩm): Nhập <span className="font-extrabold bg-white px-1 rounded shadow-sm">100%</span> (Đại diện cho giá gốc).</li>
                                            <li>Các mốc số lượng lớn hơn: Nhập tỉ lệ <span className="font-extrabold text-red-500 bg-white px-1 rounded shadow-sm">nhỏ dần</span> (Ví dụ 90%, 85%) để tạo ra mức giá sỉ rẻ hơn cho khách hàng.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Mô tả */}
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-3">Mô tả chi tiết sản phẩm</label>
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#006B4D] focus-within:ring-1 focus-within:ring-[#006B4D] transition-all shadow-sm">
                                    <ReactQuill theme="snow" value={description} onChange={setDescription} modules={modules} className="h-64 mb-12" />
                                </div>
                            </div>
                        </div>

                        {/* ================= CỘT PHẢI: THƯ VIỆN ẢNH & SUBMIT ================= */}
                        <div className="space-y-6">
                            
                            <div className="bg-[#F9FAFB] p-5 md:p-6 rounded-2xl border border-gray-200 sticky top-6 shadow-sm">
                                <label className="flex items-center text-sm font-extrabold text-[#111827] uppercase tracking-wide mb-4">
                                    <FaImage className="mr-2 text-[#006B4D]" /> Hình ảnh sản phẩm
                                </label>
                                
                                {/* Khu vực Upload */}
                                <div className="mb-5">
                                    <input type="file" id="image-file" multiple onChange={uploadFileHandler} className="hidden" accept="image/*" />
                                    <label htmlFor="image-file" className="w-full flex flex-col items-center justify-center px-4 py-8 md:py-10 border-2 border-dashed border-[#006B4D]/30 rounded-xl hover:bg-[#E6F0ED] hover:border-[#006B4D]/50 cursor-pointer transition-all bg-white group shadow-sm">
                                        <FaCloudUploadAlt className="text-4xl md:text-5xl text-[#006B4D]/40 mb-3 group-hover:text-[#006B4D] group-hover:scale-110 transition-all" />
                                        <span className="text-sm text-[#111827] font-bold group-hover:text-[#006B4D]">Bấm để tải ảnh lên (Hoặc ấn Ctrl+V)</span>
                                        <span className="text-xs text-gray-400 mt-1 font-medium">(Hỗ trợ JPG, PNG, WEBP)</span>
                                    </label>
                                </div>

                                {/* Loading Indicator */}
                                {uploading && (
                                    <div className="text-center text-[#006B4D] text-xs mb-4 font-bold flex justify-center items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang tải ảnh lên máy chủ...
                                    </div>
                                )}

                                {/* Danh sách ảnh đã upload */}
                                <div className="border-t border-gray-200 pt-4">
                                    {images.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                                            {images.map((imgUrl, index) => (
                                                <div key={index} className="relative group border border-gray-200 rounded-xl overflow-hidden aspect-square bg-white shadow-sm">
                                                    <img src={imgUrl} alt={`Product ${index}`} className="w-full h-full object-cover" />
                                                    
                                                    {/* Nhãn Ảnh chính (Ảnh đầu tiên) */}
                                                    {index === 0 && (
                                                        <div className="absolute top-0 left-0 bg-[#006B4D] text-white text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-br-lg z-10">
                                                            Ảnh bìa
                                                        </div>
                                                    )}

                                                    {/* Nút xóa ảnh */}
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeImageHandler(index)} 
                                                        className="absolute top-1.5 right-1.5 bg-white text-red-500 rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 z-10"
                                                    >
                                                        <FaTimes className="text-[10px]" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-400 text-xs italic border border-gray-200 rounded-xl bg-white border-dashed">
                                            Chưa có hình ảnh nào được chọn.
                                        </div>
                                    )}
                                </div>
                                
                                {/* NÚT LƯU CHÍNH */}
                                <div className="mt-8 border-t border-gray-200 pt-6">
                                    <button 
                                        type="submit" 
                                        className={`w-full flex justify-center items-center font-extrabold py-4 rounded-xl shadow-md transition transform active:scale-95 text-base uppercase tracking-wide ${loading || uploading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#006B4D] hover:bg-[#00543c] text-white'}`} 
                                        disabled={loading || uploading}
                                    >
                                        <FaSave className="mr-2 text-xl" />
                                        {loading ? 'Đang lưu dữ liệu...' : (isEditMode ? 'Lưu Cập Nhật' : 'Đăng Sản Phẩm')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default ProductEditScreen;