import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUserCircle, FaKey, FaSave, FaShieldAlt, FaEnvelope, FaUser, FaLock } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';

const ProfileScreen = () => {
  // === STATE QUẢN LÝ SIDEBAR MOBILE ===
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // --- HÀM 1: CẬP NHẬT THÔNG TIN ---
  const updateInfoHandler = async (e) => {
    e.preventDefault();
    setLoadingInfo(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const { data } = await axios.put(
        '/api/users/profile',
        { name, email },
        config
      );

      setLoadingInfo(false);
      toast.success('Đã cập nhật tên hiển thị!');
      localStorage.setItem('userInfo', JSON.stringify(data));

    } catch (error) {
      setLoadingInfo(false);
      toast.error(error.response?.data?.message || 'Lỗi cập nhật thông tin');
    }
  };

  // --- HÀM 2: ĐỔI MẬT KHẨU ---
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

      await axios.put(
        '/api/users/profile',
        { password },
        config
      );

      setLoadingPass(false);
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      setPassword('');
      setConfirmPassword('');

    } catch (error) {
      setLoadingPass(false);
      toast.error(error.response?.data?.message || 'Lỗi đổi mật khẩu');
    }
  };

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

        {/* ================= ADMIN HEADER ĐỒNG BỘ ================= */}
        <AdminHeader
          title="Cài đặt Tài khoản"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto">

            {/* Title Section */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-xl md:text-2xl shadow-sm shrink-0">
                <FaUserCircle />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Hồ sơ cá nhân</h2>
                <p className="text-[#6B7280] text-xs md:text-sm mt-0.5 md:mt-1">Quản lý thông tin định danh và bảo mật của bạn</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

              {/* --- CARD 1: THÔNG TIN CHUNG --- */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-fit">
                <div className="px-6 py-5 border-b border-gray-100 bg-[#F9FAFB] flex items-center gap-3">
                  <FaUser className="text-[#006B4D]" />
                  <h3 className="font-extrabold text-[#111827]">Thông tin cơ bản</h3>
                </div>

                <form onSubmit={updateInfoHandler} className="p-6 space-y-6">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Email đăng nhập</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400 text-sm" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 font-medium cursor-not-allowed text-sm"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 italic">* Email không thể thay đổi vì lý do bảo mật hệ thống.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Họ và tên hiển thị</label>
                    <div className="relative focus-within:text-[#006B4D]">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-sm transition-colors" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] font-extrabold text-[#111827] shadow-sm transition-all text-sm"
                        placeholder="Nhập họ và tên..."
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loadingInfo}
                      className="w-full bg-[#006B4D] hover:bg-[#00543c] text-white font-extrabold py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center text-sm disabled:opacity-50"
                    >
                      {loadingInfo ? 'Đang xử lý...' : <><FaSave className="mr-2" /> CẬP NHẬT THÔNG TIN</>}
                    </button>
                  </div>
                </form>
              </div>

              {/* --- CARD 2: ĐỔI MẬT KHẨU --- */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-fit">
                <div className="px-6 py-5 border-b border-gray-100 bg-red-50/30 flex items-center gap-3">
                  <FaShieldAlt className="text-red-500" />
                  <h3 className="font-extrabold text-[#111827]">Bảo mật & Mật khẩu</h3>
                </div>

                <form onSubmit={updatePasswordHandler} className="p-6 space-y-6">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Mật khẩu mới</label>
                    <div className="relative focus-within:text-red-500">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-sm transition-colors" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-bold text-[#111827] shadow-sm transition-all text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Xác nhận mật khẩu mới</label>
                    <div className="relative focus-within:text-red-500">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaKey className="text-sm transition-colors" />
                      </div>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-bold text-[#111827] shadow-sm transition-all text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loadingPass}
                      className="w-full bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-extrabold py-3 rounded-xl shadow-sm transition-all active:scale-95 flex justify-center items-center text-sm disabled:opacity-50"
                    >
                      {loadingPass ? 'Đang xử lý...' : <><FaKey className="mr-2" /> ĐỔI MẬT KHẨU</>}
                    </button>
                  </div>
                </form>

                <div className="px-6 pb-6 mt-auto">
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                    <div className="flex gap-3">
                      <FaShieldAlt className="text-orange-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-orange-700 leading-relaxed font-medium">
                        Lưu ý: Sau khi đổi mật khẩu thành công, bạn sẽ cần đăng nhập lại ở tất cả các thiết bị để tiếp tục sử dụng hệ thống.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileScreen;