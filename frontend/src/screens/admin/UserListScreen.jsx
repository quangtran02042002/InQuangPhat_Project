import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash, FaCheck, FaTimes, FaUserShield, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';

const UserListScreen = () => {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal Xóa
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

  // Mở Modal hỏi xóa
  const openDeleteModal = (id) => {
    setDeleteUserId(id);
    setIsModalOpen(true);
  };

  // Xóa thật
  const confirmDeleteHandler = async () => {
    if (!deleteUserId) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`/api/users/${deleteUserId}`, config);
      
      // Cập nhật giao diện ngay lập tức
      setUsers(users.filter((user) => user._id !== deleteUserId));
      toast.success('Đã xóa tài khoản thành công');
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa user này');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center uppercase">
            <FaUserShield className="mr-3 text-blue-600" /> Quản lý Tài khoản
        </h1>

        {loading ? (
            <div className="text-blue-600 font-medium">Đang tải dữ liệu...</div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                            <th className="py-3 px-6 text-left">ID</th>
                            <th className="py-3 px-6 text-left">Họ tên</th>
                            <th className="py-3 px-6 text-left">Email</th>
                            <th className="py-3 px-6 text-center">Quyền Admin</th>
                            <th className="py-3 px-6 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                        {users.map((user) => (
                            <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="py-3 px-6 font-mono text-xs text-gray-500">{user._id}</td>
                                <td className="py-3 px-6 font-bold flex items-center gap-2">
                                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                        <FaUser />
                                    </div>
                                    {user.name}
                                </td>
                                <td className="py-3 px-6 text-blue-600">
                                    <a href={`mailto:${user.email}`}>{user.email}</a>
                                </td>
                                <td className="py-3 px-6 text-center">
                                    {user.isAdmin ? (
                                        <FaCheck className="text-green-500 mx-auto" />
                                    ) : (
                                        <FaTimes className="text-red-400 mx-auto" />
                                    )}
                                </td>
                                <td className="py-3 px-6 text-center">
                                    {/* Không hiện nút xóa nếu là chính mình */}
                                    {user._id !== userInfo._id && (
                                        <button 
                                            onClick={() => openDeleteModal(user._id)}
                                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition"
                                            title="Xóa tài khoản này"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* MODAL XÁC NHẬN */}
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