import React, { useState, useEffect, useMemo, useRef } from 'react'; // Import thêm useMemo, useRef
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
// Dùng thư viện mới
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FaArrowLeft, FaSave, FaCloudUploadAlt } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
const NewsEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const quillRef = useRef(null); // Ref để truy cập vào ReactQuill editor

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(''); // Ảnh thumbnail (1 ảnh)
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);

  // --- HÀM UPLOAD ẢNH THUMBNAIL (Giữ nguyên) ---
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('images', file); // Gửi key 'images' để khớp với Backend
    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('/api/upload', formData, config);
      setImage(data[0]); // Backend trả về mảng ['link'], lấy phần tử đầu
      setUploading(false);
      toast.success('Upload ảnh bìa thành công!');
    } catch (error) {
      setUploading(false);
      toast.error('Lỗi upload ảnh bìa');
    }
  };

  // --- CODE MỚI: XỬ LÝ CHÈN ẢNH VÀO NỘI DUNG BÀI VIẾT ---
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('images', file); // Gửi key 'images'

      try {
        // 1. Upload lên Cloudinary
        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
        const { data } = await axios.post('/api/upload', formData, config);
        const imageUrl = data[0]; // Lấy link ảnh

        // 2. Chèn link ảnh vào vị trí con trỏ trong editor
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        quill.insertEmbed(range.index, 'image', imageUrl);
        
      } catch (error) {
        toast.error('Lỗi chèn ảnh vào bài viết');
        console.error(error);
      }
    };
  };

  // --- CẤU HÌNH MODULES CHO QUILL (Dùng useMemo để không bị render lại) ---
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }], // Thêm chọn màu
        ['link', 'image'], // <-- Thêm nút 'image' vào đây
        ['clean']
      ],
      handlers: {
        image: imageHandler // Gán hàm xử lý custom cho nút image
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
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <Link to="/admin/newslist" className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition">
          <FaArrowLeft className="mr-2" /> Quay lại danh sách
        </Link>
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 uppercase border-b pb-4">{isEditMode ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h1>
            <form onSubmit={submitHandler} className="space-y-6">
                {/* Các trường Tiêu đề, Mô tả ngắn giữ nguyên */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài viết</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg" placeholder="Nhập tiêu đề hấp dẫn..." />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn (Sapo)</label>
                    <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Đoạn giới thiệu ngắn gọn hiện ở trang chủ..."></textarea>
                </div>

                {/* Phần Upload ảnh Thumbnail giữ nguyên */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện (Thumbnail - Chỉ 1 ảnh)</label>
                    <div className="flex items-center gap-4 border p-4 rounded bg-gray-50">
                        {image ? <img src={image} alt="Preview" className="h-24 w-36 object-cover rounded shadow" /> : <div className="h-24 w-36 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">Chưa có ảnh</div>}
                        <label className="cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 flex items-center shadow-sm transition">
                            <FaCloudUploadAlt className="mr-2 text-blue-600" /> {uploading ? 'Đang tải...' : 'Chọn ảnh bìa'}
                            <input type="file" className="hidden" onChange={uploadFileHandler} />
                        </label>
                    </div>
                </div>

                {/* Phần soạn thảo nội dung có thay đổi */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung chi tiết (Có thể chèn nhiều ảnh)</label>
                    <div className="bg-white">
                        <ReactQuill 
                            ref={quillRef} // Gán ref
                            theme="snow" 
                            modules={modules} // Sử dụng modules đã cấu hình
                            value={content} 
                            onChange={setContent} 
                            className="h-96 mb-12" // Tăng chiều cao lên chút
                        />
                    </div>
                </div>

                <div className="pt-8">
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded shadow-lg transition flex justify-center items-center">
                        <FaSave className="mr-2" /> {isEditMode ? 'LƯU CẬP NHẬT' : 'ĐĂNG BÀI NGAY'}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default NewsEditScreen;