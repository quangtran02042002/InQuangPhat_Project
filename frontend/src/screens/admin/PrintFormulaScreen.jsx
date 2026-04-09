import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaPlus, FaEdit, FaTrash, FaCopy, FaSearch, FaFileExcel,
  FaFlask, FaTimes, FaChevronDown, FaChevronUp, FaSave,
  FaEye, FaUpload, FaImage
} from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import * as XLSX from 'xlsx-js-style';
import { useImagePaste } from '../../hooks/useImagePaste';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
const StatusBadge = ({ status }) => {
  const map = {
    draft: { label: 'Nháp', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    approved: { label: 'Đã duyệt', cls: 'bg-green-50 text-green-700 border-green-200' },
    archived: { label: 'Lưu trữ', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  };
  const s = map[status] || map.draft;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${s.cls}`}>
      {s.label}
    </span>
  );
};

const OFFSET_POST_PROCESS = [
  'Cán màng mờ', 'Cán màng bóng', 'Cán màng nhung',
  'Ép kim vàng', 'Ép kim bạc', 'Ép kim holo',
  'Dập nổi', 'Dập chìm', 'Phủ UV cục bộ', 'Phủ UV toàn bộ',
  'Bế (Die-cut)', 'Dán hộp', 'Đóng ghim', 'Đóng gáy keo', 'Khâu chỉ',
  'Xếp tờ', 'Đóng gói'
];

const EMPTY_INK = { colorName: '', colorCode: '', inkBrand: '', mixRatio: '', note: '' };
const EMPTY_OFFSET_COMP = { componentName: '', paperType: '', paperWeight: '', paperSize: '', paperSupplier: '', inkColors: [{ ...EMPTY_INK }], postProcess: [] };
const EMPTY_SILK_FRAME = { frameName: '', meshDetails: '', inkFormula: '', squeegeeStrokes: '', printHits: '', image: '' };

const EMPTY_FORM = {
  name: '', printType: 'offset', customer: '', product: '', status: 'draft',
  offsetComponents: [{ ...EMPTY_OFFSET_COMP }],
  silkEmulsion: '',
  silkFrames: [{ ...EMPTY_SILK_FRAME }],
  machineName: '', machineSettings: '',
  notes: '', images: [], attachments: [],
};

const Section = ({ title, id, section, toggleSection, children }) => (
  <div className="border border-gray-100 rounded-2xl overflow-hidden mb-4 shadow-sm">
    <button type="button" onClick={() => toggleSection(id)}
      className="w-full flex justify-between items-center px-5 py-3 bg-[#F9FAFB] text-sm font-bold text-[#111827] hover:bg-[#E6F0ED] transition">
      {title}
      {section[id] ? <FaChevronUp className="text-xs text-[#006B4D]" /> : <FaChevronDown className="text-xs text-gray-400" />}
    </button>
    {section[id] && <div className="p-5 space-y-4">{children}</div>}
  </div>
);

const Inp = ({ label, name, value, onChange, type = 'text', className = '', required = false, placeholder = '' }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}{required && ' *'}</label>
    <input type={type} name={name} value={value || ''} onChange={onChange} required={required} placeholder={placeholder}
      className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D]" />
  </div>
);

const Sel = ({ label, name, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
    <select name={name} value={value || ''} onChange={onChange}
      className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D]">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ─────────────────────────────────────────────
// MODAL – Create / Edit
// ─────────────────────────────────────────────
const FormulaModal = ({ formula, onClose, onSaved }) => {
  const isEdit = !!formula?._id;
  const [form, setForm] = useState(
    isEdit ? {
      ...EMPTY_FORM,
      ...formula,
      offsetComponents: formula.offsetComponents?.length ? formula.offsetComponents.map(c => ({ ...c, postProcess: (c.postProcess || []).map(p => p.step || p) })) : [{ ...EMPTY_OFFSET_COMP }],
      silkFrames: formula.silkFrames?.length ? formula.silkFrames : [{ ...EMPTY_SILK_FRAME }],
    } : { ...EMPTY_FORM }
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [section, setSection] = useState({ general: true, offset: true, silk: true, machine: true, notes: true });

  // === HOOK: DÁN ẢNH KHUNG LỤA TỪ CLIPBOARD ===
  useImagePaste({
    onImageUploaded: (url) => {
      // Chỉ tự động điền nếu đang ở tab Khung lụa
      if (form.printType === 'silk') {
        // Tìm khung lụa đầu tiên chưa có ảnh
        const targetIdx = form.silkFrames.findIndex(f => !f.image);
        const idx = targetIdx !== -1 ? targetIdx : 0; // Nếu tất cả đều có thì ghi đè lên khung đầu tiên
        changeSilkFrame(idx, 'image', url);
      }
    },
    enabled: form.printType === 'silk'
  });

  const toggleSection = (k) => setSection(s => ({ ...s, [k]: !s[k] }));
  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // OFFSET COMPONENT HANDLERS
  const addOffsetComp = () => setForm(f => ({ ...f, offsetComponents: [...f.offsetComponents, { ...EMPTY_OFFSET_COMP }] }));
  const rmOffsetComp = (idx) => setForm(f => ({ ...f, offsetComponents: f.offsetComponents.filter((_, i) => i !== idx) }));
  const changeOffsetComp = (idx, field, val) => {
    const arr = [...form.offsetComponents];
    arr[idx] = { ...arr[idx], [field]: val };
    setForm(f => ({ ...f, offsetComponents: arr }));
  };

  const addOffsetInk = (cIdx) => {
    const arr = [...form.offsetComponents];
    arr[cIdx].inkColors = [...arr[cIdx].inkColors, { ...EMPTY_INK }];
    setForm(f => ({ ...f, offsetComponents: arr }));
  };
  const rmOffsetInk = (cIdx, iIdx) => {
    const arr = [...form.offsetComponents];
    arr[cIdx].inkColors = arr[cIdx].inkColors.filter((_, i) => i !== iIdx);
    setForm(f => ({ ...f, offsetComponents: arr }));
  };
  const changeOffsetInk = (cIdx, iIdx, field, val) => {
    const arr = [...form.offsetComponents];
    arr[cIdx].inkColors[iIdx] = { ...arr[cIdx].inkColors[iIdx], [field]: val };
    setForm(f => ({ ...f, offsetComponents: arr }));
  };
  const toggleOffsetPost = (cIdx, pStep) => {
    const arr = [...form.offsetComponents];
    const post = arr[cIdx].postProcess;
    arr[cIdx].postProcess = post.includes(pStep) ? post.filter(x => x !== pStep) : [...post, pStep];
    setForm(f => ({ ...f, offsetComponents: arr }));
  };

  // SILK FRAME HANDLERS
  const addSilkFrame = () => setForm(f => ({ ...f, silkFrames: [...f.silkFrames, { ...EMPTY_SILK_FRAME }] }));
  const rmSilkFrame = (idx) => setForm(f => ({ ...f, silkFrames: f.silkFrames.filter((_, i) => i !== idx) }));
  const changeSilkFrame = (idx, field, val) => {
    const arr = [...form.silkFrames];
    arr[idx] = { ...arr[idx], [field]: val };
    setForm(f => ({ ...f, silkFrames: arr }));
  };

  const uploadFrameImage = async (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('images', file);
    setUploading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const { data } = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`
        }
      });
      changeSilkFrame(idx, 'image', data[0]);
      toast.success('Tải ảnh thành công');
    } catch (err) {
      toast.error('Lỗi tải ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Vui lòng nhập tên công thức');
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const cfg = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

      const payload = { ...form };
      if (payload.printType === 'offset') {
        payload.silkFrames = [];
        // format postProcess to obj
        payload.offsetComponents = payload.offsetComponents.map(c => ({
          ...c,
          postProcess: c.postProcess.map(s => ({ step: s }))
        }));
      } else {
        payload.offsetComponents = [];
      }

      if (isEdit) {
        await axios.put(`/api/print-formulas/${formula._id}`, payload, cfg);
        toast.success('Đã cập nhật công thức');
      } else {
        await axios.post('/api/print-formulas', payload, cfg);
        toast.success('Đã tạo công thức mới');
      }
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-5xl mx-4 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-[#111827]">
              {isEdit ? '✏️ Chỉnh sửa công thức' : '➕ Tạo công thức mới'}
            </h2>
            {isEdit && <p className="text-xs text-gray-400 mt-1">Mã: <strong>{formula.formulaCode}</strong></p>}
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <FaTimes size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 overflow-y-auto flex-1">
          {/* THÔNG TIN CHUNG */}
          <Section title="Thông tin chung" id="general" section={section} toggleSection={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Inp label="Tên công thức" name="name" value={form.name} onChange={handleChange} required className="md:col-span-2" placeholder="VD: Hộp cứng Rượu Vang cao cấp" />
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Loại kỹ thuật in *</label>
                <div className="flex gap-3">
                  {[{ value: 'offset', label: '🖨️ In Offset' }, { value: 'silk', label: '🕸️ In Lụa' }].map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setForm(f => ({ ...f, printType: opt.value }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition ${form.printType === opt.value ? 'border-[#006B4D] bg-[#E6F0ED] text-[#006B4D]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <Sel label="Trạng thái" name="status" value={form.status} onChange={handleChange}
                options={[{ value: 'draft', label: 'Nháp' }, { value: 'approved', label: 'Đã duyệt' }, { value: 'archived', label: 'Lưu trữ' }]} />
              <Inp label="Khách hàng" name="customer" value={form.customer} onChange={handleChange} />
              <Inp label="Sản phẩm áp dụng" name="product" value={form.product} onChange={handleChange} />
            </div>
          </Section>

          {/* OFFSET COMPONENTS */}
          {form.printType === 'offset' && (
            <Section title="Cấu thành Offset (Đa chi tiết)" id="offset" section={section} toggleSection={toggleSection}>
              <div className="space-y-6">
                {form.offsetComponents.map((comp, cIdx) => (
                  <div key={cIdx} className="border border-[#E6F0ED] rounded-2xl p-5 bg-white relative shadow-sm">
                    {form.offsetComponents.length > 1 && (
                      <button type="button" onClick={() => rmOffsetComp(cIdx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition">
                        <FaTrash size={14} />
                      </button>
                    )}
                    <h4 className="text-sm font-black text-[#006B4D] mb-4 flex items-center gap-2">
                      <span className="bg-[#E6F0ED] rounded-full w-6 h-6 flex items-center justify-center">{cIdx + 1}</span>
                      Chi tiết: {comp.componentName || 'Chưa đặt tên'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <Inp label="Tên chi tiết" value={comp.componentName} onChange={e => changeOffsetComp(cIdx, 'componentName', e.target.value)} required placeholder="Nắp hộp, Khay hộp..." />
                      <Inp label="Loại giấy" value={comp.paperType} onChange={e => changeOffsetComp(cIdx, 'paperType', e.target.value)} placeholder="Couche, Ivory..." />
                      <Inp label="Định lượng" value={comp.paperWeight} onChange={e => changeOffsetComp(cIdx, 'paperWeight', e.target.value)} placeholder="300gsm" />
                      <Inp label="Khổ giấy" value={comp.paperSize} onChange={e => changeOffsetComp(cIdx, 'paperSize', e.target.value)} placeholder="65x90" />
                    </div>

                    {/* Offset Inks */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Công thức mực CMYK</label>
                      <div className="space-y-2">
                        {comp.inkColors.map((ink, iIdx) => (
                          <div key={iIdx} className="flex gap-2 items-center">
                            <input placeholder="Tên màu *" value={ink.colorName} onChange={e => changeOffsetInk(cIdx, iIdx, 'colorName', e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#006B4D] outline-none" />
                            <input placeholder="Mã C/M/Y/K" value={ink.colorCode} onChange={e => changeOffsetInk(cIdx, iIdx, 'colorCode', e.target.value)} className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#006B4D] outline-none" />
                            <input placeholder="Tỉ lệ" value={ink.mixRatio} onChange={e => changeOffsetInk(cIdx, iIdx, 'mixRatio', e.target.value)} className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#006B4D] outline-none" />
                            <input placeholder="Ghi chú" value={ink.note} onChange={e => changeOffsetInk(cIdx, iIdx, 'note', e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#006B4D] outline-none" />
                            {comp.inkColors.length > 1 && <button type="button" onClick={() => rmOffsetInk(cIdx, iIdx)} className="text-red-400 hover:text-red-600"><FaTimes size={12} /></button>}
                          </div>
                        ))}
                        <button type="button" onClick={() => addOffsetInk(cIdx)} className="text-xs text-[#006B4D] font-bold mt-2 hover:underline flex items-center gap-1"><FaPlus size={10} /> Thêm màu mực</button>
                      </div>
                    </div>

                    {/* Offset Post Process */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Gia công sau in (Offset)</label>
                      <div className="flex flex-wrap gap-2">
                        {OFFSET_POST_PROCESS.map(opt => (
                          <button key={opt} type="button" onClick={() => toggleOffsetPost(cIdx, opt)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${comp.postProcess.includes(opt) ? 'bg-[#006B4D] text-white border-[#006B4D]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#006B4D]'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                ))}
                <button type="button" onClick={addOffsetComp} className="w-full py-3 border-2 border-dashed border-[#006B4D]/30 rounded-2xl text-[#006B4D] font-bold text-sm hover:bg-[#E6F0ED] transition flex items-center justify-center gap-2">
                  <FaPlus /> Thêm chi tiết cấu thành (Nắp, Khay, Thân...)
                </button>
              </div>
            </Section>
          )}

          {/* SILK FRAMES */}
          {form.printType === 'silk' && (
            <Section title="Khung Bảng Kéo Lụa (Trình tự)" id="silk" section={section} toggleSection={toggleSection}>
              <div className="mb-4">
                <Inp label="Keo chụp bảng (Hóa chất nền)" name="silkEmulsion" value={form.silkEmulsion} onChange={handleChange} placeholder="VD: Keo chụp bản hệ gốc nước Ulanogel..." />
              </div>
              <div className="space-y-4 text-sm mt-6">
                <div className="hidden lg:grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2">
                  <div className="col-span-2">Tên khung</div>
                  <div className="col-span-2">Lưới/Căng</div>
                  <div className="col-span-3">Hóa chất pha mực</div>
                  <div className="col-span-1">Lần gạt</div>
                  <div className="col-span-1">SL in</div>
                  <div className="col-span-2">Ảnh demo</div>
                  <div className="col-span-1 text-center">Xóa</div>
                </div>

                {form.silkFrames.map((frame, idx) => (
                  <div key={idx} className="flex flex-col lg:grid lg:grid-cols-12 gap-2 items-start lg:items-center bg-gray-50 p-4 lg:p-2 border border-gray-100 rounded-xl relative">
                    {/* Mobile Label Helpers */}
                    <div className="w-full lg:col-span-2">
                      <span className="lg:hidden text-[10px] font-bold text-gray-400 block mb-1">Tên khung</span>
                      <input value={frame.frameName} onChange={e => changeSilkFrame(idx, 'frameName', e.target.value)} placeholder="Tên khung" className="w-full border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:ring-1 focus:ring-[#006B4D] border" />
                    </div>
                    <div className="w-full lg:col-span-2">
                      <span className="lg:hidden text-[10px] font-bold text-gray-400 block mb-1">Loại lưới</span>
                      <input value={frame.meshDetails} onChange={e => changeSilkFrame(idx, 'meshDetails', e.target.value)} placeholder="VD: 120T" className="w-full border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:ring-1 focus:ring-[#006B4D] border" />
                    </div>
                    <div className="w-full lg:col-span-3">
                      <span className="lg:hidden text-[10px] font-bold text-gray-400 block mb-1">Hóa chất pha mực</span>
                      <textarea value={frame.inkFormula} onChange={e => changeSilkFrame(idx, 'inkFormula', e.target.value)} placeholder="20% bóng, 80% trắng, 2% cầm màu" rows={1} className="w-full border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:ring-1 focus:ring-[#006B4D] border resize-none" />
                    </div>
                    <div className="w-full lg:col-span-1 flex gap-2">
                      <div className="flex-1">
                        <span className="lg:hidden text-[10px] font-bold text-gray-400 block mb-1">Gạt</span>
                        <input value={frame.squeegeeStrokes} onChange={e => changeSilkFrame(idx, 'squeegeeStrokes', e.target.value)} placeholder="số gạt" className="w-full border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:ring-1 focus:ring-[#006B4D] border text-center" />
                      </div>
                    </div>
                    <div className="w-full lg:col-span-1">
                      <span className="lg:hidden text-[10px] font-bold text-gray-400 block mb-1">In (hit)</span>
                      <input value={frame.printHits} onChange={e => changeSilkFrame(idx, 'printHits', e.target.value)} placeholder="SL" className="w-full border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:ring-1 focus:ring-[#006B4D] border text-center" />
                    </div>

                    <div className="w-full lg:col-span-2 flex flex-col items-center justify-center relative">
                      <span className="lg:hidden text-[10px] font-bold text-gray-400 block w-full mb-1">Ảnh minh họa (Tùy chọn)</span>
                      <label className={`w-full flex items-center justify-center gap-2 border-2 border-dashed rounded-lg py-1.5 cursor-pointer hover:bg-gray-100 transition ${frame.image ? 'border-[#006B4D] bg-[#E6F0ED]' : 'border-gray-300'}`}>
                        {uploading ? <span className="text-xs text-gray-400">Đang tải...</span> : frame.image ? <span className="text-[10px] text-[#006B4D] font-bold">Đã tải ảnh</span> : <><FaUpload className="text-gray-400" /> <span className="text-[10px] text-gray-500 font-bold">Upload (hoặc Ctrl+V)</span></>}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadFrameImage(e, idx)} disabled={uploading} />
                      </label>
                      {frame.image && <a href={frame.image} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 underline mt-1 flex items-center gap-1"><FaEye /> Xem ảnh</a>}
                    </div>

                    <div className="w-full lg:col-span-1 flex justify-center mt-2 lg:mt-0">
                      {form.silkFrames.length > 1 && (
                        <button type="button" onClick={() => rmSilkFrame(idx)} className="text-red-400 hover:text-red-600 border lg:border-0 border-red-200 rounded-lg p-2 lg:p-0 w-full flex justify-center hover:bg-red-50">
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button type="button" onClick={addSilkFrame} className="w-full py-2.5 border-2 border-dashed border-purple-300 rounded-xl text-purple-700 font-bold text-sm hover:bg-purple-50 transition flex items-center justify-center gap-2">
                  <FaPlus /> Thêm lớp khung kéo tiếp theo
                </button>
              </div>
            </Section>
          )}

          {/* CÀI ĐẶT MÁY */}
          <Section title="Cài đặt máy (Tùy chọn)" id="machine" section={section} toggleSection={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Inp label="Tên máy sử dụng" name="machineName" value={form.machineName} onChange={handleChange} />
              <div className="flex flex-col gap-1 md:col-span-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Thông số kỹ thuật</label>
                <textarea name="machineSettings" value={form.machineSettings || ''} onChange={handleChange} rows={2}
                  placeholder="Tốc độ, áp lực, nhiệt độ sấy, khoảng cách trục..."
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D] resize-none" />
              </div>
            </div>
          </Section>

          {/* GHI CHÚ */}
          <Section title="Ghi chú chung" id="notes" section={section} toggleSection={toggleSection}>
            <textarea name="notes" value={form.notes || ''} onChange={handleChange} rows={3}
              placeholder="Lưu ý đặc biệt cho cả công thức..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D] resize-none" />
          </Section>
        </form>

        <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-100 shrink-0 bg-white rounded-b-3xl">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
            Hủy
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading || uploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#006B4D] hover:bg-[#005a3f] text-white rounded-xl text-sm font-bold transition shadow-lg disabled:opacity-60">
            <FaSave /> {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo công thức'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MODAL – View Detail (read-only)
// ─────────────────────────────────────────────
const ViewModal = ({ formula, onClose, onEdit, onExport, isAdmin }) => {
  if (!formula) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm overflow-y-auto py-8">
      <div className="w-full max-w-4xl mx-4 bg-white rounded-3xl shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs font-bold text-[#006B4D] tracking-widest uppercase">{formula.formulaCode}</span>
              <h2 className="text-xl font-extrabold text-[#111827] mt-1">{formula.name}</h2>
            </div>
            <button onClick={() => onExport(formula)} className="flex items-center gap-2 bg-[#E6F0ED] text-[#006B4D] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#006B4D] hover:text-white transition">
              <FaFileExcel /> Xuất Chi Tiết
            </button>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition"><FaTimes size={18} /></button>
        </div>
        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <Info label="Loại in" value={formula.printType === 'offset' ? '🖨️ In Offset' : '🕸️ In Lụa'} />
            <Info label="Trạng thái" value={<StatusBadge status={formula.status} />} />
            <Info label="Khách hàng" value={formula.customer || '—'} />
            <Info label="Sản phẩm" value={formula.product || '—'} />
          </div>

          {formula.printType === 'offset' && formula.offsetComponents && formula.offsetComponents.length > 0 && (
            <div className="space-y-4">
              {formula.offsetComponents.map((comp, idx) => (
                <DetailBlock key={idx} title={`Chi tiết: ${comp.componentName || 'Không tên'}`}>
                  <div className="bg-white border text-sm border-gray-200 rounded-xl p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 mb-4 border-b border-dashed border-gray-200 pb-4">
                      <Info label="Loại giấy" value={comp.paperType || '—'} />
                      <Info label="Định lượng" value={comp.paperWeight || '—'} />
                      <Info label="Khổ giấy" value={comp.paperSize || '—'} />
                      <Info label="Nhà cung cấp" value={comp.paperSupplier || '—'} />
                    </div>
                    {comp.inkColors && comp.inkColors.length > 0 && (
                      <div className="mb-4 border-b border-dashed border-gray-200 pb-4">
                        <label className="text-[10px] uppercase font-bold text-gray-400 mb-2 block">Công thức mực</label>
                        <table className="w-full text-xs text-left">
                          <thead><tr className="text-gray-500"><th className="pb-2">Tên màu</th><th className="pb-2">Mã màu</th><th className="pb-2">Tỉ lệ pha</th></tr></thead>
                          <tbody>
                            {comp.inkColors.map((c, i) => (
                              <tr key={i}>
                                <td className="py-1 font-bold">{c.colorName}</td><td>{c.colorCode}</td><td>{c.mixRatio}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {comp.postProcess && comp.postProcess.length > 0 && (
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 mb-2 block">Gia công sau in</label>
                        <div className="flex flex-wrap gap-2">
                          {comp.postProcess.map((p, i) => (
                            <span key={i} className="px-2 py-1 bg-[#E6F0ED] text-[#006B4D] rounded text-xs font-bold">{p.step || p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DetailBlock>
              ))}
            </div>
          )}

          {formula.printType === 'silk' && (
            <div className="space-y-4">
              {formula.silkEmulsion && (
                <DetailBlock title="Hóa chất nền">
                  <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">{formula.silkEmulsion}</div>
                </DetailBlock>
              )}
              {formula.silkFrames && formula.silkFrames.length > 0 && (
                <DetailBlock title="Trình tự kéo khung lụa">
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#006B4D] text-white text-xs">
                        <tr>
                          <th className="px-4 py-3 border-r border-[#005a3f]">Khung</th>
                          <th className="px-4 py-3">Lưới</th>
                          <th className="px-4 py-3">Công thức pha hóa chất</th>
                          <th className="px-4 py-3 text-center">Lần gạt</th>
                          <th className="px-4 py-3 text-center">Lần in (Hit)</th>
                          <th className="px-4 py-3 text-center">Hình ảnh</th>
                          {isAdmin && <th className="px-4 py-3 text-center">Thao tác</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {formula.silkFrames.map((f, i) => (
                          <tr key={i} className="bg-white">
                            <td className="px-4 py-3 font-bold text-[#006B4D] border-r border-gray-100">{f.frameName || `Khung ${i + 1}`}</td>
                            <td className="px-4 py-3 text-xs">{f.meshDetails}</td>
                            <td className="px-4 py-3 text-xs whitespace-pre-wrap">{f.inkFormula}</td>
                            <td className="px-4 py-3 text-center font-semibold">{f.squeegeeStrokes}</td>
                            <td className="px-4 py-3 text-center font-bold text-blue-600">{f.printHits}</td>
                            <td className="px-4 py-3 text-center">
                              {f.image ? <a href={f.image} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 mx-auto w-fit block p-1 bg-blue-50 rounded"><FaImage size={16} /></a> : <span className="text-gray-300">-</span>}
                            </td>
                            {isAdmin && (
                              <td className="px-4 py-3 text-center">
                                {/* Add specific actions for silk frames if needed, or leave empty */}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </DetailBlock>
              )}
            </div>
          )}

          {formula.notes && (
            <DetailBlock title="Ghi chú kỹ thuật chung">
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">{formula.notes}</p>
            </DetailBlock>
          )}
        </div>
        <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Đóng</button>
          {isAdmin && (
            <button onClick={() => onEdit(formula)} className="flex items-center gap-2 px-5 py-2.5 bg-[#006B4D] text-white rounded-xl text-sm font-bold hover:bg-[#005a3f] transition">
              <FaEdit /> Chỉnh sửa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{label}</span>
    <span className="text-sm font-bold text-[#111827]">{value}</span>
  </div>
);
const DetailBlock = ({ title, children }) => (
  <div className="mb-4">
    <h4 className="text-xs font-black text-gray-500 mb-3 uppercase tracking-wider">{title}</h4>
    {children}
  </div>
);

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────
const PrintFormulaScreen = () => {
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    setIsAdmin(userInfo?.isAdmin || false);
  }, []);

  const getToken = () => {
    const u = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return { headers: { Authorization: `Bearer ${u.token}` } };
  };

  const fetchFormulas = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (tab !== 'all') params.printType = tab;
      if (status) params.status = status;
      if (search.trim()) params.q = search.trim();
      const { data } = await axios.get('/api/print-formulas', { ...getToken(), params });
      setFormulas(data);
    } catch {
      toast.error('Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [tab, status, search]);

  useEffect(() => { fetchFormulas(); }, [fetchFormulas]);

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa công thức này?')) return;
    try {
      await axios.delete(`/api/print-formulas/${id}`, getToken());
      toast.success('Đã xóa');
      fetchFormulas();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await axios.put(`/api/print-formulas/${id}/duplicate`, {}, getToken());
      toast.success('Đã nhân bản công thức');
      fetchFormulas();
    } catch {
      toast.error('Nhân bản thất bại');
    }
  };


  const exportDetailedExcel = async (f) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('ChiTietCongThuc', { views: [{ showGridLines: false }] });

      // 1. Định hình 7 Cột
      ws.columns = [
        { width: 18 }, { width: 20 }, { width: 20 }, { width: 18 },
        { width: 15 }, { width: 20 }, { width: 25 }
      ];

      ws.getRow(1).height = 25;
      ws.getRow(2).height = 20;
      ws.getRow(3).height = 20;
      ws.getRow(5).height = 40;
      ws.getRow(6).height = 25;

      // 2. CHÈN LOGO
      try {
        const response = await fetch(`/logo.png?t=${new Date().getTime()}`);
        if (response.ok) {
          const buffer = await (await response.blob()).arrayBuffer();
          const logoId = workbook.addImage({ buffer: buffer, extension: 'png' });
          ws.addImage(logoId, {
            tl: { col: 0.2, row: 0.2 },
            ext: { width: 160, height: 65 }, // Chỉnh lại size logo thon gọn hơn
            editAs: 'absolute'
          });
        }
      } catch (e) { console.warn("Lỗi logo", e); }

      // 3. HEADER CÔNG TY
      ws.mergeCells('C1:G1');
      const compName = ws.getCell('C1');
      compName.value = 'CÔNG TY TNHH IN QUANG PHÁT';
      compName.font = { bold: true, size: 16, color: { argb: 'FFC00000' } };
      compName.alignment = { vertical: 'middle', horizontal: 'left' };

      ws.mergeCells('C2:G2');
      const compInfo = ws.getCell('C2');
      compInfo.value = 'Hotline: 0935.110.639 - Email: quang02042002@gmail.com';
      compInfo.font = { italic: true, size: 11, color: { argb: 'FF555555' } };

      ws.mergeCells('C3:G3');
      ws.getCell('C3').value = 'ĐC: Số 5 Đường Số 4 - Cụm CN An Hoà - Thành phố Huế';
      ws.getCell('C3').font = { italic: true, size: 11, color: { argb: 'FF555555' } };

      // 4. TIÊU ĐỀ BÁO CÁO
      ws.mergeCells('A5:G5');
      const title = ws.getCell('A5');
      title.value = 'PHIẾU CHI TIẾT CÔNG THỨC IN';
      title.font = { bold: true, size: 20, color: { argb: 'FF002060' } };
      title.alignment = { vertical: 'middle', horizontal: 'center' };

      const today = new Date();
      const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
      ws.mergeCells('A6:G6');
      ws.getCell('A6').value = `Ngày xuất: ${dateStr}`;
      ws.getCell('A6').alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getCell('A6').font = { italic: true, color: { argb: 'FF555555' } };

      // HÀM TIỆN ÍCH
      const applyStyle = (row, isHeader = false) => {
        row.height = isHeader ? 28 : 22;
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFBFBFBF' } }, bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
            left: { style: 'thin', color: { argb: 'FFBFBFBF' } }, right: { style: 'thin', color: { argb: 'FFBFBFBF' } }
          };
          cell.alignment = { vertical: 'middle', horizontal: isHeader ? 'center' : 'left', wrapText: true };
          if (isHeader) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002060' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 }; // Font nhỏ gọn lại
          }
        });
      };

      ws.addRow([]); // Dòng 7 trống

      // 5. KHỐI THÔNG TIN CƠ BẢN (Tự động lấy số dòng chuẩn xác)
      const r1 = ws.addRow(["Mã CT:", f.formulaCode || '-', "", "Tên CT:", f.name, "", ""]);
      ws.mergeCells(`B${r1.number}:C${r1.number}`); ws.mergeCells(`E${r1.number}:G${r1.number}`); applyStyle(r1);
      r1.getCell(1).font = { bold: true }; r1.getCell(4).font = { bold: true };

      const r2 = ws.addRow(["Khách hàng:", f.customer || '-', "", "Sản phẩm:", f.product || '-', "", ""]);
      ws.mergeCells(`B${r2.number}:C${r2.number}`); ws.mergeCells(`E${r2.number}:G${r2.number}`); applyStyle(r2);
      r2.getCell(1).font = { bold: true }; r2.getCell(4).font = { bold: true };

      const r3 = ws.addRow(["Loại in:", f.printType === 'offset' ? 'In Offset' : 'In Lụa', "", "Trạng thái:", f.status === 'draft' ? 'Nháp' : f.status === 'approved' ? 'Đã duyệt' : 'Lưu trữ', "", ""]);
      ws.mergeCells(`B${r3.number}:C${r3.number}`); ws.mergeCells(`E${r3.number}:G${r3.number}`); applyStyle(r3);
      r3.getCell(1).font = { bold: true }; r3.getCell(4).font = { bold: true };

      const r4 = ws.addRow(["Ghi chú chung:", f.notes || '-', "", "", "", "", ""]);
      ws.mergeCells(`B${r4.number}:G${r4.number}`); applyStyle(r4);
      r4.getCell(1).font = { bold: true };

      ws.addRow([]); // Khoảng trắng

      // 6. DỮ LIỆU CHI TIẾT
      if (f.printType === 'offset') {
        const secRow = ws.addRow(["--- CẤU THÀNH IN OFFSET ---", "", "", "", "", "", ""]);
        ws.mergeCells(`A${secRow.number}:G${secRow.number}`); applyStyle(secRow, true);

        (f.offsetComponents || []).forEach((c, idx) => {
          ws.addRow([]);
          const subRow = ws.addRow([`Chi tiết ${idx + 1}: ${c.componentName || 'Chưa đặt tên'}`, "", "", "", "", "", ""]);
          ws.mergeCells(`A${subRow.number}:G${subRow.number}`); applyStyle(subRow);
          subRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
          subRow.getCell(1).font = { bold: true, color: { argb: 'FF002060' } };

          const hdr1 = ws.addRow(['Loại giấy', '', 'Định lượng', 'Khổ giấy', '', 'Nhà cung cấp', '']);
          ws.mergeCells(`A${hdr1.number}:B${hdr1.number}`); ws.mergeCells(`D${hdr1.number}:E${hdr1.number}`); ws.mergeCells(`F${hdr1.number}:G${hdr1.number}`);
          applyStyle(hdr1, true); hdr1.eachCell(cell => cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC00000' } });

          const val1 = ws.addRow([c.paperType || '-', '', c.paperWeight || '-', c.paperSize || '-', '', c.paperSupplier || '-', '']);
          ws.mergeCells(`A${val1.number}:B${val1.number}`); ws.mergeCells(`D${val1.number}:E${val1.number}`); ws.mergeCells(`F${val1.number}:G${val1.number}`);
          applyStyle(val1);

          if (c.inkColors && c.inkColors.length > 0) {
            ws.addRow([]);
            const inkHdr = ws.addRow(['Tên màu', '', 'Mã màu', '', 'Tỉ lệ', 'Ghi chú', '']);
            ws.mergeCells(`A${inkHdr.number}:B${inkHdr.number}`); ws.mergeCells(`C${inkHdr.number}:D${inkHdr.number}`); ws.mergeCells(`F${inkHdr.number}:G${inkHdr.number}`);
            applyStyle(inkHdr, true); inkHdr.eachCell(cell => cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC00000' } });

            c.inkColors.forEach(ink => {
              const inkVal = ws.addRow([ink.colorName, '', ink.colorCode, '', ink.mixRatio, ink.note, '']);
              ws.mergeCells(`A${inkVal.number}:B${inkVal.number}`); ws.mergeCells(`C${inkVal.number}:D${inkVal.number}`); ws.mergeCells(`F${inkVal.number}:G${inkVal.number}`);
              applyStyle(inkVal);
            });
          }

          if (c.postProcess && c.postProcess.length > 0) {
            ws.addRow([]);
            const postRow = ws.addRow(['Gia công sau in:', c.postProcess.map(p => p.step || p).join(', '), "", "", "", "", ""]);
            ws.mergeCells(`B${postRow.number}:G${postRow.number}`); applyStyle(postRow);
            postRow.getCell(1).font = { bold: true };
          }
        });
      } else {
        const secRow = ws.addRow(["--- TRÌNH TỰ KHUNG BẢNG LỤA ---", "", "", "", "", "", ""]);
        ws.mergeCells(`A${secRow.number}:G${secRow.number}`); applyStyle(secRow, true);

        const chemRow = ws.addRow(['Hóa chất nền:', f.silkEmulsion || '-', "", "", "", "", ""]);
        ws.mergeCells(`B${chemRow.number}:G${chemRow.number}`); applyStyle(chemRow);
        chemRow.getCell(1).font = { bold: true };

        ws.addRow([]);

        const tblHdr = ws.addRow(['STT', 'Tên khung', 'Lưới/Căng', 'Hóa chất pha mực', 'Lần gạt', 'SL in (Hit)', 'Ảnh Demo']);
        applyStyle(tblHdr, true); tblHdr.eachCell(cell => cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC00000' } });

        (f.silkFrames || []).forEach((frame, idx) => {
          const rowData = ws.addRow([
            idx + 1, frame.frameName || '-', frame.meshDetails || '-', frame.inkFormula || '-',
            frame.squeegeeStrokes || '-', frame.printHits || '-', frame.image || 'Không có'
          ]);
          applyStyle(rowData);
          rowData.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

          if (frame.image && frame.image.startsWith('http')) {
            rowData.getCell(7).value = { text: 'Xem ảnh đính kèm', hyperlink: frame.image };
            rowData.getCell(7).font = { color: { argb: 'FF0563C1' }, underline: true };
          }
        });
      }

      // 7. XUẤT FILE
      const fileBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `ChiTiet_${f.formulaCode || 'CT'}_${dateStr.replace(/\//g, '_')}.xlsx`);
      toast.success(`Đã xuất Excel chi tiết mã ${f.formulaCode || 'CT'}!`);

    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi xuất file Excel');
    }
  };

  // ==========================================
  // XUẤT DANH SÁCH CÔNG THỨC IN
  // ==========================================
  const exportExcel = async () => {
    if (!formulas.length) return toast.warning('Không có dữ liệu để xuất');

    try {
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('DanhSach', { views: [{ showGridLines: false }] });

      ws.columns = [
        { width: 8 }, { width: 18 }, { width: 35 }, { width: 15 },
        { width: 40 }, { width: 25 }, { width: 25 }, { width: 15 }, { width: 15 }
      ];

      ws.getRow(1).height = 25; ws.getRow(2).height = 20; ws.getRow(3).height = 20;
      ws.getRow(5).height = 40; ws.getRow(6).height = 25;

      try {
        const response = await fetch(`/logo.png?t=${new Date().getTime()}`);
        if (response.ok) {
          const buffer = await (await response.blob()).arrayBuffer();
          const logoId = workbook.addImage({ buffer: buffer, extension: 'png' });
          ws.addImage(logoId, { tl: { col: 0.2, row: 0.2 }, ext: { width: 160, height: 65 }, editAs: 'absolute' });
        }
      } catch (e) { console.warn("Lỗi logo", e); }

      ws.mergeCells('D1:I1');
      ws.getCell('D1').value = 'CÔNG TY TNHH IN QUANG PHÁT';
      ws.getCell('D1').font = { bold: true, size: 16, color: { argb: 'FFC00000' } };
      ws.getCell('D1').alignment = { vertical: 'middle', horizontal: 'left' };

      ws.mergeCells('D2:I2');
      ws.getCell('D2').value = 'Hotline: 0935.110.639 - Email: quang02042002@gmail.com';
      ws.getCell('D2').font = { italic: true, size: 11, color: { argb: 'FF555555' } };

      ws.mergeCells('D3:I3');
      ws.getCell('D3').value = 'ĐC: Số 5 Đường Số 4 - Cụm CN An Hoà - Thành phố Huế';
      ws.getCell('D3').font = { italic: true, size: 11, color: { argb: 'FF555555' } };

      ws.mergeCells('A5:I5');
      ws.getCell('A5').value = 'DANH SÁCH CÔNG THỨC IN';
      ws.getCell('A5').font = { bold: true, size: 20, color: { argb: 'FF002060' } };
      ws.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' };

      const today = new Date();
      const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
      ws.mergeCells('A6:I6');
      ws.getCell('A6').value = `Ngày xuất báo cáo: ${dateStr}`;
      ws.getCell('A6').alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getCell('A6').font = { italic: true, color: { argb: 'FF555555' } };

      ws.addRow([]); // Dòng 7 trống

      const headerRow = ws.addRow(["STT", "Mã CT", "Tên công thức", "Loại in", "Chi tiết / Khung", "Khách hàng", "Sản phẩm", "Trạng thái", "Ngày tạo"]);
      headerRow.height = 30;
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002060' } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = { top: { style: 'thin', color: { argb: 'FFBFBFBF' } }, bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } }, left: { style: 'thin', color: { argb: 'FFBFBFBF' } }, right: { style: 'thin', color: { argb: 'FFBFBFBF' } } };
      });

      formulas.forEach((f, idx) => {
        const isOffset = f.printType === 'offset';
        const row = ws.addRow([
          idx + 1, f.formulaCode || '', f.name, isOffset ? 'In Offset' : 'In Lụa',
          isOffset ? (f.offsetComponents || []).map(c => c.componentName).join(', ') : (f.silkFrames || []).map(k => k.frameName).join(', '),
          f.customer || '', f.product || '', f.status === 'draft' ? 'Nháp' : f.status === 'approved' ? 'Đã duyệt' : 'Lưu trữ',
          new Date(f.createdAt).toLocaleDateString('vi-VN')
        ]);

        row.height = 25;
        row.eachCell((cell, colNum) => {
          cell.border = { top: { style: 'thin', color: { argb: 'FFBFBFBF' } }, bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } }, left: { style: 'thin', color: { argb: 'FFBFBFBF' } }, right: { style: 'thin', color: { argb: 'FFBFBFBF' } } };
          cell.alignment = { vertical: 'middle', wrapText: true, horizontal: (colNum === 1 || colNum === 4 || colNum === 8 || colNum === 9) ? 'center' : 'left' };
        });
      });

      const fileBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `DanhSachCongThucIn_${dateStr.replace(/\//g, '_')}.xlsx`);
      toast.success('Đã xuất file Excel danh sách thành công!');

    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi xuất danh sách Excel');
    }
  };

  const tabBase = 'px-5 py-2 rounded-full text-sm font-bold transition border';
  const tabAct = 'bg-[#006B4D] text-white border-[#006B4D]';
  const tabIdle = 'bg-white text-gray-600 border-gray-200 hover:border-[#006B4D]/50';

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827]">
      <div className="h-full flex-shrink-0 z-10 hidden lg:block"><Sidebar /></div>
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <AdminHeader title="Quản Lý Công Thức In" />
        {(modal === 'create' || (modal && modal._id)) && (
          <FormulaModal formula={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchFormulas(); }} />
        )}
        {viewing && <ViewModal formula={viewing} onClose={() => setViewing(null)} onEdit={(f) => { setViewing(null); setModal(f); }} onExport={exportDetailedExcel} isAdmin={isAdmin} />}

        <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#111827] flex items-center gap-3">
                <FaFlask className="text-[#006B4D]" /> Công thức In nâng cao
              </h1>
              <p className="text-sm text-gray-500 mt-1">Lưu trữ & tra cứu công thức đa chi tiết và đa khung kéo</p>
            </div>
            <div className="flex gap-3">
              {/* <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-[#006B4D] hover:bg-[#E6F0ED] transition">
              <FaFileExcel /> Xuất Excel
            </button> */}
              {isAdmin && (
                <button onClick={() => setModal('create')} className="flex items-center gap-2 px-5 py-2.5 bg-[#006B4D] text-white rounded-xl text-sm font-bold hover:bg-[#005a3f] transition shadow-lg">
                  <FaPlus /> Tạo công thức
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-2">
              {[{ key: 'all', label: 'Tất cả' }, { key: 'offset', label: '🖨️ In Offset' }, { key: 'silk', label: '🕸️ In Lụa' }].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} className={`${tabBase} ${tab === t.key ? tabAct : tabIdle}`}>{t.label}</button>
              ))}
            </div>
            <div className="flex-1" />
            <select value={status} onChange={e => setStatus(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30">
              <option value="">Mọi trạng thái</option>
              <option value="draft">Nháp</option>
              <option value="approved">Đã duyệt</option>
              <option value="archived">Lưu trữ</option>
            </select>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchFormulas()} placeholder="Tìm tên, mã, khách hàng..." className="pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 w-64" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-gray-400 text-sm">Đang tải...</div>
            ) : formulas.length === 0 ? (
              <div className="py-20 text-center">
                <FaFlask className="text-5xl text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">Chưa có công thức nào</p>
                {isAdmin && (
                  <button onClick={() => setModal('create')} className="mt-4 px-5 py-2.5 bg-[#006B4D] text-white rounded-xl text-sm font-bold hover:bg-[#005a3f] transition">
                    Tạo công thức đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-[10px] tracking-wider uppercase font-bold border-b border-gray-200">
                      <th className="px-5 py-4 text-left">Mã CT</th>
                      <th className="px-5 py-4 text-left">Tên công thức / Sản phẩm</th>
                      <th className="px-5 py-4 text-left">Phân loại</th>
                      <th className="px-5 py-4 text-left">Cấu thành / Mảng chi tiết</th>
                      <th className="px-5 py-4 text-center">Trạng thái</th>
                      <th className="px-5 py-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {formulas.map(f => {
                      const isOff = f.printType === 'offset';
                      return (
                        <tr key={f._id} className="hover:bg-[#F9FAFB] transition group">
                          <td className="px-5 py-4 font-mono text-xs text-[#006B4D] font-bold">{f.formulaCode}</td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-[#111827] line-clamp-1">{f.name}</div>
                            {f.product && <div className="text-xs text-gray-400 mt-0.5">{f.product} {f.customer && `(${f.customer})`}</div>}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${isOff ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                              {isOff ? '🖨️ Offset' : '🕸️ Lụa'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-600">
                            {isOff ? (
                              <div className="flex flex-wrap gap-1">
                                {(f.offsetComponents || []).map((c, i) => <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">{c.componentName || 'Chi tiết'}</span>)}
                              </div>
                            ) : (
                              <span className="text-purple-600 font-medium">{(f.silkFrames || []).length} khung in</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-center"><StatusBadge status={f.status} /></td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => setViewing(f)} title="Xem chi tiết" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-[#006B4D] hover:text-white transition"><FaEye size={12} /></button>
                              <button onClick={() => exportDetailedExcel(f)} title="Xuất Excel Chi Tiết Mã Này" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-green-600 hover:text-white transition"><FaFileExcel size={12} /></button>
                              {isAdmin && (
                                <>
                                  <button onClick={() => setModal(f)} title="Chỉnh sửa" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-500 hover:text-white transition"><FaEdit size={12} /></button>
                                  <button onClick={() => handleDuplicate(f._id)} title="Nhân bản" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-yellow-500 hover:text-white transition"><FaCopy size={12} /></button>
                                  <button onClick={() => handleDelete(f._id)} title="Xóa" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white transition"><FaTrash size={12} /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintFormulaScreen;
