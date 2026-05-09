import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { 
  FaCalendarAlt, FaShareAlt, FaTag, FaPhoneAlt, FaArrowRight, FaCogs, 
  FaPlay, FaImage, FaExpand, FaTimes, FaHome 
} from 'react-icons/fa';
import dayjs from 'dayjs';

const MachineDetailPublicScreen = () => {
  const { id } = useParams();
  
  // --- STATE DỮ LIỆU ---
  const [machine, setMachine] = useState(null);
  const [relatedMachines, setRelatedMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE GIAO DIỆN MEDIA ---
  const [activeTab, setActiveTab] = useState('image'); // 'image' hoặc 'video'
  const [selectedImage, setSelectedImage] = useState(''); // Ảnh đang hiện ở khung lớn
  const [lightboxOpen, setLightboxOpen] = useState(false); // Trạng thái mở popup phóng to

  const publishDate = dayjs().format('DD/MM/YYYY'); 

  useEffect(() => {
    const fetchMachine = async () => {
      try {
        const { data } = await axios.get(`/api/v1/machines/${id}`);
        setMachine(data.machine);
        
        // Mặc định chọn ảnh đầu tiên làm ảnh chính
        if (data.machine.images && data.machine.images.length > 0) {
            setSelectedImage(data.machine.images[0].url);
        }

        // Lấy máy liên quan
        const { data: allData } = await axios.get('/api/v1/machines');
        const related = allData.machines
            .filter(m => m._id !== id)
            .slice(0, 5);
        setRelatedMachines(related);

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchMachine();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="h-screen flex justify-center items-center text-gray-500">Đang tải dữ liệu...</div>;
  if (!machine) return <div className="h-screen flex justify-center items-center text-red-500">Không tìm thấy nội dung.</div>;

  // Xử lý chuyển tab
  const handleThumbnailClick = (imgUrl) => {
      setActiveTab('image');
      setSelectedImage(imgUrl);
  };

  const handleVideoClick = () => {
      setActiveTab('video');
  };

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800 relative">
      
      {/* 1. BREADCRUMB */}
      <div className="bg-white border-b border-gray-100 py-4 text-sm font-sans">
        <div className="container mx-auto px-4 max-w-6xl flex items-center text-[#6B7280]">
            <Link to="/" className="hover:text-[#006B4D] font-bold flex items-center transition-colors"><FaHome className="mr-2"/> Trang chủ</Link>
            <span className="mx-3 opacity-50">/</span>
            <Link to="/infrastructure" className="hover:text-[#006B4D] font-bold transition-colors">Năng lực sản xuất</Link>
            <span className="mx-3 opacity-50">/</span>
            <span className="text-[#111827] font-bold truncate max-w-xs">{machine.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl mt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* === CỘT TRÁI: NỘI DUNG CHÍNH (Chiếm 8 phần) === */}
            <div className="lg:col-span-8">
                
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#111827] tracking-tight leading-tight mb-6">
                    {machine.name}
                </h1>

                <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
                    <div className="flex items-center text-sm font-bold text-[#6B7280]">
                        <span className="flex items-center mr-5"><FaCalendarAlt className="mr-2 text-[#006B4D]" /> {publishDate}</span>
                        <span className="flex items-center bg-[#E6F0ED] text-[#006B4D] px-3 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-widest border border-[#006B4D]/10"><FaTag className="mr-2" /> {machine.category}</span>
                    </div>
                </div>

                {/* --- KHU VỰC MEDIA VIEWER (QUAN TRỌNG) --- */}
                <div className="mb-8 select-none">
                    
                    {/* KHUNG HIỂN THỊ LỚN */}
                    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg group border border-gray-200">
                        
                        {/* TRƯỜNG HỢP 1: ĐANG XEM ẢNH */}
                        {activeTab === 'image' && (
                            <>
                                <img 
                                    src={selectedImage} 
                                    alt="Main View" 
                                    className="w-full h-full object-contain cursor-zoom-in transition-transform duration-500" 
                                    onClick={() => setLightboxOpen(true)} // Bấm vào để mở Lightbox
                                />
                                {/* Nút phóng to ở góc */}
                                <button 
                                    onClick={() => setLightboxOpen(true)}
                                    className="absolute bottom-4 right-4 bg-white/90 text-gray-800 p-2 rounded-full shadow hover:bg-white hover:text-blue-600 transition opacity-0 group-hover:opacity-100"
                                    title="Phóng to ảnh"
                                >
                                    <FaExpand size={18} />
                                </button>
                            </>
                        )}

                        {/* TRƯỜNG HỢP 2: ĐANG XEM VIDEO */}
                        {activeTab === 'video' && machine.videos && machine.videos.length > 0 && (
                            <video controls className="w-full h-full" autoPlay>
                                <source src={machine.videos[0].url} type="video/mp4" />
                                Trình duyệt không hỗ trợ thẻ video.
                            </video>
                        )}

                        {/* Nếu chọn Video mà không có video */}
                        {activeTab === 'video' && (!machine.videos || machine.videos.length === 0) && (
                            <div className="w-full h-full flex items-center justify-center text-white flex-col">
                                <FaPlay className="text-4xl mb-2 opacity-50" />
                                <p>Video đang cập nhật...</p>
                            </div>
                        )}
                    </div>

                    {/* DANH SÁCH THUMBNAILS (BÊN DƯỚI) */}
                    <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                        
                        {/* 1. Nút Video (Nếu có) */}
                        {machine.videos && machine.videos.length > 0 && (
                            <button 
                                onClick={handleVideoClick}
                                className={`relative w-24 h-16 flex-shrink-0 rounded-lg border-2 overflow-hidden bg-gray-900 flex items-center justify-center group transition-all ${activeTab === 'video' ? 'border-[#006B4D] ring-2 ring-[#006B4D]/30' : 'border-transparent opacity-70 hover:opacity-100'}`}
                            >
                                <FaPlay className="text-white text-xl drop-shadow-md group-hover:scale-110 transition" />
                                <span className="absolute bottom-1 text-[10px] text-white font-bold bg-black/50 px-1.5 rounded">VIDEO</span>
                            </button>
                        )}

                        {/* 2. List Ảnh */}
                        {machine.images && machine.images.map((img, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleThumbnailClick(img.url)}
                                className={`relative w-24 h-16 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all ${activeTab === 'image' && selectedImage === img.url ? 'border-[#006B4D] ring-2 ring-[#006B4D]/30' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img src={img.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                            </button>
                        ))}

                    </div>
                </div>

                {/* Sapo */}
                <div className="text-lg font-medium text-[#111827] leading-relaxed italic mb-8 border-l-4 border-[#006B4D] pl-6 py-2">
                    Hệ thống {machine.name} tại In Quang Phát được đầu tư đồng bộ, giúp tối ưu hóa quy trình sản xuất và đảm bảo chất lượng bản in sắc nét nhất.
                </div>

                {/* NỘI DUNG CHI TIẾT */}
                <article className="prose prose-lg prose-[#006B4D] max-w-none text-[#111827] leading-relaxed break-words">
                    <div dangerouslySetInnerHTML={{ __html: machine.description }}></div>
                </article>

            </div>

            {/* === CỘT PHẢI: SIDEBAR === */}
            <div className="lg:col-span-4 space-y-8">
                
                {/* Widget Liên hệ Sticky */}
                <div className="bg-[#F9FAFB] p-8 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
                    <h3 className="text-xl font-extrabold text-[#111827] mb-3 text-center uppercase tracking-wide">Tư vấn kỹ thuật</h3>
                    <p className="text-[#6B7280] text-center mb-8">Liên hệ để nhận thông số chi tiết & báo giá in ấn</p>
                    
                    <a href="tel:0903597686" className="block w-full bg-[#006B4D] hover:bg-[#00553d] text-white text-center font-bold py-4 rounded-xl transition-colors shadow-sm mb-2 flex items-center justify-center">
                        <FaPhoneAlt className="mr-3" /> 0903.597.686
                    </a>
                </div>

                {/* Widget Máy liên quan */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-extrabold text-[#111827] mb-6 uppercase tracking-wider">
                        Công nghệ khác
                    </h3>
                    <div className="flex flex-col gap-5">
                        {relatedMachines.map((item) => (
                            <Link key={item._id} to={`/infrastructure/${item._id}`} className="group flex items-center gap-4 bg-white rounded flex-shrink-0">
                                <div className="w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[#F9FAFB] border border-gray-100 relative">
                                    {item.images && item.images[0] ? (
                                        <img src={item.images[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.name} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><FaCogs className="text-[#6B7280]"/></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-[#111827] group-hover:text-[#006B4D] transition-colors line-clamp-2 leading-snug truncate">
                                        {item.name}
                                    </h4>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </div>

      {/* --- LIGHTBOX (MODAL PHÓNG TO ẢNH) --- */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            {/* Nút đóng */}
            <button 
                onClick={() => setLightboxOpen(false)}
                className="absolute top-5 right-5 text-white bg-gray-800/50 hover:bg-red-600 p-3 rounded-full transition z-50"
            >
                <FaTimes size={24} />
            </button>

            {/* Ảnh lớn */}
            <img 
                src={selectedImage} 
                alt="Full View" 
                className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl" 
            />
            
            <p className="absolute bottom-5 text-white/70 text-sm">Nhấn phím ESC hoặc bấm ra ngoài để đóng</p>
            {/* Click ra ngoài để đóng */}
            <div className="absolute inset-0 -z-10" onClick={() => setLightboxOpen(false)}></div>
        </div>
      )}

    </div>
  );
};

export default MachineDetailPublicScreen; 