import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCloudUploadAlt, FaSave, FaTimes, FaBoxOpen, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar'; 

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

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

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'], ['clean']
    ],
  };

  useEffect(() => {
    // SỬA LỖI Ở ĐÂY: Chuyển userInfo vào trong để tránh bị re-render liên tục
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
  }, [id, isEditMode, navigate]); // Đã xóa userInfo khỏi mảng phụ thuộc để tránh bug ghi đè

  const handleCategoryChange = (e) => {
    const selectedCat = e.target.value;
    setCategory(selectedCat);
    if (CATEGORY_DATA.offset.includes(selectedCat)) setGroup('offset');
    else if (CATEGORY_DATA.garment.includes(selectedCat)) setGroup('garment');
  };

  // --- HÀM XỬ LÝ PRICE TABLE (Đã sửa để hoạt động mượt mà) ---
  const handlePriceChange = (index, field, value) => {
    const updatedTable = priceTable.map((item, i) => {
      if (i === index) {
        // Cho phép chuỗi rỗng ('') để người dùng xóa số cũ trước khi nhập số mới
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
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6 md:p-8 overflow-y-auto h-screen pb-24">
        <div className="max-w-7xl mx-auto">
            
            <div className="flex items-center justify-between mb-6">
                <Link to="/admin/productlist" className="flex items-center text-gray-500 hover:text-blue-600 transition">
                    <FaArrowLeft className="mr-2" /> Quay lại danh sách
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-8 py-5 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-white uppercase flex items-center">
                    <FaBoxOpen className="mr-3 text-2xl"/>
                    {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </h1>
                </div>

                <form onSubmit={submitHandler} className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tên sản phẩm */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tên sản phẩm <span className="text-red-500">*</span></label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Nhập tên sản phẩm..." />
                        </div>

                        {/* Danh mục & Nhóm */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục</label>
                                <select value={category} onChange={handleCategoryChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none bg-white focus:border-blue-500">
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
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nhóm sản xuất</label>
                                <input type="text" value={group === 'offset' ? 'In Offset & Bao Bì' : 'In Vải & Garment'} readOnly className={`w-full border rounded-lg px-4 py-3 font-bold cursor-not-allowed ${group === 'offset' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}/>
                            </div>
                        </div>

                        {/* --- BẢNG GIÁ THEO TỈ LỆ CHIẾT KHẤU (%) --- */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-bold text-gray-700">Bảng Chiết Khấu Theo Số Lượng <span className="text-red-500">*</span></label>
                                <button type="button" onClick={addPriceRow} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 flex items-center shadow-sm">
                                    <FaPlus className="mr-1" /> Thêm mức số lượng
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {priceTable.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 bg-white p-2 rounded border border-gray-200 shadow-sm">
                                        <div className="flex-1">
                                            <span className="text-[10px] text-gray-400 mb-1 block uppercase font-bold">Số lượng đặt in (&ge;)</span>
                                            <input 
                                                type="number" 
                                                value={item.minQuantity} 
                                                onChange={(e) => handlePriceChange(index, 'minQuantity', e.target.value)}
                                                className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:border-blue-500 outline-none font-medium"
                                                placeholder="VD: 1000"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-[10px] text-gray-400 mb-1 block uppercase font-bold">Tỉ lệ giá (%)</span>
                                            <div className="flex items-center border-b border-gray-300 focus-within:border-blue-500 transition-colors pb-1">
                                                <input 
                                                    type="number" 
                                                    min="1" max="100"
                                                    value={item.price} 
                                                    onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                                                    className="w-full px-2 text-sm outline-none font-bold text-blue-600 bg-transparent"
                                                    placeholder="VD: 100"
                                                />
                                                <span className="text-gray-500 text-sm font-bold pr-2 shrink-0">%</span>
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <button 
                                                type="button" 
                                                onClick={() => removePriceRow(index)}
                                                className="text-red-400 hover:text-red-600 p-2 transition"
                                                disabled={priceTable.length === 1} 
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-gray-600 leading-relaxed">
                                <p className="font-bold text-blue-800 mb-1">Hướng dẫn nhập tỉ lệ %:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Mốc số lượng nhỏ nhất: Nhập <span className="font-bold text-gray-800">100%</span> (Đại diện cho giá gốc).</li>
                                    <li>Mốc số lượng lớn hơn: Nhập số <span className="font-bold text-red-500">nhỏ dần</span> (Ví dụ 90, 85) để tạo hiệu ứng giảm giá.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Mô tả */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả chi tiết</label>
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <ReactQuill theme="snow" value={description} onChange={setDescription} modules={modules} className="h-64 mb-12" />
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: THƯ VIỆN ẢNH */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 sticky top-6">
                            <label className="block text-sm font-bold text-gray-700 mb-4">Thư viện ảnh</label>
                            
                            {/* Khu vực Upload */}
                            <div className="relative mb-4">
                                <input type="file" id="image-file" multiple onChange={uploadFileHandler} className="hidden" accept="image/*" />
                                <label htmlFor="image-file" className="w-full flex flex-col items-center justify-center px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:bg-white hover:border-blue-400 cursor-pointer transition bg-white group">
                                    <FaCloudUploadAlt className="text-4xl text-gray-400 mb-2 group-hover:text-blue-500 transition" />
                                    <span className="text-sm text-gray-500 font-medium group-hover:text-blue-600">Bấm để tải ảnh lên</span>
                                    <span className="text-xs text-gray-400 mt-1">(Hỗ trợ JPG, PNG, WEBP)</span>
                                </label>
                            </div>

                            {/* Danh sách ảnh đã upload */}
                            {images.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {images.map((imgUrl, index) => (
                                <div key={index} className="relative group border border-gray-200 rounded-lg overflow-hidden aspect-square bg-white shadow-sm">
                                    <img src={imgUrl} alt={`Product ${index}`} className="w-full h-full object-cover" />
                                    {/* Nút xóa ảnh */}
                                    <button 
                                        type="button" 
                                        onClick={() => removeImageHandler(index)} 
                                        className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1.5 shadow-md opacity-80 group-hover:opacity-100 hover:bg-red-600 hover:text-white transition"
                                    >
                                        <FaTimes className="text-xs" />
                                    </button>
                                </div>
                                ))}
                            </div>
                            ) : (
                                <div className="text-center py-4 text-gray-400 text-sm italic border rounded-lg bg-gray-100 border-dashed">
                                    Chưa có ảnh nào.
                                </div>
                            )}

                            {/* Loading Indicator */}
                            {uploading && <div className="text-center text-blue-600 text-sm mt-2 font-medium animate-pulse">Đang tải ảnh lên...</div>}
                        </div>

                        <button type="submit" className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95" disabled={loading || uploading}>
                            <FaSave className="mr-2 text-lg" />
                            {loading ? 'Đang xử lý...' : (isEditMode ? 'LƯU CẬP NHẬT' : 'TẠO SẢN PHẨM')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEditScreen;