import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash, FaCheck, FaTimes, FaUserShield, FaSearch, FaTimes as FaClear, FaEnvelope, FaIdBadge, FaUsers, FaUser, FaBars } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';
import AdminHeader from '../../components/AdminHeader';

// Helper: Random Avatar Color (Giữ nguyên logic của bạn)
const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-100 text-gray-600';
    const colors = ['bg-red-100 text-red-600', 'bg-orange-100 text-orange-600', 'bg-amber-100 text-amber-600', 'bg-green-100 text-green-600', 'bg-teal-100 text-teal-600', 'bg-blue-100 text-blue-600', 'bg-indigo-100 text-indigo-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash % colors.length)];
};

const UserListScreen = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- STATE TÌM KIẾM ---
    const [keyword, setKeyword] = useState('');

    // --- UI STATE ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState(null);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        if (!userInfo) {
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
            toast.error(error.response?.data?.message || 'Lỗi tải danh sách tài khoản');
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
            toast.error(error.response?.data?.message || 'Không thể xóa người dùng này');
            setIsModalOpen(false);
        }
    };

    // --- FILTER LOGIC ---
    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(keyword.toLowerCase()) ||
        user.email.toLowerCase().includes(keyword.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827] relative">

            {/* ================= SIDEBAR & OVERLAY ================= */}
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

                {/* ================= ADMIN HEADER ================= */}
                <AdminHeader
                    title="Quản lý Người dùng"
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
                    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

                        {/* --- TITLE SECTION --- */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-xl md:text-2xl shadow-sm shrink-0">
                                <FaUsers />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Danh sách Thành viên</h2>
                                <p className="text-[#6B7280] text-xs md:text-sm mt-0.5 md:mt-1">Kiểm soát quyền hạn truy cập hệ thống quản trị</p>
                            </div>
                        </div>

                        {/* --- TOOLBAR (SEARCH) --- */}
                        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-1/2">
                                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên hoặc email thành viên..."
                                    className="w-full bg-gray-50 border border-gray-200 text-[#111827] text-sm md:text-base rounded-xl pl-12 pr-10 py-3 outline-none focus:border-[#006B4D] focus:bg-white transition shadow-sm"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                                {keyword && (
                                    <button onClick={() => setKeyword('')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition">
                                        <FaClear />
                                    </button>
                                )}
                            </div>

                            <div className="w-full md:w-auto flex items-center justify-center bg-[#E6F0ED] text-[#006B4D] px-5 py-3 rounded-xl font-extrabold text-sm shadow-sm shrink-0 border border-[#006B4D]/10">
                                {filteredUsers.length} <span className="font-bold ml-1 text-xs">TÀI KHOẢN</span>
                            </div>
                        </div>

                        {/* --- DATA LIST --- */}
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006B4D] mx-auto mb-4"></div>
                                <div className="text-gray-400 font-medium">Đang tải danh sách người dùng...</div>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 border-dashed text-gray-400 shadow-sm flex flex-col items-center">
                                <FaUserShield className="text-5xl text-gray-200 mb-4" />
                                <p className="text-lg font-extrabold text-[#111827]">Không tìm thấy tài khoản nào</p>
                                <p className="text-sm mt-1">Hãy thử tìm kiếm với từ khóa khác</p>
                            </div>
                        ) : (
                            <div className="mb-20 sm:mb-10">
                                {/* ================= DESKTOP TABLE ================= */}
                                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <table className="min-w-full leading-normal text-left">
                                        <thead className="bg-[#F9FAFB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-5 w-1/4">Thành viên</th>
                                                <th className="px-6 py-5 w-1/3">Email liên hệ</th>
                                                <th className="px-6 py-5 text-center w-32">Vai trò</th>
                                                <th className="px-6 py-5 text-center w-32">ID Hệ thống</th>
                                                <th className="px-6 py-5 text-center w-24">Xóa</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {filteredUsers.map((user) => (
                                                <tr key={user._id} className="border-b border-gray-100 hover:bg-[#E6F0ED]/30 transition-colors">
                                                    {/* Name & Avatar */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm border-2 border-white ${getAvatarColor(user.name)}`}>
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="font-extrabold text-[#111827] text-base leading-tight truncate" title={user.name}>
                                                                    {user.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Email */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center text-gray-600 font-medium">
                                                            <FaEnvelope className="mr-2.5 text-gray-400 text-xs shrink-0" />
                                                            <a href={`mailto:${user.email}`} className="hover:text-[#006B4D] hover:underline transition-all truncate">{user.email}</a>
                                                        </div>
                                                    </td>

                                                    {/* Role */}
                                                    <td className="px-6 py-4 text-center">
                                                        {user.role === 'director' ? (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-widest">
                                                                <FaUserShield className="mr-1.5" /> Giám đốc
                                                            </span>
                                                        ) : user.role === 'accountant' ? (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-widest">
                                                                Kế toán
                                                            </span>
                                                        ) : user.role === 'production' ? (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-orange-50 text-orange-700 border border-orange-100 uppercase tracking-widest">
                                                                Sản xuất
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-widest">
                                                                Khách hàng
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* ID */}
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="text-[10px] font-mono font-bold text-gray-400 bg-gray-50 py-1 px-2 rounded-md inline-block select-all border border-gray-100" title={user._id}>
                                                            {user._id.slice(-6).toUpperCase()}
                                                        </div>
                                                    </td>

                                                    {/* Action */}
                                                    <td className="px-6 py-4 text-center">
                                                        {user._id !== userInfo._id ? (
                                                            <button
                                                                onClick={() => openDeleteModal(user._id)}
                                                                className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-90"
                                                                title="Gỡ bỏ tài khoản"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] font-extrabold text-[#006B4D] bg-[#E6F0ED] px-2 py-1 rounded">Chính bạn</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* ================= MOBILE USER LIST ================= */}
                                <div className="md:hidden flex flex-col gap-4">
                                    {filteredUsers.map((user) => (
                                        <div key={user._id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-lg shrink-0 shadow-sm ${getAvatarColor(user.name)}`}>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-extrabold text-[#111827] text-base leading-tight">{user.name}</h3>
                                                        <div className="mt-1">
                                                            {user.role === 'director' ? (
                                                                <span className="text-[9px] font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded uppercase border border-purple-100">Giám đốc</span>
                                                            ) : user.role === 'accountant' ? (
                                                                <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase border border-blue-100">Kế toán</span>
                                                            ) : user.role === 'production' ? (
                                                                <span className="text-[9px] font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase border border-orange-100">Sản xuất</span>
                                                            ) : (
                                                                <span className="text-[9px] font-extrabold text-gray-500 bg-gray-50 px-2 py-0.5 rounded uppercase border border-gray-200">Khách hàng</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {user._id !== userInfo._id && (
                                                    <button onClick={() => openDeleteModal(user._id)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg">
                                                        <FaTrash size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-2 pt-3 border-t border-gray-50">
                                                <div className="flex items-center text-xs font-medium text-gray-600">
                                                    <FaEnvelope className="mr-2 text-gray-400" />
                                                    <a href={`mailto:${user.email}`} className="truncate text-[#006B4D] font-bold">{user.email}</a>
                                                </div>
                                                <div className="flex items-center text-[10px] text-gray-400 font-mono">
                                                    <FaIdBadge className="mr-2 text-gray-300" />
                                                    ID: {user._id.toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDeleteHandler}
                title="Xóa tài khoản vĩnh viễn"
                message="Người dùng này sẽ không thể đăng nhập vào hệ thống quản trị nữa. Bạn có chắc chắn muốn thực hiện hành động này?"
            />
        </div>
    );
};

export default UserListScreen;