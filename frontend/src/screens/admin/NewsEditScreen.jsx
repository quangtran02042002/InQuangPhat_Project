import React, { useState, useEffect, useMemo, useRef } from 'react'; 
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useImagePaste } from '../../hooks/useImagePaste';
import { FaArrowLeft, FaSave, FaCloudUploadAlt, FaNewspaper, FaImage, FaBars } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader'; // GỌI ADMIN HEADER

const NewsEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const quillRef = useRef(null); 

  // === STATE QUẢN LÝ SIDEBAR MOBILE ===
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(''); 
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);

  // === HOOK: DÁN ẢNH BÌA TỪ CLIPBOARD ===
  useImagePaste({
    onImageUploaded: (url) => {
      setImage(url);
    },
    enabled: true 
  });

  // --- HÀM UPLOAD ẢNH THUMBNAIL (Giữ nguyên) ---
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('images', file); 
    setUploading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post('/api/upload', formData, config);
      setImage(data[0]); 
      setUploading(false);
      toast.success('Upload ảnh bìa thành công!');
    } catch (error) {
      setUploading(false);
      toast.error('Lỗi upload ảnh bìa');
    }
  };

  // --- HÀM UPLOAD ẢNH VÀO QUILL (Giữ nguyên) ---
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('images', file); 

      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.post('/api/upload', formData, config);
        const imageUrl = data[0]; 

        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        quill.insertEmbed(range.index, 'image', imageUrl);
        
      } catch (error) {
        toast.error('Lỗi chèn ảnh vào bài viết');
        console.error(error);
      }
    };
  };

  // --- CẤU HÌNH MODULES CHO QUILL (Giữ nguyên) ---
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }], 
        ['link', 'image'], 
        ['clean']
      ],
      handlers: {
        image: imageHandler 
      }
    },
  }), []);

  // --- HÀM LẤY DỮ LIỆU KHI SỬA (Giữ nguyên) ---
  useEffect(() => {
    if (isEditMode) {
      const fetchNews = async () => {
        try {
          const { data } = await axios.get(`/api/news/${id}`);
          setTitle(data.title);
          setDescription(data.description);
          setImage(data.image);
          setContent(data.content);
        } catch (err) { toast.error('Lỗi tải dữ liệu'); }
      };
      fetchNews();
    }
  }, [id, isEditMode]);

  // --- HÀM SUBMIT (Giữ nguyên) ---
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!title || !description || !content || !image) return toast.warning('Vui lòng điền đầy đủ thông tin');
    
    const newsData = { title, description, image, content };
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    try {
      if (isEditMode) {
        await axios.put(`/api/news/${id}`, newsData, config);
        toast.success('Cập nhật bài viết thành công');
      } else {
        await axios.post('/api/news', newsData, config);
        toast.success('Đăng bài viết mới thành công');
      }
      navigate('/admin/newslist');
    } catch (error) {
      toast.error('Lỗi khi lưu bài viết');
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
        
        {/* ================= GỌI ADMIN HEADER ĐỒNG BỘ ================= */}
        <AdminHeader 
            title={isEditMode ? 'Chỉnh sửa Bài viết' : 'Viết bài mới'} 
            onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto">
                <Link to="/admin/newslist" className="inline-flex items-center text-sm font-bold text-[#6B7280] hover:text-[#006B4D] mb-6 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                    <FaArrowLeft className="mr-2" /> Quay lại danh sách bài viết
                </Link>
                
                <form onSubmit={submitHandler} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    
                    {/* Form Header */}
                    <div className="bg-[#E6F0ED] px-6 md:px-8 py-5 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#006B4D]/10">
                        <h1 className="text-xl md:text-2xl font-extrabold text-[#006B4D] flex items-center">
                            <FaNewspaper className="mr-3" /> {isEditMode ? 'Chỉnh sửa nội dung' : 'Tạo bài viết mới'}
                        </h1>
                        <button 
                            type="submit" 
                            disabled={uploading}
                            className="bg-[#006B4D] text-white hover:bg-[#00543c] font-bold py-2.5 px-6 rounded-xl shadow-md transition flex items-center justify-center sm:w-auto disabled:opacity-50 active:scale-95"
                        >
                            <FaSave className="mr-2" /> {isEditMode ? 'LƯU BÀI VIẾT' : 'ĐĂNG BÀI NGAY'}
                        </button>
                    </div>

                    <div className="p-6 md:p-8 space-y-6 md:space-y-8">
                        
                        {/* Tiêu đề & Sapo */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    className="w-full border border-gray-200 p-3 md:p-4 text-base md:text-lg rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-extrabold text-[#111827] shadow-sm transition" 
                                    placeholder="Nhập tiêu đề hấp dẫn..." 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Mô tả ngắn (Sapo) <span className="text-red-500">*</span></label>
                                <textarea 
                                    rows="3" 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    className="w-full border border-gray-200 p-3 md:p-3.5 text-sm md:text-base rounded-xl outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-medium text-[#111827] shadow-sm transition custom-scrollbar leading-relaxed" 
                                    placeholder="Đoạn giới thiệu tóm tắt hiện ở trang chủ (khoảng 2-3 câu)..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Ảnh Thumbnail */}
                        <div className="border-t border-gray-100 pt-6">
                            <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-3">Ảnh đại diện (Thumbnail) <span className="text-red-500">*</span></label>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#F9FAFB] border border-gray-200 p-4 md:p-5 rounded-2xl">
                                
                                <div className="w-full sm:w-48 h-32 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden shadow-inner shrink-0">
                                    {image ? (
                                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400">
                                            <FaImage className="text-3xl mb-1 opacity-50" />
                                            <span className="text-[10px] font-bold uppercase">Chưa có ảnh</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex flex-col flex-1 w-full gap-2">
                                    <p className="text-xs text-gray-500 leading-relaxed hidden sm:block">Ảnh hiển thị ngoài trang chủ. Kích thước khuyên dùng: Tỷ lệ 16:9 (Ví dụ 800x450px).</p>
                                    <label className="cursor-pointer w-full sm:w-auto bg-white border border-[#006B4D] text-[#006B4D] px-5 py-2.5 rounded-xl hover:bg-[#E6F0ED] font-bold flex items-center justify-center shadow-sm transition active:scale-95 mt-2">
                                        <FaCloudUploadAlt className="mr-2 text-lg" /> {uploading ? 'Đang tải lên...' : 'Chọn ảnh bìa mới (Hoặc ấn Ctrl+V)'}
                                        <input type="file" className="hidden" onChange={uploadFileHandler} accept="image/*" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Phần soạn thảo nội dung (ReactQuill) */}
                        <div className="border-t border-gray-100 pt-6">
                            <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-3">Nội dung chi tiết bài viết <span className="text-red-500">*</span></label>
                            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 focus-within:border-[#006B4D] focus-within:ring-1 focus-within:ring-[#006B4D] transition-all shadow-sm">
                                <ReactQuill 
                                    ref={quillRef} 
                                    theme="snow" 
                                    modules={modules} 
                                    value={content} 
                                    onChange={setContent} 
                                    className="h-80 md:h-[500px] mb-10 md:mb-12 custom-quill-editor" 
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
                                <FaSave className="mr-2" /> {isEditMode ? 'LƯU CẬP NHẬT BÀI VIẾT' : 'ĐĂNG BÀI VIẾT NGAY'}
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

export default NewsEditScreen;