import React, { useState, useRef, useCallback } from 'react';
import { FaPlus, FaTrash, FaSave, FaImage, FaTimes, FaPaste, FaFileExcel } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { exportQuotationExcel } from '../../../utils/quotationExcelExport';

const EMPTY_ITEM = { style: '', images: [], printTechnique: '', quantity: 0, unitPrice: 0, note: '' };

const QuotationForm = ({ editData, onSaved, onCancel }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  const [customerName, setCustomerName] = useState(editData?.customerName || '');
  const [quoteDate, setQuoteDate] = useState(
    editData?.quoteDate ? new Date(editData.quoteDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [items, setItems] = useState(
    editData?.items?.length > 0 ? editData.items.map(it => ({ ...it, images: it.images || [] })) : [{ ...EMPTY_ITEM }]
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const fileRefs = useRef({});

  const isEditMode = !!editData?._id;

  // ── Item handlers ──
  const updateItem = (idx, field, value) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }]);

  const removeItem = (idx) => {
    if (items.length <= 1) return toast.warning('Cần ít nhất 1 danh mục');
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const removeImage = (itemIdx, imgIdx) => {
    setItems(prev => prev.map((it, i) => i === itemIdx ? { ...it, images: it.images.filter((_, j) => j !== imgIdx) } : it));
  };

  // ── Upload images ──
  const uploadFiles = async (itemIdx, files) => {
    if (!files || files.length === 0) return;
    setUploading(prev => ({ ...prev, [itemIdx]: true }));
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('images', f));
      const { data } = await axios.post('/api/upload', formData, {
        headers: { Authorization: `Bearer ${userInfo?.token}`, 'Content-Type': 'multipart/form-data' },
      });
      const urls = Array.isArray(data) ? data : [data];
      setItems(prev => prev.map((it, i) => i === itemIdx ? { ...it, images: [...it.images, ...urls] } : it));
      toast.success(`Đã tải ${urls.length} hình`);
    } catch (e) {
      toast.error('Lỗi upload hình ảnh');
    }
    setUploading(prev => ({ ...prev, [itemIdx]: false }));
  };

  // ── Ctrl+V paste handler ──
  const handlePaste = useCallback((itemIdx, e) => {
    const clipItems = e.clipboardData?.items;
    if (!clipItems) return;
    const files = [];
    for (let i = 0; i < clipItems.length; i++) {
      if (clipItems[i].type.startsWith('image/')) {
        files.push(clipItems[i].getAsFile());
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      uploadFiles(itemIdx, files);
    }
  }, []);

  // ── Grand total ──
  const grandTotal = items.reduce((s, it) => s + ((it.quantity || 0) * (it.unitPrice || 0)), 0);

  // ── Save ──
  const handleSave = async () => {
    if (!customerName.trim()) return toast.warning('Vui lòng nhập tên khách hàng');
    if (items.every(it => !it.style && !it.printTechnique)) return toast.warning('Cần nhập ít nhất 1 danh mục');
    setSaving(true);
    try {
      const payload = { customerName, quoteDate, items, grandTotal };
      let res;
      if (isEditMode) {
        res = await axios.put(`/api/quotations/${editData._id}`, payload, config);
        toast.success('Đã cập nhật báo giá!');
      } else {
        res = await axios.post('/api/quotations', payload, config);
        toast.success('Đã lưu báo giá mới!');
      }
      if (onSaved) onSaved(res.data);
    } catch (e) {
      toast.error('Lỗi khi lưu báo giá');
    }
    setSaving(false);
  };

  const handleExportExcel = async () => {
    const payload = { customerName, quoteDate, items, grandTotal, quotationCode: editData?.quotationCode || 'Mới' };
    await exportQuotationExcel(payload);
    toast.success('Đã xuất file Excel!');
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-xl">📋</div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">{isEditMode ? 'Chỉnh sửa Báo giá' : 'Tạo Bảng Báo Giá'}</h2>
            <p className="text-xs text-[#6B7280]">{isEditMode ? `Mã: ${editData.quotationCode}` : 'Nhập thông tin để tạo bảng báo giá mới'}</p>
          </div>
        </div>
        {isEditMode && onCancel && (
          <button onClick={onCancel} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-red-500 bg-gray-100 rounded-xl transition">
            <FaTimes className="inline mr-1" /> Hủy sửa
          </button>
        )}
      </div>

      {/* THÔNG TIN CHUNG */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-extrabold text-sm text-[#006B4D] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Thông tin chung</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Khách hàng</label>
            <input value={customerName} onChange={e => setCustomerName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D] transition"
              placeholder="Tên khách hàng / công ty" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Ngày báo giá</label>
            <input type="date" value={quoteDate} onChange={e => setQuoteDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D] transition" />
          </div>
        </div>
      </div>

      {/* DANH MỤC BÁO GIÁ */}
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold text-[#006B4D] bg-[#E6F0ED] px-3 py-1 rounded-lg">Danh mục #{idx + 1}</span>
              {items.length > 1 && (
                <button onClick={() => removeItem(idx)} className="text-gray-300 hover:text-red-500 transition p-1" title="Xóa danh mục">
                  <FaTrash size={14} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Mã hàng (Style)</label>
                <input value={item.style} onChange={e => updateItem(idx, 'style', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D] transition" placeholder="VD: BOX-001" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Kĩ thuật in</label>
                <input value={item.printTechnique} onChange={e => updateItem(idx, 'printTechnique', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D] transition" placeholder="VD: Offset 4 màu" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Số lượng</label>
                <input type="number" value={item.quantity || ''} onChange={e => updateItem(idx, 'quantity', Number(e.target.value) || 0)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D] transition" placeholder="0" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Đơn giá (VNĐ)</label>
                <input type="number" value={item.unitPrice || ''} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value) || 0)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D] transition" placeholder="0" />
              </div>
            </div>

            {/* Thành tiền */}
            <div className="flex items-center justify-between mb-4 bg-[#F9FAFB] p-3 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-500">Thành tiền:</span>
              <span className="text-base font-extrabold text-[#006B4D]">{((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString('vi-VN')} đ</span>
            </div>

            {/* Ghi chú */}
            <div className="mb-4">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Ghi chú</label>
              <textarea value={item.note} onChange={e => updateItem(idx, 'note', e.target.value)} rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D] transition resize-none" placeholder="Ghi chú cho danh mục này..." />
            </div>

            {/* Hình ảnh */}
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2">Hình ảnh</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {item.images?.map((img, imgIdx) => (
                  <div key={imgIdx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 group/img">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx, imgIdx)}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover/img:opacity-100 transition">
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                <input type="file" multiple accept="image/*" ref={el => fileRefs.current[idx] = el} className="hidden"
                  onChange={e => { uploadFiles(idx, e.target.files); e.target.value = ''; }} />
                <button onClick={() => fileRefs.current[idx]?.click()} disabled={uploading[idx]}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition border border-blue-200 disabled:opacity-50">
                  <FaImage size={12} /> {uploading[idx] ? 'Đang tải...' : 'Chọn ảnh'}
                </button>
                <div onPaste={e => handlePaste(idx, e)} tabIndex={0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition border border-purple-200 cursor-text focus:ring-2 focus:ring-purple-300 outline-none">
                  <FaPaste size={12} /> Ctrl+V dán ảnh (click vào đây)
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Nút thêm danh mục */}
        <button onClick={addItem}
          className="w-full py-4 border-2 border-dashed border-[#006B4D]/30 rounded-2xl text-[#006B4D] font-bold text-sm hover:bg-[#E6F0ED] hover:border-[#006B4D] transition flex items-center justify-center gap-2">
          <FaPlus /> Thêm danh mục báo giá
        </button>
      </div>

      {/* TỔNG CỘNG & ACTIONS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-6 bg-[#111827] text-white p-5 rounded-xl">
          <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">Tổng cộng ({items.length} danh mục)</span>
          <span className="text-2xl font-black text-[#00E096]">{grandTotal.toLocaleString('vi-VN')} <span className="text-sm opacity-70">đ</span></span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-[#006B4D] hover:bg-[#00543c] text-white py-3.5 rounded-xl font-extrabold flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-lg shadow-[#006B4D]/30 disabled:opacity-50">
            <FaSave size={16} /> {saving ? 'Đang lưu...' : (isEditMode ? 'Cập nhật Báo giá' : 'Lưu Báo giá')}
          </button>
          <button onClick={handleExportExcel}
            className="flex-1 sm:flex-none bg-emerald-50 text-emerald-700 px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 border border-emerald-200 hover:bg-emerald-100 transition">
            <FaFileExcel size={16} /> Xuất Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationForm;
