import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';

const MachineListScreen = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(''); // Để sau này làm tính năng tìm kiếm nếu cần

  // --- HÀM LẤY DANH SÁCH MÁY ---
  const fetchMachines = async () => {
    try {
      // Gọi API lấy tất cả máy (Public route hoặc Admin route đều được)
      const { data } = await axios.get('/api/v1/machines'); 
      setMachines(data.machines);
      setLoading(false);
    } catch (error) {
      toast.error('Không thể tải danh sách máy móc');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  // --- HÀM XÓA MÁY ---
  const deleteHandler = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa máy này không?')) {
      try {
        await axios.delete(`/api/v1/admin/machine/${id}`);
        toast.success('Đã xóa máy thành công');
        // Load lại danh sách sau khi xóa
        fetchMachines();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa máy');
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 p-8 overflow-y-auto">
        {/* HEADER: Tiêu đề + Nút Thêm Mới */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 uppercase">Quản lý Máy móc</h1>
          <Link 
            to="/admin/machine/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center shadow-lg transition"
          >
            <FaPlus className="mr-2" /> Thêm Máy Mới
          </Link>
        </div>

        {/* BẢNG DANH SÁCH */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : machines.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
                Chưa có máy móc nào. Hãy thêm máy mới!
            </div>
          ) : (
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hình ảnh
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tên máy
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {machines.map((machine) => (
                  <tr key={machine._id} className="hover:bg-gray-50 transition">
                    {/* Cột Hình Ảnh */}
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      <div className="flex-shrink-0 w-20 h-16 rounded overflow-hidden border">
                         {/* Lấy ảnh đầu tiên trong mảng images để hiển thị */}
                         {machine.images && machine.images.length > 0 ? (
                             <img 
                                src={machine.images[0].url} 
                                alt={machine.name} 
                                className="w-full h-full object-cover"
                             />
                         ) : (
                             <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Image</div>
                         )}
                      </div>
                    </td>

                    {/* Cột Tên Máy */}
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap font-semibold">
                        {machine.name}
                      </p>
                    </td>

                    {/* Cột Danh Mục */}
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                        <span aria-hidden className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                        <span className="relative">{machine.category}</span>
                      </span>
                    </td>

                    {/* Cột Hành Động (Sửa / Xóa) */}
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                      <div className="flex justify-center gap-3">
                        <Link 
                            to={`/admin/machine/${machine._id}/edit`} 
                            className="text-blue-600 hover:text-blue-900 bg-blue-100 p-2 rounded-full hover:bg-blue-200 transition"
                            title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => deleteHandler(machine._id)}
                          className="text-red-600 hover:text-red-900 bg-red-100 p-2 rounded-full hover:bg-red-200 transition"
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MachineListScreen;