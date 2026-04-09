import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    FaCheck, FaLayerGroup, FaBoxOpen, FaCubes, FaBookOpen,
    FaCut, FaShieldAlt, FaStar, FaGem, FaCircle, FaSpinner
} from 'react-icons/fa';
import axios from 'axios';

// ==========================================
// FALLBACK MOCK DATA (used when API is unavailable)
// ==========================================
const FALLBACK_PROCESSES = [
    { id: 'lam_bong', name: 'Cán màng bóng', description: 'Phủ lớp màng polyme bóng, tăng độ sáng bề mặt, chống nước, chống xước.', price: 500, unit: 'đ/tờ in', category: 'surface', color: '#8B5CF6', icon: '✨' },
    { id: 'lam_mo', name: 'Cán màng mờ', description: 'Phủ lớp màng mờ mịn, tạo cảm giác mềm mại và sang trọng.', price: 500, unit: 'đ/tờ in', category: 'surface', color: '#8B5CF6', icon: '🌫️' },
    { id: 'uv_toan_phan', name: 'Phủ UV toàn phần', description: 'Phủ vecni UV kín bề mặt, tăng độ bóng bẩy và bảo vệ mực in.', price: 800, unit: 'đ/tờ in', category: 'surface', color: '#06B6D4', icon: '💎' },
    { id: 'uv_cuc_bo', name: 'Phủ UV cục bộ', description: 'Phủ UV lên chi tiết riêng (logo, hình ảnh) tạo điểm nhấn nổi bật.', price: 1500000, unit: 'đ/tổng', category: 'surface', color: '#06B6D4', icon: '🔮' },
    { id: 'ep_kim', name: 'Ép kim / Ép nhũ', description: 'Ép lớp nhũ vàng, bạc, đồng lên giấy bằng khuôn nóng - sang trọng tối đa.', price: 2000000, unit: 'đ/tổng', category: 'surface', color: '#F59E0B', icon: '👑' },
    { id: 'thuc_noi', name: 'Thúc nổi / Dập chìm', description: 'Ép bề mặt giấy nhô lên hoặc lõm xuống, tạo hiệu ứng 3D xúc giác.', price: 1500000, unit: 'đ/tổng', category: 'surface', color: '#EC4899', icon: '🎭' },
    { id: 'can_gan', name: 'Cán gân', description: 'Tạo họa tiết sần trên bề mặt qua trục lăn khắc vân, giả lập giấy mỹ thuật.', price: 300, unit: 'đ/tờ in', category: 'surface', color: '#78716C', icon: '🪵' },
    { id: 'can_be', name: 'Cấn bế (Die-cutting)', description: 'Dùng khuôn bế dập cắt và tạo đường gấp theo thiết kế hộp.', price: 2500000, unit: 'đ/tổng', category: 'shaping', color: '#F97316', icon: '📐' },
    { id: 'gap_dan', name: 'Gấp dán hộp', description: 'Quét keo và dán mép, định hình thành hộp hoàn chỉnh.', price: 200, unit: 'đ/SP', category: 'shaping', color: '#F97316', icon: '📦' },
    { id: 'dan_cua_so', name: 'Dán cửa sổ', description: 'Bế khoảng trống và dán màng nhìn xuyên (PET/mica) lên mặt hộp.', price: 500, unit: 'đ/SP', category: 'shaping', color: '#F97316', icon: '🪟' },
    { id: 'boi_giay', name: 'Bồi giấy (Mounting)', description: 'Dán bồi lớp giấy in mỏng lên cốt carton lạnh/sóng cứng cáp.', price: 1000, unit: 'đ/SP', category: 'rigid', color: '#059669', icon: '🧱' },
    { id: 'phay_ranh', name: 'Phay rãnh (V-grooving)', description: 'Rạch rãnh chữ V trên carton lạnh để gấp hộp cứng vuông vức hoàn hảo.', price: 500, unit: 'đ/SP', category: 'rigid', color: '#059669', icon: '🔧' },
    { id: 'boc_hop', name: 'Bọc hộp (Wrapping)', description: 'Gấp dán lớp giấy in áo ôm sát các góc cạnh carton lạnh đã phay.', price: 1500, unit: 'đ/SP', category: 'rigid', color: '#059669', icon: '🎁' },
    { id: 'khay_dinh_hinh', name: 'Gia công khay định hình', description: 'Bế mút xốp EVA, khay giấy, bọc lụa, phủ nhung cố định sản phẩm.', price: 3000, unit: 'đ/SP', category: 'rigid', color: '#059669', icon: '🧶' },
    { id: 'dong_kim', name: 'Đóng kim / Bấm gáy', description: 'Bấm ghim kim loại giữa gáy, phù hợp ấn phẩm mỏng.', price: 200, unit: 'đ/cuốn', category: 'book', color: '#3B82F6', icon: '📎' },
    { id: 'gay_keo_nhiet', name: 'Đóng gáy keo nhiệt', description: 'Phay xước gáy, quét keo nóng dán bìa - phổ biến cho sách dày.', price: 1000, unit: 'đ/cuốn', category: 'book', color: '#3B82F6', icon: '📕' },
    { id: 'khau_chi', name: 'Khâu chỉ gáy keo', description: 'Khâu chỉ liền tay sách trước dán keo - độ bền tuyệt đối.', price: 2000, unit: 'đ/cuốn', category: 'book', color: '#3B82F6', icon: '🧵' },
    { id: 'gay_lo_xo', name: 'Đóng gáy lò xo', description: 'Đục lỗ xỏ dây lò xo nhựa/kim loại - dùng cho lịch, sổ tay, menu.', price: 1500, unit: 'đ/cuốn', category: 'book', color: '#3B82F6', icon: '🗓️' },
    { id: 'cat_xen', name: 'Cắt xén (Trimming)', description: 'Cắt bỏ lề dư, xén cạnh đúng kích thước thành phẩm.', price: 100, unit: 'đ/SP', category: 'finishing', color: '#64748B', icon: '✂️' },
    { id: 'khoan_lo', name: 'Khoan lỗ / Đóng mắt cáo', description: 'Đục lỗ tròn, dập khoen kim loại gia cố.', price: 300, unit: 'đ/SP', category: 'finishing', color: '#64748B', icon: '⭕' },
    { id: 'rang_cua', name: 'Đục lỗ răng cưa', description: 'Tạo đường đứt nét để xé dễ dàng.', price: 200, unit: 'đ/SP', category: 'finishing', color: '#64748B', icon: '🎫' },
    { id: 'so_nhay', name: 'Đóng số nhảy', description: 'Đóng dãy số seri liên tiếp.', price: 50, unit: 'đ/SP', category: 'finishing', color: '#64748B', icon: '🔢' },
];

const CATEGORIES = [
    { id: 'surface', name: 'Gia công bề mặt', subtitle: 'Tăng thẩm mỹ & bảo vệ', icon: <FaShieldAlt />, gradient: 'from-violet-500/10 to-cyan-500/10', borderColor: 'border-violet-200' },
    { id: 'shaping', name: 'Gia công định hình', subtitle: 'Hộp giấy & Bao bì', icon: <FaBoxOpen />, gradient: 'from-orange-500/10 to-amber-500/10', borderColor: 'border-orange-200' },
    { id: 'rigid', name: 'Hộp cứng cao cấp', subtitle: 'Rigid Boxes', icon: <FaCubes />, gradient: 'from-emerald-500/10 to-teal-500/10', borderColor: 'border-emerald-200' },
    { id: 'book', name: 'Sách, Tạp chí, Catalog', subtitle: 'Đóng gáy & Gia công', icon: <FaBookOpen />, gradient: 'from-blue-500/10 to-indigo-500/10', borderColor: 'border-blue-200' },
    { id: 'finishing', name: 'Hoàn thiện phụ trợ', subtitle: 'Cắt xén, Đục lỗ, Số nhảy', icon: <FaCut />, gradient: 'from-slate-500/10 to-gray-500/10', borderColor: 'border-slate-200' },
];

// ==========================================
// FORMAT HELPERS
// ==========================================
const formatPrice = (price) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1)}tr`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)}k`;
    return `${price}`;
};

const formatPriceFull = (price) => price.toLocaleString('vi-VN');

// Map API data to component format
const mapApiToProcess = (apiItem) => ({
    id: apiItem.processId,
    _id: apiItem._id,
    name: apiItem.name,
    description: apiItem.description || '',
    price: apiItem.price,
    unit: apiItem.unit,
    category: apiItem.category,
    color: apiItem.color || '#64748B',
    icon: apiItem.icon || '⚙️',
});

// ==========================================
// PROCESS CARD COMPONENT
// ==========================================
const ProcessCard = React.memo(({ process, isSelected, onToggle }) => {
    const baseColor = process.color;

    return (
        <button
            type="button"
            onClick={() => onToggle(process.id)}
            className={`
                group relative w-full text-left rounded-2xl border-2 p-4 
                transition-all duration-300 ease-out cursor-pointer
                ${isSelected
                    ? 'shadow-lg scale-[1.02] border-opacity-100'
                    : 'shadow-sm hover:shadow-md border-gray-200 hover:border-gray-300 opacity-60 hover:opacity-80'
                }
            `}
            style={{
                borderColor: isSelected ? baseColor : undefined,
                background: isSelected
                    ? `linear-gradient(135deg, ${baseColor}08, ${baseColor}15)`
                    : 'white',
            }}
        >
            {/* Selected Indicator - Checkmark */}
            <div
                className={`
                    absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center
                    transition-all duration-300 ease-out
                    ${isSelected
                        ? 'scale-100 opacity-100'
                        : 'scale-0 opacity-0'
                    }
                `}
                style={{ backgroundColor: baseColor }}
            >
                <FaCheck className="text-white text-[10px]" />
            </div>

            {/* Icon + Name Row */}
            <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110">
                    {process.icon}
                </span>
                <div className="flex-1 min-w-0">
                    <h4
                        className={`
                            font-extrabold text-sm leading-snug transition-colors duration-300
                            ${isSelected ? 'text-gray-900' : 'text-gray-500'}
                        `}
                    >
                        {process.name}
                    </h4>
                    <p
                        className={`
                            text-[11px] leading-relaxed mt-1 line-clamp-2 transition-colors duration-300
                            ${isSelected ? 'text-gray-600' : 'text-gray-400'}
                        `}
                    >
                        {process.description}
                    </p>
                </div>
            </div>

            {/* Price Badge */}
            <div className="mt-3 flex items-center justify-between">
                <span
                    className={`
                        inline-flex items-center gap-1 text-xs font-black rounded-lg px-2.5 py-1
                        transition-all duration-300
                    `}
                    style={{
                        backgroundColor: isSelected ? `${baseColor}20` : '#F3F4F6',
                        color: isSelected ? baseColor : '#9CA3AF',
                    }}
                >
                    {formatPriceFull(process.price)}đ
                    <span className="font-medium opacity-70 text-[10px]">/{process.unit.replace('đ/', '')}</span>
                </span>

                {/* Toggle indicator */}
                <span
                    className={`
                        text-[10px] font-bold uppercase tracking-wider transition-all duration-300
                        ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
                    `}
                    style={{ color: isSelected ? baseColor : '#9CA3AF' }}
                >
                    {isSelected ? '✓ Đã chọn' : 'Chọn'}
                </span>
            </div>

            {/* Subtle glow effect when selected */}
            {isSelected && (
                <div
                    className="absolute inset-0 rounded-2xl opacity-[0.06] pointer-events-none"
                    style={{
                        background: `radial-gradient(ellipse at top right, ${baseColor}, transparent 70%)`,
                    }}
                />
            )}
        </button>
    );
});

ProcessCard.displayName = 'ProcessCard';

// ==========================================
// MAIN COMPONENT
// ==========================================
const PostProcessSelector = ({ onChange, printQuantity = 1000 }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [processes, setProcesses] = useState(FALLBACK_PROCESSES);
    const [loadingApi, setLoadingApi] = useState(true);
    const [dataSource, setDataSource] = useState('fallback'); // 'api' or 'fallback'
    const [expandedCategories, setExpandedCategories] = useState(
        CATEGORIES.map(c => c.id)
    );

    // ---- FETCH FROM API ----
    useEffect(() => {
        const fetchFromApi = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo?.token) {
                    setLoadingApi(false);
                    return;
                }
                const { data } = await axios.get('/api/finishing-prices', {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                if (data && data.length > 0) {
                    const mapped = data
                        .filter(item => item.isActive !== false)
                        .map(mapApiToProcess);
                    setProcesses(mapped);
                    setDataSource('api');
                }
            } catch (err) {
                console.warn('PostProcessSelector: API unavailable, using fallback data.', err.message);
            } finally {
                setLoadingApi(false);
            }
        };
        fetchFromApi();
    }, []);

    const toggleProcess = useCallback((processId) => {
        setSelectedIds(prev => {
            const next = prev.includes(processId)
                ? prev.filter(id => id !== processId)
                : [...prev, processId];

            // Calculate totals for parent using current processes state
            const selectedProcesses = processes.filter(p => next.includes(p.id));
            const totalFixedCost = selectedProcesses
                .filter(p => p.unit === 'đ/tổng')
                .reduce((sum, p) => sum + p.price, 0);
            const totalPerUnitCost = selectedProcesses
                .filter(p => p.unit !== 'đ/tổng')
                .reduce((sum, p) => sum + p.price, 0);

            if (onChange) {
                onChange({
                    selectedIds: next,
                    selectedProcesses,
                    totalFixedCost,
                    totalPerUnitCost,
                    totalCostPerItem: totalPerUnitCost + (printQuantity > 0 ? totalFixedCost / printQuantity : 0),
                    grandTotal: totalFixedCost + (totalPerUnitCost * printQuantity),
                });
            }

            return next;
        });
    }, [onChange, printQuantity, processes]);

    const toggleCategory = useCallback((catId) => {
        setExpandedCategories(prev =>
            prev.includes(catId)
                ? prev.filter(id => id !== catId)
                : [...prev, catId]
        );
    }, []);

    // Computed summary
    const summary = useMemo(() => {
        const selected = processes.filter(p => selectedIds.includes(p.id));
        const fixedTotal = selected
            .filter(p => p.unit === 'đ/tổng')
            .reduce((sum, p) => sum + p.price, 0);
        const perUnit = selected
            .filter(p => p.unit !== 'đ/tổng')
            .reduce((sum, p) => sum + p.price, 0);
        const costPerItem = perUnit + (printQuantity > 0 ? fixedTotal / printQuantity : 0);
        const grandTotal = fixedTotal + (perUnit * printQuantity);

        return { count: selected.length, fixedTotal, perUnit, costPerItem, grandTotal, items: selected };
    }, [selectedIds, printQuantity, processes]);

    return (
        <div className="space-y-6">
            {/* Data source indicator */}
            {!loadingApi && (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${dataSource === 'api' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {dataSource === 'api' ? 'Giá từ Database (cập nhật mới nhất)' : 'Giá mặc định (chưa kết nối DB)'}
                    </span>
                </div>
            )}

            {/* Loading state */}
            {loadingApi && (
                <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                    <FaSpinner className="animate-spin" />
                    <span className="text-sm font-medium">Đang tải giá gia công...</span>
                </div>
            )}

            {/* ========== CATEGORIES ========== */}
            {CATEGORIES.map(cat => {
                const catProcesses = processes.filter(p => p.category === cat.id);
                if (catProcesses.length === 0) return null;
                const selectedInCat = catProcesses.filter(p => selectedIds.includes(p.id));
                const isExpanded = expandedCategories.includes(cat.id);

                return (
                    <div
                        key={cat.id}
                        className={`rounded-2xl border overflow-hidden transition-all duration-300 ${cat.borderColor}`}
                    >
                        {/* Category Header */}
                        <button
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className={`
                                w-full flex items-center justify-between px-5 py-3.5
                                bg-gradient-to-r ${cat.gradient} hover:brightness-95
                                transition-all duration-200 cursor-pointer
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-lg opacity-70">{cat.icon}</div>
                                <div className="text-left">
                                    <h3 className="font-extrabold text-sm text-gray-800">{cat.name}</h3>
                                    <p className="text-[10px] text-gray-500 font-medium">{cat.subtitle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {selectedInCat.length > 0 && (
                                    <span className="bg-white/80 backdrop-blur-sm text-xs font-black px-2.5 py-1 rounded-full text-emerald-600 shadow-sm">
                                        {selectedInCat.length} đã chọn
                                    </span>
                                )}
                                <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>

                        {/* Category Body */}
                        <div
                            className={`
                                transition-all duration-400 ease-in-out overflow-hidden
                                ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
                            `}
                        >
                            <div className="p-4 bg-white/50">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {catProcesses.map(process => (
                                        <ProcessCard
                                            key={process.id}
                                            process={process}
                                            isSelected={selectedIds.includes(process.id)}
                                            onToggle={toggleProcess}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* ========== TOTAL PRICE SUMMARY (STICKY) ========== */}
            <div
                className={`
                    sticky bottom-0 z-20 rounded-2xl overflow-hidden
                    transition-all duration-500 ease-out
                    ${summary.count > 0
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-60 translate-y-0'
                    }
                `}
            >
                <div className="bg-gradient-to-r from-[#111827] via-[#1E293B] to-[#111827] p-5 text-white relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-violet-500/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/4" />

                    <div className="relative z-10">
                        {/* Top row - summary chips */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Gia công đã chọn:
                            </span>
                            {summary.items.length === 0 ? (
                                <span className="text-xs text-gray-500 italic">Chưa chọn công đoạn nào</span>
                            ) : (
                                summary.items.map(item => (
                                    <span
                                        key={item.id}
                                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                        style={{
                                            backgroundColor: `${item.color}30`,
                                            color: item.color,
                                        }}
                                    >
                                        {item.icon} {item.name}
                                    </span>
                                ))
                            )}
                        </div>

                        {/* Bottom row - pricing */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                            <div className="flex flex-wrap gap-4 text-xs">
                                <div>
                                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider font-bold">Chi phí cố định</span>
                                    <span className="font-black text-amber-400 text-base">{formatPriceFull(summary.fixedTotal)}đ</span>
                                </div>
                                <div className="w-px bg-gray-700 hidden sm:block" />
                                <div>
                                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider font-bold">Phí gia công / SP</span>
                                    <span className="font-black text-cyan-400 text-base">{formatPriceFull(Math.round(summary.perUnit))}đ</span>
                                </div>
                                <div className="w-px bg-gray-700 hidden sm:block" />
                                <div>
                                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider font-bold">Tổng vốn GC / SP</span>
                                    <span className="font-black text-emerald-400 text-base">{formatPriceFull(Math.round(summary.costPerItem))}đ</span>
                                </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">
                                    Tổng chi phí gia công ({printQuantity.toLocaleString()} SP)
                                </span>
                                <span className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                    {formatPriceFull(Math.round(summary.grandTotal))}
                                    <span className="text-lg ml-1">đ</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Also export the data for parent usage
export { FALLBACK_PROCESSES as POST_PROCESSES, CATEGORIES };
export default PostProcessSelector;
