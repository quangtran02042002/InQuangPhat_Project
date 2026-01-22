import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { FaMoneyBillWave, FaBox, FaUserPlus, FaChartPie, FaLightbulb, FaArrowRight } from 'react-icons/fa';

// Import các thành phần biểu đồ từ Recharts
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardScreen = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  const [stats, setStats] = useState({
    productCount: 0,
    userCount: 0,
    quoteCount: 0,
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  // Bảng màu hiện đại (Xanh, Vàng cam, Xanh lá, Đỏ)
  const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'];

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
        navigate('/login');
        return;
    }

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
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar /> 

      <div className="flex-1 p-8 overflow-y-auto">
        {/* HEADER */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Xin chào, {userInfo?.name}! 👋</h1>
            <p className="text-slate-500">Đây là tổng quan tình hình kinh doanh của hệ thống.</p>
        </div>
        
        {loading ? (
            <div className="text-center mt-20 text-blue-600 font-medium animate-pulse">Đang tải dữ liệu thống kê...</div>
        ) : (
            <>
                {/* 1. CÁC THẺ SỐ LIỆU (STATS CARDS) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                  {/* Thẻ Báo giá */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex items-center transition hover:shadow-lg hover:-translate-y-1 transform duration-200">
                      <div className="p-4 rounded-full bg-blue-50 text-blue-600 mr-5">
                        <FaMoneyBillWave className="text-2xl" />
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Yêu cầu báo giá</div>
                        <div className="text-3xl font-extrabold text-slate-800">{stats.quoteCount}</div>
                      </div>
                  </div>

                  {/* Thẻ Sản phẩm */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 flex items-center transition hover:shadow-lg hover:-translate-y-1 transform duration-200">
                      <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 mr-5">
                        <FaBox className="text-2xl" />
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Tổng mẫu in</div>
                        <div className="text-3xl font-extrabold text-slate-800">{stats.productCount}</div>
                      </div>
                  </div>

                  {/* Thẻ Thành viên */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100 flex items-center transition hover:shadow-lg hover:-translate-y-1 transform duration-200">
                      <div className="p-4 rounded-full bg-amber-50 text-amber-600 mr-5">
                        <FaUserPlus className="text-2xl" />
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Thành viên</div>
                        <div className="text-3xl font-extrabold text-slate-800">{stats.userCount}</div>
                      </div>
                  </div>
                </div>

                {/* 2. BIỂU ĐỒ & MẸO QUẢN TRỊ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* KHỐI BIỂU ĐỒ */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col h-[400px]">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center border-b pb-4">
                            <FaChartPie className="mr-2 text-blue-500" /> Tỷ lệ Trạng thái Báo giá
                        </h3>
                        <div className="flex-1 w-full min-h-0 flex justify-center items-center">
                            {/* KIỂM TRA DỮ LIỆU: Phải có data VÀ ít nhất 1 mục có giá trị > 0 */}
                            {stats.chartData && stats.chartData.length > 0 && stats.chartData.some(item => item.value > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70} // Biểu đồ rỗng ruột (Donut)
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {stats.chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            formatter={(value, name) => [`${value} yêu cầu`, name]}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                /* GIAO DIỆN KHI KHÔNG CÓ DỮ LIỆU (EMPTY STATE) */
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                    <div className="bg-slate-50 p-4 rounded-full mb-3">
                                        <FaChartPie size={40} className="text-slate-300"/>
                                    </div>
                                    <p className="font-medium text-slate-500">Chưa có dữ liệu báo giá.</p>
                                    <p className="text-xs text-slate-400 mt-1">Biểu đồ sẽ hiện khi có yêu cầu mới.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KHỐI MẸO QUẢN TRỊ (Shortcuts) */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl shadow-lg text-white flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <FaLightbulb className="text-yellow-400 mr-3" /> Mẹo Quản trị
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="bg-blue-500/20 p-2 rounded-lg mr-4 mt-1">
                                        <FaMoneyBillWave className="text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-blue-100 mb-1">Ưu tiên Báo giá Mới</h4>
                                        <p className="text-sm text-slate-300 leading-relaxed">Hãy kiểm tra mục <strong>Báo giá</strong> mỗi sáng. Khách hàng thường chốt đơn nhanh nếu được phản hồi trong vòng 30 phút.</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-emerald-500/20 p-2 rounded-lg mr-4 mt-1">
                                        <FaBox className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-emerald-100 mb-1">Cập nhật Sản phẩm</h4>
                                        <p className="text-sm text-slate-300 leading-relaxed">Hình ảnh thực tế từ xưởng luôn tạo độ tin cậy cao hơn ảnh thiết kế 3D. Hãy thường xuyên upload ảnh mới.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-slate-700">
                            <button 
                                onClick={() => navigate('/admin/quotes')}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition flex items-center justify-center group"
                            >
                                Đi đến Quản lý Báo giá <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
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