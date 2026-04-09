import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaHistory, FaSignOutAlt, FaEdit } from 'react-icons/fa';
import Meta from '../components/Meta';

const UserProfileScreen = () => { // <--- Đã đổi tên thành UserProfileScreen
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State lịch sử báo giá
  const [myQuotes, setMyQuotes] = useState([]);
  const [activeTab, setActiveTab] = useState('info'); // 'info' hoặc 'history'
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      setName(userInfo.name);
      setEmail(userInfo.email);
      if (activeTab === 'history') {
          fetchMyQuotes();
      }
    }
  }, [navigate, userInfo, activeTab]);

  const fetchMyQuotes = async () => {
      setLoadingQuotes(true);
      try {
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          // Lưu ý: Cần có API này ở backend để lấy báo giá của riêng user này
          // Nếu chưa có, bạn cần tạo route GET /api/quotes/myquotes ở backend
          const { data } = await axios.get('/api/quotes/myquotes', config); 
          setMyQuotes(data);
      } catch (error) {
          console.log("Chưa lấy được lịch sử báo giá");
      } finally {
          setLoadingQuotes(false);
      }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
    } else {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.put('/api/users/profile', { name, email, password }, config);
        
        localStorage.setItem('userInfo', JSON.stringify(data));
        toast.success('Cập nhật hồ sơ thành công!');
        setPassword('');
        setConfirmPassword('');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi cập nhật');
      }
    }
  };

  const logoutHandler = () => {
      localStorage.removeItem('userInfo');
      navigate('/login');
      toast.info('Đã đăng xuất');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans py-12">
      <Meta title="Hồ sơ cá nhân | In Quang Phát" />
      
      <div className="container mx-auto px-4">
        
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-[#111827]">Xin chào, {name}! 👋</h1>
                <p className="text-[#6B7280] mt-2">Quản lý thông tin cá nhân và lịch sử đặt hàng của bạn.</p>
            </div>
            <button 
                onClick={logoutHandler}
                className="flex items-center gap-2 bg-white border border-gray-200 text-red-600 px-5 py-2.5 rounded-xl hover:bg-red-50 transition shadow-sm font-bold"
            >
                <FaSignOutAlt /> Đăng xuất
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* CỘT TRÁI: MENU */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Thẻ User */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-[#E6F0ED]"></div>
                    <div className="relative z-10 mt-12">
                        <div className="w-24 h-24 mx-auto bg-white p-1 rounded-full shadow-sm border border-gray-100">
                            <div className="w-full h-full bg-[#E6F0ED] rounded-full flex items-center justify-center text-3xl font-extrabold text-[#006B4D] uppercase">
                                {name?.charAt(0)}
                            </div>
                        </div>
                        <h2 className="mt-4 text-xl font-extrabold text-[#111827]">{name}</h2>
                        <p className="text-[#6B7280] text-sm mt-1">{email}</p>
                        
                        <div className="mt-4 inline-block px-4 py-1.5 bg-[#F9FAFB] text-[#006B4D] text-xs font-bold rounded-full border border-gray-100 uppercase tracking-wider">
                            {userInfo?.isAdmin ? 'Quản trị viên' : 'Thành viên'}
                        </div>
                    </div>
                </div>

                {/* Menu Điều hướng */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button 
                        onClick={() => setActiveTab('info')}
                        className={`w-full flex items-center gap-3 px-6 py-4 text-left transition font-bold ${activeTab === 'info' ? 'bg-[#F9FAFB] text-[#006B4D] border-l-4 border-[#006B4D]' : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'}`}
                    >
                        <FaUser /> Thông tin tài khoản
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`w-full flex items-center gap-3 px-6 py-4 text-left transition font-bold ${activeTab === 'history' ? 'bg-[#F9FAFB] text-[#006B4D] border-l-4 border-[#006B4D]' : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'}`}
                    >
                        <FaHistory /> Lịch sử yêu cầu báo giá
                    </button>
                </div>
            </div>

            {/* CỘT PHẢI: NỘI DUNG */}
            <div className="lg:col-span-2">
                
                {/* TAB 1: CẬP NHẬT THÔNG TIN */}
                {activeTab === 'info' && (
                    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
                        <h3 className="text-xl font-extrabold text-[#111827] mb-8 flex items-center gap-3">
                            <FaEdit className="text-[#006B4D]"/> Cập nhật thông tin
                        </h3>
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-[#111827] mb-2">Họ và tên</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><FaUser /></div>
                                        <input 
                                            type="text" 
                                            className="w-full pl-11 pr-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006B4D] focus:border-[#006B4D] outline-none transition-all text-[#111827]"
                                            value={name} onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#111827] mb-2">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><FaEnvelope /></div>
                                        <input 
                                            type="email" disabled
                                            className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                            value={email}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <hr className="border-gray-100 my-4"/>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-[#111827] mb-2">Mật khẩu mới</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><FaLock /></div>
                                        <input 
                                            type="password" 
                                            className="w-full pl-11 pr-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006B4D] focus:border-[#006B4D] outline-none transition-all text-[#111827]"
                                            placeholder="••••••••"
                                            value={password} onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#111827] mb-2">Xác nhận mật khẩu</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><FaLock /></div>
                                        <input 
                                            type="password" 
                                            className="w-full pl-11 pr-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006B4D] focus:border-[#006B4D] outline-none transition-all text-[#111827]"
                                            placeholder="••••••••"
                                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button type="submit" className="bg-[#006B4D] hover:bg-[#00553d] text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm w-full md:w-auto">
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TAB 2: LỊCH SỬ BÁO GIÁ */}
                {activeTab === 'history' && (
                    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
                        <h3 className="text-xl font-extrabold text-[#111827] mb-8 flex items-center gap-3">
                            <FaHistory className="text-[#006B4D]"/> Lịch sử Báo giá
                        </h3>
                        
                        {loadingQuotes ? (
                            <div className="text-center py-16 flex flex-col items-center">
                                <div className="w-8 h-8 border-4 border-[#E6F0ED] border-t-[#006B4D] rounded-full animate-spin mb-4"></div>
                                <span className="text-[#6B7280] font-medium">Đang tải biểu mẫu...</span>
                            </div>
                        ) : myQuotes.length === 0 ? (
                            <div className="text-center py-16 bg-[#F9FAFB] rounded-2xl border border-dashed border-gray-200">
                                <p className="text-[#6B7280] mb-4">Bạn chưa gửi yêu cầu báo giá nào.</p>
                                <button onClick={() => navigate('/contact')} className="text-[#006B4D] font-bold hover:underline bg-[#E6F0ED] px-6 py-2 rounded-full inline-flex items-center">Gửi yêu cầu ngay</button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs uppercase tracking-wider text-[#6B7280] border-b border-gray-100">
                                            <th className="py-4 font-bold">Sản phẩm</th>
                                            <th className="py-4 font-bold">Ngày gửi</th>
                                            <th className="py-4 font-bold text-center">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-[#111827]">
                                        {myQuotes.map(quote => (
                                            <tr key={quote._id} className="border-b border-gray-50 hover:bg-[#F9FAFB] transition-colors">
                                                <td className="py-4 font-bold max-w-xs truncate" title={quote.productName}>{quote.productName}</td>
                                                <td className="py-4 text-[#6B7280] font-medium">{new Date(quote.createdAt).toLocaleDateString('vi-VN')}</td>
                                                <td className="py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap inline-flex ${
                                                        quote.status === 'New' ? 'bg-[#E6F0ED] text-[#006B4D]' :
                                                        quote.status === 'Contacted' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-[#111827]'
                                                    }`}>
                                                        {quote.status === 'New' ? 'Mới gửi' : 
                                                         quote.status === 'Contacted' ? 'Đang xử lý' : 'Hoàn thành'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileScreen; // <--- Export tên mới