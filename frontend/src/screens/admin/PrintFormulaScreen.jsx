import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaFileExcel,
  FaFlask, FaTimes, FaChevronDown, FaChevronUp, FaSave,
  FaEye, FaUpload, FaImage, FaCheck, FaCodeBranch, FaHistory,
} from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import { useImagePaste } from '../../hooks/useImagePaste';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    draft:    { label: 'Đang phát triển', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    approved: { label: '✅ Đã chốt',       cls: 'bg-green-50 text-green-700 border-green-200' },
    archived: { label: 'Phiên bản cũ',    cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  };
  const s = map[status] || map.draft;
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${s.cls}`}>{s.label}</span>;
};

const VersionBadge = ({ version }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
    <FaCodeBranch size={9} /> v{version}
  </span>
);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const OFFSET_POST_PROCESS = [
  'Cán màng mờ', 'Cán màng bóng', 'Cán màng nhung',
  'Ép kim vàng', 'Ép kim bạc', 'Ép kim holo',
  'Dập nổi', 'Dập chìm', 'Phủ UV cục bộ', 'Phủ UV toàn bộ',
  'Bế (Die-cut)', 'Dán hộp', 'Đóng ghim', 'Đóng gáy keo', 'Khâu chỉ',
  'Xếp tờ', 'Đóng gói'
];

const EMPTY_INK         = { colorName: '', colorCode: '', inkBrand: '', mixRatio: '', note: '' };
const EMPTY_OFFSET_COMP = { componentName: '', paperType: '', paperWeight: '', paperSize: '', paperSupplier: '', inkColors: [{ ...EMPTY_INK }], postProcess: [] };
const EMPTY_SILK_FRAME  = { frameName: '', meshDetails: '', inkFormula: '', squeegeeStrokes: '', printHits: '', image: '' };

const EMPTY_FORM = {
  name: '', printType: 'offset', customer: '', product: '', status: 'draft',
  offsetComponents: [{ ...EMPTY_OFFSET_COMP }],
  silkEmulsion: '',
  silkFrames: [{ ...EMPTY_SILK_FRAME }],
  machineName: '', machineSettings: '',
  notes: '', images: [], attachments: [],
};

// ─── UI HELPERS ──────────────────────────────────────────────────────────────
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

// ─── CONFIRM MODAL ───────────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, bgColor }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-extrabold text-[#111827] mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6 whitespace-pre-wrap leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 transition">
            Huỷ
          </button>
          <button onClick={onConfirm} className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition ${bgColor}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── VERSION HISTORY MODAL ───────────────────────────────────────────────────
const VersionHistoryModal = ({ sampleGroup, onClose, onView, getToken }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`/api/print-formulas/group/${sampleGroup}`, getToken());
        setVersions(data);
      } catch { toast.error('Không tải được lịch sử'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [sampleGroup]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-white rounded-3xl shadow-2xl">
        <div className="flex justify-between items-center px-6 py-5 border-b">
          <div>
            <h3 className="font-extrabold text-lg">Lịch sử phiên bản</h3>
            <p className="text-xs text-gray-400 mt-0.5">Nhóm mẫu: <strong className="text-indigo-600">{sampleGroup}</strong></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><FaTimes size={18} /></button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-400 py-8">Đang tải...</p>
          ) : (
            <div className="relative pl-6">
              {/* Timeline vertical line */}
              <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {versions.map((v, i) => (
                  <div key={v._id} className="relative flex gap-4 items-start">
                    {/* Timeline dot */}
                    <div className={`absolute -left-3.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      v.status === 'approved' ? 'bg-green-500 border-green-600' :
                      v.status === 'archived' ? 'bg-gray-300 border-gray-400' :
                      'bg-yellow-400 border-yellow-500'
                    }`}>
                      {v.status === 'approved' && <FaCheck className="text-white" style={{ fontSize: 7 }} />}
                    </div>
                    <div className={`flex-1 rounded-xl border p-4 ${
                      v.status === 'approved' ? 'border-green-200 bg-green-50' :
                      v.status === 'archived' ? 'border-gray-100 bg-gray-50 opacity-70' :
                      'border-yellow-200 bg-yellow-50'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <VersionBadge version={v.version} />
                          <StatusBadge status={v.status} />
                        </div>
                        <span className="text-[10px] text-gray-400">{new Date(v.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{v.name}</p>
                      {v.status === 'approved' && v.approvedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Chốt lúc {new Date(v.approvedAt).toLocaleString('vi-VN')}
                          {v.approvedBy?.name && ` bởi ${v.approvedBy.name}`}
                        </p>
                      )}
                      <button onClick={() => { onView(v); onClose(); }}
                        className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        <FaEye size={10} /> Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t flex justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-xl border text-sm font-bold text-gray-600 hover:bg-gray-50">Đóng</button>
        </div>
      </div>
    </div>
  );
};

// ─── FORMULA MODAL (Create/Edit) ─────────────────────────────────────────────
const FormulaModal = ({ formula, onClose, onSaved }) => {
  const isEdit = !!formula?._id;
  const isApproved = formula?.status === 'approved';

  const [form, setForm] = useState(
    isEdit ? {
      ...EMPTY_FORM, ...formula,
      offsetComponents: formula.offsetComponents?.length ? formula.offsetComponents.map(c => ({ ...c, postProcess: (c.postProcess || []).map(p => p.step || p) })) : [{ ...EMPTY_OFFSET_COMP }],
      silkFrames: formula.silkFrames?.length ? formula.silkFrames : [{ ...EMPTY_SILK_FRAME }],
    } : { ...EMPTY_FORM }
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [section, setSection] = useState({ general: true, offset: true, silk: true, machine: true, notes: true });

  useImagePaste({
    onImageUploaded: (url) => {
      if (form.printType === 'silk') {
        const targetIdx = form.silkFrames.findIndex(f => !f.image);
        changeSilkFrame(targetIdx !== -1 ? targetIdx : 0, 'image', url);
      }
    },
    enabled: form.printType === 'silk'
  });

  const toggleSection = (k) => setSection(s => ({ ...s, [k]: !s[k] }));
  const handleChange  = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const addOffsetComp    = () => setForm(f => ({ ...f, offsetComponents: [...f.offsetComponents, { ...EMPTY_OFFSET_COMP }] }));
  const rmOffsetComp     = (idx) => setForm(f => ({ ...f, offsetComponents: f.offsetComponents.filter((_, i) => i !== idx) }));
  const changeOffsetComp = (idx, field, val) => { const arr = [...form.offsetComponents]; arr[idx] = { ...arr[idx], [field]: val }; setForm(f => ({ ...f, offsetComponents: arr })); };
  const addOffsetInk     = (ci) => { const arr = [...form.offsetComponents]; arr[ci].inkColors = [...arr[ci].inkColors, { ...EMPTY_INK }]; setForm(f => ({ ...f, offsetComponents: arr })); };
  const rmOffsetInk      = (ci, ii) => { const arr = [...form.offsetComponents]; arr[ci].inkColors = arr[ci].inkColors.filter((_, i) => i !== ii); setForm(f => ({ ...f, offsetComponents: arr })); };
  const changeOffsetInk  = (ci, ii, field, val) => { const arr = [...form.offsetComponents]; arr[ci].inkColors[ii] = { ...arr[ci].inkColors[ii], [field]: val }; setForm(f => ({ ...f, offsetComponents: arr })); };
  const toggleOffsetPost = (ci, step) => { const arr = [...form.offsetComponents]; const post = arr[ci].postProcess; arr[ci].postProcess = post.includes(step) ? post.filter(x => x !== step) : [...post, step]; setForm(f => ({ ...f, offsetComponents: arr })); };

  const addSilkFrame    = () => setForm(f => ({ ...f, silkFrames: [...f.silkFrames, { ...EMPTY_SILK_FRAME }] }));
  const rmSilkFrame     = (idx) => setForm(f => ({ ...f, silkFrames: f.silkFrames.filter((_, i) => i !== idx) }));
  const changeSilkFrame = (idx, field, val) => { const arr = [...form.silkFrames]; arr[idx] = { ...arr[idx], [field]: val }; setForm(f => ({ ...f, silkFrames: arr })); };

  const uploadFrameImage = async (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('images', file);
    setUploading(true);
    try {
      const ui = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const { data } = await axios.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${ui.token}` } });
      changeSilkFrame(idx, 'image', data[0]);
      toast.success('Tải ảnh thành công');
    } catch { toast.error('Lỗi tải ảnh'); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.name.trim()) return toast.error('Vui lòng nhập tên mẫu');
    setLoading(true);
    try {
      const ui  = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const cfg = { headers: { Authorization: `Bearer ${ui.token}` } };
      const payload = { ...form };
      if (payload.printType === 'offset') {
        payload.silkFrames         = [];
        payload.offsetComponents   = payload.offsetComponents.map(c => ({ ...c, postProcess: c.postProcess.map(s => ({ step: s })) }));
      } else {
        payload.offsetComponents   = [];
      }
      if (isEdit) {
        await axios.put(`/api/print-formulas/${formula._id}`, payload, cfg);
        toast.success('Đã cập nhật mẫu');
      } else {
        await axios.post('/api/print-formulas', payload, cfg);
        toast.success('Đã tạo phiên bản mẫu mới (v1)');
      }
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-5xl mx-4 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-[#111827]">
              {isEdit ? (isApproved ? '👁️ Xem mẫu đã chốt' : '✏️ Chỉnh sửa mẫu') : '🧪 Tạo mẫu mới (v1)'}
            </h2>
            {isEdit && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-400">Mã: <strong>{formula.formulaCode}</strong></p>
                <VersionBadge version={formula.version} />
                <StatusBadge status={formula.status} />
                {formula.sampleGroup && <p className="text-xs text-indigo-500 font-bold">Nhóm: {formula.sampleGroup}</p>}
              </div>
            )}
            {isApproved && <p className="text-xs text-yellow-600 mt-1 bg-yellow-50 px-2 py-0.5 rounded-lg inline-block">Mẫu đã chốt — chỉ đọc</p>}
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-red-500 transition"><FaTimes size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 overflow-y-auto flex-1">
          {/* THÔNG TIN CHUNG */}
          <Section title="Thông tin chung" id="general" section={section} toggleSection={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Inp label="Tên mẫu" name="name" value={form.name} onChange={handleChange} required className="md:col-span-2" placeholder="VD: Hộp cứng Rượu Vang cao cấp" />
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Loại kỹ thuật in *</label>
                <div className="flex gap-3">
                  {[{ value: 'offset', label: '🖨️ In Offset' }, { value: 'silk', label: '🕸️ In Lụa' }].map(opt => (
                    <button key={opt.value} type="button" disabled={isApproved || isEdit}
                      onClick={() => setForm(f => ({ ...f, printType: opt.value }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition ${form.printType === opt.value ? 'border-[#006B4D] bg-[#E6F0ED] text-[#006B4D]' : 'border-gray-200 text-gray-500'} ${(isApproved || isEdit) ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-300'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
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
                    {!isApproved && form.offsetComponents.length > 1 && (
                      <button type="button" onClick={() => rmOffsetComp(cIdx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><FaTrash size={14} /></button>
                    )}
                    <h4 className="text-sm font-black text-[#006B4D] mb-4 flex items-center gap-2">
                      <span className="bg-[#E6F0ED] rounded-full w-6 h-6 flex items-center justify-center">{cIdx + 1}</span>
                      Chi tiết: {comp.componentName || 'Chưa đặt tên'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <Inp label="Tên chi tiết" value={comp.componentName} onChange={e => changeOffsetComp(cIdx, 'componentName', e.target.value)} required placeholder="Nắp hộp..." />
                      <Inp label="Loại giấy"    value={comp.paperType}     onChange={e => changeOffsetComp(cIdx, 'paperType', e.target.value)} placeholder="Couche, Ivory..." />
                      <Inp label="Định lượng"   value={comp.paperWeight}   onChange={e => changeOffsetComp(cIdx, 'paperWeight', e.target.value)} placeholder="300gsm" />
                      <Inp label="Khổ giấy"     value={comp.paperSize}     onChange={e => changeOffsetComp(cIdx, 'paperSize', e.target.value)} placeholder="65x90" />
                    </div>
                    {/* Inks */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Công thức mực CMYK</label>
                      <div className="space-y-2">
                        {comp.inkColors.map((ink, iIdx) => (
                          <div key={iIdx} className="flex gap-2 items-center">
                            <input placeholder="Tên màu *"   value={ink.colorName} onChange={e => changeOffsetInk(cIdx, iIdx, 'colorName', e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#006B4D] outline-none" disabled={isApproved} />
                            <input placeholder="Mã C/M/Y/K" value={ink.colorCode} onChange={e => changeOffsetInk(cIdx, iIdx, 'colorCode', e.target.value)} className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#006B4D] outline-none" disabled={isApproved} />
                            <input placeholder="Tỉ lệ"       value={ink.mixRatio}  onChange={e => changeOffsetInk(cIdx, iIdx, 'mixRatio', e.target.value)}  className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#006B4D] outline-none" disabled={isApproved} />
                            <input placeholder="Ghi chú"     value={ink.note}      onChange={e => changeOffsetInk(cIdx, iIdx, 'note', e.target.value)}      className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#006B4D] outline-none" disabled={isApproved} />
                            {!isApproved && comp.inkColors.length > 1 && <button type="button" onClick={() => rmOffsetInk(cIdx, iIdx)} className="text-red-400 hover:text-red-600"><FaTimes size={12} /></button>}
                          </div>
                        ))}
                        {!isApproved && <button type="button" onClick={() => addOffsetInk(cIdx)} className="text-xs text-[#006B4D] font-bold mt-2 hover:underline flex items-center gap-1"><FaPlus size={10} /> Thêm màu mực</button>}
                      </div>
                    </div>
                    {/* Post Process */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Gia công sau in</label>
                      <div className="flex flex-wrap gap-2">
                        {OFFSET_POST_PROCESS.map(opt => (
                          <button key={opt} type="button" disabled={isApproved} onClick={() => toggleOffsetPost(cIdx, opt)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${comp.postProcess.includes(opt) ? 'bg-[#006B4D] text-white border-[#006B4D]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#006B4D]'} ${isApproved ? 'cursor-not-allowed opacity-70' : ''}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {!isApproved && (
                  <button type="button" onClick={addOffsetComp} className="w-full py-3 border-2 border-dashed border-[#006B4D]/30 rounded-2xl text-[#006B4D] font-bold text-sm hover:bg-[#E6F0ED] transition flex items-center justify-center gap-2">
                    <FaPlus /> Thêm chi tiết cấu thành
                  </button>
                )}
              </div>
            </Section>
          )}

          {/* SILK FRAMES */}
          {form.printType === 'silk' && (
            <Section title="Khung Bảng Kéo Lụa (Trình tự)" id="silk" section={section} toggleSection={toggleSection}>
              <div className="mb-4">
                <Inp label="Keo chụp bảng" name="silkEmulsion" value={form.silkEmulsion} onChange={handleChange} placeholder="VD: Ulanogel..." />
              </div>
              <div className="space-y-4 text-sm">
                <div className="hidden lg:grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2">
                  <div className="col-span-2">Tên khung</div><div className="col-span-2">Lưới/Căng</div>
                  <div className="col-span-3">Hóa chất pha mực</div><div className="col-span-1">Gạt</div>
                  <div className="col-span-1">In (hit)</div><div className="col-span-2">Ảnh demo</div>
                  <div className="col-span-1 text-center">Xóa</div>
                </div>
                {form.silkFrames.map((frame, idx) => (
                  <div key={idx} className="flex flex-col lg:grid lg:grid-cols-12 gap-2 items-start lg:items-center bg-gray-50 p-4 lg:p-2 border border-gray-100 rounded-xl">
                    <div className="w-full lg:col-span-2"><input value={frame.frameName} onChange={e => changeSilkFrame(idx, 'frameName', e.target.value)} placeholder="Tên khung" disabled={isApproved} className="w-full border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:ring-1 focus:ring-[#006B4D] border" /></div>
                    <div className="w-full lg:col-span-2"><input value={frame.meshDetails} onChange={e => changeSilkFrame(idx, 'meshDetails', e.target.value)} placeholder="VD: 120T" disabled={isApproved} className="w-full border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:ring-1 focus:ring-[#006B4D] border" /></div>
                    <div className="w-full lg:col-span-3"><textarea value={frame.inkFormula} onChange={e => changeSilkFrame(idx, 'inkFormula', e.target.value)} placeholder="20% bóng, 80% trắng..." rows={1} disabled={isApproved} className="w-full border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:ring-1 focus:ring-[#006B4D] border resize-none" /></div>
                    <div className="w-full lg:col-span-1"><input value={frame.squeegeeStrokes} onChange={e => changeSilkFrame(idx, 'squeegeeStrokes', e.target.value)} placeholder="số gạt" disabled={isApproved} className="w-full border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:ring-1 focus:ring-[#006B4D] border text-center" /></div>
                    <div className="w-full lg:col-span-1"><input value={frame.printHits} onChange={e => changeSilkFrame(idx, 'printHits', e.target.value)} placeholder="SL" disabled={isApproved} className="w-full border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:ring-1 focus:ring-[#006B4D] border text-center" /></div>
                    <div className="w-full lg:col-span-2 flex flex-col items-center">
                      <label className={`w-full flex items-center justify-center gap-2 border-2 border-dashed rounded-lg py-1.5 ${isApproved ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'} transition ${frame.image ? 'border-[#006B4D] bg-[#E6F0ED]' : 'border-gray-300'}`}>
                        {frame.image ? <span className="text-[10px] text-[#006B4D] font-bold">Đã tải ảnh</span> : <><FaUpload className="text-gray-400" /><span className="text-[10px] text-gray-500 font-bold">Upload</span></>}
                        <input type="file" accept="image/*" className="hidden" onChange={e => uploadFrameImage(e, idx)} disabled={uploading || isApproved} />
                      </label>
                      {frame.image && <a href={frame.image} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 underline mt-1 flex items-center gap-1"><FaEye size={10} /> Xem ảnh</a>}
                    </div>
                    <div className="w-full lg:col-span-1 flex justify-center">
                      {!isApproved && form.silkFrames.length > 1 && (
                        <button type="button" onClick={() => rmSilkFrame(idx)} className="text-red-400 hover:text-red-600 border border-red-200 rounded-lg p-2 w-full flex justify-center"><FaTrash size={14} /></button>
                      )}
                    </div>
                  </div>
                ))}
                {!isApproved && (
                  <button type="button" onClick={addSilkFrame} className="w-full py-2.5 border-2 border-dashed border-purple-300 rounded-xl text-purple-700 font-bold text-sm hover:bg-purple-50 transition flex items-center justify-center gap-2">
                    <FaPlus /> Thêm lớp khung kéo tiếp theo
                  </button>
                )}
              </div>
            </Section>
          )}

          {/* CÀI ĐẶT MÁY */}
          <Section title="Cài đặt máy (Tùy chọn)" id="machine" section={section} toggleSection={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Inp label="Tên máy sử dụng" name="machineName" value={form.machineName} onChange={handleChange} />
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Thông số kỹ thuật</label>
                <textarea name="machineSettings" value={form.machineSettings || ''} onChange={handleChange} rows={2} disabled={isApproved}
                  placeholder="Tốc độ, áp lực, nhiệt độ..." className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D] resize-none" />
              </div>
            </div>
          </Section>

          {/* GHI CHÚ */}
          <Section title="Ghi chú chung" id="notes" section={section} toggleSection={toggleSection}>
            <textarea name="notes" value={form.notes || ''} onChange={handleChange} rows={3} disabled={isApproved}
              placeholder="Lưu ý đặc biệt..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D] resize-none" />
          </Section>
        </form>

        <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-100 shrink-0 bg-white rounded-b-3xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Hủy</button>
          {!isApproved && (
            <button type="button" onClick={handleSubmit} disabled={loading || uploading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#006B4D] hover:bg-[#005a3f] text-white rounded-xl text-sm font-bold transition shadow-lg disabled:opacity-60">
              <FaSave /> {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu mẫu (v1)'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── VIEW MODAL ──────────────────────────────────────────────────────────────
const ViewModal = ({ formula, onClose, onEdit, isAdmin }) => {
  if (!formula) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm overflow-y-auto py-8">
      <div className="w-full max-w-4xl mx-4 bg-white rounded-3xl shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center px-8 py-6 border-b">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs font-bold text-[#006B4D] tracking-widest uppercase">{formula.formulaCode}</span>
              <div className="flex items-center gap-2 mt-1">
                <h2 className="text-xl font-extrabold text-[#111827]">{formula.name}</h2>
                <VersionBadge version={formula.version} />
                <StatusBadge status={formula.status} />
              </div>
              {formula.sampleGroup && <p className="text-xs text-indigo-500 mt-0.5">Nhóm: <strong>{formula.sampleGroup}</strong></p>}
              {formula.status === 'approved' && formula.approvedAt && (
                <p className="text-xs text-green-600 mt-1">Chốt lúc: {new Date(formula.approvedAt).toLocaleString('vi-VN')}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><FaTimes size={18} /></button>
        </div>
        <div className="px-8 py-6 max-h-[65vh] overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <Info label="Loại in"     value={formula.printType === 'offset' ? '🖨️ In Offset' : '🕸️ In Lụa'} />
            <Info label="Khách hàng" value={formula.customer || '—'} />
            <Info label="Sản phẩm"   value={formula.product || '—'} />
            <Info label="Phiên bản"  value={`v${formula.version}`} />
          </div>

          {formula.printType === 'offset' && formula.offsetComponents?.length > 0 && (
            <div className="space-y-4">
              {formula.offsetComponents.map((comp, idx) => (
                <DetailBlock key={idx} title={`Chi tiết: ${comp.componentName || 'Không tên'}`}>
                  <div className="bg-white border text-sm border-gray-200 rounded-xl p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 mb-4 border-b border-dashed border-gray-200 pb-4">
                      <Info label="Loại giấy"    value={comp.paperType || '—'} />
                      <Info label="Định lượng"   value={comp.paperWeight || '—'} />
                      <Info label="Khổ giấy"     value={comp.paperSize || '—'} />
                      <Info label="Nhà cung cấp" value={comp.paperSupplier || '—'} />
                    </div>
                    {comp.inkColors?.length > 0 && (
                      <div className="mb-4 border-b border-dashed pb-4">
                        <label className="text-[10px] uppercase font-bold text-gray-400 mb-2 block">Công thức mực</label>
                        <table className="w-full text-xs">
                          <thead><tr className="text-gray-500"><th className="pb-2 text-left">Tên màu</th><th className="pb-2 text-left">Mã màu</th><th className="pb-2 text-left">Tỉ lệ pha</th></tr></thead>
                          <tbody>{comp.inkColors.map((c, i) => (<tr key={i}><td className="py-1 font-bold">{c.colorName}</td><td>{c.colorCode}</td><td>{c.mixRatio}</td></tr>))}</tbody>
                        </table>
                      </div>
                    )}
                    {comp.postProcess?.length > 0 && (
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 mb-2 block">Gia công sau in</label>
                        <div className="flex flex-wrap gap-2">{comp.postProcess.map((p, i) => (<span key={i} className="px-2 py-1 bg-[#E6F0ED] text-[#006B4D] rounded text-xs font-bold">{p.step || p}</span>))}</div>
                      </div>
                    )}
                  </div>
                </DetailBlock>
              ))}
            </div>
          )}

          {formula.printType === 'silk' && (
            <div className="space-y-4">
              {formula.silkEmulsion && (<DetailBlock title="Hóa chất nền"><div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">{formula.silkEmulsion}</div></DetailBlock>)}
              {formula.silkFrames?.length > 0 && (
                <DetailBlock title="Trình tự kéo khung lụa">
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-[#006B4D] text-white text-xs">
                        <tr><th className="px-4 py-3">Khung</th><th className="px-4 py-3">Lưới</th><th className="px-4 py-3">Công thức hóa chất</th><th className="px-4 py-3 text-center">Lần gạt</th><th className="px-4 py-3 text-center">Lần in</th><th className="px-4 py-3 text-center">Ảnh</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {formula.silkFrames.map((f, i) => (
                          <tr key={i} className="bg-white">
                            <td className="px-4 py-3 font-bold text-[#006B4D]">{f.frameName || `Khung ${i + 1}`}</td>
                            <td className="px-4 py-3 text-xs">{f.meshDetails}</td>
                            <td className="px-4 py-3 text-xs whitespace-pre-wrap">{f.inkFormula}</td>
                            <td className="px-4 py-3 text-center font-semibold">{f.squeegeeStrokes}</td>
                            <td className="px-4 py-3 text-center font-bold text-blue-600">{f.printHits}</td>
                            <td className="px-4 py-3 text-center">{f.image ? <a href={f.image} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700"><FaImage size={16} /></a> : <span className="text-gray-300">-</span>}</td>
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
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border text-sm font-bold text-gray-600 hover:bg-gray-50">Đóng</button>
          {isAdmin && formula.status !== 'approved' && (
            <button onClick={() => { onEdit(formula); onClose(); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600">
              <FaEdit /> Chỉnh sửa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
const PrintFormulaScreen = () => {
  const [formulas, setFormulas]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [tab, setTab]               = useState('all');
  const [status, setStatus]         = useState('');
  const [modal, setModal]           = useState(null);   // 'create' | formula object (edit)
  const [viewing, setViewing]       = useState(null);   // formula object for read-only view
  const [historyGroup, setHistoryGroup] = useState(null); // sampleGroup string for history modal
  const [isAdmin, setIsAdmin]       = useState(false);

  // Thêm state cho pop-up xác nhận và accordion version
  const [confirmAction, setConfirmAction] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (groupId) => setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));

  useEffect(() => {
    const ui = JSON.parse(localStorage.getItem('userInfo') || '{}');
    setIsAdmin(ui?.isAdmin || false);
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
    } catch { toast.error('Không tải được dữ liệu'); }
    finally { setLoading(false); }
  }, [tab, status, search]);

  useEffect(() => { fetchFormulas(); }, [fetchFormulas]);

  const handleDelete = (id) => {
    setConfirmAction({
      title: 'Xác nhận xoá?',
      message: 'Bạn có chắc chắn muốn xoá phiên bản mẫu này không?',
      confirmText: 'Xoá',
      bgColor: 'bg-red-600 hover:bg-red-700',
      onConfirm: async () => {
        setConfirmAction(null);
        try {
          await axios.delete(`/api/print-formulas/${id}`, getToken());
          toast.success('Đã xóa'); fetchFormulas();
        } catch { toast.error('Xóa thất bại'); }
      }
    });
  };

  const handleNextVersion = (id) => {
    setConfirmAction({
      title: 'Tạo phiên bản tiếp theo?',
      message: 'Hệ thống sẽ tạo tự động một phiên bản mới với toàn bộ nội dung dựa trên phiên bản hiện tại để bạn có thể chỉnh sửa ngay.',
      confirmText: 'Tạo phiên bản',
      bgColor: 'bg-indigo-600 hover:bg-indigo-700',
      onConfirm: async () => {
        setConfirmAction(null);
        try {
          const { data } = await axios.post(`/api/print-formulas/${id}/next-version`, {}, getToken());
          toast.success('Đã tạo phiên bản tiếp theo, hãy chỉnh sửa!');
          fetchFormulas();
          setModal(data); // Mở popup sửa ngay lập tức
        } catch (err) { toast.error(err?.response?.data?.message || 'Không tạo được phiên bản mới'); }
      }
    });
  };

  const handleApprove = (id, name) => {
    setConfirmAction({
      title: '✅ CHỐT MẪU?',
      message: `Bạn xác nhận mẫu "${name}" đã được khách hàng duyệt?\n\nSau khi chốt, công thức sẽ không thể chỉnh sửa và các phiên bản nháp khác sẽ bị lưu trữ.`,
      confirmText: 'Chốt mẫu',
      bgColor: 'bg-green-600 hover:bg-green-700',
      onConfirm: async () => {
        setConfirmAction(null);
        try {
          await axios.post(`/api/print-formulas/${id}/approve`, {}, getToken());
          toast.success('✅ Đã chốt mẫu thành công! Công thức đã được lưu chính thức.');
          fetchFormulas();
        } catch (err) { toast.error(err?.response?.data?.message || 'Không chốt được mẫu'); }
      }
    });
  };

  const tabBase = 'px-5 py-2 rounded-full text-sm font-bold transition border';
  const tabAct  = 'bg-[#006B4D] text-white border-[#006B4D]';
  const tabIdle = 'bg-white text-gray-600 border-gray-200 hover:border-[#006B4D]/50';

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827]">
      <div className="h-full flex-shrink-0 z-10 hidden lg:block"><Sidebar /></div>
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <AdminHeader title="Phát triển Mẫu In" />

        {(modal === 'create' || (modal && modal._id)) && (
          <FormulaModal formula={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchFormulas(); }} />
        )}
        {viewing && <ViewModal formula={viewing} onClose={() => setViewing(null)} onEdit={f => setModal(f)} isAdmin={isAdmin} />}
        {historyGroup && <VersionHistoryModal sampleGroup={historyGroup} onClose={() => setHistoryGroup(null)} onView={f => setViewing(f)} getToken={getToken} />}

        <ConfirmModal 
          isOpen={!!confirmAction} 
          {...confirmAction} 
          onCancel={() => setConfirmAction(null)} 
        />

        <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#111827] flex items-center gap-3">
                <FaFlask className="text-[#006B4D]" /> Phát triển Mẫu In
              </h1>
              <p className="text-sm text-gray-500 mt-1">Quản lý quy trình phát triển mẫu nhiều phiên bản — chỉ chốt khi khách duyệt</p>
            </div>
            {isAdmin && (
              <button onClick={() => setModal('create')} className="flex items-center gap-2 px-5 py-2.5 bg-[#006B4D] text-white rounded-xl text-sm font-bold hover:bg-[#005a3f] transition shadow-lg">
                <FaPlus /> Tạo mẫu mới
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-2">
              {[{ key: 'all', label: 'Tất cả' }, { key: 'offset', label: '🖨️ Offset' }, { key: 'silk', label: '🕸️ Lụa' }].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} className={`${tabBase} ${tab === t.key ? tabAct : tabIdle}`}>{t.label}</button>
              ))}
            </div>
            <div className="flex-1" />
            <select value={status} onChange={e => setStatus(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30">
              <option value="">Mọi trạng thái</option>
              <option value="draft">Đang phát triển</option>
              <option value="approved">Đã chốt</option>
              <option value="archived">Phiên bản cũ</option>
            </select>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchFormulas()} placeholder="Tìm tên, mã, nhóm mẫu..." className="pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 w-64" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-gray-400 text-sm">Đang tải...</div>
            ) : formulas.length === 0 ? (
              <div className="py-20 text-center">
                <FaFlask className="text-5xl text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">Chưa có mẫu nào</p>
                {isAdmin && <button onClick={() => setModal('create')} className="mt-4 px-5 py-2.5 bg-[#006B4D] text-white rounded-xl text-sm font-bold hover:bg-[#005a3f]">Tạo mẫu đầu tiên</button>}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-[10px] tracking-wider uppercase font-bold border-b border-gray-200">
                      <th className="px-5 py-4 text-left">Mã mẫu</th>
                      <th className="px-5 py-4 text-left">Tên mẫu / Sản phẩm</th>
                      <th className="px-5 py-4 text-left">Phân loại</th>
                      <th className="px-5 py-4 text-center">Phiên bản</th>
                      <th className="px-5 py-4 text-center">Trạng thái</th>
                      <th className="px-5 py-4 text-left">Nhóm mẫu</th>
                      <th className="px-5 py-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(() => {
                      // Nhóm mẫu lại theo sampleGroup
                      const groups = {};
                      formulas.forEach(f => {
                        const key = f.sampleGroup || f._id;
                        if (!groups[key]) groups[key] = [];
                        groups[key].push(f);
                      });
                      
                      const groupedFormulas = Object.values(groups).map(g => {
                        g.sort((a,b) => b.version - a.version); // Mới nhất lên đầu nội bộ
                        return g;
                      }).sort((a,b) => new Date(b[0].updatedAt) - new Date(a[0].updatedAt)); // Sort nhóm hiển thị

                      return groupedFormulas.map(group => {
                        const latestV = group[0];
                        const isExpanded = expandedGroups[latestV.sampleGroup];
                        const hasMultiple = group.length > 1;

                        const f = latestV; // Dòng chính luôn hiển thị phiên bản mới nhất
                        const isOff = f.printType === 'offset';
                        const isDraft    = f.status === 'draft';
                        const isApproved = f.status === 'approved';
                        
                        return (
                          <React.Fragment key={f._id}>
                            <tr className={`hover:bg-[#F9FAFB] transition group ${isApproved ? 'bg-green-50/30' : ''}`}>
                              <td className="px-5 py-4 font-mono text-xs text-[#006B4D] font-bold">{f.formulaCode}</td>
                              <td className="px-5 py-4">
                                <div className="font-bold text-[#111827] line-clamp-1">{f.name}</div>
                                {f.product && <div className="text-xs text-gray-400 mt-0.5">{f.product}{f.customer && ` (${f.customer})`}</div>}
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${isOff ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                  {isOff ? '🖨️ Offset' : '🕸️ Lụa'}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                {hasMultiple ? (
                                  <button onClick={() => toggleGroup(latestV.sampleGroup)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition shadow-sm">
                                    <FaCodeBranch size={10} /> v{f.version}
                                    {isExpanded ? <FaChevronUp size={10} className="ml-1" /> : <FaChevronDown size={10} className="ml-1" />}
                                  </button>
                                ) : (
                                  <VersionBadge version={f.version} />
                                )}
                              </td>
                              <td className="px-5 py-4 text-center"><StatusBadge status={f.status} /></td>
                              <td className="px-5 py-4 text-xs font-bold text-gray-500">
                                {f.sampleGroup}
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* Xem */}
                                  <button onClick={() => setViewing(f)} title="Xem chi tiết" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-[#006B4D] hover:text-white transition"><FaEye size={12} /></button>
                                  {/* Chỉnh sửa (chỉ draft) */}
                                  {isAdmin && isDraft && (
                                    <button onClick={() => setModal(f)} title="Chỉnh sửa" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-500 hover:text-white transition"><FaEdit size={12} /></button>
                                  )}
                                  {/* Tạo phiên bản tiếp theo */}
                                  {isAdmin && latestV.status !== 'approved' && (
                                    <button onClick={() => handleNextVersion(f._id)} title={`Tạo v${latestV.version + 1} từ phiên bản này`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-indigo-500 hover:text-white transition">
                                      <FaCodeBranch size={12} />
                                    </button>
                                  )}
                                  {/* CHỐT MẪU */}
                                  {isAdmin && isDraft && (
                                    <button onClick={() => handleApprove(f._id, f.name)} title="Chốt mẫu (Khách duyệt)"
                                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-green-600 hover:text-white transition">
                                      <FaCheck size={12} />
                                    </button>
                                  )}
                                  {/* Xóa */}
                                  {isAdmin && !isApproved && (
                                    <button onClick={() => handleDelete(f._id)} title="Xóa" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white transition"><FaTrash size={12} /></button>
                                  )}
                                </div>
                              </td>
                            </tr>
                            
                            {/* Danh sách phiên bản cũ (Accordion) */}
                            {isExpanded && hasMultiple && (
                              <tr className="bg-slate-50/50">
                                <td colSpan="7" className="p-0 border-b border-gray-200">
                                  <div className="py-4 pl-16 pr-8 border-l-4 border-indigo-400 m-2 ml-4 rounded-r-xl bg-white shadow-sm ring-1 ring-gray-100">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Các phiên bản trước của {latestV.sampleGroup}</h4>
                                    <div className="grid gap-2">
                                      {group.slice(1).map(v => (
                                        <div key={v._id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition">
                                          <div className="flex items-center gap-4">
                                            <VersionBadge version={v.version} />
                                            {v.status === 'approved' ? (
                                              <span className="text-xs font-bold text-green-600 border border-green-200 bg-green-50 px-2 py-0.5 rounded-full">✅ Đã chốt</span>
                                            ) : (
                                              <span className="text-xs font-bold text-gray-500 border border-gray-200 bg-gray-100 px-2 py-0.5 rounded-full">Phiên bản cũ</span>
                                            )}
                                            <span className="text-xs text-gray-400 w-24">{new Date(v.createdAt).toLocaleDateString('vi-VN')}</span>
                                            <span className="text-sm font-semibold text-gray-700">{v.name}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <button onClick={() => setViewing(v)} title="Xem chi tiết" className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-[#006B4D] hover:text-white transition"><FaEye size={10} /></button>
                                            
                                            {/* Sửa phiên bản cũ (nếu draft) */}
                                            {isAdmin && v.status === 'draft' && (
                                              <button onClick={() => setModal(v)} title="Chỉnh sửa" className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-500 hover:text-white transition"><FaEdit size={10} /></button>
                                            )}
                                            
                                            {/* Tạo version chia nhánh từ bản cũ */}
                                            {isAdmin && latestV.status !== 'approved' && (
                                              <button onClick={() => handleNextVersion(v._id)} title={`Tạo phiên bản mới từ v${v.version}`} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-indigo-500 hover:text-white transition"><FaCodeBranch size={10} /></button>
                                            )}
                                            
                                            {/* Chốt bản cũ (sẽ ghi đè làm bản chính thức) */}
                                            {isAdmin && v.status === 'draft' && latestV.status !== 'approved' && (
                                              <button onClick={() => handleApprove(v._id, v.name)} title="Chốt phiên bản này" className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-green-600 hover:text-white transition"><FaCheck size={10} /></button>
                                            )}

                                            {/* Xoá */}
                                            {isAdmin && v.status !== 'approved' && (
                                              <button onClick={() => handleDelete(v._id)} title="Xóa" className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white transition"><FaTrash size={10} /></button>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* LEGEND */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><FaEye className="text-[#006B4D]" /> Xem chi tiết</span>
            <span className="flex items-center gap-1.5"><FaEdit className="text-blue-500" /> Chỉnh sửa (draft)</span>
            <span className="flex items-center gap-1.5"><FaCodeBranch className="text-indigo-500" /> Tạo phiên bản tiếp theo</span>
            <span className="flex items-center gap-1.5"><FaCheck className="text-green-600" /> Chốt mẫu (khi khách duyệt)</span>
            <span className="flex items-center gap-1.5"><FaHistory className="text-indigo-600" /> Xem lịch sử phiên bản</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintFormulaScreen;
