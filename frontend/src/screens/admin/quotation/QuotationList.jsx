import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSearch, FaFilter, FaTimes, FaEdit, FaTrash, FaFileExcel, FaEye, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { exportQuotationExcel } from '../../../utils/quotationExcelExport';

const statusMap = {
  draft: { label: 'Nháp', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  sent: { label: 'Đã gửi', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  accepted: { label: 'Đã duyệt', cls: 'bg-[#E6F0ED] text-[#006B4D] border-[#006B4D]/20' },
  rejected: { label: 'Từ chối', cls: 'bg-red-50 text-red-600 border-red-200' },
};

const QuotationList = ({ onEdit }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewDetail, setViewDetail] = useState(null);

  const fetchData = async () => {
    try {
      const { data } = await axios.get('/api/quotations', config);
      setQuotations(data);
    } catch { toast.error('Lỗi tải danh sách'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa báo giá này?')) return;
    try {
      await axios.delete(`/api/quotations/${id}`, config);
      toast.success('Đã xóa báo giá');
      fetchData();
    } catch { toast.error('Lỗi xóa'); }
  };

  const handleExport = async (q) => {
    await exportQuotationExcel(q);
    toast.success('Đã xuất Excel!');
  };

  const filtered = quotations.filter(q => {
    const s = keyword.toLowerCase();
    const matchKw = !s || q.customerName?.toLowerCase().includes(s) || q.quotationCode?.toLowerCase().includes(s);
    const matchSt = filterStatus === 'all' || q.status === filterStatus;
    const qDate = new Date(q.quoteDate);
    const matchFrom = !dateFrom || qDate >= new Date(dateFrom);
    const matchTo   = !dateTo   || qDate <= new Date(dateTo + 'T23:59:59');
    return matchKw && matchSt && matchFrom && matchTo;
  });

  const Badge = ({ status }) => {
    const s = statusMap[status] || statusMap.draft;
    return <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${s.cls}`}>{s.label}</span>;
  };

  if (loading) return (
    <div className="text-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006B4D] mx-auto mb-4" />
      <p className="text-gray-400 font-medium">Đang tải...</p>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-xl">📑</div>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Danh Sách Báo Giá</h2>
          <p className="text-xs text-[#6B7280]">Quản lý và theo dõi tất cả bảng báo giá</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-3">
        {/* Row 1: Search + Status + Count */}
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="relative w-full lg:w-1/2">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Tìm theo tên khách, mã báo giá..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-10 py-3 text-sm outline-none focus:border-[#006B4D] focus:bg-white transition shadow-sm" />
            {keyword && <button onClick={() => setKeyword('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><FaTimes /></button>}
          </div>
          <div className="flex gap-3 items-center w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="w-full lg:w-auto pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#006B4D] bg-white text-sm font-bold appearance-none cursor-pointer shadow-sm">
                <option value="all">Tất cả</option>
                <option value="draft">Nháp</option>
                <option value="sent">Đã gửi</option>
                <option value="accepted">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>
            <div className="bg-[#E6F0ED] text-[#006B4D] px-5 py-3 rounded-xl font-extrabold text-sm border border-[#006B4D]/10 shrink-0">
              {filtered.length} <span className="text-xs font-bold ml-1">BÁO GIÁ</span>
            </div>
          </div>
        </div>
        {/* Row 2: Date range filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 shrink-0">
            <FaCalendarAlt className="text-[#006B4D]" /> Lọc theo ngày:
          </div>
          <div className="flex gap-2 flex-1 flex-wrap">
            <div className="relative flex-1 min-w-[140px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none">TỪ</span>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-[#006B4D] bg-gray-50 focus:bg-white transition" />
            </div>
            <div className="relative flex-1 min-w-[140px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none">ĐẾN</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-[#006B4D] bg-gray-50 focus:bg-white transition" />
            </div>
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="px-3 py-2.5 rounded-xl bg-red-50 text-red-500 border border-red-200 text-xs font-bold hover:bg-red-100 transition flex items-center gap-1">
                <FaTimes size={10} /> Xoá lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table - Desktop */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 border-dashed text-gray-400 shadow-sm">
          <FaSearch className="text-5xl text-gray-200 mx-auto mb-4" />
          <p className="text-lg font-extrabold text-[#111827]">Không tìm thấy báo giá nào</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full text-left">
              <thead className="bg-[#F9FAFB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4">Mã BG</th>
                  <th className="px-5 py-4">Khách hàng</th>
                  <th className="px-5 py-4 text-center">Ngày</th>
                  <th className="px-5 py-4 text-center">Items</th>
                  <th className="px-5 py-4 text-right">Tổng tiền</th>
                  <th className="px-5 py-4 text-center">Trạng thái</th>
                  <th className="px-5 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.map(q => (
                  <tr key={q._id} className="border-b border-gray-100 hover:bg-[#E6F0ED]/30 transition-colors">
                    <td className="px-5 py-4 font-extrabold text-[#006B4D]">{q.quotationCode}</td>
                    <td className="px-5 py-4 font-bold text-[#111827]">{q.customerName}</td>
                    <td className="px-5 py-4 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-1 text-xs">
                        <FaCalendarAlt className="text-[10px] text-[#006B4D]" />
                        {new Date(q.quoteDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center font-bold">{q.items?.length || 0}</td>
                    <td className="px-5 py-4 text-right font-extrabold text-[#006B4D]">{(q.grandTotal || 0).toLocaleString('vi-VN')} đ</td>
                    <td className="px-5 py-4 text-center"><Badge status={q.status} /></td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setViewDetail(q)} title="Xem" className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition border border-gray-200"><FaEye size={14} /></button>
                        <button onClick={() => onEdit(q)} title="Sửa" className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition border border-gray-200"><FaEdit size={14} /></button>
                        <button onClick={() => handleExport(q)} title="Excel" className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition border border-gray-200"><FaFileExcel size={14} /></button>
                        <button onClick={() => handleDelete(q._id)} title="Xóa" className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 transition border border-gray-200"><FaTrash size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden flex flex-col gap-4">
            {filtered.map(q => (
              <div key={q._id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-extrabold text-[#006B4D] bg-[#E6F0ED] px-2 py-0.5 rounded">{q.quotationCode}</span>
                    <h3 className="font-extrabold text-[#111827] text-lg mt-1">{q.customerName}</h3>
                  </div>
                  <Badge status={q.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><FaCalendarAlt className="text-[#006B4D]" /> {new Date(q.quoteDate).toLocaleDateString('vi-VN')}</span>
                  <span>{q.items?.length || 0} danh mục</span>
                </div>
                <div className="bg-[#F9FAFB] p-3 rounded-xl mb-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500">Tổng cộng</span>
                  <span className="text-lg font-extrabold text-[#006B4D]">{(q.grandTotal || 0).toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(q)} className="flex-1 bg-[#E6F0ED] text-[#006B4D] font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm transition active:scale-95"><FaEdit /> Sửa</button>
                  <button onClick={() => handleExport(q)} className="px-4 bg-emerald-50 text-emerald-600 font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm border border-emerald-200 transition"><FaFileExcel /></button>
                  <button onClick={() => handleDelete(q._id)} className="px-4 bg-red-50 text-red-500 font-bold py-2.5 rounded-xl flex items-center justify-center text-sm border border-red-200 transition"><FaTrash /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Detail Modal */}
      {viewDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewDetail(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#F9FAFB] rounded-t-2xl">
              <div>
                <h3 className="font-extrabold text-lg text-[#111827]">{viewDetail.quotationCode}</h3>
                <p className="text-sm text-gray-500">{viewDetail.customerName} • {new Date(viewDetail.quoteDate).toLocaleDateString('vi-VN')}</p>
              </div>
              <button onClick={() => setViewDetail(null)} className="p-2 hover:bg-red-50 rounded-xl transition text-gray-400 hover:text-red-500"><FaTimes size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {viewDetail.items?.map((it, i) => (
                <div key={i} className="bg-[#F9FAFB] p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-extrabold text-[#006B4D]">#{i + 1} — {it.style || 'Không mã'}</span>
                    <span className="font-extrabold text-[#111827]">{((it.quantity || 0) * (it.unitPrice || 0)).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-2">
                    <span>KT In: <b>{it.printTechnique || '—'}</b></span>
                    <span>SL: <b>{(it.quantity || 0).toLocaleString()}</b></span>
                    <span>Đơn giá: <b>{(it.unitPrice || 0).toLocaleString()} đ</b></span>
                  </div>
                  {it.note && <p className="text-xs text-gray-500 italic">📝 {it.note}</p>}
                  {it.images?.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {it.images.map((img, j) => <img key={j} src={img} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-[#F9FAFB] rounded-b-2xl">
              <span className="font-bold text-gray-500">Tổng cộng</span>
              <span className="text-2xl font-extrabold text-[#006B4D]">{(viewDetail.grandTotal || 0).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationList;
