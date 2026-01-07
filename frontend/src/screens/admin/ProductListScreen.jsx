import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';
import Paginate from '../../components/Paginate';
import Loader from '../../components/Loader';

const ProductListScreen = () => {
  const navigate = useNavigate();
  const { pageNumber } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);

  // Lấy userInfo nhưng KHÔNG cho vào dependency array
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/products?pageNumber=${pageNumber || 1}`);

        setProducts(data.products);
        setPage(data.page);
        setPages(data.pages);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchProducts();
    // SỬA LỖI TẠI ĐÂY: Đã xóa 'userInfo' khỏi danh sách bên dưới
  }, [navigate, pageNumber]); 

  // --- CÁC HÀM XỬ LÝ KHÁC GIỮ NGUYÊN ---
  const openDeleteModal = (id) => {
    setDeleteProductId(id);
    setIsModalOpen(true);
  };

  const confirmDeleteHandler = async () => {
    if (!deleteProductId) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.delete(`/api/products/${deleteProductId}`, config);
      
      setProducts(products.filter((product) => product._id !== deleteProductId));
      toast.success('Đã xóa sản phẩm thành công!');
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

  const getProductImage = (product) => {
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) {
        const firstImg = product.images[0];
        return typeof firstImg === 'string' ? firstImg : firstImg.url;
    }
    return '';
  };

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
           <div className="flex justify-center mt-20"><Loader /></div>
        ) : error ? (
          <div className="text-red-500 bg-red-100 p-3 rounded">{error}</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                  <th className="py-3 px-6 text-left">Hình ảnh</th>
                  <th className="py-3 px-6 text-left">Tên sản phẩm</th>
                  <th className="py-3 px-6 text-left">Giá hiển thị</th>
                  <th className="py-3 px-6 text-left">Danh mục</th>
                  <th className="py-3 px-6 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {products.length === 0 && (
                   <tr><td colSpan="5" className="text-center py-8 text-gray-500">Chưa có sản phẩm nào.</td></tr>
                )}
                
                {products.map((product) => (
                  <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-3 px-6">
                        <div className="w-12 h-12 rounded border overflow-hidden bg-gray-100">
                             {getProductImage(product) ? (
                                <img 
                                    src={getProductImage(product)} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover"
                                />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                             )}
                        </div>
                    </td>
                    <td className="py-3 px-6 font-bold text-gray-800">
                        {product.name}
                        <div className="text-xs text-gray-400 font-normal font-mono mt-1">{product._id}</div>
                    </td>
                    <td className="py-3 px-6 text-blue-600 font-bold">
                      {product.price ? product.price.toLocaleString() : 0}đ
                    </td>
                    <td className="py-3 px-6">
                      <span className="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-xs font-medium border border-gray-200">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex justify-center space-x-4">
                        <Link to={`/admin/product/${product._id}/edit`} className="text-yellow-500 hover:text-yellow-700 transition p-2 hover:bg-yellow-50 rounded">
                          <FaEdit className="text-lg" title="Sửa" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(product._id)}
                          className="text-red-500 hover:text-red-700 transition p-2 hover:bg-red-50 rounded"
                        >
                          <FaTrash className="text-lg" title="Xóa" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pages > 1 && (
                <div className="p-4 border-t border-gray-100">
                <Paginate pages={pages} page={data.page} isAdmin={true} />
                </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDeleteHandler}
        title="Xác nhận xóa"
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa không?"
      />
    </div>
  );
};

export default ProductListScreen;