import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FaArrowLeft, FaSave, FaCloudUploadAlt, FaTrash, FaVideo, FaTimes, FaCogs, FaImage, FaBars } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
// 1. IMPORT VALIDATE
import { validateTextMixed } from '../../utils/validation';
import { useImagePaste } from '../../hooks/useImagePaste';

const MachineEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const quillRef = useRef(null);

  // === STATE QUẢN LÝ GIAO DIỆN MOBILE ===
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // === HOOK: DÁN ẢNH TỪ CLIPBOARD ===
  useImagePaste({
    onImageUploaded: (url) => {
      // Đã được upload API backend (Cloudinary), đóng vai trò như ảnh cũ:
      setOldImages((prev) => [...prev, { url }]);
    },
    enabled: true
  });

  const categories = [
    "Máy in Offset",
    "Máy gia công sau in", 
    "Máy in vải",
    "Máy in kỹ thuật số",
    "Máy cắt bế",
    "Khác"
  ];

  // --- XỬ LÝ ẢNH & VIDEO ---
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

    // 1. Validate Tên máy
    if (!validateTextMixed(name)) {
        toast.error('Tên máy không hợp lệ (cần ít nhất 2 ký tự)');
        return;
    }

    // 2. Validate Danh mục
    if (!category || category === "") {
        toast.error('Vui lòng chọn danh mục cho máy');
        return;
    }

    // 3. Validate Ảnh
    if (oldImages.length === 0 && images.length === 0) {
        toast.error('Vui lòng tải lên ít nhất 1 hình ảnh minh họa');
        return;
    }

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
            title={isEditMode ? 'Cập nhật Thông tin Máy' : 'Thêm Máy móc mới'} 
            onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-5xl mx-auto">
                <Link to="/admin/machinelist" className="inline-flex items-center text-sm font-bold text-[#6B7280] hover:text-[#006B4D] mb-6 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                    <FaArrowLeft className="mr-2" /> Quay lại danh sách máy
                </Link>
                
                <form onSubmit={submitHandler} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" encType="multipart/form-data">
                    
                    {/* Form Header */}
                    <div className="bg-[#E6F0ED] px-6 md:px-8 py-5 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#006B4D]/10">
                        <h1 className="text-xl md:text-2xl font-extrabold text-[#006B4D] flex items-center">
                            <FaCogs className="mr-3" /> {isEditMode ? 'Chỉnh sửa thông tin máy' : 'Thêm máy móc mới'}
                        </h1>
                        <button 
                            type="submit" 
                            disabled={uploading}
                            className="bg-[#006B4D] text-white hover:bg-[#00543c] font-bold py-2.5 px-6 rounded-xl shadow-md transition flex items-center justify-center sm:w-auto disabled:opacity-50 active:scale-95"
                        >
                            {uploading ? 'Đang lưu...' : <><FaSave className="mr-2" /> Lưu thông tin</>}
                        </button>
                    </div>

                    <div className="p-6 md:p-8 space-y-8 md:space-y-10">
                        
                        {/* Tên Máy & Danh Mục */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                            <div className="md:col-span-2 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <span className="w-1.5 h-5 bg-[#006B4D] rounded-full inline-block"></span>
                                <h3 className="text-base md:text-lg font-bold text-[#111827]">Thông tin cơ bản</h3>
                            </div>
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Tên máy <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-bold text-[#111827] shadow-sm transition" 
                                    placeholder="VD: Máy in Offset Komori..." 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Danh mục <span className="text-red-500">*</span></label>
                                <select 
                                    value={category} 
                                    onChange={(e) => setCategory(e.target.value)} 
                                    className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] bg-white font-medium text-[#111827] shadow-sm cursor-pointer transition"
                                >
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* --- KHU VỰC ẢNH --- */}
                        <div className="space-y-4 border-t border-gray-100 pt-6 md:pt-8">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center text-base md:text-lg font-extrabold text-[#111827]">
                                    <FaImage className="text-[#006B4D] mr-2"/> Hình ảnh minh họa <span className="text-red-500 ml-1">*</span>
                                </label>
                            </div>
                            
                            <label className="cursor-pointer flex flex-col items-center justify-center bg-[#F9FAFB] border-2 border-dashed border-[#006B4D]/30 text-[#006B4D] px-6 py-6 md:py-8 rounded-2xl hover:bg-[#E6F0ED] hover:border-[#006B4D]/50 transition-all shadow-sm w-full group">
                                <FaCloudUploadAlt className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform" /> 
                                <span className="font-bold text-sm md:text-base">Click để tải ảnh lên (Hoặc ấn Ctrl+V)</span>
                                <span className="text-xs text-gray-500 mt-1 font-medium">Hỗ trợ JPG, PNG. Có thể chọn nhiều ảnh cùng lúc</span>
                                <input type="file" className="hidden" onChange={handleImagesChange} multiple accept="image/*" />
                            </label>

                            {/* Preview Ảnh MỚI */}
                            {imagesPreview.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-xs font-bold text-[#006B4D] uppercase tracking-wider mb-3">Ảnh mới chọn:</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
                                        {imagesPreview.map((img, index) => (
                                            <div key={index} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-200 shadow-sm">
                                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => removeImage(index)} className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600">
                                                    <FaTimes size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Danh sách Ảnh CŨ */}
                            {isEditMode && oldImages.length > 0 && (
                                <div className="mt-6 p-4 md:p-5 bg-gray-50 rounded-2xl border border-gray-200">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Ảnh hiện có trên hệ thống:</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
                                        {oldImages.map((img, idx) => (
                                            <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-200 shadow-sm bg-white">
                                                <img src={img.url} alt="Old" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => removeOldImage(idx)} className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600">
                                                    <FaTimes size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- KHU VỰC VIDEO --- */}
                        <div className="space-y-4 border-t border-gray-100 pt-6 md:pt-8">
                            <label className="flex items-center text-base md:text-lg font-extrabold text-[#111827]">
                                <FaVideo className="text-orange-500 mr-2"/> Video thực tế
                            </label>
                            
                            <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center justify-center bg-orange-50 border-2 border-dashed border-orange-300 text-orange-600 px-6 py-6 md:py-8 rounded-2xl hover:bg-orange-100 transition-all shadow-sm w-full group">
                                <FaCloudUploadAlt className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform" /> 
                                <span className="font-bold text-sm md:text-base">Click để tải Video lên (MP4, MOV)</span>
                                <span className="text-xs text-orange-500/70 mt-1 font-medium">Tối đa 50MB/file</span>
                                <input type="file" id="video-upload" className="hidden" accept="video/*" multiple onChange={handleVideosChange} />
                            </label>

                            {/* Video MỚI */}
                            {videoFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Video mới chọn:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {videoFiles.map((file, index) => (
                                            <div key={index} className="flex justify-between items-center bg-white p-3 border border-orange-200 rounded-xl shadow-sm">
                                                <div className="flex items-center truncate pr-3">
                                                    <FaVideo className="text-orange-400 mr-2 shrink-0"/>
                                                    <span className="truncate text-sm font-medium text-[#111827]">{file.name}</span>
                                                </div>
                                                <button type="button" onClick={() => removeVideo(index)} className="text-red-400 hover:text-red-600 p-1.5 bg-red-50 rounded-lg transition-colors"><FaTrash size={12}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Video CŨ */}
                            {isEditMode && oldVideos.length > 0 && (
                                 <div className="mt-6 p-4 md:p-5 bg-gray-50 rounded-2xl border border-gray-200">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Video hiện có:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {oldVideos.map((vid, index) => (
                                            <div key={index} className="flex justify-between items-center bg-white p-3 border border-gray-200 rounded-xl shadow-sm">
                                                <a href={vid.url} target="_blank" rel="noreferrer" className="flex items-center truncate pr-3 text-sm text-[#006B4D] hover:underline font-bold">
                                                    <FaVideo className="mr-2 shrink-0"/> Xem video hiện tại
                                                </a>
                                                <button type="button" onClick={() => removeOldVideo(index)} className="text-red-400 hover:text-red-600 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors">Xóa bỏ</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mô tả chi tiết (ReactQuill) */}
                        <div className="border-t border-gray-100 pt-6 md:pt-8">
                            <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-3">Bài viết Mô tả chi tiết</label>
                            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 focus-within:border-[#006B4D] focus-within:ring-1 focus-within:ring-[#006B4D] transition-all">
                                <ReactQuill 
                                    ref={quillRef} 
                                    theme="snow" 
                                    modules={modules} 
                                    value={description} 
                                    onChange={setDescription} 
                                    className="h-64 mb-10 md:mb-12" // Tránh việc toolbar che mất text bên dưới
                                />
                            </div>
                        </div>

                        {/* Nút Submit Dưới Cùng */}
                        <div className="pt-8 border-t border-gray-100">
                            <button 
                                type="submit" 
                                disabled={uploading}
                                className={`w-full text-white font-extrabold py-4 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center text-base md:text-lg ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#006B4D] hover:bg-[#00543c]'}`}
                            >
                                {uploading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý tải lên...
                                    </span>
                                ) : (
                                    <>
                                        <FaSave className="mr-2" /> {isEditMode ? 'LƯU CẬP NHẬT THÔNG TIN' : 'XÁC NHẬN THÊM MÁY MỚI'}
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </form>
            </div>
        </main>
      </div>
    </div>
  );
};

export default MachineEditScreen;