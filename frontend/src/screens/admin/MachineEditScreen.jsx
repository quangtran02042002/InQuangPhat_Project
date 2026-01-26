import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FaArrowLeft, FaSave, FaCloudUploadAlt, FaTrash, FaVideo, FaTimes } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
// 1. IMPORT VALIDATE
import { validateTextMixed } from '../../utils/validation';

const MachineEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const quillRef = useRef(null);

  // --- STATE ---
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  
  const [images, setImages] = useState([]); 
  const [imagesPreview, setImagesPreview] = useState([]); 
  const [oldImages, setOldImages] = useState([]); 

  const [videoFiles, setVideoFiles] = useState([]); 
  const [oldVideos, setOldVideos] = useState([]); 

  const [uploading, setUploading] = useState(false);

  const categories = [
    "Máy in Offset",
    "Máy gia công sau in", 
    "Máy in vải",
    "Máy in kỹ thuật số",
    "Máy cắt bế",
    "Khác"
  ];

  // --- XỬ LÝ ẢNH & VIDEO (Giữ nguyên như cũ) ---
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) setImagesPreview((old) => [...old, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    const newPreviews = [...imagesPreview];
    newPreviews.splice(index, 1);
    setImagesPreview(newPreviews);
  };

  const removeOldImage = (index) => {
    const newOldImages = [...oldImages];
    newOldImages.splice(index, 1);
    setOldImages(newOldImages);
  };

  const handleVideosChange = (e) => {
    const files = Array.from(e.target.files);
    setVideoFiles((prev) => [...prev, ...files]);
  };

  const removeVideo = (index) => {
    const newVideos = [...videoFiles];
    newVideos.splice(index, 1);
    setVideoFiles(newVideos);
  };

  const removeOldVideo = (index) => {
    const newOldVideos = [...oldVideos];
    newOldVideos.splice(index, 1);
    setOldVideos(newOldVideos);
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link'], 
        ['clean']
      ],
    },
  }), []);

  useEffect(() => {
    if (isEditMode) {
      const fetchMachine = async () => {
        try {
          const { data } = await axios.get(`/api/v1/machines/${id}`); 
          const machine = data.machine || data; 
          setName(machine.name);
          setCategory(machine.category);
          setDescription(machine.description || '');
          setOldImages(machine.images || []);
          setOldVideos(machine.videos || []); 
        } catch (err) { 
            toast.error('Lỗi tải dữ liệu máy'); 
        }
      };
      fetchMachine();
    }
  }, [id, isEditMode]);

  // --- HÀM SUBMIT ĐÃ BỔ SUNG VALIDATE ---
  const submitHandler = async (e) => {
    e.preventDefault();

    // 1. Validate Tên máy (Dùng validateTextMixed vì tên máy có số và ký tự)
    if (!validateTextMixed(name)) {
        toast.error('Tên máy không hợp lệ (cần ít nhất 2 ký tự)');
        return;
    }

    // 2. Validate Danh mục
    if (!category || category === "") {
        toast.error('Vui lòng chọn danh mục cho máy');
        return;
    }

    // 3. Validate Ảnh (Bắt buộc phải có ít nhất 1 ảnh để hiển thị trang chủ)
    // Logic: Tổng ảnh cũ + ảnh mới phải > 0
    if (oldImages.length === 0 && images.length === 0) {
        toast.error('Vui lòng tải lên ít nhất 1 hình ảnh minh họa');
        return;
    }

    // Nếu qua hết các bước kiểm tra thì mới xử lý gửi đi
    setUploading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('oldImages', JSON.stringify(oldImages));
    formData.append('oldVideos', JSON.stringify(oldVideos));

    images.forEach((image) => {
      formData.append('images', image);
    });

    videoFiles.forEach((video) => {
        formData.append('videos', video);
    });

    try {
        const config = { headers: { "Content-Type": "multipart/form-data" } };
        if (isEditMode) {
            await axios.put(`/api/v1/admin/machine/${id}`, formData, config);
            toast.success('Cập nhật máy thành công!');
        } else {
            await axios.post('/api/v1/admin/machine/new', formData, config);
            toast.success('Thêm máy mới thành công!');
        }
        navigate('/admin/machinelist');
    } catch (error) {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <Link to="/admin/machinelist" className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition">
          <FaArrowLeft className="mr-2" /> Quay lại danh sách máy
        </Link>
        
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 uppercase border-b pb-4">
                {isEditMode ? 'Chỉnh sửa thông tin máy' : 'Thêm máy móc mới'}
            </h1>
            
            <form onSubmit={submitHandler} className="space-y-6" encType="multipart/form-data">
                
                {/* Tên Máy & Danh Mục */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên máy <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="VD: Máy in Offset Komori..." 
                            
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                        <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)} 
                            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* --- KHU VỰC ẢNH --- */}
                <div className="border-t pt-4">
                    <label className="block text-lg font-semibold text-gray-800 mb-2">Hình ảnh sản phẩm <span className="text-red-500">*</span></label>
                    <div className="mb-4">
                        <label className="cursor-pointer inline-flex items-center bg-white border border-dashed border-blue-400 text-blue-600 px-6 py-3 rounded hover:bg-blue-50 transition shadow-sm w-full justify-center">
                            <FaCloudUploadAlt className="mr-2 text-xl" /> 
                            <span className="font-semibold">Chọn ảnh từ máy tính</span>
                            <input type="file" className="hidden" onChange={handleImagesChange} multiple accept="image/*" />
                        </label>
                    </div>

                    {/* Preview Ảnh MỚI */}
                    {imagesPreview.length > 0 && (
                        <div className="mb-4 grid grid-cols-2 md:grid-cols-6 gap-4">
                            {imagesPreview.map((img, index) => (
                                <div key={index} className="relative group border rounded-lg overflow-hidden h-24 shadow-sm">
                                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition shadow">
                                        <FaTimes size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Danh sách Ảnh CŨ */}
                    {isEditMode && oldImages.length > 0 && (
                        <div className="p-4 bg-gray-50 rounded border border-gray-200">
                            <p className="text-sm text-gray-700 font-bold mb-2">Ảnh hiện có trên server:</p>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                {oldImages.map((img, idx) => (
                                    <div key={idx} className="relative group h-24 w-full border rounded overflow-hidden shadow-sm">
                                        <img src={img.url} alt="Old" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeOldImage(idx)} className="absolute top-0 right-0 bg-red-600 text-white w-6 h-6 flex items-center justify-center hover:bg-red-700 transition z-10">
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- KHU VỰC VIDEO --- */}
                <div className="border-t pt-4">
                    <label className="block text-lg font-semibold text-gray-800 mb-2">Video thực tế</label>
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input type="file" id="video-upload" className="hidden" accept="video/*" multiple onChange={handleVideosChange} />
                        <label htmlFor="video-upload" className="cursor-pointer bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition inline-flex items-center shadow-lg">
                             <FaVideo className="mr-2" /> Chọn Video (MP4, MOV)
                        </label>
                        <p className="text-xs text-gray-500 mt-3">Tối đa 50MB/file.</p>
                    </div>

                    {/* Video MỚI & CŨ (Giữ nguyên logic hiển thị) */}
                    {videoFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-xs text-blue-600 font-bold">Video mới chọn:</p>
                            {videoFiles.map((file, index) => (
                                <div key={index} className="flex justify-between items-center bg-blue-50 p-3 border border-blue-200 rounded-lg">
                                    <span className="truncate text-sm">{file.name}</span>
                                    <button type="button" onClick={() => removeVideo(index)} className="text-red-500"><FaTrash /></button>
                                </div>
                            ))}
                        </div>
                    )}
                    {isEditMode && oldVideos.length > 0 && (
                         <div className="mt-4 space-y-2">
                            <p className="text-xs text-gray-700 font-bold">Video hiện có:</p>
                            {oldVideos.map((vid, index) => (
                                <div key={index} className="flex justify-between items-center bg-white p-3 border rounded-lg shadow-sm">
                                    <a href={vid.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate">Xem video hiện tại</a>
                                    <button type="button" onClick={() => removeOldVideo(index)} className="text-gray-400 hover:text-red-500 border px-2 py-1 rounded">Xóa bỏ</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mô tả chi tiết */}
                <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                    <div className="bg-white">
                        <ReactQuill ref={quillRef} theme="snow" modules={modules} value={description} onChange={setDescription} className="h-64 mb-12" />
                    </div>
                </div>

                {/* Nút Submit */}
                <div className="pt-8 border-t">
                    <button 
                        type="submit" 
                        disabled={uploading}
                        className={`w-full text-white font-bold py-4 rounded-lg shadow-lg transition flex justify-center items-center text-lg ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'}`}
                    >
                        {uploading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang tải lên Cloudinary...
                            </span>
                        ) : (
                            <>
                                <FaSave className="mr-2" /> {isEditMode ? 'LƯU CẬP NHẬT' : 'XÁC NHẬN THÊM MÁY'}
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
      </div>
    </div>
  );
};

export default MachineEditScreen;