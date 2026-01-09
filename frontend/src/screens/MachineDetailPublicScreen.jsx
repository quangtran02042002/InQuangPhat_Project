import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const MachineDetailPublicScreen = () => {
  const { id } = useParams();
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMachine = async () => {
      try {
        const { data } = await axios.get(`/api/v1/machines/${id}`);
        setMachine(data.machine);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchMachine();
  }, [id]);

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (!machine) return <div className="text-center py-20">Không tìm thấy máy.</div>;

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-gray-100 py-4 border-b">
        <div className="container mx-auto px-4 max-w-5xl">
            <Link to="/infrastructure" className="text-gray-500 hover:text-blue-600 flex items-center">
                <FaArrowLeft className="mr-2" /> Quay lại danh sách
            </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 max-w-5xl">
        {/* Header bài viết */}
        <div className="mb-8">
            <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">
                {machine.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
                {machine.name}
            </h1>
            <div className="w-20 h-1 bg-blue-600"></div>
        </div>

        {/* 1. KHU VỰC VIDEO (Ưu tiên hiển thị to nhất) */}
        {machine.videos && machine.videos.length > 0 && (
            <div className="mb-10">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2" /> Video vận hành thực tế
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {machine.videos.map((vid, index) => (
                        <div key={index} className="bg-black rounded-lg overflow-hidden shadow-lg">
                            <video controls className="w-full h-auto aspect-video">
                                <source src={vid.url} type="video/mp4" />
                                Trình duyệt của bạn không hỗ trợ thẻ video.
                            </video>
                            <p className="text-white text-sm p-2 text-center">Video #{index + 1}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* 2. NỘI DUNG BÀI VIẾT (Mô tả) */}
        <div className="prose prose-lg max-w-none text-gray-700 mb-10">
            {/* Sử dụng dangerouslySetInnerHTML để hiển thị nội dung từ ReactQuill */}
            <div dangerouslySetInnerHTML={{ __html: machine.description }}></div>
        </div>

        {/* 3. THƯ VIỆN ẢNH (Gallery cuối bài) */}
        {machine.images && machine.images.length > 0 && (
            <div className="border-t pt-10">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Hình ảnh chi tiết</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {machine.images.map((img, index) => (
                        <div key={index} className="rounded-lg overflow-hidden shadow hover:shadow-lg transition h-48 md:h-64 cursor-pointer">
                            <img 
                                src={img.url} 
                                alt={`Detail ${index}`} 
                                className="w-full h-full object-cover hover:scale-105 transition duration-500"
                            />
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
      
      {/* Call to Action cuối bài */}
      <div className="container mx-auto px-4 mt-16 max-w-3xl text-center">
        <div className="bg-blue-50 border border-blue-200 p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Bạn cần tư vấn in ấn trên thiết bị này?</h3>
            <p className="text-gray-600 mb-6">Liên hệ ngay với In Quang Phát để nhận báo giá tốt nhất.</p>
            <Link to="/contact" className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition shadow-lg">
                LIÊN HỆ BÁO GIÁ NGAY
            </Link>
        </div>
      </div>

    </div>
  );
};

export default MachineDetailPublicScreen;