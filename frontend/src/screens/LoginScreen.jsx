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
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      navigate('/admin/dashboard');
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

      // 3. Chuyển hướng sang trang Dashboard
      // (Dùng window.location.href để load lại trang, cập nhật Header)
      window.location.href = '/admin/dashboard'; 
      
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập Quản trị
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Dành riêng cho nhân viên In Quang Phát
          </p>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>}
        {loading && <div className="text-center text-blue-500">Đang xử lý...</div>}

        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Địa chỉ Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ĐĂNG NHẬP
            </button>
          </div>
          <div className="mt-4 text-center">
    <span className="text-gray-600 text-sm">Chưa có tài khoản? </span>
    <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
        Đăng ký tài khoản mới
    </Link>
</div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;