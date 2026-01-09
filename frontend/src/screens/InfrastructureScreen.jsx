import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaMicrochip, FaArrowRight } from 'react-icons/fa';

const InfrastructureScreen = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const { data } = await axios.get('/api/v1/machines');
        setMachines(data.machines);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchMachines();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Banner giới thiệu */}
      <div className="bg-blue-900 text-white py-16 text-center">
        <h1 className="text-4xl font-bold uppercase mb-4">Hệ thống máy móc & Nhà xưởng</h1>
        <p className="text-blue-200 max-w-2xl mx-auto">
          In Quang Phát sở hữu dây chuyền khép kín hiện đại, đảm bảo chất lượng sắc nét và tiến độ nhanh nhất cho khách hàng.
        </p>
      </div>

      <div className="container mx-auto px-4 mt-12 max-w-6xl">
        {loading ? (
          <p className="text-center">Đang tải dữ liệu...</p>
        ) : (
          <div className="grid grid-cols-1 gap-10">
            {machines.map((machine, index) => (
              // Thiết kế dạng thẻ bài viết (Card Row)
              <div key={machine._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 border border-gray-100 flex flex-col md:flex-row">
                
                {/* Phần Ảnh (Chiếm 40-50%) */}
                <div className="md:w-5/12 h-64 md:h-auto relative overflow-hidden group">
                  {machine.images && machine.images.length > 0 ? (
                    <img 
                      src={machine.images[0].url} 
                      alt={machine.name} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      Chưa có ảnh
                    </div>
                  )}
                  <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 uppercase rounded-br-lg">
                    {machine.category}
                  </div>
                </div>

                {/* Phần Nội dung (Chiếm phần còn lại) */}
                <div className="p-8 md:w-7/12 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition">
                    <Link to={`/infrastructure/${machine._id}`}>{machine.name}</Link>
                  </h2>
                  
                  {/* Hiển thị 1 đoạn mô tả ngắn (bỏ thẻ html) */}
                  <div 
                    className="text-gray-600 mb-6 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: machine.description }}
                  ></div>

                  <Link 
                    to={`/infrastructure/${machine._id}`} 
                    className="inline-flex items-center text-blue-600 font-bold hover:text-blue-800 transition"
                  >
                    XEM CHI TIẾT CÔNG NGHỆ <FaArrowRight className="ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfrastructureScreen;