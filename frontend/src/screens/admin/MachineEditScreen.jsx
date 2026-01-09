import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FaArrowLeft, FaSave, FaCloudUploadAlt, FaTrash, FaVideo, FaTimes } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';

const MachineEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const quillRef = useRef(null);

  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  
  // State cho ẢNH
  const [images, setImages] = useState([]); // File mới (để upload)
  const [imagesPreview, setImagesPreview] = useState([]); // Preview ảnh mới
  const [oldImages, setOldImages] = useState([]); // Ảnh cũ từ DB (để giữ lại)

  // State cho VIDEO
  const [videoFiles, setVideoFiles] = useState([]); // File video mới
  const [oldVideos, setOldVideos] = useState([]); // Video cũ từ DB

  const [uploading, setUploading] = useState(false);

  const categories = [
    "Máy in Offset",
    "Máy gia công sau in", 
    "Máy in vải",
    "Máy in kỹ thuật số",
    "Máy cắt bế",
    "Máy ép nhiệt",
    "Máy ép kim",
    "Máy sấy băng tải",
    "Máy chụp bản in",
    "Máy Dán hộp",
    "Máy cán màn tự động",
    "Máy in Oval tự động",
    "Khác",
  ];

  // --- 1. XỬ LÝ ẢNH (MỚI & CŨ) ---
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagesPreview((old) => [...old, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => { // Xóa ảnh MỚI đang chọn
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagesPreview];
    newPreviews.splice(index, 1);
    setImagesPreview(newPreviews);
  };

  const removeOldImage = (index) => { // Xóa ảnh CŨ (đã có trên server)
    const newOldImages = [...oldImages];
    newOldImages.splice(index, 1);
    setOldImages(newOldImages);
  };

  // --- 2. XỬ LÝ VIDEO (MỚI & CŨ) ---
  const handleVideosChange = (e) => {
    const files = Array.from(e.target.files);
    setVideoFiles((prev) => [...prev, ...files]);
  };

  const removeVideo = (index) => { // Xóa video MỚI
    const newVideos = [...videoFiles];
    newVideos.splice(index, 1);
    setVideoFiles(newVideos);
  };

  const removeOldVideo = (index) => { // Xóa video CŨ
    const newOldVideos = [...oldVideos];
    newOldVideos.splice(index, 1);
    setOldVideos(newOldVideos);
  };

  // --- CẤU HÌNH EDITOR ---
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

  // --- LẤY DỮ LIỆU KHI EDIT ---
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
          setOldVideos(machine.videos || []); // Load video cũ nếu có

        } catch (err) { 
            toast.error('Lỗi tải dữ liệu máy'); 
        }
      };
      fetchMachine();
    }
  }, [id, isEditMode]);

  // --- SUBMIT FORM ---
  const submitHandler = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('description', description);

    // QUAN TRỌNG: Gửi danh sách ảnh/video cũ cần GIỮ LẠI
    formData.append('oldImages', JSON.stringify(oldImages));
    formData.append('oldVideos', JSON.stringify(oldVideos));

    // Append ảnh MỚI
    images.forEach((image) => {
      formData.append('images', image);
    });

    // Append video MỚI
    videoFiles.forEach((video) => {
        formData.append('videos', video);
    });

    try {
        const config = { headers: { "Content-Type": "multipart/form-data" } };

        if (isEditMode) {
            // Update (PUT)
            await axios.put(`/api/v1/admin/machine/${id}`, formData, config);
            toast.success('Cập nhật máy thành công!');
        } else {
            // Create (POST)
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên máy</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="VD: Máy in Offset Komori..." 
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                        <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)} 
                            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
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
                    <label className="block text-lg font-semibold text-gray-800 mb-2">Hình ảnh sản phẩm</label>
                    
                    {/* Nút chọn ảnh mới */}
                    <div className="mb-4">
                        <label className="cursor-pointer inline-flex items-center bg-white border border-dashed border-blue-400 text-blue-600 px-6 py-3 rounded hover:bg-blue-50 transition shadow-sm w-full justify-center">
                            <FaCloudUploadAlt className="mr-2 text-xl" /> 
                            <span className="font-semibold">Chọn thêm ảnh từ máy tính</span>
                            <input 
                                type="file" 
                                className="hidden" 
                                onChange={handleImagesChange} 
                                multiple 
                                accept="image/*"
                            />
                        </label>
                    </div>

                    {/* Preview Ảnh MỚI */}
                    {imagesPreview.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs text-blue-600 font-bold mb-2">Ảnh mới chọn:</p>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                {imagesPreview.map((img, index) => (
                                    <div key={index} className="relative group border rounded-lg overflow-hidden h-24 shadow-sm">
                                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition shadow"
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Danh sách Ảnh CŨ (Chỉ hiện khi Edit) */}
                    {isEditMode && oldImages.length > 0 && (
                        <div className="p-4 bg-gray-50 rounded border border-gray-200">
                            <p className="text-sm text-gray-700 font-bold mb-2">Ảnh hiện có trên server (Bấm X để xóa):</p>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                {oldImages.map((img, idx) => (
                                    <div key={idx} className="relative group h-24 w-full border rounded overflow-hidden shadow-sm">
                                        <img src={img.url} alt="Old" className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => removeOldImage(idx)}
                                            className="absolute top-0 right-0 bg-red-600 text-white w-6 h-6 flex items-center justify-center hover:bg-red-700 transition z-10"
                                            title="Xóa ảnh này"
                                        >
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
                        <input 
                            type="file" 
                            id="video-upload"
                            className="hidden"
                            accept="video/*"
                            multiple 
                            onChange={handleVideosChange}
                        />
                        <label htmlFor="video-upload" className="cursor-pointer bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition inline-flex items-center shadow-lg">
                             <FaVideo className="mr-2" /> Chọn Video (MP4, MOV)
                        </label>
                        <p className="text-xs text-gray-500 mt-3">Giữ phím Ctrl để chọn nhiều video. Khuyến nghị &lt; 50MB/file.</p>
                    </div>

                    {/* Video MỚI */}
                    {videoFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-xs text-blue-600 font-bold">Video mới chọn:</p>
                            {videoFiles.map((file, index) => (
                                <div key={index} className="flex justify-between items-center bg-blue-50 p-3 border border-blue-200 rounded-lg">
                                    <div className="flex items-center overflow-hidden">
                                        <FaVideo className="text-blue-500 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{file.name}</p>
                                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeVideo(index)} className="text-red-500 hover:text-red-700 p-2">
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Video CŨ */}
                    {isEditMode && oldVideos.length > 0 && (
                         <div className="mt-4 space-y-2">
                            <p className="text-xs text-gray-700 font-bold">Video hiện có trên server:</p>
                            {oldVideos.map((vid, index) => (
                                <div key={index} className="flex justify-between items-center bg-white p-3 border rounded-lg shadow-sm">
                                    <div className="flex items-center overflow-hidden">
                                        <div className="bg-green-100 text-green-600 p-2 rounded-full mr-3">
                                            <FaVideo />
                                        </div>
                                        <a href={vid.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate max-w-xs">
                                            Xem video hiện tại (Link)
                                        </a>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => removeOldVideo(index)}
                                        className="text-gray-400 hover:text-red-500 transition px-3 py-1 border rounded hover:bg-red-50"
                                    >
                                        Xóa bỏ
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mô tả chi tiết */}
                <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                    <div className="bg-white">
                        <ReactQuill 
                            ref={quillRef}
                            theme="snow" 
                            modules={modules} 
                            value={description} 
                            onChange={setDescription} 
                            className="h-64 mb-12"
                        />
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
                                {isEditMode ? 'Đang cập nhật...' : 'Đang thêm mới...'}
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