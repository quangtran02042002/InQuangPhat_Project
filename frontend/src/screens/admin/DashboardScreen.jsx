import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader'; // GỌI COMPONENT VÀO ĐÂY
import { FaMoneyBillWave, FaBox, FaUserPlus, FaChartPie, FaLightbulb, FaArrowRight, FaChartBar, FaBars, FaFlask, FaExclamationTriangle } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardScreen = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  // === STATE SIDEBAR MOBILE ===
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [stats, setStats] = useState({
    productCount: 0,
    userCount: 0,
    quoteCount: 0,
    chartData: []
  });
  const [loading, setLoading] = useState(true);
  const [lowStockChemicals, setLowStockChemicals] = useState([]);

  const COLORS = ['#006B4D', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    if (!userInfo) {
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
    const fetchLowStock = async () => {
      try {
        const { data } = await axios.get('/api/chemicals');
        setLowStockChemicals(data.filter((c) => c.quantity <= c.minStock));
      } catch (e) {
        // silent fail
      }
    };
    fetchStats();
    fetchLowStock();
  }, [navigate]);

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
        
        {/* ================= GỌI ADMIN HEADER TẠI ĐÂY ================= */}
        <AdminHeader 
            title="Tổng quan hệ thống" 
            onMenuClick={() => setIsSidebarOpen(true)} 
        />

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
                
                <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-xl md:text-2xl shadow-sm shrink-0">
                        <FaChartBar />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Báo cáo & Thống kê</h2>
                        <p className="text-[#6B7280] text-xs md:text-sm mt-0.5 md:mt-1">Cập nhật tình hình hoạt động của xưởng in</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006B4D] mx-auto mb-4"></div>
                        <div className="text-[#6B7280] font-medium">Đang tải dữ liệu thống kê...</div>
                    </div>
                ) : (
                    <>
                        {/* 1. CÁC THẺ SỐ LIỆU */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center hover:border-[#006B4D]/30 hover:shadow-md transition-all group">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#E6F0ED] text-[#006B4D] flex items-center justify-center mr-4 md:mr-5 group-hover:scale-110 transition-transform">
                                    <FaMoneyBillWave className="text-xl md:text-2xl" />
                                </div>
                                <div>
                                    <div className="text-[#6B7280] text-[10px] md:text-xs uppercase font-bold tracking-wider mb-1">Yêu cầu báo giá</div>
                                    <div className="text-2xl md:text-3xl font-extrabold text-[#111827]">{stats.quoteCount}</div>
                                </div>
                            </div>

                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center hover:border-orange-300 hover:shadow-md transition-all group">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mr-4 md:mr-5 group-hover:scale-110 transition-transform">
                                    <FaBox className="text-xl md:text-2xl" />
                                </div>
                                <div>
                                    <div className="text-[#6B7280] text-[10px] md:text-xs uppercase font-bold tracking-wider mb-1">Tổng mẫu in</div>
                                    <div className="text-2xl md:text-3xl font-extrabold text-[#111827]">{stats.productCount}</div>
                                </div>
                            </div>

                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center hover:border-purple-300 hover:shadow-md transition-all group">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mr-4 md:mr-5 group-hover:scale-110 transition-transform">
                                    <FaUserPlus className="text-xl md:text-2xl" />
                                </div>
                                <div>
                                    <div className="text-[#6B7280] text-[10px] md:text-xs uppercase font-bold tracking-wider mb-1">Thành viên</div>
                                    <div className="text-2xl md:text-3xl font-extrabold text-[#111827]">{stats.userCount}</div>
                                </div>
                            </div>
                        </div>

                        {/* 2. LOW-STOCK WIDGET */}
                        {lowStockChemicals.length > 0 && (
                            <div className="mb-6 md:mb-8">
                                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white animate-pulse">
                                                <FaExclamationTriangle />
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-red-700 text-base">🚨 Kho Hóa Chất Cần Nhập</h3>
                                                <p className="text-red-500 text-xs font-medium">{lowStockChemicals.length} mặt hàng dưới ngưỡng an toàn</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate('/admin/chemicals')}
                                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition active:scale-95 shrink-0"
                                        >
                                            Xem kho <FaArrowRight className="text-[10px]" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {lowStockChemicals.slice(0, 6).map((c) => (
                                            <div
                                                key={c._id}
                                                onClick={() => navigate('/admin/chemicals')}
                                                className="bg-white rounded-xl border border-red-100 px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-red-300 hover:shadow-sm transition-all group"
                                            >
                                                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-400 shrink-0 group-hover:bg-red-100 transition">
                                                    <FaFlask className="text-sm" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-[#111827] text-sm truncate">{c.name}</div>
                                                    <div className="text-xs text-red-500 font-extrabold">
                                                        {c.quantity <= 0 ? '🔴 Hết hàng' : `⚠️ Còn ${c.quantity} ${c.unit}`}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {lowStockChemicals.length > 6 && (
                                            <div
                                                onClick={() => navigate('/admin/chemicals')}
                                                className="bg-red-50 rounded-xl border border-red-100 px-4 py-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-red-100 transition text-red-600 font-extrabold text-sm"
                                            >
                                                +{lowStockChemicals.length - 6} mặt hàng khác →
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. BIỂU ĐỒ & MẸO QUẢN TRỊ */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pb-20">
                            
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[350px] md:h-[400px]">
                                <h3 className="text-base md:text-lg font-bold text-[#111827] mb-6 flex items-center border-b border-gray-100 pb-4">
                                    <FaChartPie className="mr-2 text-[#006B4D]" /> Tỷ lệ Trạng thái Báo giá
                                </h3>
                                <div className="flex-1 w-full min-h-0 flex justify-center items-center">
                                    {stats.chartData && stats.chartData.length > 0 && stats.chartData.some(item => item.value > 0) ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.chartData}
                                                    cx="50%" cy="50%"
                                                    innerRadius={60} outerRadius={90}
                                                    paddingAngle={5} dataKey="value" stroke="none"
                                                >
                                                    {stats.chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                                                    formatter={(value, name) => [`${value} yêu cầu`, name]}
                                                />
                                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '500' }}/>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <div className="bg-gray-50 p-4 rounded-full mb-3 border border-gray-100">
                                                <FaChartPie size={32} className="text-gray-300"/>
                                            </div>
                                            <p className="font-bold text-[#111827]">Chưa có dữ liệu báo giá</p>
                                            <p className="text-xs text-gray-500 mt-1">Biểu đồ sẽ hiện khi có yêu cầu mới.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-[#111827] p-6 md:p-8 rounded-2xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#006B4D] opacity-20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#10B981] opacity-10 rounded-full blur-2xl -ml-5 -mb-5 pointer-events-none"></div>

                                <div className="relative z-10">
                                    <h2 className="text-xl md:text-2xl font-extrabold mb-6 flex items-center">
                                        <FaLightbulb className="text-yellow-400 mr-3 text-2xl" /> Mẹo Quản trị
                                    </h2>
                                    <div className="space-y-6">
                                        <div className="flex items-start">
                                            <div className="bg-[#006B4D] p-2.5 rounded-xl mr-4 shrink-0 shadow-sm">
                                                <FaMoneyBillWave className="text-white text-lg" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white mb-1">Ưu tiên Báo giá Mới</h4>
                                                <p className="text-xs md:text-sm text-gray-400 leading-relaxed">Hãy kiểm tra mục <strong className="text-gray-200">Báo giá</strong> mỗi sáng. Khách hàng thường chốt đơn nhanh nếu được phản hồi trong vòng 30 phút.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="bg-orange-500 p-2.5 rounded-xl mr-4 shrink-0 shadow-sm">
                                                <FaBox className="text-white text-lg" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white mb-1">Cập nhật Sản phẩm</h4>
                                                <p className="text-xs md:text-sm text-gray-400 leading-relaxed">Hình ảnh thực tế từ xưởng luôn tạo độ tin cậy cao hơn thiết kế 3D. Hãy thường xuyên upload ảnh mới.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-8 pt-6 border-t border-gray-800 relative z-10">
                                    <button 
                                        onClick={() => navigate('/admin/quotes')}
                                        className="w-full py-3 md:py-3.5 bg-[#006B4D] hover:bg-[#00543c] text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center group active:scale-95"
                                    >
                                        Đi đến Quản lý Báo giá <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Nút nổi Floating Mở Sidebar trên Mobile */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#006B4D] text-white rounded-full shadow-xl flex items-center justify-center z-30 hover:bg-[#00543c] transition-all active:scale-95"
            >
                <FaBars size={24} />
            </button>
        </main>
      </div>
    </div>
  );
};

export default DashboardScreen;