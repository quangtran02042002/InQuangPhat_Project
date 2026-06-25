import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaFileExcel, FaBars,
  FaTimes, FaChevronDown, FaChevronUp, FaSave, FaCheckCircle,
  FaArrowRight, FaFileAlt, FaPrint, FaTrashAlt, FaUpload, FaImage, FaEye
} from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import PrintableOrder from '../../components/PrintableOrder';
import * as XLSX from 'xlsx-js-style';
import { useImagePaste } from '../../hooks/useImagePaste';

// ─────────────────────────────────────────────
// POST-PROCESS OPTIONS
// ─────────────────────────────────────────────
const OFFSET_POST_PROCESS = [
  'Cán màng bóng', 'Cán màng mờ', 'Phủ UV toàn phần', 'Phủ UV cục bộ',
  'Ép kim / Ép nhũ', 'Thúc nổi / Dập chìm', 'Cán gân',
  'Cấn bế (Die-cutting)', 'Gấp dán hộp', 'Dán cửa sổ',
  'Bồi giấy (Mounting)', 'Phay rãnh (V-grooving)', 'Bọc hộp (Wrapping)', 'Gia công khay định hình',
  'Đóng kim / Bấm gáy', 'Đóng gáy keo nhiệt', 'Khâu chỉ gáy keo', 'Đóng gáy lò xo',
  'Cắt xén (Trimming)', 'Khoan lỗ / Đóng mắt cáo', 'Đục lỗ răng cưa', 'Đóng số nhảy'
];

const SILK_POST_PROCESS = [
  'Sấy băng tải (Conveyor dryer)',
  'Sấy đèn UV',
  'Ủi nhiệt (Heat transfer)',
  'Ép nhiệt (Heat press)',
  'Sấy thường (Air dry)',
  'Kiểm tra màu (QC check)',
  'Đóng gói',
];

// ─────────────────────────────────────────────
// PROGRESS STEPS CONFIG
// ─────────────────────────────────────────────
const OFFSET_PROGRESS_STEPS = [
  { id: 'isPaperOrdered', label: 'Đặt giấy', short: 'Giấy' },
  { id: 'isPlateOutput', label: 'Xuất kẽm', short: 'Kẽm' },
  { id: 'isMoldOutput', label: 'Khuôn bế', short: 'Khuôn' },
  { id: 'isOffsetLamination', label: 'Cán màng', short: 'Màng' },
  { id: 'isTicketPrinted', label: 'Phát lệnh', short: 'Lệnh SX' },
];

const SILK_PROGRESS_STEPS = [
  { id: 'isSilkInkColor', label: 'Màu mực', short: 'Mực' },
  { id: 'isSilkFilm', label: 'Phim', short: 'Phim' },
  { id: 'isSilkFrame', label: 'Khung lụa', short: 'Khung' },
  { id: 'isSilkPattern', label: 'Rập', short: 'Rập' },
  { id: 'isSilkFabric', label: 'Vải', short: 'Vải' },
];

const EMPTY_JOB = {
  jobName: '', quantity: '', image: '',
  material: '', printSize: '', printPaperSize: '', cutPaperSize: '', cutPaperQuantity: '', isPlateReady: false, printColors: '',
  postProcess: [], notes: '', printFormula: ''
};

const EMPTY_FORM = {
  orderName: '', printType: 'offset', totalQuantity: '', status: 'pending', notes: '',
  printJobs: [{ ...EMPTY_JOB }]
};

// ─────────────────────────────────────────────
// Helper UI components
// ─────────────────────────────────────────────
const Section = ({ title, id, section, toggleSection, children }) => (
  <div className="border border-gray-100 rounded-2xl overflow-hidden mb-4">
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
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}{required && ' *'}</label>
    <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
      className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D]" />
  </div>
);

const Sel = ({ label, name, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
    <select name={name} value={value} onChange={onChange}
      className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D]">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ─────────────────────────────────────────────
// MODAL – View Details
// ─────────────────────────────────────────────
const ViewOrderModal = ({ order, formulas, onClose }) => {
  const [section, setSection] = useState({ general: true, jobs: true });
  const toggleSection = (k) => setSection(s => ({ ...s, [k]: !s[k] }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-5xl mx-4 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col" style={{ maxHeight: '95vh' }}>
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-extrabold text-[#111827]">👁️ Chi tiết Lệnh sản xuất</h2>
            <p className="text-xs text-gray-400 mt-1">Mã: <strong>{order.orderCode}</strong></p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="px-8 py-6 overflow-y-auto flex-1 bg-[#F9FAFB]/50">
          <Section title="A. Thông tin chung của Lệnh" id="general" section={section} toggleSection={toggleSection}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="col-span-2">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Tên Lệnh / Khách hàng</p>
                <p className="font-semibold text-gray-800">{order.orderName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Kỹ thuật in</p>
                <p className="font-semibold text-[#006B4D]">{order.printType === 'offset' ? 'In Offset' : 'In Lụa'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Trạng thái</p>
                <p className="font-semibold text-gray-800">
                  {order.status === 'pending' ? 'Chờ xử lý' : 
                   order.status === 'in_progress' ? 'Đang chạy' : 
                   order.status === 'completed' ? 'Hoàn thành' : 'Hủy'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Tổng SL</p>
                <p className="font-semibold text-gray-800">{order.totalQuantity}</p>
              </div>
              <div className="col-span-2 lg:col-span-4 mt-2">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Ghi chú chung</p>
                <div className="p-3 bg-white border border-gray-200 rounded-xl min-h-[60px] text-sm text-gray-700 whitespace-pre-wrap">{order.notes || 'Không có ghi chú.'}</div>
              </div>
            </div>
          </Section>

          <Section title={`B. Cấu thành (Chi tiết ${order.printJobs.length} bài in)`} id="jobs" section={section} toggleSection={toggleSection}>
            {order.printJobs.map((job, idx) => (
              <div key={idx} className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-5 mb-4 shadow-sm hover:border-[#006B4D]/30 transition">
                <h4 className="text-base font-black text-[#006B4D] mb-4 flex items-center gap-2">
                  <span className="bg-[#E6F0ED] rounded-full w-7 h-7 flex items-center justify-center text-sm">{idx + 1}</span>
                  Bài in: {job.jobName || 'Chưa đặt tên'}
                </h4>
                
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1 text-sm bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div><span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Vật liệu / Giấy</span><strong className="text-gray-800">{job.material || '-'}</strong></div>
                    <div><span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Khổ thành phẩm</span><strong className="text-gray-800">{job.printSize || '-'}</strong></div>
                    <div><span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Khổ giấy in</span><strong className="text-gray-800">{job.printPaperSize || '-'}</strong></div>
                    <div><span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Khổ giấy cắt</span><strong className="text-gray-800">{job.cutPaperSize || '-'}</strong></div>
                    <div><span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Số lượng cắt</span><strong className="text-gray-800">{job.cutPaperQuantity || '-'}</strong></div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Kẽm / Khuôn</span>
                      <strong className={job.isPlateReady ? 'text-green-600' : 'text-red-500'}>
                        {job.isPlateReady ? '✓ Đã xuất' : '✗ Chưa xuất'}
                      </strong>
                    </div>
                    <div><span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Số lượng in rập</span><strong className="text-gray-800">{job.quantity || '-'}</strong></div>
                    <div><span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Số màu</span><strong className="text-gray-800">{job.printColors || '-'}</strong></div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide">Công thức in</span>
                      <strong className="text-[#006B4D]">
                        {job.printFormula ? formulas.find(f => f._id === job.printFormula)?.name || '...' : 'Tùy chỉnh tự do'}
                      </strong>
                    </div>
                    {job.postProcess && job.postProcess.length > 0 && (
                       <div className="col-span-2 md:col-span-3 mt-2">
                         <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide mb-1.5">Gia công sau in</span>
                         <div className="flex flex-wrap gap-1.5">
                           {job.postProcess.map(p => <span key={p} className="px-2.5 py-1 bg-[#006B4D] text-white rounded-lg text-[10px] font-bold">{p}</span>)}
                         </div>
                       </div>
                    )}
                    {job.notes && (
                      <div className="col-span-2 md:col-span-3 mt-2">
                        <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wide mb-1">Ghi chú kỹ thuật</span>
                        <p className="text-gray-700 italic border-l-2 border-gray-200 pl-3">{job.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  {job.image && (
                     <div className="w-full lg:w-48 shrink-0 flex flex-col items-center justify-center border border-gray-100 rounded-xl p-2 bg-white group relative">
                       <img src={job.image} alt="Artwork" className="max-h-32 object-contain rounded-lg shadow-sm group-hover:opacity-90 transition" />
                       <a href={job.image} target="_blank" rel="noreferrer" className="text-[10px] font-bold mt-2 text-blue-500 hover:text-blue-700 underline flex items-center gap-1">
                         <FaEye size={12}/> Phóng to ảnh
                       </a>
                     </div>
                  )}
                </div>
              </div>
            ))}
          </Section>
        </div>

        <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-100 shrink-0 bg-white rounded-b-3xl">
          <button type="button" onClick={onClose}
            className="px-6 py-2.5 bg-[#006B4D] hover:bg-[#005a3f] text-white rounded-xl text-sm font-bold transition shadow-lg w-full md:w-auto">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MODAL – Create / Edit
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
const OrderModal = ({ order, formulas, onClose, onSaved }) => {
  const isEdit = !!order?._id;

  const prepareInitialForm = () => {
    if (!isEdit) return { ...EMPTY_FORM };
    return {
      ...EMPTY_FORM,
      ...order,
      printJobs: order.printJobs?.length ? order.printJobs.map(j => ({
        ...EMPTY_JOB, ...j, printFormula: j.printFormula?._id || j.printFormula || ''
      })) : [{ ...EMPTY_JOB }]
    };
  };

  const [form, setForm] = useState(prepareInitialForm());
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [section, setSection] = useState({ general: true, jobs: true });

  const toggleSection = (k) => setSection(s => ({ ...s, [k]: !s[k] }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const addJob = () => setForm(f => ({ ...f, printJobs: [...f.printJobs, { ...EMPTY_JOB }] }));
  const rmJob = (idx) => setForm(f => ({ ...f, printJobs: f.printJobs.filter((_, i) => i !== idx) }));

  const changeJob = (idx, field, value) => {
    const arr = [...form.printJobs];
    arr[idx] = { ...arr[idx], [field]: value };
    setForm(f => ({ ...f, printJobs: arr }));
  };

  const toggleJobPost = (idx, val) => {
    const arr = [...form.printJobs];
    const post = arr[idx].postProcess || [];
    arr[idx].postProcess = post.includes(val) ? post.filter(v => v !== val) : [...post, val];
    setForm(f => ({ ...f, printJobs: arr }));
  };

  const uploadJobImage = async (file, idx) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('images', file);
    setUploading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${userInfo.token}` }
      });
      changeJob(idx, 'image', data[0]);
      toast.success('Đã tải lên ảnh thiết kế!');
    } catch (err) {
      toast.error('Lỗi tải ảnh');
    } finally {
      setUploading(false);
    }
  };

  // === HOOK: DÁN ẢNH TỪ CLIPBOARD ===
  useImagePaste({
    onImageUploaded: (url) => {
      const targetIdx = form.printJobs.findIndex(j => !j.image);
      const idx = targetIdx !== -1 ? targetIdx : 0;
      changeJob(idx, 'image', url);
    },
    enabled: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.orderName.trim()) return toast.error('Vui lòng nhập tên Lệnh / Khách hàng');
    if (form.printJobs.some(j => !j.jobName.trim())) return toast.error('Vui lòng nhập tên cho tất cả các bài in');

    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const cfg = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const payload = { ...form };
      payload.printJobs = payload.printJobs.map(j => {
        const _j = { ...j };
        if (!_j.printFormula) delete _j.printFormula;
        return _j;
      });

      if (isEdit) {
        await axios.put(`/api/production-orders/${order._id}`, payload, cfg);
        toast.success('Đã cập nhật Lệnh xuất');
      } else {
        await axios.post('/api/production-orders', payload, cfg);
        toast.success('Đã tạo Lệnh sản xuất mới');
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
      <div className="w-full max-w-5xl mx-4 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col" style={{ maxHeight: '95vh' }}>
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-extrabold text-[#111827]">
              {isEdit ? '✏️ Sửa lệnh sản xuất' : '🎫 Tạo lệnh SX mới'}
            </h2>
            {isEdit && <p className="text-xs text-gray-400 mt-1">Mã: <strong>{order.orderCode}</strong></p>}
            <p className="text-[10px] text-gray-400 mt-1 italic">Mẹo: Bạn có thể nhấn Ctrl+V / Cmd+V để dán ảnh mẫu trực tiếp vào bài in trống.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <FaTimes size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 overflow-y-auto flex-1 bg-[#F9FAFB]/50">
          {/* 1. THÔNG TIN CHUNG CỦA LỆNH */}
          <Section title="A. Thông tin chung của Lệnh" id="general" section={section} toggleSection={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 pb-4 mb-2">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-black text-[#006B4D] uppercase tracking-widest block w-full mb-1">Loại Hình Kỹ Thuật (Áp dụng cho toàn Lệnh) *</label>
                <div className="flex gap-3 h-12">
                  {[{ value: 'offset', label: '🖨️ Kỹ Thuật In Offset' }, { value: 'silk', label: '🕸️ Kỹ Thuật In Lụa' }].map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setForm(f => ({ ...f, printType: opt.value }))}
                      className={`flex-1 rounded-xl text-sm font-bold border-2 transition shadow-sm ${form.printType === opt.value ? 'border-[#006B4D] bg-[#E6F0ED] text-[#006B4D]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Inp label="Tên Lệnh / Khách hàng" name="orderName" value={form.orderName} onChange={handleChange} required className="md:col-span-2" placeholder="VD: Hộp cứng HueOneFood" />
              <Inp label="Tổng số lượng chung" name="totalQuantity" type="number" value={form.totalQuantity} onChange={handleChange} required />
              <Sel label="Trạng thái" name="status" value={form.status} onChange={handleChange}
                options={[
                  { value: 'pending', label: 'Chờ xử lý' },
                  { value: 'in_progress', label: 'Đang chạy' },
                  { value: 'completed', label: 'Hoàn thành' },
                  { value: 'cancelled', label: 'Hủy' }
                ]} />
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                placeholder="Ghi chú chung cho toàn bộ lệnh..."
                className="lg:col-span-4 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D] resize-none" />
            </div>
          </Section>

          {/* 2. CHUỖI CÁC BÀI IN BÊN TRONG */}
          <Section title={`B. Cấu thành (Chi tiết ${form.printJobs.length} bài in ${form.printType === 'offset' ? 'Offset' : 'Lụa'})`} id="jobs" section={section} toggleSection={toggleSection}>
            {form.printJobs.map((job, idx) => (
              <div key={idx} className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-5 relative mb-4 hover:border-[#006B4D]/30 transition group/job">
                {form.printJobs.length > 1 && (
                  <button type="button" onClick={() => rmJob(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg transition" title="Xóa bài in này">
                    <FaTrashAlt size={14} />
                  </button>
                )}

                <h4 className="text-base font-black text-[#006B4D] mb-4 flex items-center gap-2">
                  <span className="bg-[#E6F0ED] rounded-full w-7 h-7 flex items-center justify-center text-sm">{idx + 1}</span>
                  Bài in: {job.jobName || 'Chưa đặt tên'}
                </h4>

                <div className="flex flex-col lg:flex-row gap-6 mb-4">
                  {/* Left: Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                    <Inp label="Tên bài in" value={job.jobName} onChange={e => changeJob(idx, 'jobName', e.target.value)} required placeholder="Nắp hộp, Khay hộp..." className="md:col-span-2" />
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block w-full">Ảnh mẫu (Artwork) 🖼️</label>
                      <label className={`flex h-[38px] items-center justify-center gap-2 border border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition ${job.image ? 'border-[#006B4D] bg-[#E6F0ED] text-[#006B4D] font-bold' : 'border-gray-300 text-gray-500'}`}>
                        {uploading ? <span className="text-xs">Đang tải...</span> : job.image ? <><FaCheckCircle size={14} /> <span className="text-xs">Đã tải ảnh mẫu</span></> : <><FaUpload size={14} /> <span className="text-xs font-bold">Upload (Hoặc Ctrl+V)</span></>}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadJobImage(e.target.files[0], idx)} disabled={uploading} />
                      </label>
                    </div>

                    <Inp label="Vật liệu / Giấy" value={job.material} onChange={e => changeJob(idx, 'material', e.target.value)} placeholder="Couche 300gsm..." />
                    <Inp label="Khổ thành phẩm" value={job.printSize} onChange={e => changeJob(idx, 'printSize', e.target.value)} placeholder="VD: 15x20 cm" />
                    <Inp label="Khổ giấy in" value={job.printPaperSize} onChange={e => changeJob(idx, 'printPaperSize', e.target.value)} placeholder="VD: 43x65 cm" />
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái Kẽm / Khuôn</label>
                      <button type="button" onClick={() => changeJob(idx, 'isPlateReady', !job.isPlateReady)}
                        className={`h-[38px] rounded-xl text-xs font-bold border-2 transition ${job.isPlateReady ? 'bg-green-500 text-white border-green-600' : 'bg-gray-100 text-gray-400 border-gray-200 hover:border-gray-300'}`}>
                        {job.isPlateReady ? '✓ Đã xuất xong' : 'Chưa xuất'}
                      </button>
                    </div>

                    <Inp label="Khổ giấy cắt (Đầu vào)" value={job.cutPaperSize} onChange={e => changeJob(idx, 'cutPaperSize', e.target.value)} placeholder="VD: 65x86 cm" />
                    <Inp label="Số lượng cắt" value={job.cutPaperQuantity} onChange={e => changeJob(idx, 'cutPaperQuantity', e.target.value)} type="number" placeholder="1000" />
                    <Inp label="Số lượng in rập" value={job.quantity} onChange={e => changeJob(idx, 'quantity', e.target.value)} type="number" placeholder="1000" />
                    <Inp label="Màu in / Số màu" value={job.printColors} onChange={e => changeJob(idx, 'printColors', e.target.value)} placeholder="CMYK, Pant..." />

                    <div className="flex flex-col gap-1 md:col-span-4">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Công thức in tham chiếu</label>
                      <select value={job.printFormula} onChange={e => changeJob(idx, 'printFormula', e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#006B4D] bg-white text-gray-600">
                        <option value="">-- Tùy chỉnh tự do (Không dùng mẫu) --</option>
                        {formulas.filter(f => f.printType === form.printType).map(f => (
                          <option key={f._id} value={f._id}>[{f.formulaCode}] {f.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right: Image Preview */}
                  {job.image && (
                    <div className="w-full lg:w-48 shrink-0 flex flex-col items-center justify-center border border-gray-100 rounded-xl p-2 bg-gray-50 relative group">
                      <img src={job.image} alt="Artwork" className="max-h-32 object-contain rounded-lg shadow-sm" />
                      <button type="button" onClick={() => changeJob(idx, 'image', '')} className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition"><FaTimes size={12} /></button>
                    </div>
                  )}
                </div>

                {/* Gia công sau in */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Gia công sau in</label>
                  <div className="flex flex-wrap gap-2">
                    {(form.printType === 'offset' ? OFFSET_POST_PROCESS : SILK_POST_PROCESS).map(opt => (
                      <button key={opt} type="button" onClick={() => toggleJobPost(idx, opt)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${(job.postProcess || []).includes(opt)
                          ? 'bg-[#006B4D] text-white border-[#006B4D]'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#006B4D]/50'
                          }`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea value={job.notes} onChange={e => changeJob(idx, 'notes', e.target.value)} rows={2}
                  placeholder="Ghi chú kỹ thuật riêng cho bài in này..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D] resize-none" />
              </div>
            ))}

            <button type="button" onClick={addJob} className="w-full py-3 border-2 border-dashed border-[#006B4D]/30 bg-[#E6F0ED]/50 rounded-xl text-[#006B4D] font-bold text-sm hover:bg-[#E6F0ED] transition flex items-center justify-center gap-2">
              <FaPlus /> Thêm bài in vào lệnh này
            </button>
          </Section>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-100 shrink-0 bg-white rounded-b-3xl">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
            Hủy
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading || uploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#006B4D] hover:bg-[#005a3f] text-white rounded-xl text-sm font-bold transition shadow-lg disabled:opacity-60">
            <FaSave /> {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu Lệnh Sản Xuất'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────
const ProductionOrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'create' | order object
  const [viewModal, setViewModal] = useState(null); // order object
  const [printingOrder, setPrintingOrder] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Filters
  const [printType, setPrintType] = useState('all');
  const [status, setStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const cfg = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      let url = `/api/production-orders?pageSize=100`;
      if (printType !== 'all') url += `&printType=${printType}`;
      if (status !== 'all') url += `&status=${status}`;
      if (searchQuery) url += `&keyword=${searchQuery}`;

      const [ordersRes, formulasRes] = await Promise.all([
        axios.get(url, cfg),
        axios.get('/api/print-formulas?status=approved', cfg)
      ]);

      setOrders(ordersRes.data.orders || []);
      setFormulas(formulasRes.data.formulas || []);
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    setIsAdmin(userInfo?.isAdmin || ['director', 'production'].includes(userInfo?.role));
  }, []);
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [printType, status, searchQuery]);

  const triggerPrint = (order) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  useEffect(() => {
    const handleAfterPrint = () => setPrintingOrder(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa lệnh sản xuất này?')) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      await axios.delete(`/api/production-orders/${id}`, { headers: { Authorization: `Bearer ${userInfo.token}` } });
      toast.success('Xóa thành công');
      fetchData();
    } catch (err) {
      toast.error('Có lỗi khi xóa');
    }
  };

  const toggleProgress = async (id, flag, currentValue) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      await axios.patch(`/api/production-orders/${id}/progress`,
        { flag, value: !currentValue },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      setOrders(orders.map(o => o._id === id ? { ...o, [flag]: !currentValue } : o));
    } catch (err) {
      toast.error('Lỗi cập nhật tiến độ');
      fetchData();
    }
  };

  const changeOrderStatus = async (id, newStatus) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      await axios.put(`/api/production-orders/${id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${userInfo.token}` } });
      toast.success('Đã cập nhật trạng thái lệnh');
      setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      toast.error('Lỗi cập nhật trạng thái');
      fetchData();
    }
  };

  // UI Helpers
  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };
  const statusText = { pending: 'Chờ xử lý', in_progress: 'Đang chạy', completed: 'Hoàn thành', cancelled: 'Hủy' };

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827] relative">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 h-full transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0`}>
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <AdminHeader title="Quản Lý Lệnh Sản Xuất" />

        {/* PRINT LAYER */}
        {printingOrder && <PrintableOrder order={printingOrder} />}

        {/* VIEW MODAL */}
        {viewModal && (
          <ViewOrderModal
            order={viewModal}
            formulas={formulas}
            onClose={() => setViewModal(null)}
          />
        )}

        {/* EDIT MODAL */}
        {(modal === 'create' || (modal && modal._id)) && (
          <OrderModal
            order={modal === 'create' ? null : modal}
            formulas={formulas}
            onClose={() => setModal(null)}
            onSaved={() => { setModal(null); fetchData(); }}
          />
        )}

        {/* HEADER */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 md:py-6 shrink-0 z-0 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button className="lg:hidden text-gray-500 hover:text-gray-700 transition" onClick={() => setIsSidebarOpen(true)}><FaBars size={20} /></button>
              <div className="w-10 h-10 bg-[#E6F0ED] rounded-xl flex items-center justify-center text-[#006B4D]">
                <FaFileAlt size={20} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-[#111827] tracking-tight">Quản Lý Lệnh Sản Xuất</h1>
                <p className="hidden md:block text-sm text-gray-500 font-medium">Theo dõi thông số và các bài in trong từng đơn hàng</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              {isAdmin && (
                <button
                  onClick={() => setModal('create')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#006B4D] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#00543c] transition shadow-md"
                >
                  <FaPlus /> Tạo lệnh in mới
                </button>
              )}
            </div>
          </div>

          {/* FILTERS */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap sm:flex-nowrap bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto custom-scrollbar">
              {[{ id: 'all', label: 'Tất cả Bài In' }, { id: 'offset', label: 'Chứa In Offset' }, { id: 'silk', label: 'Chứa In Lụa' }].map(tab => (
                <button key={tab.id} onClick={() => setPrintType(tab.id)}
                  className={`flex-1 min-w-[100px] md:w-32 py-2 px-2 text-[11px] sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${printType === tab.id ? 'bg-white text-[#006B4D] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:border-[#006B4D] bg-white">
                <option value="all">Mọi trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="in_progress">Đang chạy</option>
                <option value="completed">Hoàn thành</option>
              </select>
              <div className="relative flex-1 md:w-64">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Tìm tên Lệnh, Khách hàng..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#006B4D] bg-white transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F9FAFB]">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-[#006B4D] border-t-transparent animate-spin"></div></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
              <FaFileAlt className="text-5xl text-gray-200 mb-4" />
              <h3 className="text-lg font-bold text-gray-900">Chưa có Lệnh sản xuất nào</h3>
              <p className="text-gray-500 mt-2 mb-6 text-sm">Hãy nhóm các bài in thành Lệnh đầu tiên của bạn.</p>
              <button onClick={() => setModal('create')} className="px-6 py-2.5 bg-[#006B4D] text-white font-bold rounded-xl shadow-lg hover:bg-[#005a3f] transition">Tạo lệnh ngay</button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition group">
                  <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">

                    {/* INFOS */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex flex-col items-center justify-center shrink-0 border border-gray-100">
                        <span className="text-[10px] text-gray-400 uppercase font-black">LỆNH</span>
                        <FaArrowRight size={10} className="text-gray-300 mt-0.5" />
                      </div>
                      <div className="w-full">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-extrabold text-lg text-gray-900 leading-tight">{order.orderName}</h3>
                          <select 
                            value={order.status}
                            onChange={(e) => changeOrderStatus(order._id, e.target.value)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide cursor-pointer focus:outline-none appearance-none hover:opacity-80 transition ${statusColor[order.status]}`}
                          >
                            <option value="pending" className="bg-white text-gray-800">Chờ xử lý</option>
                            <option value="in_progress" className="bg-white text-gray-800">Đang chạy</option>
                            <option value="completed" className="bg-white text-gray-800">Hoàn thành</option>
                            <option value="cancelled" className="bg-white text-gray-800">Hủy</option>
                          </select>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-gray-500 mb-2">
                          <span>Mã: <strong className="text-gray-800">{order.orderCode}</strong></span>
                          <span className="hidden sm:inline">&bull;</span>
                          <span>Tổng SL: <strong className="text-gray-800 text-sm">{order.totalQuantity.toLocaleString()}</strong></span>
                          <span className="hidden sm:inline">&bull;</span>
                          <span className="text-[#006B4D] bg-[#E6F0ED] px-2 py-0.5 rounded font-bold">{(order.printJobs || []).length} Bài in</span>
                        </div>

                        {/* Tags of Jobs */}
                        <div className="flex flex-wrap gap-2">
                          {(order.printJobs || []).map((j, i) => (
                            <span key={i} className={`px-2.5 py-1 rounded text-[11px] font-bold border ${order.printType === 'offset' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                              {order.printType === 'offset' ? '🖨️' : '🕸️'} {j.jobName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* PROGRESS TRACKER (Interactive) */}
                    <div className="w-full xl:w-auto flex flex-col gap-2 shrink-0">
                      {[
                        order.printType === 'offset' ? { type: 'offset', label: 'OFFSET', steps: OFFSET_PROGRESS_STEPS } : null,
                        order.printType === 'silk' ? { type: 'silk', label: 'LỤA', steps: SILK_PROGRESS_STEPS } : null
                      ].filter(Boolean).map(tracker => (
                        <div key={tracker.type} className="bg-[#F9FAFB] w-full rounded-xl p-2.5 border border-gray-100 flex items-center justify-between gap-1 overflow-x-auto relative custom-scrollbar">
                          <span className="absolute top-1 left-2 text-[8px] font-black text-gray-300 uppercase tracking-widest">{tracker.label}</span>
                          <div className="flex items-center mt-2 w-max min-w-full justify-between px-2">
                            {tracker.steps.map((step, i) => {
                              const isDone = order[step.id];
                              return (
                                <React.Fragment key={step.id}>
                                  <div className="flex flex-col items-center gap-1 cursor-pointer group/step min-w-[45px]"
                                    onClick={() => toggleProgress(order._id, step.id, isDone)}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isDone
                                      ? 'bg-[#006B4D] text-white shadow-sm shadow-[#006B4D]/30'
                                      : 'bg-white text-gray-300 border-2 border-dashed border-gray-300 group-hover/step:border-[#006B4D] group-hover/step:text-[#006B4D]'
                                      }`}>
                                      <FaCheckCircle size={12} className={isDone ? 'opacity-100' : 'opacity-0 scale-50 transition-all group-hover/step:opacity-50'} />
                                    </div>
                                    <span className={`text-[9px] font-bold whitespace-nowrap ${isDone ? 'text-[#006B4D]' : 'text-gray-400'}`}>
                                      {step.short}
                                    </span>
                                  </div>
                                  {i < tracker.steps.length - 1 && (
                                    <div className={`h-[2px] w-3 sm:w-6 md:w-8 mt-[-14px] transition-colors ${order[tracker.steps[i].id] && order[tracker.steps[i + 1].id]
                                      ? 'bg-[#006B4D]'
                                      : 'bg-gray-200'
                                      }`} />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 xl:pl-4 xl:border-l xl:border-gray-100 w-full xl:w-auto justify-end mt-2 xl:mt-0">
                      <button onClick={() => setViewModal(order)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition" title="Xem Chi Tiết">
                        <FaEye size={16} />
                      </button>
                      <button onClick={() => triggerPrint(order)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition" title="In Lệnh A4">
                        <FaPrint size={16} />
                      </button>
                      <button onClick={() => setModal(order)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition" title="Xem/Sửa">
                        <FaEdit size={16} />
                      </button>
                      <button onClick={() => handleDelete(order._id)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition" title="Xóa">
                        <FaTrash size={14} />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductionOrderScreen;
