import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave, FaCloudUploadAlt, FaTimes, FaCogs, FaImage, FaBars } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';

const NewMachine = () => {
  const navigate = useNavigate();

  // === STATE QUẢN LÝ GIAO DIỆN MOBILE ===
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState('');
  const [images, setImages] = useState([]); // Chứa file dạng base64 để gửi đi
  const [imagesPreview, setImagesPreview] = useState([]); // Chứa link để hiển thị preview
  const [loading, setLoading] = useState(false);

  const categories = [
    "Máy in Offset",
    "Máy gia công sau in", 
    "Máy in vải",
    "Máy in kỹ thuật số",
    "Máy cắt bế",
    "Khác"
  ];

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [navigate]);

  // Xử lý khi Submit form
  const createMachineSubmitHandler = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.warning("Vui lòng nhập tên máy");
    if (!category) return toast.warning("Vui lòng chọn danh mục");
    if (images.length === 0) return toast.warning("Vui lòng tải lên ít nhất 1 ảnh");

    setLoading(true);

    const myForm = {
        name,
        category,
        description,
        video,
        images // Gửi mảng ảnh base64
    };

    try {
      // Dùng logic cũ của bạn: Gửi JSON chứa Base64
      const config = { 
          headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${userInfo?.token}`
          } 
      };
      
      await axios.post('/api/v1/admin/machine/new', myForm, config);
      
      toast.success('Thêm máy mới thành công!');
      navigate('/admin/machinelist');
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm máy");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi chọn ảnh
  const createMachineImagesChange = (e) => {
    const files = Array.from(e.target.files);

    setImages([]);
    setImagesPreview([]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagesPreview((old) => [...old, reader.result]);
          setImages((old) => [...old, reader.result]);
        }
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
            title="Thêm Máy Mới" 
            onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto">
                <Link to="/admin/machinelist" className="inline-flex items-center text-sm font-bold text-[#6B7280] hover:text-[#006B4D] mb-6 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                    <FaArrowLeft className="mr-2" /> Quay lại danh sách
                </Link>
                
                <form onSubmit={createMachineSubmitHandler} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    
                    {/* Form Header */}
                    <div className="bg-[#E6F0ED] px-6 md:px-8 py-5 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#006B4D]/10">
                        <h1 className="text-xl md:text-2xl font-extrabold text-[#006B4D] flex items-center">
                            <FaCogs className="mr-3" /> Thêm Thiết Bị Mới
                        </h1>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-[#006B4D] text-white hover:bg-[#00543c] font-bold py-2.5 px-6 rounded-xl shadow-md transition flex items-center justify-center sm:w-auto disabled:opacity-50 active:scale-95"
                        >
                            {loading ? 'Đang tải lên...' : <><FaSave className="mr-2" /> Tạo Máy Mới</>}
                        </button>
                    </div>

                    <div className="p-6 md:p-8 space-y-6 md:space-y-8">
                        
                        {/* Thông tin cơ bản */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Tên máy <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    required
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-bold text-[#111827] shadow-sm transition" 
                                    placeholder="Ví dụ: Máy in Offset 6 màu..." 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Danh mục <span className="text-red-500">*</span></label>
                                <select 
                                    required
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

                        {/* Video & Mô tả */}
                        <div className="space-y-5 border-t border-gray-100 pt-6">
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Link Video (Youtube / Drive)</label>
                                <input 
                                    type="text" 
                                    value={video} 
                                    onChange={(e) => setVideo(e.target.value)} 
                                    className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-medium text-[#111827] shadow-sm transition" 
                                    placeholder="https://youtube.com/watch?v=..." 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Mô tả ngắn gọn</label>
                                <textarea 
                                    rows="4"
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-medium text-[#111827] shadow-sm transition custom-scrollbar" 
                                    placeholder="Nhập mô tả về khả năng, tốc độ in, khổ in của máy..." 
                                ></textarea>
                            </div>
                        </div>

                        {/* --- KHU VỰC ẢNH (Dùng base64) --- */}
                        <div className="border-t border-gray-100 pt-6">
                            <label className="flex items-center text-base md:text-lg font-extrabold text-[#111827] mb-4">
                                <FaImage className="text-[#006B4D] mr-2"/> Hình ảnh thiết bị <span className="text-red-500 ml-1">*</span>
                            </label>
                            
                            <label className="cursor-pointer flex flex-col items-center justify-center bg-[#F9FAFB] border-2 border-dashed border-[#006B4D]/30 text-[#006B4D] px-6 py-6 md:py-8 rounded-2xl hover:bg-[#E6F0ED] hover:border-[#006B4D]/50 transition-all shadow-sm w-full group">
                                <FaCloudUploadAlt className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform" /> 
                                <span className="font-bold text-sm md:text-base">Click để chọn ảnh (Hỗ trợ JPG, PNG)</span>
                                <span className="text-xs text-gray-500 mt-1 font-medium">Bạn có thể chọn nhiều ảnh cùng lúc</span>
                                <input type="file" className="hidden" onChange={createMachineImagesChange} multiple accept="image/*" />
                            </label>

                            {/* Preview Ảnh */}
                            {imagesPreview.length > 0 && (
                                <div className="mt-5">
                                    <p className="text-xs font-bold text-[#006B4D] uppercase tracking-wider mb-3">Ảnh đã chọn ({imagesPreview.length}):</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
                                        {imagesPreview.map((img, index) => (
                                            <div key={index} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-200 shadow-sm">
                                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeImage(index)} 
                                                    className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                                                >
                                                    <FaTimes size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Nút Submit Dưới Cùng */}
                        <div className="pt-6 border-t border-gray-100">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`w-full text-white font-extrabold py-4 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center text-base md:text-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#006B4D] hover:bg-[#00543c]'}`}
                            >
                                {loading ? 'Đang xử lý tải lên...' : 'XÁC NHẬN THÊM MÁY'}
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

export default NewMachine;