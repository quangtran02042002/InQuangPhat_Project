import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaFillDrip, FaChevronDown, FaFileExport, FaBars, FaTruck } from 'react-icons/fa';
import * as XLSX from 'xlsx-js-style';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import ConfirmModal from '../../components/ConfirmModal';

const InkPriceScreen = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const authConfig = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  const [inkPrices, setInkPrices] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [filteredInks, setFilteredInks] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState('Tất cả');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('Tất cả');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
      inkType: '',
      brand: '',
      unit: 'đ/kg',
      price: '',
      supplier: '',
      note: ''
  });

  useEffect(() => { 
      if (!userInfo) {
          navigate('/login');
          return;
      }
      fetchAllData(); 
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      const [inksRes, suppliersRes] = await Promise.all([
          axios.get('/api/ink-prices', authConfig),
          axios.get('/api/v1/suppliers', authConfig)
      ]);
      setInkPrices(inksRes.data);
      setSuppliersList(suppliersRes.data.suppliers || suppliersRes.data || []); 
    } catch (error) { 
        toast.error("Lỗi kết nối API."); 
    }
  };

  useEffect(() => {
      let result = inkPrices;
      if (selectedSupplierFilter !== 'Tất cả') result = result.filter(p => p.supplier === selectedSupplierFilter);
      if (selectedBrandFilter !== 'Tất cả') result = result.filter(p => p.brand === selectedBrandFilter);
      if (searchTerm) {
          const lowerCaseTerm = searchTerm.toLowerCase();
          result = result.filter(ink => 
              ink.inkType.toLowerCase().includes(lowerCaseTerm) || 
              ink.brand.toLowerCase().includes(lowerCaseTerm) ||
              (ink.note && ink.note.toLowerCase().includes(lowerCaseTerm))
          );
      }
      setFilteredInks(result);
  }, [searchTerm, selectedSupplierFilter, selectedBrandFilter, inkPrices]);

  const uniqueSuppliers = [...new Set(inkPrices.map(p => p.supplier).filter(Boolean))];
  const uniqueBrands = [...new Set(inkPrices.map(p => p.brand).filter(Boolean))];

  const exportToExcel = () => {
      if (filteredInks.length === 0) return toast.warning("Không có dữ liệu để xuất!");
      
      const excelData = filteredInks.map((ink, index) => ({
          "STT": index + 1,
          "Nhà Cung Cấp": ink.supplier || "Chưa xác định",
          "Hãng / Thương Hiệu": ink.brand,
          "Loại Mực": ink.inkType,
          "Đơn Vị Tính": ink.unit,
          "Đơn Giá": ink.price,
          "Ghi Chú": ink.note || ""
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      const headerStyle = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "006B4D" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
              top: { style: "thin", color: { rgb: "00543C" } },
              bottom: { style: "thin", color: { rgb: "00543C" } },
              left: { style: "thin", color: { rgb: "00543C" } },
              right: { style: "thin", color: { rgb: "00543C" } }
          }
      };

      const cellStyle = {
          alignment: { vertical: "center" },
          border: {
              top: { style: "thin", color: { rgb: "DDDDDD" } },
              bottom: { style: "thin", color: { rgb: "DDDDDD" } },
              left: { style: "thin", color: { rgb: "DDDDDD" } },
              right: { style: "thin", color: { rgb: "DDDDDD" } }
          }
      };

      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
              const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
              if (!worksheet[cellRef]) continue; 
              if (R === 0) worksheet[cellRef].s = headerStyle;
              else worksheet[cellRef].s = cellStyle;
          }
      }

      worksheet['!cols'] = [{ wch: 6 }, { wch: 25 }, { wch: 20 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "GiaMuc");
      
      const today = new Date();
      const fileName = `BaoGiaMuc_${today.getDate()}_${today.getMonth()+1}_${today.getFullYear()}.xlsx`;
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(dataBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Đã xuất file Excel thành công!`);
  };

  const openModal = (ink = null) => {
      if (ink) {
          setEditId(ink._id);
          setFormData({
              inkType: ink.inkType,
              brand: ink.brand,
              unit: ink.unit,
              price: ink.price,
              supplier: ink.supplier,
              note: ink.note || ''
          });
      } else {
          setEditId(null);
          setFormData({
              inkType: '',
              brand: '',
              unit: 'đ/kg',
              price: '',
              supplier: suppliersList.length > 0 ? suppliersList[0].name : '',
              note: ''
          });
      }
      setIsModalOpen(true);
  };

  const submitHandler = async (e) => {
      e.preventDefault();
      
      if (!formData.inkType.trim()) return toast.warning("Vui lòng nhập loại mực");
      if (!formData.brand.trim()) return toast.warning("Vui lòng nhập hãng mực");
      if (!formData.supplier) return toast.warning("Vui lòng chọn Nhà cung cấp");
      if (formData.price === '' || formData.price < 0) return toast.warning("Vui lòng nhập giá hợp lệ");

      try {
          if (editId) {
              await axios.put(`/api/ink-prices/${editId}`, formData, authConfig);
              toast.success('Cập nhật thành công');
          } else {
              await axios.post('/api/ink-prices', formData, authConfig);
              toast.success('Đã thêm mực mới');
          }
          setIsModalOpen(false);
          fetchAllData();
      } catch (error) { 
          toast.error(error.response?.data?.message || 'Lỗi lưu dữ liệu'); 
      }
  };

  const deleteHandler = async () => {
      try {
          await axios.delete(`/api/ink-prices/${deleteId}`, authConfig);
          setInkPrices(inkPrices.filter(x => x._id !== deleteId));
          setIsDeleteModalOpen(false);
          toast.success('Đã xóa thành công');
      } catch (error) { toast.error('Lỗi khi xóa'); }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827] relative">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 h-full transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <AdminHeader title="Giá Mực In Cạnh Tranh" />
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 shrink-0 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-4">
                <button className="lg:hidden text-gray-500" onClick={() => setIsSidebarOpen(true)}><FaBars size={20}/></button>
                <h1 className="text-lg md:text-xl font-bold text-[#111827]">Quản lý Bảng giá Mực</h1>
            </div>
            
            <div className="flex items-center gap-3 self-end sm:self-auto">
                <button onClick={exportToExcel} className="hidden md:flex items-center gap-2 bg-gray-100 text-[#6B7280] hover:text-[#111827] px-4 py-2 rounded-full text-sm font-bold transition">
                    <FaFileExport /> Xuất file Excel
                </button>
                <button onClick={() => openModal()} className="flex items-center gap-2 bg-[#006B4D] text-white px-4 md:px-5 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-[#00543c] transition">
                    <FaPlus className="md:hidden" /> <span className="hidden md:inline">Thêm loại mực</span>
                </button>
            </div>
        </header>

        <div className="sm:hidden bg-white px-4 py-3 border-b border-gray-200 flex justify-end">
            <button onClick={exportToExcel} className="text-[#006B4D] p-2 bg-[#E6F0ED] rounded-full shrink-0">
                <FaFileExport size={16}/>
            </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto">

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 text-xl shadow-sm shrink-0"><FaFillDrip /></div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Bảng giá Mực theo NCC</h2>
                        <p className="text-[#6B7280] text-sm mt-1">Theo dõi giá nhập mực in Offset, mực UV, hóa chất ngành in...</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-6 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200">
                    <div>
                        <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1.5">Nhà cung cấp</label>
                        <div className="relative">
                            <select value={selectedSupplierFilter} onChange={(e) => setSelectedSupplierFilter(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-[#111827] rounded-lg sm:rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#006B4D] font-bold appearance-none">
                                <option value="Tất cả">Tất cả NCC</option>
                                {uniqueSuppliers.map(sup => <option key={sup} value={sup}>{sup}</option>)}
                            </select>
                            <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1.5">Thương hiệu / Hãng</label>
                        <div className="relative">
                            <select value={selectedBrandFilter} onChange={(e) => setSelectedBrandFilter(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-[#111827] rounded-lg sm:rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#006B4D] font-bold appearance-none">
                                <option value="Tất cả">Tất cả Hãng</option>
                                {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                            </select>
                            <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1.5">Tìm kiếm nhanh</label>
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl px-3 py-2 focus-within:border-[#006B4D] transition-colors">
                            <FaSearch className="text-gray-400 mr-2.5 text-xs" />
                            <input type="text" placeholder="Tên mực..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent border-none text-xs sm:text-sm outline-none font-medium text-[#111827]"/>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredInks.length === 0 ? (
                        <div className="text-center py-16 text-[#6B7280] bg-white rounded-2xl border border-gray-200 text-xs sm:text-sm shadow-sm">Không tìm thấy dữ liệu.</div>
                    ) : (
                        <>
                            {/* --- DESKTOP TABLE VIEW --- */}
                            <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 text-[#6B7280] text-xs uppercase font-bold border-b border-gray-200 whitespace-nowrap">
                                                <th className="py-4 px-6 w-1/4">Tên mực</th>
                                                <th className="py-4 px-6">Hãng / NCC</th>
                                                <th className="py-4 px-6 text-right">Đơn giá nhập</th>
                                                <th className="py-4 px-6">Ghi chú</th>
                                                <th className="py-4 px-6 text-center w-24">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[#111827] text-sm">
                                            {filteredInks.map((ink, idx) => (
                                                <tr key={ink._id} className={`hover:bg-gray-50 transition-colors ${idx !== filteredInks.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                                    <td className="py-4 px-6 font-extrabold">{ink.inkType}</td>
                                                    <td className="py-4 px-6">
                                                        <div className="font-bold text-gray-700">{ink.brand}</div>
                                                        <div className="text-[11px] text-gray-500 font-medium flex items-center mt-1"><FaTruck className="mr-1"/> {ink.supplier}</div>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="text-lg font-extrabold text-[#006B4D]">{ink.price.toLocaleString()}đ</div>
                                                        <div className="text-xs text-gray-500 font-bold">{ink.unit}</div>
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-500 max-w-[200px] truncate" title={ink.note}>{ink.note || '-'}</td>
                                                    <td className="py-4 px-6 text-center">
                                                        <div className="flex justify-center items-center gap-3">
                                                            <button onClick={()=>openModal(ink)} className="text-gray-400 hover:text-[#006B4D] transition"><FaEdit/></button>
                                                            <button onClick={()=>{setDeleteId(ink._id); setIsDeleteModalOpen(true)}} className="text-gray-400 hover:text-red-500 transition"><FaTrash/></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* --- MOBILE CARD VIEW --- */}
                            <div className="md:hidden space-y-3">
                                {filteredInks.map((ink) => (
                                    <div key={ink._id} className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2.5">
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-extrabold text-sm text-[#111827] truncate">{ink.inkType}</h3>
                                                <div className="text-[10px] text-gray-400 font-bold mt-0.5">{ink.brand}</div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-sm font-extrabold text-[#006B4D] block">{ink.price.toLocaleString()}đ</span>
                                                <span className="text-[9px] text-gray-400 font-bold">/ {ink.unit.replace('đ/', '')}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-gray-100 pt-2 text-[10px] text-gray-500 font-medium">
                                            <div className="flex items-center gap-1.5"><FaTruck className="text-gray-400" /> {ink.supplier}</div>
                                            {ink.note && <div className="text-gray-400 truncate max-w-[150px] italic" title={ink.note}>{ink.note}</div>}
                                        </div>
                                        <div className="flex justify-end gap-2.5 border-t border-gray-100 pt-2">
                                            <button onClick={() => openModal(ink)} className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-[11px] font-bold"><FaEdit size={10} /> Sửa</button>
                                            <button onClick={() => {setDeleteId(ink._id); setIsDeleteModalOpen(true)}} className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[11px] font-bold"><FaTrash size={10} /> Xóa</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 bg-[#111827]/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xl flex flex-col animate-fade-in-down overflow-hidden">
                  <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 flex justify-between items-center bg-[#F9FAFB]">
                      <h2 className="font-extrabold text-[#111827] text-sm sm:text-base">
                          {editId ? '✏️ Cập nhật giá mực' : '➕ Thêm báo giá mực NCC'}
                      </h2>
                      <button onClick={()=>setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 bg-white p-1.5 rounded-full transition"><FaTimes size={14}/></button>
                  </div>
                  
                  <div className="p-3 sm:p-6 overflow-y-auto max-h-[75vh]">
                      <form id="inkForm" onSubmit={submitHandler} className="space-y-3.5 sm:space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                              <div className="md:col-span-2">
                                  <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Tên mực <span className="text-red-500">*</span></label>
                                  <input type="text" required value={formData.inkType} onChange={e=>setFormData({...formData, inkType: e.target.value})} className="w-full border border-gray-200 p-2 sm:p-2.5 rounded-lg text-xs sm:text-sm focus:ring-[#006B4D] focus:border-[#006B4D] outline-none text-[#111827] font-bold" placeholder="VD: Mực Offset Cyan..."/>
                              </div>

                              <div>
                                  <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Hãng / Thương hiệu <span className="text-red-500">*</span></label>
                                  <input type="text" required value={formData.brand} onChange={e=>setFormData({...formData, brand: e.target.value})} className="w-full border border-gray-200 p-2 sm:p-2.5 rounded-lg text-xs sm:text-sm focus:ring-[#006B4D] focus:border-[#006B4D] outline-none text-[#111827]" placeholder="VD: Toyo, DIC..."/>
                              </div>

                              <div>
                                  <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Nhà cung cấp <span className="text-red-500">*</span></label>
                                  <div className="relative">
                                      <select required value={formData.supplier} onChange={e=>setFormData({...formData, supplier: e.target.value})} className="w-full border border-gray-200 p-2 sm:p-2.5 rounded-lg text-xs sm:text-sm focus:border-[#006B4D] outline-none text-[#111827] appearance-none cursor-pointer bg-white">
                                          <option value="" disabled>-- Chọn NCC --</option>
                                          {suppliersList.map(sup => (
                                              <option key={sup._id} value={sup.name}>{sup.name}</option>
                                          ))}
                                      </select>
                                      <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#006B4D] text-xs" />
                                  </div>
                              </div>

                              <div>
                                  <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Giá nhập <span className="text-red-500">*</span></label>
                                  <input type="number" min="0" required value={formData.price} onChange={e=>setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-gray-200 p-2 sm:p-2.5 rounded-lg text-xs sm:text-sm focus:border-[#006B4D] outline-none text-[#006B4D] font-extrabold"/>
                              </div>

                              <div>
                                  <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Đơn vị tính <span className="text-red-500">*</span></label>
                                  <select value={formData.unit} onChange={e=>setFormData({...formData, unit: e.target.value})} className="w-full border border-gray-200 p-2 sm:p-2.5 rounded-lg text-xs sm:text-sm focus:border-[#006B4D] outline-none bg-white">
                                      <option value="đ/kg">đ/kg</option>
                                      <option value="đ/lon">đ/lon</option>
                                      <option value="đ/thùng">đ/thùng</option>
                                  </select>
                              </div>

                              <div className="md:col-span-2">
                                  <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Ghi chú thêm</label>
                                  <textarea value={formData.note} onChange={e=>setFormData({...formData, note: e.target.value})} className="w-full border border-gray-200 p-2 sm:p-2.5 rounded-lg text-xs sm:text-sm focus:border-[#006B4D] outline-none text-[#111827] resize-none" rows="2" placeholder="Ghi chú kỹ thuật..."></textarea>
                              </div>
                          </div>
                      </form>
                  </div>
                  <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 rounded-b-xl sm:rounded-b-2xl">
                      <button onClick={()=>setIsModalOpen(false)} className="px-4 py-2 text-xs sm:text-sm text-[#6B7280] font-bold hover:bg-gray-200 rounded-lg transition">Hủy bỏ</button>
                      <button type="submit" form="inkForm" className="px-5 py-2 text-xs sm:text-sm bg-[#006B4D] text-white font-bold rounded-lg shadow-md hover:bg-[#00543c] transition">Lưu lại</button>
                  </div>
              </div>
          </div>
      )}

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={()=>setIsDeleteModalOpen(false)} onConfirm={deleteHandler} title="Xóa dữ liệu" message="Bạn chắc chắn muốn xóa giá mực này không?" />
    </div>
  );
};

export default InkPriceScreen;
