import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUserCircle, FaKey, FaSave, FaShieldAlt } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';

const ProfileScreen = () => {
  // State cho Thông tin cơ bản
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // State cho Đổi mật khẩu
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, []);

  // --- HÀM 1: CHỈ CẬP NHẬT THÔNG TIN ---
  const updateInfoHandler = async (e) => {
    e.preventDefault();
    setLoadingInfo(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      // Chỉ gửi name lên, không gửi password
      const { data } = await axios.put(
        '/api/users/profile',
        { name, email }, 
        config
      );

      setLoadingInfo(false);
      toast.success('Đã cập nhật tên hiển thị!');
      
      // Lưu lại vào LocalStorage để Header cập nhật tên mới
      localStorage.setItem('userInfo', JSON.stringify(data));
      
    } catch (error) {
      setLoadingInfo(false);
      toast.error(error.response?.data?.message || 'Lỗi cập nhật thông tin');
    }
  };

  // --- HÀM 2: CHỈ ĐỔI MẬT KHẨU ---
  const updatePasswordHandler = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 6) {
        toast.error('Mật khẩu phải có ít nhất 6 ký tự');
        return;
    }

    setLoadingPass(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      // Chỉ gửi password lên
      const { data } = await axios.put(
        '/api/users/profile',
        { password }, 
        config
      );

      setLoadingPass(false);
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      
      // Reset ô nhập
      setPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      setLoadingPass(false);
      toast.error(error.response?.data?.message || 'Lỗi đổi mật khẩu');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center uppercase">
                <FaUserCircle className="mr-3 text-blue-600" /> Hồ sơ cá nhân
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* --- FORM 1: THÔNG TIN CÁ NHÂN --- */}
                <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
                    <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 flex items-center">
                        <FaUserCircle className="mr-2" /> Thông tin chung
                    </h2>
                    <form onSubmit={updateInfoHandler} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Tên đăng nhập)</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full px-4 py-2 rounded border bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên hiển thị</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded shadow transition flex justify-center items-center"
                        >
                            {loadingInfo ? 'Đang lưu...' : <><FaSave className="mr-2" /> CẬP NHẬT THÔNG TIN</>}
                        </button>
                    </form>
                </div>

                {/* --- FORM 2: ĐỔI MẬT KHẨU --- */}
                <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
                    <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 flex items-center">
                        <FaShieldAlt className="mr-2 text-red-500" /> Bảo mật & Mật khẩu
                    </h2>
                    <form onSubmit={updatePasswordHandler} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                                placeholder="Nhập mật khẩu mới..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                                placeholder="Nhập lại mật khẩu mới..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-white border border-red-500 text-red-500 hover:bg-red-50 font-bold py-2 rounded shadow transition flex justify-center items-center"
                        >
                            {loadingPass ? 'Đang xử lý...' : <><FaKey className="mr-2" /> ĐỔI MẬT KHẨU</>}
                        </button>
                    </form>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;