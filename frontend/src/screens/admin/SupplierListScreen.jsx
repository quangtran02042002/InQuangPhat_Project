import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaTruck } from 'react-icons/fa';
import Swal from 'sweetalert2'; // <-- 1. IMPORT THƯ VIỆN MỚI
import Sidebar from '../../components/Sidebar';

const SupplierListScreen = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const fetchSuppliers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/v1/suppliers', config);
      setSuppliers(data.suppliers);
      setLoading(false);
    } catch (error) {
      toast.error('Lỗi tải danh sách nhà cung cấp');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // --- 2. SỬA HÀM DELETE HANDLER DÙNG SWEETALERT2 ---
  const deleteHandler = (id) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Hành động này sẽ xóa vĩnh viễn nhà cung cấp này!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Màu đỏ cho nút Xóa
      cancelButtonColor: '#3085d6', // Màu xanh cho nút Hủy
      confirmButtonText: 'Vâng, xóa nó!',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          await axios.delete(`/api/v1/suppliers/${id}`, config);
          
          // Thông báo xóa thành công (Cũng dùng Swal cho đẹp, hoặc dùng toast tùy bạn)
          Swal.fire(
            'Đã xóa!',
            'Nhà cung cấp đã bị xóa khỏi hệ thống.',
            'success'
          );
          
          fetchSuppliers(); // Load lại danh sách
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể xóa nhà cung cấp này.',
          });
        }
      }
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 uppercase flex items-center">
             <FaTruck className="mr-3 text-blue-600" /> Quản lý Nhà Cung Cấp
          </h1>
          <Link to="/admin/supplier/new" className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center shadow hover:bg-blue-700 transition transform hover:scale-105">
            <FaPlus className="mr-2" /> Thêm NCC Mới
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? ( <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div> ) : (
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200 text-gray-600 uppercase text-xs font-bold tracking-wider">
                  <th className="px-5 py-3 text-left">Tên NCC</th>
                  <th className="px-5 py-3 text-left">Sản phẩm cung cấp</th>
                  <th className="px-5 py-3 text-left">Liên hệ</th>
                  <th className="px-5 py-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="text-center py-10 text-gray-500">Chưa có nhà cung cấp nào.</td>
                    </tr>
                ) : (
                    suppliers.map((sup) => (
                    <tr key={sup._id} className="border-b hover:bg-blue-50 transition duration-150">
                        <td className="px-5 py-4">
                            <p className="font-bold text-blue-900 text-base">{sup.name}</p>
                            {sup.taxCode && <p className="text-xs text-gray-500 mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded">MST: {sup.taxCode}</p>}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700 max-w-xs truncate">
                            {sup.productsProvided || <span className="italic text-gray-400">Chưa cập nhật</span>}
                        </td>
                        <td className="px-5 py-4 text-sm">
                            <p className="font-bold text-gray-800">{sup.phone}</p>
                            <p className="text-gray-500 text-xs">{sup.contactName}</p>
                        </td>
                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {/* Căn chỉnh lại nút bấm cho gần nhau */}
                            <div className="flex items-center justify-center gap-4"> 
                                <Link 
                                    to={`/admin/supplier/${sup._id}/edit`} 
                                    className="text-blue-600 hover:text-blue-900 transition transform hover:scale-110 p-2 rounded-full hover:bg-blue-100"
                                    title="Chỉnh sửa"
                                >
                                    <FaEdit size={18} />
                                </Link>
                                <button 
                                    onClick={() => deleteHandler(sup._id)} 
                                    className="text-red-600 hover:text-red-900 transition transform hover:scale-110 p-2 rounded-full hover:bg-red-100"
                                    title="Xóa"
                                >
                                    <FaTrash size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierListScreen;