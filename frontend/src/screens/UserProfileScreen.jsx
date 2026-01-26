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
    <div className="min-h-screen bg-gray-50 py-12">
      <Meta title="Hồ sơ cá nhân | In Quang Phát" />
      
      <div className="container mx-auto px-4">
        
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Xin chào, {name}! 👋</h1>
                <p className="text-gray-500">Quản lý thông tin cá nhân và lịch sử đặt hàng của bạn.</p>
            </div>
            <button 
                onClick={logoutHandler}
                className="flex items-center gap-2 bg-white border border-red-100 text-red-600 px-5 py-2.5 rounded-xl hover:bg-red-50 transition shadow-sm font-medium"
            >
                <FaSignOutAlt /> Đăng xuất
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* CỘT TRÁI: MENU */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Thẻ User */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                    <div className="relative z-10 mt-12">
                        <div className="w-24 h-24 mx-auto bg-white p-1 rounded-full shadow-lg">
                            <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600 uppercase">
                                {name?.charAt(0)}
                            </div>
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-gray-800">{name}</h2>
                        <p className="text-gray-500 text-sm">{email}</p>
                        
                        <div className="mt-4 inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 uppercase">
                            {userInfo?.isAdmin ? 'Quản trị viên' : 'Thành viên'}
                        </div>
                    </div>
                </div>

                {/* Menu Điều hướng */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button 
                        onClick={() => setActiveTab('info')}
                        className={`w-full flex items-center gap-3 px-6 py-4 text-left transition ${activeTab === 'info' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <FaUser /> Thông tin tài khoản
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`w-full flex items-center gap-3 px-6 py-4 text-left transition ${activeTab === 'history' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <FaHistory /> Lịch sử yêu cầu báo giá
                    </button>
                </div>
            </div>

            {/* CỘT PHẢI: NỘI DUNG */}
            <div className="lg:col-span-2">
                
                {/* TAB 1: CẬP NHẬT THÔNG TIN */}
                {activeTab === 'info' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FaEdit className="text-blue-500"/> Cập nhật thông tin
                        </h3>
                        <form onSubmit={submitHandler} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaUser /></div>
                                        <input 
                                            type="text" 
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={name} onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaEnvelope /></div>
                                        <input 
                                            type="email" disabled
                                            className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                                            value={email}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <hr className="border-gray-100 my-2"/>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaLock /></div>
                                        <input 
                                            type="password" 
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="••••••••"
                                            value={password} onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaLock /></div>
                                        <input 
                                            type="password" 
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="••••••••"
                                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TAB 2: LỊCH SỬ BÁO GIÁ */}
                {activeTab === 'history' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FaHistory className="text-blue-500"/> Lịch sử Báo giá
                        </h3>
                        
                        {loadingQuotes ? (
                            <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
                        ) : myQuotes.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-4">Bạn chưa gửi yêu cầu báo giá nào.</p>
                                <button onClick={() => navigate('/contact')} className="text-blue-600 font-bold hover:underline">Gửi yêu cầu ngay</button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-sm text-gray-500 border-b border-gray-100">
                                            <th className="py-3 font-medium">Sản phẩm</th>
                                            <th className="py-3 font-medium">Ngày gửi</th>
                                            <th className="py-3 font-medium text-center">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-gray-700">
                                        {myQuotes.map(quote => (
                                            <tr key={quote._id} className="border-b border-gray-50 hover:bg-blue-50/30 transition">
                                                <td className="py-4 font-bold">{quote.productName}</td>
                                                <td className="py-4">{new Date(quote.createdAt).toLocaleDateString('vi-VN')}</td>
                                                <td className="py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        quote.status === 'New' ? 'bg-green-100 text-green-700' :
                                                        quote.status === 'Contacted' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'
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