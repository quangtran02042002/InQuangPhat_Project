import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUserPlus } from 'react-icons/fa';
import Meta from '../components/Meta';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Validate cơ bản
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' },
      };

      // Gọi API đăng ký
      const { data } = await axios.post(
        '/api/users',
        { name, email, password },
        config
      );

      // Đăng ký xong thì lưu vào LocalStorage (coi như đăng nhập luôn)
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      toast.success('Đăng ký thành công!');
      setLoading(false);
      navigate(redirect);
      // Reload để Header cập nhật tên User
      window.location.reload(); 

    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Meta title="Đăng ký tài khoản | In Quang Phát" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#111827] uppercase tracking-tight">
          Đăng ký thành viên
        </h2>
        <p className="mt-2 text-center text-sm text-[#6B7280]">
          Hoặc <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="font-bold text-[#006B4D] hover:underline">đăng nhập nếu đã có tài khoản</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={submitHandler}>
            
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-1">Họ và Tên</label>
              <div>
                <input 
                    type="text" required 
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-200 bg-[#F9FAFB] text-[#111827] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006B4D] focus:border-[#006B4D] sm:text-sm transition-all" 
                    placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#111827] mb-1">Email</label>
              <div>
                <input 
                    type="email" required 
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-200 bg-[#F9FAFB] text-[#111827] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006B4D] focus:border-[#006B4D] sm:text-sm transition-all" 
                    placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#111827] mb-1">Mật khẩu</label>
              <div>
                <input 
                    type="password" required 
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-200 bg-[#F9FAFB] text-[#111827] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006B4D] focus:border-[#006B4D] sm:text-sm transition-all" 
                    placeholder="Tối thiểu 6 ký tự"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#111827] mb-1">Xác nhận mật khẩu</label>
              <div>
                <input 
                    type="password" required 
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-200 bg-[#F9FAFB] text-[#111827] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006B4D] focus:border-[#006B4D] sm:text-sm transition-all" 
                    placeholder="Nhập lại mật khẩu"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#006B4D] hover:bg-[#00553d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006B4D] transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Đang xử lý...' : <><FaUserPlus className="mr-2 text-lg" /> ĐĂNG KÝ NGAY</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;