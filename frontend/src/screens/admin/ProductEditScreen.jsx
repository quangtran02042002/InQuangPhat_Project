import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCloudUploadAlt, FaSave, FaImage } from 'react-icons/fa';
import { toast } from 'react-toastify';
// Import bộ lọc số
import { validateNumberInfo, validateStock } from '../../utils/validation';

// --- IMPORT REACT QUILL ---
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import giao diện soạn thảo

const ProductEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState(''); // ReactQuill sẽ lưu HTML vào đây
  
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Cấu hình thanh công cụ (Toolbar) cho Editor
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }], // Tiêu đề H1, H2
      ['bold', 'italic', 'underline', 'strike'], // Bôi đậm, nghiêng...
      [{ 'list': 'ordered'}, { 'list': 'bullet' }], // Danh sách số, chấm tròn
      ['link'], // Chèn link
      ['clean'] // Xóa định dạng
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
  ];

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const { data } = await axios.get(`/api/products/${id}`);
          setName(data.name);
          setPrice(data.priceTable && data.priceTable.length > 0 ? data.priceTable[0].price : 0);
          setImage(data.images && data.images.length > 0 ? data.images[0].url : '');
          setCategory(data.category);
          setDescription(data.description); // Load nội dung cũ vào Editor
          setCountInStock(data.countInStock || 0);
        } catch (error) {
          toast.error('Không tải được dữ liệu sản phẩm');
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };
      const { data } = await axios.post('/api/upload', formData, config);
      setImage(data);
      setUploading(false);
      toast.success('Upload ảnh thành công!');
    } catch (error) {
      console.error(error);
      setUploading(false);
      toast.error('Lỗi khi upload ảnh');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    // --- VALIDATE ---
    if (!name.trim()) return toast.warning("Tên sản phẩm không được để trống");
    if (!validateNumberInfo(price)) return toast.warning("Giá sản phẩm phải là số dương lớn hơn 0");
    if (!validateStock(countInStock)) return toast.warning("Số lượng tồn kho không hợp lệ");
    if (!image) return toast.warning("Vui lòng upload ảnh sản phẩm");
    // Kiểm tra mô tả (HTML string)
    if (!description || description === '<p><br></p>') return toast.warning("Hãy nhập mô tả sản phẩm");

    setLoading(true);

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      const productData = {
        name,
        price,
        image,
        category,
        description,
        countInStock,
      };

      if (isEditMode) {
        await axios.put(`/api/products/${id}`, productData, config);
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        await axios.post('/api/products', productData, config);
        toast.success('Thêm sản phẩm mới thành công!');
      }
      navigate('/admin/productlist');

    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/admin/productlist" className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition">
            <FaArrowLeft className="mr-2" /> Quay lại danh sách
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-900 px-8 py-5 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white uppercase">
                    {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h1>
                {loading && <div className="text-white animate-pulse">Đang xử lý...</div>}
            </div>

            <form onSubmit={submitHandler} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Nhập tên sản phẩm..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VNĐ)</label>
                            <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Tồn kho</label>
                            <input type="number" required value={countInStock} onChange={(e) => setCountInStock(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                        <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ví dụ: Hộp giấy, Túi giấy..." />
                    </div>
                    
                    {/* --- TRÌNH SOẠN THẢO Ở ĐÂY --- */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
                        <div className="bg-white">
                            <ReactQuill 
                                theme="snow"
                                value={description}
                                onChange={setDescription}
                                modules={modules}
                                formats={formats}
                                className="h-64 mb-12" 
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sản phẩm</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex items-center justify-center bg-gray-50 relative overflow-hidden group hover:border-blue-500 transition">
                        {image ? (
                            <img src={image} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-center text-gray-400">
                                <FaImage className="mx-auto text-4xl mb-2" />
                                <span className="text-sm">Chưa có ảnh</span>
                            </div>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                    </div>
                    <input type="text" value={image} readOnly className="w-full bg-gray-100 text-gray-500 text-xs border border-gray-200 rounded px-3 py-2" placeholder="Link ảnh sẽ hiện ở đây..." />
                    <div className="relative">
                         <input type="file" id="image-file" onChange={uploadFileHandler} className="hidden" />
                         <label htmlFor="image-file" className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition">
                            <FaCloudUploadAlt className="mr-2 text-xl text-blue-600" /> 
                            {uploading ? 'Đang tải lên...' : 'Chọn ảnh từ máy tính'}
                         </label>
                    </div>
                    <div className="pt-8">
                         <button type="submit" className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1">
                             <FaSave className="mr-2 text-xl" /> 
                             {isEditMode ? 'CẬP NHẬT SẢN PHẨM' : 'TẠO SẢN PHẨM MỚI'}
                         </button>
                    </div>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ProductEditScreen;