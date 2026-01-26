import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash, FaCheck, FaTimes, FaUserShield, FaSearch, FaTimes as FaClear, FaEnvelope, FaIdBadge } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';
import AdminHeader from '../../components/AdminHeader';
// Helper: Random Avatar Color
const getAvatarColor = (name) => {
    const colors = ['bg-red-100 text-red-600', 'bg-orange-100 text-orange-600', 'bg-amber-100 text-amber-600', 'bg-green-100 text-green-600', 'bg-teal-100 text-teal-600', 'bg-blue-100 text-blue-600', 'bg-indigo-100 text-indigo-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash % colors.length)];
};

const UserListScreen = () => {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- SEARCH STATE ---
  const [keyword, setKeyword] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/users', config);
      setUsers(data);
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi tải danh sách');
      setLoading(false);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteUserId(id);
    setIsModalOpen(true);
  };

  const confirmDeleteHandler = async () => {
    if (!deleteUserId) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`/api/users/${deleteUserId}`, config);
      
      setUsers(users.filter((user) => user._id !== deleteUserId));
      toast.success('Đã xóa tài khoản thành công');
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa user này');
      setIsModalOpen(false);
    }
  };

  // --- FILTER LOGIC ---
  const filteredUsers = users.filter((user) => 
    user.name.toLowerCase().includes(keyword.toLowerCase()) || 
    user.email.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <div className="flex-1 p-8 overflow-y-auto h-screen pb-24">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
            <AdminHeader title="Quản Lí Tài Khoản" />
        </div>

        {/* --- TOOLBAR (SEARCH) --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/2">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Tìm theo tên hoặc email..." 
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                {keyword && (
                    <button onClick={() => setKeyword('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <FaClear />
                    </button>
                )}
            </div>

            <div className="bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap border border-blue-100">
                {filteredUsers.length} Tài khoản
            </div>
        </div>

        {/* TABLE */}
        {loading ? (
            <div className="text-center mt-20 text-gray-500 animate-pulse font-medium">Đang tải dữ liệu...</div>
        ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <table className="min-w-full leading-normal table-fixed">
                    <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                        <tr className="text-xs font-bold uppercase tracking-wider">
                            <th className="px-5 py-4 text-left w-1/4">Thành viên</th>
                            <th className="px-5 py-4 text-left w-1/3">Email liên hệ</th>
                            <th className="px-5 py-4 text-center w-32">Vai trò</th>
                            <th className="px-5 py-4 text-center w-32">ID</th>
                            <th className="px-5 py-4 text-center w-24">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {filteredUsers.map((user) => (
                            <tr key={user._id} className="border-b border-gray-100 hover:bg-blue-50/60 transition duration-200">
                                
                                {/* 1. Name & Avatar */}
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${getAvatarColor(user.name)}`}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-slate-800 text-base truncate" title={user.name}>
                                                {user.name}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* 2. Email */}
                                <td className="px-5 py-4">
                                    <div className="flex items-center text-sm text-gray-600 truncate" title={user.email}>
                                        <FaEnvelope className="mr-2 text-gray-400 shrink-0" />
                                        <a href={`mailto:${user.email}`} className="hover:text-blue-600 transition">{user.email}</a>
                                    </div>
                                </td>

                                {/* 3. Role (Admin/User) */}
                                <td className="px-5 py-4 text-center">
                                    {user.isAdmin ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                            <FaUserShield className="mr-1.5" /> ADMIN
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                            USER
                                        </span>
                                    )}
                                </td>

                                {/* 4. ID */}
                                <td className="px-5 py-4 text-center">
                                    <div className="text-xs font-mono text-gray-400 bg-gray-50 py-1 px-2 rounded inline-block select-all" title={user._id}>
                                        {user._id.slice(-6).toUpperCase()}
                                    </div>
                                </td>

                                {/* 5. Actions */}
                                <td className="px-5 py-4 text-center">
                                    {/* Prevent deleting yourself */}
                                    {user._id !== userInfo._id ? (
                                        <button 
                                            onClick={() => openDeleteModal(user._id)}
                                            className="text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition shadow-sm"
                                            title="Xóa tài khoản này"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Bạn</span>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-16 text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <FaUserShield size={40} className="mb-4 opacity-20"/>
                                        <p>Không tìm thấy tài khoản nào.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDeleteHandler}
        title="Xóa tài khoản người dùng"
        message="Hành động này sẽ xóa vĩnh viễn tài khoản này khỏi hệ thống. Bạn có chắc chắn không?"
      />
    </div>
  );
};

export default UserListScreen;