import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaEye, FaShareAlt, FaTag, FaPhoneAlt, FaArrowRight, FaCogs } from 'react-icons/fa';
import dayjs from 'dayjs'; // Cần cài: npm install dayjs (hoặc dùng new Date().toLocaleDateString)

const MachineDetailPublicScreen = () => {
  const { id } = useParams();
  const [machine, setMachine] = useState(null);
  const [relatedMachines, setRelatedMachines] = useState([]); // Máy liên quan
  const [loading, setLoading] = useState(true);

  // Giả lập ngày đăng (Vì model máy chưa có field createdAt, nếu có thì dùng machine.createdAt)
  const publishDate = dayjs().format('DD/MM/YYYY'); 

  useEffect(() => {
    const fetchMachine = async () => {
      try {
        const { data } = await axios.get(`/api/v1/machines/${id}`);
        setMachine(data.machine);
        
        // Gọi thêm API lấy danh sách máy để làm Sidebar "Máy liên quan"
        // (Trong thực tế nên có API getRelatedMachines riêng)
        const { data: allData } = await axios.get('/api/v1/machines');
        const related = allData.machines
            .filter(m => m._id !== id) // Trừ máy đang xem
            .slice(0, 5); // Lấy 5 máy
        setRelatedMachines(related);

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchMachine();
    // Scroll lên đầu khi chuyển trang
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="h-screen flex justify-center items-center text-gray-500">Đang tải dữ liệu...</div>;
  if (!machine) return <div className="h-screen flex justify-center items-center text-red-500">Không tìm thấy nội dung.</div>;

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800">
      
      {/* 1. BREADCRUMB (Điều hướng) */}
      <div className="bg-gray-50 border-b border-gray-100 py-3 text-sm">
        <div className="container mx-auto px-4 max-w-6xl flex items-center text-gray-500">
            <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
            <span className="mx-2">/</span>
            <Link to="/infrastructure" className="hover:text-blue-600">Năng lực sản xuất</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium truncate max-w-xs">{machine.category}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl mt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* === CỘT TRÁI: NỘI DUNG CHÍNH (Chiếm 8 phần) === */}
            <div className="lg:col-span-8">
                
                {/* Tiêu đề lớn (Chuẩn báo chí) */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                    {machine.name}
                </h1>

                {/* Meta Data (Ngày đăng, Nút share) */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="flex items-center mr-4"><FaCalendarAlt className="mr-2" /> {publishDate}</span>
                        <span className="flex items-center"><FaTag className="mr-2" /> {machine.category}</span>
                    </div>
                    <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 px-3 py-1 rounded-full transition">
                        <FaShareAlt className="mr-2" /> Chia sẻ
                    </button>
                </div>

                {/* Sapo (Mô tả ngắn - In đậm) */}
                {/* Vì data của bạn chỉ có description (HTML), ta sẽ hiển thị 1 đoạn text static hoặc trích xuất nếu muốn */}
                <div className="text-lg md:text-xl font-semibold text-gray-700 italic mb-8 border-l-4 border-blue-600 pl-4 bg-gray-50 py-2 rounded-r">
                    Hệ thống máy {machine.name} hiện đại tại Xưởng In Quang Phát đảm bảo công suất lớn, chất lượng in sắc nét và tiến độ nhanh nhất cho khách hàng.
                </div>

                {/* KHU VỰC VIDEO (Nếu có) - Đặt lên đầu để thu hút */}
                {machine.videos && machine.videos.length > 0 && (
                    <div className="mb-8">
                        {machine.videos.map((vid, index) => (
                            <div key={index} className="mb-4 rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-black">
                                <video controls className="w-full h-auto aspect-video">
                                    <source src={vid.url} type="video/mp4" />
                                    Trình duyệt của bạn không hỗ trợ thẻ video.
                                </video>
                                <p className="text-white text-xs p-2 text-center bg-gray-900">
                                    Video vận hành: {machine.name}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* NỘI DUNG CHI TIẾT (Rich Text) */}
                {/* Class 'prose' của Tailwind Typography sẽ tự động style các thẻ h1, h2, p, ul, img bên trong */}
                <article className="prose prose-lg prose-blue max-w-none text-gray-800 leading-loose">
                    <div dangerouslySetInnerHTML={{ __html: machine.description }}></div>
                </article>

                {/* Gallery Ảnh (Cuối bài) */}
                {machine.images && machine.images.length > 0 && (
                    <div className="mt-10 pt-8 border-t">
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                            <FaEye className="mr-2 text-blue-600" /> Hình ảnh thực tế
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {machine.images.map((img, idx) => (
                                <img 
                                    key={idx} 
                                    src={img.url} 
                                    alt={`Detail ${idx}`} 
                                    className="rounded-lg shadow hover:opacity-90 transition cursor-pointer object-cover h-32 w-full"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* === CỘT PHẢI: SIDEBAR (Chiếm 4 phần) === */}
            <div className="lg:col-span-4 space-y-8">
                
                {/* Widget 1: Liên hệ nhanh (Sticky) */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Cần tư vấn máy này?</h3>
                    <p className="text-sm text-blue-700 mb-4">Liên hệ ngay để nhận báo giá in ấn tốt nhất trên thị trường.</p>
                    <a href="tel:0935110639" className="block w-full bg-red-600 hover:bg-red-700 text-white text-center font-bold py-3 rounded-lg transition shadow-md animate-pulse">
                        <FaPhoneAlt className="inline mr-2" /> 0935.110.639
                    </a>
                </div>

                {/* Widget 2: Máy móc liên quan (Sidebar News) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 uppercase tracking-wide">
                        Công nghệ khác
                    </h3>
                    <div className="flex flex-col gap-4">
                        {relatedMachines.map((item) => (
                            <Link key={item._id} to={`/infrastructure/${item._id}`} className="group flex items-start gap-3">
                                {/* Ảnh thumbnail nhỏ */}
                                <div className="w-20 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                    {item.images && item.images[0] ? (
                                        <img src={item.images[0].url} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" alt={item.name} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><FaCogs /></div>
                                    )}
                                </div>
                                {/* Tiêu đề */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 line-clamp-2 transition leading-snug">
                                        {item.name}
                                    </h4>
                                    <span className="text-xs text-gray-500 mt-1 block">{item.category}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t text-center">
                        <Link to="/infrastructure" className="text-sm text-blue-600 font-bold hover:underline inline-flex items-center">
                            Xem tất cả máy móc <FaArrowRight className="ml-1" />
                        </Link>
                    </div>
                </div>

                {/* Widget 3: Banner Quảng cáo (Giả lập) */}
                <div className="rounded-xl overflow-hidden shadow-md">
                     <img src="https://via.placeholder.com/400x300/1e3a8a/ffffff?text=IN+NHANH+GIA+RE" alt="Ads" className="w-full h-auto" />
                </div>

            </div>

        </div>
      </div>
    </div>
  );
};

export default MachineDetailPublicScreen;