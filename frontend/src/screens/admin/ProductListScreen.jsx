import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaBoxOpen, FaSearch, FaFilter, FaTimes, FaImage, FaChevronDown, FaTag } from 'react-icons/fa';

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

  // --- UI STATE ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo) {
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
  }, [navigate, pageNumber]);

  // --- HELPERS ---
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
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
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

  // --- FILTER LOGIC ---
  const filteredProducts = products.filter((product) => {
    const searchLower = keyword.toLowerCase();
    const matchesKeyword = product.name.toLowerCase().includes(searchLower);
    const matchesCategory = filterCategory === 'all' ||
      (product.category && product.category.toLowerCase().includes(filterCategory.toLowerCase()));
    return matchesKeyword && matchesCategory;
  });

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
          title="Quản lý Sản phẩm"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

            {/* --- TITLE SECTION & BUTTON --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-xl md:text-2xl shadow-sm shrink-0">
                  <FaBoxOpen />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Danh mục Mẫu in</h2>
                  <p className="text-[#6B7280] text-xs md:text-sm mt-0.5 md:mt-1">Quản lý kho dữ liệu mẫu in ấn hiển thị trên trang chủ</p>
                </div>
              </div>
              <Link to="/admin/product/create" className="hidden sm:flex items-center gap-2 bg-[#006B4D] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#00543c] transition active:scale-95 shrink-0">
                <FaPlus /> Thêm Sản Phẩm
              </Link>
            </div>

            {/* --- TOOLBAR --- */}
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-3 items-center justify-between">
              {/* Search Input */}
              <div className="relative w-full lg:w-1/2">
                <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm theo tên..."
                  className="w-full bg-gray-50 border border-gray-200 text-[#111827] text-xs sm:text-sm rounded-xl pl-9 pr-9 py-2.5 outline-none focus:border-[#006B4D] focus:bg-white transition shadow-sm"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                {keyword && (
                  <button onClick={() => setKeyword('')} className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition">
                    <FaTimes size={12} />
                  </button>
                )}
              </div>

              {/* Filters & Count */}
              <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto items-center">
                <div className="relative flex-1 sm:flex-none">
                  <FaFilter className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full sm:w-auto pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#006B4D] bg-white text-[#111827] text-xs sm:text-sm font-bold appearance-none cursor-pointer shadow-sm transition"
                  >
                    <option value="all">Tất cả danh mục</option>
                    <option value="hop">Hộp giấy</option>
                    <option value="tui">Túi giấy</option>
                    <option value="tem">Tem nhãn</option>
                    <option value="khac">Khác</option>
                  </select>
                  <FaChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-[9px] pointer-events-none" />
                </div>

                <div className="flex items-center justify-center bg-[#E6F0ED] text-[#006B4D] px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-sm shrink-0 border border-[#006B4D]/10">
                  {filteredProducts.length} <span className="font-bold ml-1">Mẫu</span>
                </div>
              </div>
            </div>

            {/* --- MAIN DATA --- */}
            {loading ? (
              <div className="flex justify-center py-20"><Loader /></div>
            ) : error ? (
              <div className="text-red-600 bg-red-50 p-6 rounded-2xl border border-red-100 text-center font-bold shadow-sm">{error}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 border-dashed text-gray-400 shadow-sm flex flex-col items-center">
                <FaBoxOpen className="text-5xl text-gray-200 mb-4" />
                <p className="text-lg font-extrabold text-[#111827]">Không tìm thấy sản phẩm nào</p>
                <p className="text-sm mt-1">Vui lòng thử lại với từ khóa hoặc danh mục khác</p>
              </div>
            ) : (
              <div className="space-y-6 mb-20 md:mb-10">
                {/* ================= DESKTOP TABLE ================= */}
                <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="min-w-full leading-normal text-left">
                    <thead className="bg-[#F9FAFB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-5 text-center w-28">Hình ảnh</th>
                        <th className="px-6 py-5 w-1/3">Tên sản phẩm</th>
                        <th className="px-6 py-5 text-left w-1/5">Giá niêm yết</th>
                        <th className="px-6 py-5 text-center w-32">Danh mục</th>
                        <th className="px-6 py-5 text-center w-32">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {filteredProducts.map((product) => (
                        <tr key={product._id} className="border-b border-gray-100 hover:bg-[#E6F0ED]/30 transition-colors">
                          {/* Image */}
                          <td className="px-6 py-4 text-center">
                            <div className="w-16 h-16 rounded-xl border border-gray-200 overflow-hidden mx-auto shadow-sm bg-gray-50 flex items-center justify-center group relative">
                              {getProductImage(product) ? (
                                <img
                                  src={getProductImage(product)}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                />
                              ) : (
                                <FaImage className="text-gray-300 text-2xl" />
                              )}
                            </div>
                          </td>
                          {/* Name */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-[#111827] text-base leading-tight mb-1" title={product.name}>{product.name}</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {product._id.slice(-6)}</span>
                            </div>
                          </td>
                          {/* Price */}
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-extrabold bg-[#E6F0ED] text-[#006B4D] border border-[#006B4D]/10">
                              <FaTag className="mr-2 text-xs opacity-50" />
                              {getDisplayPrice(product)}
                            </div>
                          </td>
                          {/* Category */}
                          <td className="px-6 py-4 text-center">
                            <span className="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-[10px] font-extrabold border border-gray-200 uppercase tracking-wide">
                              {product.category || 'N/A'}
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <Link to={`/admin/product/${product._id}/edit`} className="text-gray-400 hover:text-[#006B4D] bg-white hover:bg-[#E6F0ED] p-2.5 rounded-xl transition-all border border-transparent hover:border-[#006B4D]/20 shadow-sm"><FaEdit size={16} /></Link>
                              <button onClick={() => openDeleteModal(product._id)} className="text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 p-2.5 rounded-xl transition-all border border-transparent hover:border-red-100 shadow-sm"><FaTrash size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ================= MOBILE GRID ================= */}
                <div className="lg:hidden grid grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                      <div className="aspect-square w-full bg-gray-50 flex items-center justify-center relative overflow-hidden">
                        {getProductImage(product) ? (
                          <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <FaImage className="text-gray-200 text-4xl" />
                        )}
                        <div className="absolute top-2 right-2 flex flex-col gap-2">
                          <Link to={`/admin/product/${product._id}/edit`} className="bg-white/90 backdrop-blur text-gray-700 p-2 rounded-lg shadow-md"><FaEdit size={14} /></Link>
                          <button onClick={() => openDeleteModal(product._id)} className="bg-white/90 backdrop-blur text-red-500 p-2 rounded-lg shadow-md"><FaTrash size={14} /></button>
                        </div>
                      </div>
                      <div className="p-3 flex flex-col flex-1">
                        <h3 className="font-extrabold text-[#111827] text-sm line-clamp-2 mb-2 leading-tight flex-1">{product.name}</h3>
                        <div className="flex flex-col gap-2">
                          <span className="text-[9px] font-bold text-[#006B4D] bg-[#E6F0ED] px-2 py-1 rounded w-fit uppercase">{product.category || 'Khác'}</span>
                          <span className="text-sm font-extrabold text-[#006B4D]">{getDisplayPrice(product)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="mt-8 flex justify-center pb-10 sm:pb-0">
                    <Paginate pages={pages} page={page} isAdmin={true} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nút nổi Floating Add cho Mobile */}
          <Link
            to="/admin/product/create"
            className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#006B4D] text-white rounded-full shadow-[0_4px_15px_rgba(0,107,77,0.4)] flex items-center justify-center z-30 hover:bg-[#00543c] active:scale-90 transition-all"
          >
            <FaPlus size={22} />
          </Link>
        </main>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDeleteHandler}
        title="Xóa sản phẩm"
        message="Hành động này sẽ xóa vĩnh viễn sản phẩm khỏi website. Bạn có chắc chắn muốn thực hiện?"
      />
    </div>
  );
};

export default ProductListScreen;