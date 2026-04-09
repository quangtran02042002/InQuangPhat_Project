import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validateEmail } from '../utils/validation';
import { toast } from 'react-toastify'; // Nếu chưa import
const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Kiểm tra nếu đã đăng nhập rồi thì đá thẳng vào trang admin luôn
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (userInfo) {
      navigate(userInfo.isAdmin ? '/admin/dashboard' : '/');
    }
  }, [navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!validateEmail(email)) {
        return toast.warning("Địa chỉ Email không hợp lệ!");
    }
    if (password.length < 6) {
        return toast.warning("Mật khẩu phải có ít nhất 6 ký tự!");
    }
    try {
      // 1. Gửi Email/Pass lên Backend
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        '/api/users/login',
        { email, password },
        config
      );

      // 2. Nếu thành công -> Lưu thông tin vào bộ nhớ trình duyệt
      localStorage.setItem('userInfo', JSON.stringify(data));

      // 3. Chuyển hướng sang trang
      // (Dùng window.location.href để load lại trang, cập nhật Header)
      window.location.href = data.isAdmin ? '/admin/dashboard' : '/'; 
      
    } catch (err) {
      // Nếu sai mật khẩu hoặc lỗi server
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#111827]">
            Đăng nhập Quản trị
          </h2>
          <p className="mt-2 text-center text-sm text-[#6B7280]">
            Dành riêng cho nhân viên In Quang Phát
          </p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 font-medium px-4 py-3 rounded-lg text-sm text-center">{error}</div>}
        {loading && <div className="text-center text-[#006B4D] font-medium text-sm flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-[#E6F0ED] border-t-[#006B4D] rounded-full animate-spin"></div>Đang xử lý...</div>}

        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-bold text-[#111827] mb-1">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 bg-[#F9FAFB] text-[#111827] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006B4D] focus:border-[#006B4D] sm:text-sm transition-all"
                placeholder="Địa chỉ Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[#111827] mb-1">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 bg-[#F9FAFB] text-[#111827] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006B4D] focus:border-[#006B4D] sm:text-sm transition-all"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#006B4D] hover:bg-[#00553d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006B4D] transition-colors shadow-sm"
            >
              ĐĂNG NHẬP
            </button>
          </div>
          <div className="mt-6 text-center">
            <span className="text-[#6B7280] text-sm">Chưa có tài khoản? </span>
            <Link to="/register" className="text-[#006B4D] hover:underline font-bold text-sm">
                Đăng ký tài khoản mới
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;