import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCloudUploadAlt, FaSave, FaTimes, FaBoxOpen } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar'; 

// Dùng ReactQuill New
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
  const isEditMode = !!id; // Có ID là Sửa, không có là Thêm mới

  // --- STATE ---
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [images, setImages] = useState([]); 
  const [category, setCategory] = useState('');
  const [group, setGroup] = useState('offset');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'], ['clean']
    ],
  };

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
      return;
    }

    // CHỈ GỌI API KHI Ở CHẾ ĐỘ SỬA (EDIT MODE)
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const { data } = await axios.get(`/api/products/${id}`);
          setName(data.name);
          setPrice(data.price);
          
          if (data.images && data.images.length > 0) {
             const imgUrls = data.images.map(img => typeof img === 'string' ? img : img.url);
             setImages(imgUrls);
          } else if (data.image) {
             setImages([data.image]);
          } else {
             setImages([]);
          }

          setCategory(data.category);
          setGroup(data.group || 'offset');
          setDescription(data.description);
          setCountInStock(data.countInStock || 0);
        } catch (error) {
          toast.error('Không tải được dữ liệu sản phẩm');
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode, navigate, userInfo]);

  const handleCategoryChange = (e) => {
    const selectedCat = e.target.value;
    setCategory(selectedCat);
    if (CATEGORY_DATA.offset.includes(selectedCat)) setGroup('offset');
    else if (CATEGORY_DATA.garment.includes(selectedCat)) setGroup('garment');
  };

  const uploadFileHandler = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]); 
    }

    setUploading(true);
    try {
      const config = {
        headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${userInfo.token}`
        },
      };
      
      const { data } = await axios.post('/api/upload', formData, config);
      
      // Xử lý data trả về (Tùy backend trả về string hay mảng)
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

  // --- HÀM XỬ LÝ LƯU (QUAN TRỌNG) ---
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.warning("Tên sản phẩm không được để trống");
    if (images.length === 0) return toast.warning("Vui lòng upload ít nhất 1 ảnh");
    if (!category) return toast.warning("Vui lòng chọn danh mục");

    setLoading(true);

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      const productData = {
        name,
        price,
        image: images[0], 
        images,           
        category,
        group,           
        description,
        countInStock,
      };

      if (isEditMode) {
        // CHẾ ĐỘ SỬA -> GỌI PUT
        await axios.put(`/api/products/${id}`, productData, config);
        toast.success('Cập nhật thành công!');
      } else {
        // CHẾ ĐỘ THÊM MỚI -> GỌI POST (TẠO MỚI HOÀN TOÀN)
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

      <div className="flex-1 p-6 md:p-8 overflow-y-auto h-screen">
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
                    
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tên sản phẩm <span className="text-red-500">*</span></label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none" placeholder="Nhập tên sản phẩm..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Giá (VNĐ)</label>
                                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tồn kho</label>
                                <input type="number" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục</label>
                                <select value={category} onChange={handleCategoryChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none bg-white">
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
                                <input type="text" value={group === 'offset' ? 'In Offset & Bao Bì' : 'In Vải & Garment'} readOnly className={`w-full border rounded-lg px-4 py-3 font-bold ${group === 'offset' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}/>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả chi tiết</label>
                            <div className="bg-white">
                                <ReactQuill theme="snow" value={description} onChange={setDescription} modules={modules} className="h-64 mb-12" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 sticky top-6">
                            <label className="block text-sm font-bold text-gray-700 mb-4">Hình ảnh</label>
                            <div className="relative mb-4">
                                <input type="file" id="image-file" multiple onChange={uploadFileHandler} className="hidden" />
                                <label htmlFor="image-file" className="w-full flex flex-col items-center justify-center px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:bg-white cursor-pointer transition bg-white">
                                    <FaCloudUploadAlt className="text-4xl text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Thêm ảnh</span>
                                </label>
                            </div>

                            {images.length > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                                {images.map((imgUrl, index) => (
                                <div key={index} className="relative group border rounded-lg overflow-hidden aspect-square bg-white">
                                    <img src={imgUrl} alt="Product" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImageHandler(index)} className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition">
                                        <FaTimes className="text-xs" />
                                    </button>
                                </div>
                                ))}
                            </div>
                            )}
                        </div>

                        <button type="submit" className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition" disabled={loading}>
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