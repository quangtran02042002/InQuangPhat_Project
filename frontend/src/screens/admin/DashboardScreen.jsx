import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import { FaMoneyBillWave, FaBox, FaUserPlus, FaChartPie } from 'react-icons/fa';

// Import các thành phần vẽ biểu đồ từ Recharts
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardScreen = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  const [stats, setStats] = useState({
    productCount: 0,
    userCount: 0,
    quoteCount: 0,
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  // Màu sắc cho biểu đồ (Xanh dương, Vàng, Xanh lá, Cam)
  const COLORS = ['#0088FE', '#FFBB28', '#00C49F', '#FF8042'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/dashboard/stats', config);
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar /> 

      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Xin chào, {userInfo?.name}!</h1>
        <p className="text-gray-500 mb-8">Tổng quan tình hình kinh doanh của In Quang Phát.</p>
        
        {loading ? (
            <div className="text-blue-600 font-medium">Đang tải dữ liệu thống kê...</div>
        ) : (
            <>
                {/* 1. CÁC THẺ SỐ LIỆU (CARDS) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                  {/* Thẻ Báo giá */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center transition hover:shadow-md">
                      <div className="p-4 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <FaMoneyBillWave className="text-2xl" />
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs uppercase font-bold">Yêu cầu báo giá</div>
                        <div className="text-3xl font-bold text-gray-800">{stats.quoteCount}</div>
                      </div>
                  </div>

                  {/* Thẻ Sản phẩm */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center transition hover:shadow-md">
                      <div className="p-4 rounded-full bg-green-100 text-green-600 mr-4">
                        <FaBox className="text-2xl" />
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs uppercase font-bold">Tổng mẫu in</div>
                        <div className="text-3xl font-bold text-gray-800">{stats.productCount}</div>
                      </div>
                  </div>

                  {/* Thẻ User */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 flex items-center transition hover:shadow-md">
                      <div className="p-4 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                        <FaUserPlus className="text-2xl" />
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs uppercase font-bold">User đăng ký</div>
                        <div className="text-3xl font-bold text-gray-800">{stats.userCount}</div>
                      </div>
                  </div>
                </div>

                {/* 2. BIỂU ĐỒ & HƯỚNG DẪN */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* CỘT TRÁI: BIỂU ĐỒ TRÒN */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <FaChartPie className="mr-2 text-blue-600" /> Tỷ lệ trạng thái báo giá
                        </h3>
                        <div className="flex-1 min-h-[300px] flex justify-center items-center">
                            {stats.chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60} // Tạo biểu đồ rỗng ruột (Donut chart)
                                            outerRadius={90}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            label
                                        >
                                            {stats.chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-gray-400">
                                    <p className="mb-2">Chưa có dữ liệu báo giá nào.</p>
                                    <p className="text-sm">Hãy thử tạo vài yêu cầu báo giá để xem biểu đồ.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CỘT PHẢI: LỐI TẮT */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Lối tắt quản trị</h2>
                        <div className="space-y-4 text-gray-600">
                            <ul className="space-y-4">
                                <li className="flex items-start p-3 bg-gray-50 rounded-lg">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mr-3 mt-1">Ưu tiên</span>
                                    <span>Kiểm tra mục <strong>Quản lý Báo giá</strong> để gọi lại cho khách hàng mới.</span>
                                </li>
                                <li className="flex items-start p-3 bg-gray-50 rounded-lg">
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded mr-3 mt-1">Sản phẩm</span>
                                    <span>Thường xuyên cập nhật hình ảnh thực tế các mẫu in để tăng độ tin cậy.</span>
                                </li>
                                <li className="flex items-start p-3 bg-gray-50 rounded-lg">
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded mr-3 mt-1">Tài khoản</span>
                                    <span>Chỉ cấp quyền Admin cho nhân viên tin cậy.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default DashboardScreen;