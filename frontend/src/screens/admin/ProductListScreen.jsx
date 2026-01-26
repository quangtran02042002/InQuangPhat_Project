import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaBoxOpen, FaSearch, FaFilter, FaTimes, FaImage } from 'react-icons/fa';

import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';
import Paginate from '../../components/Paginate';
import Loader from '../../components/Loader';
import AdminHeader from '../../components/AdminHeader';
const ProductListScreen = () => {
  const navigate = useNavigate();
  const { pageNumber } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // --- SEARCH & FILTER STATE ---
  const [keyword, setKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  // -----------------------------

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
        setLoading(true);
        // Note: For large datasets, server-side search is better. 
        // Here we fetch the current page. Client-side filtering applies to the fetched page.
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
  }, [navigate, pageNumber]); 

  // --- HELPER: GET DISPLAY PRICE ---
  const getDisplayPrice = (product) => {
      if (product.priceTable && product.priceTable.length > 0) {
          const minPrice = Math.min(...product.priceTable.map(item => item.price));
          return `Từ ${minPrice.toLocaleString()}đ`;
      }
      if (product.price && product.price > 0) {
          return `${product.price.toLocaleString()}đ`;
      }
      return 'Liên hệ';
  };

  // --- HELPER: GET IMAGE URL ---
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
        const firstImg = product.images[0];
        return typeof firstImg === 'string' ? firstImg : firstImg.url;
    }
    if (product.image) return product.image;
    return '';
  };

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

  // --- CLIENT-SIDE FILTERING LOGIC ---
  const filteredProducts = products.filter((product) => {
    const searchLower = keyword.toLowerCase();
    const matchesKeyword = product.name.toLowerCase().includes(searchLower);
    
    // You might need to adjust categories based on your actual data
    const matchesCategory = filterCategory === 'all' || 
                            (product.category && product.category.toLowerCase().includes(filterCategory.toLowerCase()));

    return matchesKeyword && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <div className="flex-1 p-8 overflow-y-auto h-screen pb-24">
        
        {/* HEADER */}
        
          <AdminHeader title="Danh Sách Sản Phẩm" />
          <div className="flex justify-between items-center mb-6">
          <Link
            to="/admin/product/create"
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center shadow-lg font-bold text-sm transition transform active:scale-95"
          >
            <FaPlus className="mr-2" /> Thêm sản phẩm
          </Link>
        </div>

        {/* --- TOOLBAR (SEARCH & FILTER) --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* SEARCH */}
            <div className="relative w-full md:w-1/2">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm theo tên sản phẩm..." 
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                {keyword && (
                    <button onClick={() => setKeyword('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <FaTimes />
                    </button>
                )}
            </div>

            {/* FILTER & STATS */}
            <div className="flex gap-4 w-full md:w-auto items-center">
                <div className="relative">
                    <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700 font-medium appearance-none cursor-pointer"
                    >
                        <option value="all">Tất cả danh mục</option>
                        {/* Add your specific categories here */}
                        <option value="hop">Hộp giấy</option>
                        <option value="tui">Túi giấy</option>
                        <option value="tem">Tem nhãn</option>
                        <option value="khac">Khác</option>
                    </select>
                </div>
                
                <div className="bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap border border-blue-100">
                    {filteredProducts.length} Sản phẩm
                </div>
            </div>
        </div>

        {/* TABLE */}
        {loading ? (
           <div className="flex justify-center mt-20"><Loader /></div>
        ) : error ? (
          <div className="text-red-500 bg-red-100 p-4 rounded-lg border border-red-200 text-center font-medium">{error}</div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <table className="min-w-full leading-normal table-fixed">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                <tr className="text-xs font-bold uppercase tracking-wider">
                  <th className="px-5 py-4 text-center w-24">Hình ảnh</th>
                  <th className="px-5 py-4 text-left w-1/3">Tên sản phẩm</th>
                  <th className="px-5 py-4 text-left w-1/5">Giá niêm yết</th>
                  <th className="px-5 py-4 text-center w-32">Danh mục</th>
                  <th className="px-5 py-4 text-center w-32">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredProducts.length === 0 && (
                   <tr>
                       <td colSpan="5" className="text-center py-16 text-gray-400">
                           <div className="flex flex-col items-center">
                               <FaBoxOpen size={40} className="mb-4 opacity-20"/>
                               <p>Không tìm thấy sản phẩm nào.</p>
                           </div>
                       </td>
                   </tr>
                )}
                
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-gray-100 hover:bg-blue-50/60 transition duration-200">
                    
                    {/* 1. Image */}
                    <td className="px-5 py-4 text-center">
                        <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden mx-auto shadow-sm relative bg-gray-50 flex items-center justify-center group">
                            {getProductImage(product) ? (
                                <img 
                                    src={getProductImage(product)} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                />
                            ) : (
                                <FaImage className="text-gray-300 text-xl" />
                            )}
                        </div>
                    </td>

                    {/* 2. Name & ID */}
                    <td className="px-5 py-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-base line-clamp-1" title={product.name}>{product.name}</span>
                            <span className="text-xs text-gray-400 font-mono mt-1">ID: {product._id.slice(-6).toUpperCase()}</span>
                        </div>
                    </td>
                    
                    {/* 3. Price */}
                    <td className="px-5 py-4">
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100 text-sm">
                            {getDisplayPrice(product)}
                        </span>
                    </td>

                    {/* 4. Category */}
                    <td className="px-5 py-4 text-center">
                      <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-bold border border-blue-200 inline-block uppercase">
                        {product.category || 'N/A'}
                      </span>
                    </td>

                    {/* 5. Actions */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <Link 
                            to={`/admin/product/${product._id}/edit`} 
                            className="text-amber-500 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition"
                            title="Chỉnh sửa"
                        >
                          <FaEdit size={16} />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(product._id)}
                          className="text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition"
                          title="Xóa sản phẩm"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pages > 1 && (
                <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50">
                   <Paginate pages={pages} page={page} isAdmin={true} />
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
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa sản phẩm này không?"
      />
    </div>
  );
};

export default ProductListScreen;