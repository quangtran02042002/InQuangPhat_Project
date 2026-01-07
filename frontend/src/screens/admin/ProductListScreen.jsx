import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'; // Thêm useParams nếu muốn làm phân trang sau này
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';
import Paginate from '../../components/Paginate'; // Import thêm phân trang cho Admin

const ProductListScreen = () => {
  const navigate = useNavigate();
  const { pageNumber } = useParams(); // Lấy số trang từ URL (nếu có)

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
      return;
    }

    const fetchProducts = async () => {
      try {
        // --- SỬA LỖI TẠI ĐÂY ---
        // Gọi API kèm pageNumber (mặc định là 1)
        const { data } = await axios.get(`/api/products?pageNumber=${pageNumber || 1}`);

        // Vì API trả về { products, page, pages } nên ta phải lấy data.products
        setProducts(data.products);
        setPage(data.page);
        setPages(data.pages);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate, userInfo, pageNumber]); // Thêm pageNumber vào dependency

  const openDeleteModal = (id) => {
    setDeleteProductId(id);
    setIsModalOpen(true);
  };

  const confirmDeleteHandler = async () => {
    if (!deleteProductId) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.delete(`/api/products/${deleteProductId}`, config);

      setProducts(products.filter((product) => product._id !== deleteProductId));
      toast.success('Đã xóa sản phẩm thành công!', { icon: "🗑️" });

      setIsModalOpen(false);
      setDeleteProductId(null);

    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      setIsModalOpen(false);
    }
  };

  const createProductHandler = () => {
    navigate('/admin/product/create');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 uppercase">Danh sách sản phẩm</h1>
          <button
            onClick={createProductHandler}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center shadow-lg transition"
          >
            <FaPlus className="mr-2" /> Thêm sản phẩm
          </button>
        </div>

        {loading ? (
          <div className="text-blue-600 font-medium">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-red-500 bg-red-100 p-3 rounded">{error}</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                  <th className="py-3 px-6 text-left">ID</th>
                  <th className="py-3 px-6 text-left">Tên sản phẩm</th>
                  <th className="py-3 px-6 text-left">Giá hiển thị</th>
                  <th className="py-3 px-6 text-left">Danh mục</th>
                  <th className="py-3 px-6 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {/* Kiểm tra an toàn: products có phải là mảng không? */}
                {Array.isArray(products) && products.map((product) => (
                  <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-3 px-6">
                      <div className="flex items-center">
                        <div className="mr-2">
                          <img
                            // Logic lấy ảnh đầu tiên
                            src={product.images && product.images.length > 0 ? product.images[0].url : ''}
                            alt={product.name}
                            className="w-10 h-10 rounded shadow border"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6 font-mono text-xs text-gray-500">{product._id}</td>
                    <td className="py-3 px-6 font-bold text-gray-800">{product.name}</td>
                    <td className="py-3 px-6 text-blue-600 font-bold">
                      {product.priceTable && product.priceTable.length > 0
                        ? product.priceTable[0].price.toLocaleString()
                        : 0}đ
                    </td>
                    <td className="py-3 px-6">
                      <span className="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-xs font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center flex justify-center space-x-4">
                      <Link to={`/admin/product/${product._id}/edit`} className="text-yellow-500 hover:text-yellow-700 transition">
                        <FaEdit className="text-xl" title="Sửa" />
                      </Link>
                      <button
                        onClick={() => openDeleteModal(product._id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <FaTrash className="text-xl" title="Xóa" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="p-8 text-center text-gray-500">Chưa có sản phẩm nào.</div>
            )}

            {/* Thêm thanh phân trang cho Admin */}
            <div className="p-4">
              <Paginate pages={pages} page={page} isAdmin={true} />
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDeleteHandler}
        title="Xác nhận xóa sản phẩm"
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống không?"
      />
    </div>
  );
};

export default ProductListScreen;