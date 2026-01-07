import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCloudUploadAlt, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { validateNumberInfo, validateStock } from '../../utils/validation';

// Dùng ReactQuill New
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const ProductEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);

  // STATE MỚI: Mảng chứa các đường link ảnh
  const [images, setImages] = useState([]);

  const [category, setCategory] = useState('');
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
  const CATEGORIES = [
    'Hộp giấy',
    'Túi giấy',
    'Tem nhãn',
    'Catalogue',
    'Namecard',
    'Tờ rơi',
    'Khác'
  ];
  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const { data } = await axios.get(`/api/products/${id}`);
          setName(data.name);
          setPrice(data.priceTable && data.priceTable.length > 0 ? data.priceTable[0].price : 0);

          // Xử lý tương thích ngược: Nếu sản phẩm cũ có trường 'image' string, chuyển nó vào mảng
          if (data.images && data.images.length > 0) {
            setImages(data.images.map(img => img.url));
          } else if (data.image) {
            setImages([data.image]);
          } else {
            setImages([]);
          }

          setCategory(data.category);
          setDescription(data.description);
          setCountInStock(data.countInStock || 0);
        } catch (error) {
          toast.error('Không tải được dữ liệu sản phẩm');
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  const uploadFileHandler = async (e) => {
    const files = e.target.files; // Lấy danh sách file
    if (files.length === 0) return;

    const formData = new FormData();
    // Duyệt qua từng file và append vào formData với tên 'images' (khớp với backend)
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    setUploading(true);

    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };
      // API trả về mảng các đường link: ['url1', 'url2']
      const { data } = await axios.post('/api/upload', formData, config);

      // Gộp ảnh mới vào danh sách ảnh cũ
      setImages((prev) => [...prev, ...data]);

      setUploading(false);
      toast.success('Upload ảnh thành công!');
    } catch (error) {
      console.error(error);
      setUploading(false);
      toast.error('Lỗi khi upload ảnh');
    }
  };

  // Hàm xóa 1 ảnh khỏi danh sách
  const removeImageHandler = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.warning("Tên sản phẩm không được để trống");
    if (!validateNumberInfo(price)) return toast.warning("Giá sản phẩm không hợp lệ");
    if (!validateStock(countInStock)) return toast.warning("Tồn kho không hợp lệ");
    if (images.length === 0) return toast.warning("Vui lòng upload ít nhất 1 ảnh"); // Kiểm tra mảng rỗng
    if (!description) return toast.warning("Hãy nhập mô tả sản phẩm");

    setLoading(true);

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      const productData = {
        name,
        price,
        images, // Gửi mảng images lên
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
      <div className="max-w-6xl mx-auto"> {/* Tăng chiều rộng để chứa Gallery */}
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

          <form onSubmit={submitHandler} className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CỘT TRÁI: THÔNG TIN */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition" />
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục sản phẩm</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
                <div className="bg-white">
                  <ReactQuill
                    theme="snow"
                    value={description}
                    onChange={setDescription}
                    modules={modules}
                    className="h-64 mb-12"
                  />
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: HÌNH ẢNH (GALLERY) */}
            <div className="space-y-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bộ sưu tập hình ảnh</label>

              {/* Nút Upload */}
              <div className="relative">
                <input type="file" id="image-file" multiple onChange={uploadFileHandler} className="hidden" />
                <label htmlFor="image-file" className="w-full flex flex-col items-center justify-center px-4 py-10 border-2 border-dashed border-gray-300 rounded-xl hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition group">
                  <FaCloudUploadAlt className="text-4xl text-gray-400 group-hover:text-blue-600 mb-2" />
                  <span className="text-sm text-gray-500 group-hover:text-blue-700 font-medium">
                    {uploading ? 'Đang tải lên...' : 'Bấm để chọn nhiều ảnh cùng lúc'}
                  </span>
                </label>
              </div>

              {/* Lưới hiển thị ảnh đã upload */}
              {images.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
                  {images.map((imgUrl, index) => (
                    <div key={index} className="relative group border rounded-lg overflow-hidden shadow-sm aspect-square">
                      <img src={imgUrl} alt="Product" className="w-full h-full object-cover" />
                      {/* Nút Xóa ảnh */}
                      <button
                        type="button"
                        onClick={() => removeImageHandler(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-red-600"
                        title="Xóa ảnh này"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                      {index === 0 && <span className="absolute bottom-0 left-0 bg-blue-600 text-white text-[10px] px-2 py-0.5">Ảnh bìa</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 italic text-sm py-4">Chưa có ảnh nào được chọn</div>
              )}

              <div className="pt-8 mt-auto">
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