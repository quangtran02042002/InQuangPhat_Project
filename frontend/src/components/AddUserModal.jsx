import React, { useState } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaLock, FaUserTag, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AddUserModal = ({ isOpen, onClose, onSave, loading }) => {
    if (!isOpen) return null;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');

    const submitHandler = (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            return toast.warning('Vui lòng nhập Họ tên');
        }
        if (!email.trim()) {
            return toast.warning('Vui lòng nhập Email');
        }
        if (!password.trim() || password.length < 6) {
            return toast.warning('Mật khẩu phải dài ít nhất 6 ký tự');
        }

        onSave({ name, email, password, role });
        
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setRole('user');
    };

    return (
        <div className="fixed inset-0 bg-[#111827]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 transform transition-all animate-scale-up">
                
                {/* Header */}
                <div className="bg-[#E6F0ED] px-6 py-5 flex items-center justify-between border-b border-[#006B4D]/10">
                    <h3 className="font-extrabold text-lg text-[#006B4D] flex items-center gap-2.5">
                        <FaUserPlus /> Thêm thành viên mới
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-red-500 hover:bg-white p-2 rounded-full transition-all shadow-sm active:scale-90"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={submitHandler} className="p-6 space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Họ và tên *</label>
                        <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-[#111827] text-sm rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#006B4D] focus:bg-white transition"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email đăng nhập *</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-[#111827] text-sm rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#006B4D] focus:bg-white transition"
                                placeholder="nhanvien@quangphat.com"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Mật khẩu ban đầu *</label>
                        <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-[#111827] text-sm rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#006B4D] focus:bg-white transition"
                                placeholder="Tối thiểu 6 ký tự"
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Vai trò hệ thống</label>
                        <div className="relative">
                            <FaUserTag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                            <select 
                                value={role} 
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-[#111827] text-sm rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#006B4D] focus:bg-white transition cursor-pointer appearance-none font-bold"
                            >
                                <option value="director">🟣 GIÁM ĐỐC</option>
                                <option value="accountant">🔵 KẾ TOÁN</option>
                                <option value="production">🟠 QUẢN LÝ SẢN XUẤT</option>
                                <option value="user">⚪ KHÁCH HÀNG / USER</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#006B4D] text-white hover:bg-[#00543c] disabled:opacity-50 font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
                    >
                        <FaUserPlus /> {loading ? 'Đang khởi tạo tài khoản...' : 'Khởi tạo tài khoản'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;
