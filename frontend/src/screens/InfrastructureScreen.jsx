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
    <div className="bg-[#F9FAFB] min-h-screen font-sans text-[#111827] pb-12">
      {/* Banner giới thiệu */}
      <div className="bg-white border-b border-gray-200 py-16 md:py-24 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E6F0ED] text-[#006B4D] uppercase tracking-widest mb-4">
              Cơ sở vật chất
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#111827] mb-4 tracking-tight">Hệ thống máy móc & Nhà xưởng</h1>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            In Quang Phát sở hữu dây chuyền khép kín hiện đại, đảm bảo chất lượng sắc nét và tiến độ nhanh nhất cho khách hàng.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-16 max-w-6xl">
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center">
             <div className="w-10 h-10 border-4 border-[#E6F0ED] border-t-[#006B4D] rounded-full animate-spin mb-4"></div>
             <p className="text-[#6B7280] font-medium">Đang tải dữ liệu thiết bị...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10">
            {machines.map((machine) => (
              <div key={machine._id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow">
                
                {/* Phần Ảnh (Chiếm 40-50%) */}
                <div className="md:w-5/12 h-64 md:h-auto relative overflow-hidden bg-gray-50 border-r border-gray-100 p-2">
                  <div className="w-full h-full rounded-xl overflow-hidden">
                      {machine.images && machine.images.length > 0 ? (
                        <img 
                          src={machine.images[0].url} 
                          alt={machine.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-medium">
                          Chưa có ảnh
                        </div>
                      )}
                  </div>
                  <div className="absolute top-4 left-4 bg-[#E6F0ED] text-[#006B4D] text-[10px] font-extrabold px-3 py-1.5 uppercase rounded-full tracking-widest border border-white shadow-sm">
                    {machine.category}
                  </div>
                </div>

                {/* Phần Nội dung (Chiếm phần còn lại) */}
                <div className="p-8 md:p-10 md:w-7/12 flex flex-col justify-center">
                  <h2 className="text-2xl font-extrabold text-[#111827] mb-4 hover:text-[#006B4D] transition-colors">
                    <Link to={`/infrastructure/${machine._id}`}>{machine.name}</Link>
                  </h2>
                  
                  {/* Hiển thị 1 đoạn mô tả ngắn (bỏ thẻ html) */}
                  <div 
                    className="text-[#6B7280] mb-8 line-clamp-3 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: machine.description }}
                  ></div>

                  <div>
                      <Link 
                        to={`/infrastructure/${machine._id}`} 
                        className="inline-flex items-center text-[#006B4D] font-bold hover:underline transition-colors text-sm uppercase tracking-wider"
                      >
                        XEM CHI TIẾT <FaArrowRight className="ml-2" />
                      </Link>
                  </div>
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