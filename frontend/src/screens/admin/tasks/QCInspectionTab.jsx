import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConfirmModal from '../../../components/ConfirmModal';
import {
  FaPlus, FaTimes, FaCamera, FaTrash, FaEdit, FaCheck,
  FaTimesCircle, FaClipboardCheck, FaFilter, FaEye,
  FaLock, FaKey, FaSave, FaCog, FaCheckCircle,
  FaExclamationCircle, FaExclamationTriangle, FaChevronLeft,
  FaChevronRight, FaSearch
} from 'react-icons/fa';

const SAMPLE_TYPE_MAP = {
  first_off: { label: 'Đầu chuyền', color: 'bg-blue-100 text-blue-700' },
  inline: { label: 'Trong chuyền', color: 'bg-amber-100 text-amber-700' },
  final: { label: 'Cuối chuyền', color: 'bg-purple-100 text-purple-700' },
};

const VERDICT_MAP = {
  pending: { label: 'Chưa đánh giá', color: 'bg-gray-100 text-gray-600', icon: <FaExclamationCircle className="text-[10px]" /> },
  approved: { label: 'Đạt', color: 'bg-emerald-100 text-emerald-700', icon: <FaCheckCircle className="text-[10px]" /> },
  rejected: { label: 'Không đạt', color: 'bg-red-100 text-red-700', icon: <FaTimesCircle className="text-[10px]" /> },
  conditional: { label: 'Đạt có ĐK', color: 'bg-amber-100 text-amber-700', icon: <FaExclamationTriangle className="text-[10px]" /> },
};

const CHECKLIST_ITEMS = [
  { key: 'colorAccuracy', label: 'Màu sắc', desc: 'Màu in đúng mẫu chuẩn' },
  { key: 'registration', label: 'Chồng màu', desc: 'Các lớp in trùng khớp' },
  { key: 'printClarity', label: 'Độ nét', desc: 'Đường nét sắc, không nhòe' },
  { key: 'cuttingAccuracy', label: 'Kích thước cắt', desc: 'Cắt chính xác quy cách' },
  { key: 'printPosition', label: 'Vị trí in', desc: 'In đúng vị trí trên vải' },
  { key: 'packaging', label: 'Đóng gói', desc: 'Đóng gói đúng quy cách' },
];

const QCInspectionTab = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${userInfo?.token}` } }), [userInfo?.token]);

  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterVerdict, setFilterVerdict] = useState('');
  const [hasPin, setHasPin] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, code: '', orderName: '' });

  // PIN modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [pinAction, setPinAction] = useState('create'); // 'create' | 'setup'

  // Setup PIN
  const [showSetupPin, setShowSetupPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingInspection, setEditingInspection] = useState(null);
  const [form, setForm] = useState({
    orderName: '', sampleType: 'first_off', inspector: userInfo?.name || '',
    inspectionDate: new Date().toISOString().slice(0, 16),
    checklist: {
      colorAccuracy: 'pending', registration: 'pending', printClarity: 'pending',
      cuttingAccuracy: 'pending', printPosition: 'pending', packaging: 'pending',
    },
    verdict: 'pending', defectDescription: '', correctiveAction: '', notes: '',
  });
  const [uploadingImages, setUploadingImages] = useState([]);
  const [formImages, setFormImages] = useState([]);
  const [formRefImages, setFormRefImages] = useState([]);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  // Detail view
  const [viewDetail, setViewDetail] = useState(null);

  const cameraRef = useRef(null);
  const refCameraRef = useRef(null);

  // ===== FETCH =====
  const fetchInspections = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/qc-inspections', config);
      setInspections(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchPinStatus = async () => {
    try {
      const { data } = await axios.get('/api/qc-inspections/pin-status', config);
      setHasPin(data.hasPin);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchInspections(); fetchPinStatus(); }, []);

  const filteredInspections = useMemo(() => {
    if (!filterVerdict) return inspections;
    return inspections.filter(i => i.verdict === filterVerdict);
  }, [inspections, filterVerdict]);

  const stats = useMemo(() => ({
    total: inspections.length,
    approved: inspections.filter(i => i.verdict === 'approved').length,
    rejected: inspections.filter(i => i.verdict === 'rejected').length,
    conditional: inspections.filter(i => i.verdict === 'conditional').length,
  }), [inspections]);

  // ===== PIN =====
  const handleVerifyPin = async () => {
    setPinError('');
    try {
      await axios.post('/api/qc-inspections/verify-pin', { pin: pinInput }, config);
      setPinVerified(true);
      setShowPinModal(false);
      setPinInput('');
      openCreateForm();
    } catch (err) {
      setPinError(err.response?.data?.message || 'Mã PIN không đúng');
    }
  };

  const handleSetupPin = async () => {
    if (newPin.length < 4) {
      setPinError('Mã PIN phải có ít nhất 4 ký tự');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('Mã PIN không khớp');
      return;
    }
    try {
      await axios.put('/api/qc-inspections/pin', { pin: newPin }, config);
      toast.success('Đã cài đặt mã PIN QC thành công!');
      setShowSetupPin(false);
      setNewPin('');
      setConfirmPin('');
      setPinError('');
      setHasPin(true);
    } catch (err) {
      setPinError(err.response?.data?.message || 'Lỗi');
    }
  };

  const triggerCreateWithPin = () => {
    if (!hasPin) {
      toast.warning('Chưa cài đặt mã PIN QC. Vui lòng nhấn ⚙️ PIN để cài đặt trước.');
      return;
    }
    setPinInput('');
    setPinError('');
    setPinAction('create');
    setShowPinModal(true);
  };

  // ===== FORM =====
  const openCreateForm = () => {
    setEditingInspection(null);
    setForm({
      orderName: '', sampleType: 'first_off', inspector: userInfo?.name || '',
      inspectionDate: new Date().toISOString().slice(0, 16),
      checklist: {
        colorAccuracy: 'pending', registration: 'pending', printClarity: 'pending',
        cuttingAccuracy: 'pending', printPosition: 'pending', packaging: 'pending',
      },
      verdict: 'pending', defectDescription: '', correctiveAction: '', notes: '',
    });
    setFormImages([]);
    setFormRefImages([]);
    setShowForm(true);
  };

  const openEditForm = (insp) => {
    setEditingInspection(insp);
    setForm({
      orderName: insp.orderName,
      sampleType: insp.sampleType,
      inspector: insp.inspector || '',
      inspectionDate: insp.inspectionDate
        ? new Date(insp.inspectionDate).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      checklist: { ...insp.checklist },
      verdict: insp.verdict,
      defectDescription: insp.defectDescription || '',
      correctiveAction: insp.correctiveAction || '',
      notes: insp.notes || '',
    });
    setFormImages(insp.images || []);
    setFormRefImages(insp.referenceImages || []);
    setShowForm(true);
  };

  // ===== CAMERA & UPLOAD =====
  const handleCameraCapture = async (e, isReference = false) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(prev => [...prev, ...files.map(f => f.name)]);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));

      const { data: urls } = await axios.post('/api/upload', formData, {
        headers: { ...config.headers, 'Content-Type': 'multipart/form-data' },
      });

      if (isReference) {
        setFormRefImages(prev => [...prev, ...urls]);
      } else {
        setFormImages(prev => [...prev, ...urls]);
      }
      toast.success(`Đã tải lên ${files.length} ảnh`);
    } catch (err) {
      toast.error('Upload ảnh thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingImages([]);
      e.target.value = '';
    }
  };

  const removeImage = (idx, isRef = false) => {
    if (isRef) {
      setFormRefImages(prev => prev.filter((_, i) => i !== idx));
    } else {
      setFormImages(prev => prev.filter((_, i) => i !== idx));
    }
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        images: formImages,
        referenceImages: formRefImages,
      };

      if (editingInspection) {
        await axios.put(`/api/qc-inspections/${editingInspection._id}`, payload, config);
        toast.success('Đã cập nhật phiếu kiểm QC');
      } else {
        payload.pin = pinInput;
        await axios.post('/api/qc-inspections', payload, config);
        toast.success('Đã tạo phiếu kiểm QC thành công');
      }
      setShowForm(false);
      fetchInspections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu phiếu QC');
    }
  };

  const handleDeleteClick = (insp) => {
    setDeleteModal({
      isOpen: true,
      id: insp._id,
      code: insp.inspectionCode,
      orderName: insp.orderName,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await axios.delete(`/api/qc-inspections/${deleteModal.id}`, config);
      toast.success('Đã xóa phiếu kiểm QC');
      setDeleteModal({ isOpen: false, id: null, code: '', orderName: '' });
      fetchInspections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa phiếu QC');
    }
  };

  const toggleChecklist = (key) => {
    setForm(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [key]: prev.checklist[key] === 'pass' ? 'fail' : 'pass',
      },
    }));
  };

  // ===== LIGHTBOX =====
  const openLightbox = (images, startIdx = 0) => {
    setLightboxImages(images);
    setLightboxIdx(startIdx);
    setLightboxOpen(true);
  };

  // ===== RENDER INSPECTION CARD =====
  const renderInspectionCard = (insp) => {
    const verd = VERDICT_MAP[insp.verdict] || VERDICT_MAP.pending;
    const st = SAMPLE_TYPE_MAP[insp.sampleType] || SAMPLE_TYPE_MAP.first_off;
    const passCount = Object.values(insp.checklist || {}).filter(v => v === 'pass').length;
    const failCount = Object.values(insp.checklist || {}).filter(v => v === 'fail').length;

    return (
      <div key={insp._id} className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-xs font-extrabold text-[#006B4D] bg-[#E6F0ED] px-2 py-0.5 rounded-lg shrink-0">
              {insp.inspectionCode}
            </span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${verd.color}`}>
              {verd.icon} {verd.label}
            </span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${st.color}`}>
              {st.label}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setViewDetail(insp)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition" title="Xem chi tiết">
              <FaEye className="text-xs" />
            </button>
            <button onClick={() => openEditForm(insp)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition" title="Sửa">
              <FaEdit className="text-xs" />
            </button>
            <button onClick={() => handleDeleteClick(insp)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition active:scale-95" title="Xóa">
              <FaTrash className="text-xs" />
            </button>
          </div>
        </div>

        {/* Product name */}
        <h4 className="font-bold text-sm text-[#111827] mb-1.5 truncate">{insp.orderName}</h4>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-2 flex-wrap">
          <span>👤 {insp.inspector || '—'}</span>
          <span>📅 {new Date(insp.inspectionDate).toLocaleDateString('vi-VN')}</span>
          <span>✅ {passCount} đạt · ❌ {failCount} lỗi</span>
        </div>

        {/* Images thumbnails */}
        {insp.images?.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2">
            {insp.images.slice(0, 4).map((img, idx) => (
              <button
                key={idx}
                onClick={() => openLightbox(insp.images, idx)}
                className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 shrink-0 hover:opacity-80 transition"
              >
                <img src={img} alt={`QC ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
            {insp.images.length > 4 && (
              <button
                onClick={() => openLightbox(insp.images, 4)}
                className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0"
              >
                +{insp.images.length - 4}
              </button>
            )}
          </div>
        )}

        {/* Defect description (if rejected) */}
        {insp.verdict === 'rejected' && insp.defectDescription && (
          <p className="text-[10px] text-red-500 bg-red-50 rounded-lg px-2.5 py-1.5 italic">
            ⚠️ {insp.defectDescription}
          </p>
        )}
      </div>
    );
  };

  // ===== DETAIL VIEW =====
  const renderDetailView = () => {
    if (!viewDetail) return null;
    const insp = viewDetail;
    const verd = VERDICT_MAP[insp.verdict] || VERDICT_MAP.pending;

    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-3 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#111827]">📋 {insp.inspectionCode}</h3>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${verd.color} inline-flex items-center gap-1`}>
                {verd.icon} {verd.label}
              </span>
            </div>
            <button onClick={() => setViewDetail(null)} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <FaTimes className="text-gray-400" />
            </button>
          </div>

          <div className="px-3 py-3 sm:px-4 sm:py-4 space-y-4">
            {/* Info */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-gray-500 font-bold">Sản phẩm:</span><span className="text-[#111827] font-bold">{insp.orderName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-bold">Loại mẫu:</span><span>{SAMPLE_TYPE_MAP[insp.sampleType]?.label}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-bold">QC:</span><span>{insp.inspector || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-bold">Ngày:</span><span>{new Date(insp.inspectionDate).toLocaleString('vi-VN')}</span></div>
            </div>

            {/* Images */}
            {insp.images?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-600 mb-1.5">📸 Ảnh mẫu ({insp.images.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {insp.images.map((img, idx) => (
                    <button key={idx} onClick={() => openLightbox(insp.images, idx)}
                      className="aspect-square rounded-xl overflow-hidden border border-gray-200 hover:opacity-80 transition">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {insp.referenceImages?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-600 mb-1.5">🎨 Ảnh mẫu chuẩn ({insp.referenceImages.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {insp.referenceImages.map((img, idx) => (
                    <button key={idx} onClick={() => openLightbox(insp.referenceImages, idx)}
                      className="aspect-square rounded-xl overflow-hidden border border-gray-200 hover:opacity-80 transition">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist */}
            <div>
              <p className="text-xs font-bold text-gray-600 mb-2">✅ Kết quả kiểm tra</p>
              <div className="space-y-1.5">
                {CHECKLIST_ITEMS.map(({ key, label }) => {
                  const val = insp.checklist?.[key] || 'pending';
                  return (
                    <div key={key} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                      <span className="text-xs font-bold text-gray-700">{label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        val === 'pass' ? 'bg-emerald-100 text-emerald-700' :
                        val === 'fail' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {val === 'pass' ? '✅ Đạt' : val === 'fail' ? '❌ Không đạt' : '⏳ Chưa kiểm'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Defect / Action */}
            {insp.defectDescription && (
              <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                <p className="text-xs font-bold text-red-600 mb-1">⚠️ Mô tả lỗi</p>
                <p className="text-xs text-red-700">{insp.defectDescription}</p>
              </div>
            )}
            {insp.correctiveAction && (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <p className="text-xs font-bold text-amber-600 mb-1">🔧 Hành động khắc phục</p>
                <p className="text-xs text-amber-700">{insp.correctiveAction}</p>
              </div>
            )}
            {insp.notes && (
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                <p className="text-xs font-bold text-blue-600 mb-1">📝 Ghi chú</p>
                <p className="text-xs text-blue-700">{insp.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-lg sm:text-xl shadow-sm">
            <FaClipboardCheck />
          </div>
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-[#111827]">Duyệt mẫu QC</h2>
            <p className="text-[#6B7280] text-[11px] mt-0.5">Kiểm tra mẫu in lụa đầu chuyền</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Setup PIN button (admin) */}
          {userInfo?.isAdmin && (
            <button
              onClick={() => { setShowSetupPin(true); setPinError(''); setNewPin(''); setConfirmPin(''); }}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-3 py-2.5 rounded-xl transition active:scale-95"
              title="Cài đặt mã PIN QC"
            >
              <FaCog /> PIN
            </button>
          )}
          <button
            onClick={triggerCreateWithPin}
            className="flex items-center gap-2 bg-[#006B4D] hover:bg-[#00543c] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md active:scale-95"
          >
            <FaPlus /> Tạo phiếu QC
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-2.5 sm:p-3 text-center cursor-pointer hover:border-[#006B4D]/30 transition" onClick={() => setFilterVerdict('')}>
          <div className="text-xl sm:text-2xl font-extrabold text-[#111827]">{stats.total}</div>
          <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase">Tổng phiếu</div>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-2.5 sm:p-3 text-center cursor-pointer hover:border-emerald-400 transition" onClick={() => setFilterVerdict('approved')}>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600">{stats.approved}</div>
          <div className="text-[9px] sm:text-[10px] font-bold text-emerald-500 uppercase">Đạt</div>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-2.5 sm:p-3 text-center cursor-pointer hover:border-red-400 transition" onClick={() => setFilterVerdict('rejected')}>
          <div className="text-xl sm:text-2xl font-extrabold text-red-600">{stats.rejected}</div>
          <div className="text-[9px] sm:text-[10px] font-bold text-red-500 uppercase">Không đạt</div>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-2.5 sm:p-3 text-center cursor-pointer hover:border-amber-400 transition" onClick={() => setFilterVerdict('conditional')}>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-600">{stats.conditional}</div>
          <div className="text-[9px] sm:text-[10px] font-bold text-amber-500 uppercase">Có ĐK</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1 text-[11px] text-gray-500"><FaFilter /> Lọc:</div>
        {[
          { value: '', label: 'Tất cả' },
          { value: 'approved', label: '✅ Đạt' },
          { value: 'rejected', label: '❌ Không đạt' },
          { value: 'conditional', label: '🟡 Có ĐK' },
        ].map(tab => (
          <button key={tab.value} onClick={() => setFilterVerdict(tab.value)}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition border ${
              filterVerdict === tab.value
                ? 'bg-[#006B4D] text-white border-[#006B4D]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#006B4D]/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006B4D] mx-auto mb-4" />
          <div className="text-gray-500 font-medium text-sm">Đang tải...</div>
        </div>
      ) : filteredInspections.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <FaClipboardCheck className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-500 text-sm">Chưa có phiếu kiểm QC nào</p>
          <p className="text-xs text-gray-400 mt-1">Nhấn "Tạo phiếu QC" để bắt đầu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInspections.map(renderInspectionCard)}
        </div>
      )}

      {/* ===== PIN VERIFICATION MODAL ===== */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-[#E6F0ED] rounded-full flex items-center justify-center mx-auto mb-4">
              <FaLock className="text-2xl text-[#006B4D]" />
            </div>
            <h3 className="font-extrabold text-lg text-[#111827] mb-1">Xác thực PIN</h3>
            <p className="text-xs text-gray-500 mb-4">Nhập mã PIN QC để tạo phiếu kiểm tra</p>

            <input
              type="password"
              inputMode="numeric"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
              placeholder="Nhập mã PIN..."
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-lg font-bold tracking-[0.5em] focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none mb-3"
            />

            {pinError && (
              <p className="text-xs text-red-500 font-bold mb-3 flex items-center justify-center gap-1">
                <FaTimesCircle /> {pinError}
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowPinModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 rounded-xl transition text-sm">
                Hủy
              </button>
              <button onClick={handleVerifyPin}
                className="flex-1 bg-[#006B4D] hover:bg-[#00543c] text-white font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2">
                <FaKey /> Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SETUP PIN MODAL (Admin) ===== */}
      {showSetupPin && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-[#111827]">🔐 Cài đặt mã PIN QC</h3>
              <button onClick={() => setShowSetupPin(false)} className="p-2 hover:bg-gray-100 rounded-xl"><FaTimes className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Mã PIN mới *</label>
                <input type="password" inputMode="numeric" value={newPin} onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Tối thiểu 4 ký tự"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center tracking-widest focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Xác nhận PIN *</label>
                <input type="password" inputMode="numeric" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSetupPin()}
                  placeholder="Nhập lại mã PIN"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center tracking-widest focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none" />
              </div>
              {pinError && <p className="text-xs text-red-500 font-bold flex items-center gap-1"><FaTimesCircle /> {pinError}</p>}
              <button onClick={handleSetupPin}
                className="w-full bg-[#006B4D] hover:bg-[#00543c] text-white font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2 active:scale-95">
                <FaSave /> Lưu mã PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE/EDIT FORM ===== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-2 sm:p-3 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-3 sm:p-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h3 className="font-extrabold text-sm sm:text-base text-[#111827]">
                {editingInspection ? '✏️ Sửa phiếu QC' : '📋 Tạo phiếu kiểm QC'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <FaTimes className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-3 py-3 sm:p-4 space-y-4">
              {/* === CAMERA SECTION === */}
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2">📸 Ảnh mẫu thực tế</p>

                {/* Camera button - Large & prominent for mobile */}
                <button type="button" onClick={() => cameraRef.current?.click()}
                  className="w-full bg-[#006B4D] hover:bg-[#00543c] text-white py-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 shadow-md mb-3">
                  <FaCamera className="text-2xl" />
                  <span className="text-xs font-bold">Chụp ảnh từ Camera</span>
                </button>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple
                  className="hidden" onChange={(e) => handleCameraCapture(e, false)} />

                {/* Uploading indicator */}
                {uploadingImages.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-xl px-3 py-2 mb-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Đang upload {uploadingImages.length} ảnh...
                  </div>
                )}

                {/* Image thumbnails */}
                {formImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {formImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={img} alt="" className="w-full h-full object-cover cursor-pointer"
                          onClick={() => openLightbox(formImages, idx)} />
                        <button type="button" onClick={() => removeImage(idx, false)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[8px]">
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reference images */}
              <div>
                <p className="text-xs font-bold text-gray-600 mb-1.5">🎨 Ảnh mẫu chuẩn / artwork <span className="font-normal text-gray-400">(tùy chọn)</span></p>
                <button type="button" onClick={() => refCameraRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-[#006B4D] text-gray-500 py-2.5 rounded-xl flex items-center justify-center gap-2 transition text-xs mb-2">
                  <FaCamera /> Chụp hoặc chọn ảnh mẫu
                </button>
                <input ref={refCameraRef} type="file" accept="image/*" capture="environment" multiple
                  className="hidden" onChange={(e) => handleCameraCapture(e, true)} />

                {formRefImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {formRefImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={img} alt="" className="w-full h-full object-cover cursor-pointer"
                          onClick={() => openLightbox(formRefImages, idx)} />
                        <button type="button" onClick={() => removeImage(idx, true)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[8px]">
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order info */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Tên sản phẩm / đơn hàng *</label>
                <input type="text" required value={form.orderName} onChange={(e) => setForm({ ...form, orderName: e.target.value })}
                  placeholder="VD: Túi vải PP HueOneFood"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Loại mẫu</label>
                  <select value={form.sampleType} onChange={(e) => setForm({ ...form, sampleType: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none">
                    <option value="first_off">Đầu chuyền</option>
                    <option value="inline">Trong chuyền</option>
                    <option value="final">Cuối chuyền</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">QC kiểm tra</label>
                  <input type="text" value={form.inspector} onChange={(e) => setForm({ ...form, inspector: e.target.value })}
                    placeholder="Tên QC"
                    className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none" />
                </div>
              </div>

              {/* === CHECKLIST === */}
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2">✅ Checklist kiểm tra</p>
                <div className="space-y-2">
                  {CHECKLIST_ITEMS.map(({ key, label, desc }) => {
                    const val = form.checklist[key];
                    return (
                      <div key={key} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                        <div className="min-w-0 mr-3">
                          <div className="text-xs font-bold text-[#111827]">{label}</div>
                          <div className="text-[10px] text-gray-400">{desc}</div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button type="button" onClick={() => setForm(prev => ({
                            ...prev, checklist: { ...prev.checklist, [key]: 'pass' }
                          }))}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-sm font-bold transition active:scale-90 ${
                              val === 'pass' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-400 hover:border-emerald-300'
                            }`}>
                            ✅
                          </button>
                          <button type="button" onClick={() => setForm(prev => ({
                            ...prev, checklist: { ...prev.checklist, [key]: 'fail' }
                          }))}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-sm font-bold transition active:scale-90 ${
                              val === 'fail' ? 'bg-red-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-400 hover:border-red-300'
                            }`}>
                            ❌
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* === VERDICT === */}
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2">📋 Kết luận</p>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setForm({ ...form, verdict: 'approved' })}
                    className={`py-3 rounded-xl text-xs font-bold transition active:scale-95 border ${
                      form.verdict === 'approved' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                    }`}>
                    🟢 Đạt
                  </button>
                  <button type="button" onClick={() => setForm({ ...form, verdict: 'rejected' })}
                    className={`py-3 rounded-xl text-xs font-bold transition active:scale-95 border ${
                      form.verdict === 'rejected' ? 'bg-red-500 text-white border-red-500 shadow-lg' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
                    }`}>
                    🔴 Không đạt
                  </button>
                  <button type="button" onClick={() => setForm({ ...form, verdict: 'conditional' })}
                    className={`py-3 rounded-xl text-xs font-bold transition active:scale-95 border ${
                      form.verdict === 'conditional' ? 'bg-amber-500 text-white border-amber-500 shadow-lg' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                    }`}>
                    🟡 Có ĐK
                  </button>
                </div>
              </div>

              {/* Defect & Corrective */}
              {(form.verdict === 'rejected' || form.verdict === 'conditional') && (
                <div className="space-y-3 bg-red-50/50 rounded-xl p-3 border border-red-100">
                  <div>
                    <label className="block text-xs font-bold text-red-600 mb-1">⚠️ Mô tả lỗi phát hiện</label>
                    <textarea value={form.defectDescription} onChange={(e) => setForm({ ...form, defectDescription: e.target.value })}
                      rows={2} placeholder="Mô tả chi tiết lỗi..."
                      className="w-full border border-red-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none resize-none bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-600 mb-1">🔧 Hành động khắc phục</label>
                    <textarea value={form.correctiveAction} onChange={(e) => setForm({ ...form, correctiveAction: e.target.value })}
                      rows={2} placeholder="Yêu cầu khắc phục..."
                      className="w-full border border-amber-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none resize-none bg-white" />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">📝 Ghi chú</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2} placeholder="Ghi chú thêm..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none resize-none" />
              </div>

              {/* Submit */}
              <button type="submit"
                className="w-full bg-[#006B4D] hover:bg-[#00543c] text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 active:scale-95 text-sm">
                <FaSave /> {editingInspection ? 'Cập nhật phiếu' : 'Lưu phiếu QC'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== LIGHTBOX ===== */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-[80] flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            className="absolute top-4 right-4 text-white text-xl p-2 hover:bg-white/20 rounded-xl transition z-10">
            <FaTimes />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImages[lightboxIdx]} alt=""
              className="max-w-full max-h-full object-contain rounded-lg" />

            {lightboxImages.length > 1 && (
              <>
                <button onClick={() => setLightboxIdx((lightboxIdx - 1 + lightboxImages.length) % lightboxImages.length)}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition">
                  <FaChevronLeft />
                </button>
                <button onClick={() => setLightboxIdx((lightboxIdx + 1) % lightboxImages.length)}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition">
                  <FaChevronRight />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">
                  {lightboxIdx + 1} / {lightboxImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Detail View */}
      {renderDetailView()}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, code: '', orderName: '' })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa phiếu QC"
        itemName={`${deleteModal.code} - ${deleteModal.orderName}`}
        message="Bạn có chắc chắn muốn xóa phiếu kiểm tra QC này không? Hành động này không thể hoàn tác."
        confirmText="Đồng ý xóa"
        cancelText="Hủy bỏ"
      />
    </div>
  );
};

export default QCInspectionTab;
