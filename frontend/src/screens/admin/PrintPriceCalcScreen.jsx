import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaClipboardList, FaCalculator, FaFileWord, FaPrint, FaSave, FaCheck, FaTimes, FaLayerGroup, FaMoneyBillWave, FaPercentage, FaPlus, FaTrash, FaHistory, FaBox, FaEye, FaStar, FaChevronDown, FaTags, FaSyncAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import PostProcessSelector from '../../components/PostProcessSelector';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun, Header, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, TextWrappingType } from 'docx';
// ==========================================
// CONSTANTS - BOX TYPES
// ==========================================
const BOX_TYPES = [
    { id: 'tuck_end', name: 'Hộp nắp gài (Tuck End)', calcFlat: (L, W, H) => ({ w: (L + W) * 2 + 1.5, h: H + 2 * W + 3 }) },
    { id: 'reverse_tuck', name: 'Hộp chui đầu (Reverse Tuck)', calcFlat: (L, W, H) => ({ w: (L + W) * 2 + 1.5, h: H + 2 * W + 3 }) },
    { id: 'auto_lock', name: 'Hộp đáy tự động (Auto Lock)', calcFlat: (L, W, H) => ({ w: (L + W) * 2 + 1.5, h: H + 1.5 * W + 3 }) },
    { id: 'snap_lock', name: 'Hộp cài khóa (Snap Lock)', calcFlat: (L, W, H) => ({ w: (L + W) * 2 + 1.5, h: H + 1.5 * W + 3 }) },
    { id: 'mailer', name: 'Hộp bưu điện (Mailer Box)', calcFlat: (L, W, H) => ({ w: L + 4 * H + 4, h: 2 * W + 2 * H + 5 }) },
    { id: 'custom', name: 'Sản phẩm / Mẫu in tự do', calcFlat: (L, W, H) => ({ w: L, h: W }) },
];

// ==========================================
// HELPER COMPONENTS (outside to avoid re-render)
// ==========================================
const Card = ({ title, icon, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 relative">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <div className="text-[#006B4D]">{icon}</div>
            <h3 className="font-extrabold text-[#111827] text-sm uppercase tracking-wider">{title}</h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

const Inp = ({ label, value, onChange, type = "text", suffix, addon, disabled, placeholder }) => (
    <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">{label}</label>}
        <div className="relative flex items-center">
            {addon && <span className="absolute left-3 text-gray-400 text-sm">{addon}</span>}
            <input
                type={type} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder}
                className={`w-full border border-gray-200 rounded-xl py-2 ${addon ? 'pl-8' : 'pl-3'} ${suffix ? 'pr-9' : 'pr-3'} text-sm focus:outline-none focus:ring-2 focus:ring-[#006B4D]/30 focus:border-[#006B4D] font-bold text-[#111827] disabled:bg-gray-100 disabled:text-gray-400 transition-colors`}
            />
            {suffix && <span className="absolute right-3 text-xs font-bold text-gray-400">{suffix}</span>}
        </div>
    </div>
);

// ==========================================
// IMPOSITION SVG COMPONENT (with Bleed + Gap + Click-to-Rotate)
// ==========================================
const ImpositionPreview = ({ printSheetW, printSheetH, flatW, flatH, allowCheatGripper, bleed = 0, gap = 0 }) => {
    const svgPadding = 40;
    const marginSize = allowCheatGripper ? 0 : 1;

    // Effective item size with bleed (bleed on each side)
    const effectiveW = flatW + 2 * bleed;
    const effectiveH = flatH + 2 * bleed;

    // Ensure W >= H
    const sheetW = Math.max(printSheetW || 0, printSheetH || 0);
    const sheetH = Math.min(printSheetW || 0, printSheetH || 0);
    const usableH = sheetH - marginSize;

    // State for individually rotated items
    const [rotatedItems, setRotatedItems] = useState({});

    const imposition = useMemo(() => {
        if (!effectiveW || !effectiveH || effectiveW <= 0 || effectiveH <= 0 || !sheetW || !sheetH || usableH <= 0) return { count: 0, cols: 0, rows: 0, rotated: false };
        // Normal orientation
        const cols1 = Math.floor((sheetW + gap) / (effectiveW + gap));
        const rows1 = Math.floor((usableH + gap) / (effectiveH + gap));
        const t1 = cols1 * rows1;
        // Rotated 90°
        const cols2 = Math.floor((sheetW + gap) / (effectiveH + gap));
        const rows2 = Math.floor((usableH + gap) / (effectiveW + gap));
        const t2 = cols2 * rows2;
        if (t1 >= t2) return { count: t1, cols: cols1, rows: rows1, rotated: false, itemW: effectiveW, itemH: effectiveH };
        return { count: t2, cols: cols2, rows: rows2, rotated: true, itemW: effectiveH, itemH: effectiveW };
    }, [sheetW, sheetH, usableH, effectiveW, effectiveH, gap]);

    // Reset rotated items when imposition changes
    useEffect(() => { setRotatedItems({}); }, [imposition.cols, imposition.rows, imposition.rotated]);

    const handleItemClick = (key, currentW, currentH) => {
        setRotatedItems(prev => ({
            ...prev,
            [key]: prev[key] ? undefined : true
        }));
    };

    if (!sheetW || !sheetH) return null;

    const scale = Math.min(500 / (sheetW + svgPadding * 2), 400 / (sheetH + svgPadding * 2));
    const sW = sheetW * scale;
    const sH = sheetH * scale;
    const totalW = sW + svgPadding * 2;
    const totalH = sH + svgPadding * 2;

    const elements = [];
    if (imposition.count > 0) {
        const itemsGroupW = imposition.cols * imposition.itemW + (imposition.cols - 1) * gap;
        const itemsGroupH = imposition.rows * imposition.itemH + (imposition.rows - 1) * gap;

        const startX = svgPadding + (sW - itemsGroupW * scale) / 2;
        const startY = svgPadding + (usableH * scale - itemsGroupH * scale) / 2;

        for (let r = 0; r < imposition.rows; r++) {
            for (let c = 0; c < imposition.cols; c++) {
                const key = `${r}-${c}`;
                const isRotated = !!rotatedItems[key];
                const cellW = imposition.itemW;
                const cellH = imposition.itemH;
                const drawW = isRotated ? cellH : cellW;
                const drawH = isRotated ? cellW : cellH;

                // Only draw if the rotated item still fits in the allocated cell
                const x = startX + c * (cellW + gap) * scale;
                const y = startY + r * (cellH + gap) * scale;

                const bleedScaled = bleed * scale;
                const innerW = (drawW - 2 * bleed) * scale;
                const innerH = (drawH - 2 * bleed) * scale;

                elements.push(
                    <g key={key} onClick={() => handleItemClick(key)} style={{ cursor: 'pointer' }}>
                        {/* Bleed area (red tint) */}
                        {bleed > 0 && (
                            <rect x={x} y={y} width={drawW * scale} height={drawH * scale}
                                fill="rgba(239,68,68,0.10)" stroke="#EF4444" strokeWidth="0.8" strokeDasharray="3,2" rx="1" />
                        )}
                        {/* Product area (green) */}
                        <rect x={x + bleedScaled} y={y + bleedScaled} width={innerW} height={innerH}
                            fill="rgba(0,107,77,0.12)" stroke="#006B4D" strokeWidth="1.5" rx="2" />
                        {/* Rotation indicator */}
                        {isRotated && (
                            <text x={x + drawW * scale / 2} y={y + drawH * scale / 2 + 3}
                                textAnchor="middle" fontSize="8" fill="#F97316" fontWeight="bold">↻</text>
                        )}
                    </g>
                );
            }
        }
    }

    return (
        <div className="flex flex-col items-center">
            <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full max-w-[520px]" style={{ background: '#FAFBFC' }}>
                {/* Print Sheet */}
                <rect x={svgPadding} y={svgPadding} width={sW} height={sH} fill="#f8f9fa" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="6,3" rx="3" />

                {/* Gripper Margin Area */}
                {!allowCheatGripper && usableH > 0 && (
                    <rect x={svgPadding} y={svgPadding + sH - marginSize * scale} width={sW} height={marginSize * scale} fill="#FFEDD5" stroke="#F97316" strokeWidth="1" opacity="0.8" />
                )}

                {/* Dimension labels */}
                <text x={svgPadding + sW / 2} y={svgPadding - 8} textAnchor="middle" fontSize="11" fill="#6B7280" fontWeight="bold">{sheetW} cm</text>
                <text x={svgPadding - 8} y={svgPadding + sH / 2} textAnchor="middle" fontSize="11" fill="#6B7280" fontWeight="bold" transform={`rotate(-90, ${svgPadding - 8}, ${svgPadding + sH / 2})`}>{sheetH} cm</text>

                {/* Items */}
                {elements}
            </svg>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold">
                <span className="text-[#006B4D] bg-[#E6F0ED] px-3 py-1 rounded-lg">Xếp được: {imposition.count} SP/tờ</span>
                {imposition.rotated && <span className="text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">Xoay 90°</span>}
                {flatW > 0 && <span className="text-gray-500">SP: {flatW.toFixed(1)}×{flatH.toFixed(1)} cm</span>}
                {bleed > 0 && <span className="text-red-500 bg-red-50 px-2 py-1 rounded-lg">Bleed: {bleed} cm</span>}
                {gap > 0 && <span className="text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">Gap: {gap} cm</span>}
            </div>
            <div className="mt-2 text-[10px] text-gray-400 text-center">
                {!allowCheatGripper ? '* Đã trừ 1cm Nhíp kẽm dưới đáy cạnh ngắn.' : '* Chế độ không trừ nhíp kẽm (Ăn gian).'}
                <br />* Bấm vào 1 sản phẩm bất kỳ để xoay ngang/dọc.
            </div>
        </div>
    );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const PrintPriceCalcScreen = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'Tính giá');
    const navigate = useNavigate();

    // ---- CUSTOMER / ORDER ----
    const [customerName, setCustomerName] = useState('');
    const [productName, setProductName] = useState('Hộp giấy Offset');
    const [printQuantity, setPrintQuantity] = useState(1000);

    // ---- PAPER API ----
    const [paperPricesFromAPI, setPaperPricesFromAPI] = useState([]);
    const [selectedPaperApiId, setSelectedPaperApiId] = useState('');
    const [selectedPaperSizeValue, setSelectedPaperSizeValue] = useState('');

    // ---- PAPER DIMENSIONS ----
    const [paperBigPrice, setPaperBigPrice] = useState(10000);
    const [paperBigW, setPaperBigW] = useState(79);
    const [paperBigH, setPaperBigH] = useState(109);
    const [printSheetW, setPrintSheetW] = useState(54.5);
    const [printSheetH, setPrintSheetH] = useState(39.5);

    // ---- BOX DIMENSIONS (for imposition) ----
    const [boxL, setBoxL] = useState('');
    const [boxW, setBoxW] = useState('');
    const [boxH, setBoxH] = useState('');
    const [boxType, setBoxType] = useState('custom');
    const [allowCheatGripper, setAllowCheatGripper] = useState(false);

    // ---- BLEED & GAP ----
    const [bleed, setBleed] = useState(0);
    const [gap, setGap] = useState(0);

    // ---- CUT ----
    const [autoCut, setAutoCut] = useState(true);
    const [sheetsPerBigPaper, setSheetsPerBigPaper] = useState(4);
    const [itemsPerSheet, setItemsPerSheet] = useState(5);

    // ---- PLATES ----
    const [numPlates, setNumPlates] = useState(4);
    const platePrice = 375000;

    // ---- POST PROCESS (Legacy die-cut/UV/foil kept for backward compat) ----
    const [hasDieCut, setHasDieCut] = useState(false);
    const [dieCutPrice, setDieCutPrice] = useState(0);
    const dieLaborCost = 100;
    const [hasUV, setHasUV] = useState(false);
    const [uvPrice, setUvPrice] = useState(0);
    const [hasFoil, setHasFoil] = useState(false);
    const [foilPrice, setFoilPrice] = useState(0);

    // ---- POST PROCESS (New Component) ----
    const [postProcessData, setPostProcessData] = useState({
        selectedIds: [],
        selectedProcesses: [],
        totalFixedCost: 0,
        totalPerUnitCost: 0,
        totalCostPerItem: 0,
        grandTotal: 0,
    });

    const handlePostProcessChange = useCallback((data) => {
        setPostProcessData(data);
    }, []);

    // ---- MARGIN ----
    const [margin, setMargin] = useState(20);

    // ---- QUOTE BUFFER ----
    const [quoteItems, setQuoteItems] = useState([]);

    // ---- QUOTE HISTORY ----
    const [savedQuotes, setSavedQuotes] = useState([]);
    const [viewingQuote, setViewingQuote] = useState(null);

    // ---- FLAT SIZE CALC ----
    const flatSize = useMemo(() => {
        const L = Number(boxL) || 0, W = Number(boxW) || 0, H = Number(boxH) || 0;
        if (!L || !W) return { w: 0, h: 0 };
        if (boxType !== 'custom' && !H) return { w: 0, h: 0 };
        const bt = BOX_TYPES.find(b => b.id === boxType);
        return bt ? bt.calcFlat(L, W, H) : { w: 0, h: 0 };
    }, [boxL, boxW, boxH, boxType]);

    // ---- API INIT ----
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const authConfig = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

    useEffect(() => {
        const fetchPapers = async () => {
            try { const res = await axios.get('/api/paper-prices', authConfig); setPaperPricesFromAPI(res.data || []); } catch (e) { console.error(e); }
        };
        fetchPapers();
    }, []);

    useEffect(() => { if (activeTab === 'Lịch sử báo giá') fetchQuotes(); }, [activeTab]);

    const fetchQuotes = async () => {
        try { const res = await axios.get('/api/admin-quotes', authConfig); setSavedQuotes(res.data || []); } catch (e) { console.error(e); }
    };

    // ---- CUT ALGORITHM (updated with bleed + gap) ----
    const calculateCuts = (cW, cH, chW, chH, applyGripper = false) => {
        if (!chW || !chH || chW <= 0 || chH <= 0 || !cW || !cH) return 0;
        const sheetW = applyGripper ? Math.max(cW, cH) : cW;
        const sheetH = applyGripper ? Math.min(cW, cH) : cH;
        const usableH = applyGripper ? (sheetH - (allowCheatGripper ? 0 : 1)) : sheetH;
        // When applying gripper (imposition), use bleed + gap
        const effW = applyGripper ? chW + 2 * bleed : chW;
        const effH = applyGripper ? chH + 2 * bleed : chH;
        const G = applyGripper ? gap : 0;
        return Math.max(
            Math.floor((sheetW + G) / (effW + G)) * Math.floor((usableH + G) / (effH + G)),
            Math.floor((sheetW + G) / (effH + G)) * Math.floor((usableH + G) / (effW + G))
        );
    };

    useEffect(() => {
        if (autoCut) {
            const spbp = calculateCuts(paperBigW, paperBigH, printSheetW, printSheetH, false);
            if (spbp > 0) setSheetsPerBigPaper(spbp);
            if (flatSize.w > 0 && flatSize.h > 0) {
                const ips = calculateCuts(printSheetW, printSheetH, flatSize.w, flatSize.h, true);
                if (ips > 0) setItemsPerSheet(ips);
            }
        }
    }, [autoCut, paperBigW, paperBigH, printSheetW, printSheetH, flatSize, allowCheatGripper, bleed, gap]);

    // ---- COST CALCULATIONS ----
    const totalItemsPerBigPaper = sheetsPerBigPaper * itemsPerSheet;
    const paperCostPerItem = totalItemsPerBigPaper > 0 ? (paperBigPrice / totalItemsPerBigPaper) : 0;
    const printCostPerItem = printQuantity > 0 ? ((numPlates * platePrice) / printQuantity) : 0;
    const dieCostPerItem = (hasDieCut && printQuantity > 0) ? ((Number(dieCutPrice) / printQuantity) + dieLaborCost) : 0;
    const uvCostPerItem = (hasUV && printQuantity > 0) ? (Number(uvPrice) / printQuantity) : 0;
    const foilCostPerItem = (hasFoil && printQuantity > 0) ? (Number(foilPrice) / printQuantity) : 0;
    // Post-process costs from the selector component (includes lamination)
    const postProcessCostPerItem = postProcessData.totalCostPerItem || 0;
    const totalCostPerItem = paperCostPerItem + printCostPerItem + dieCostPerItem + uvCostPerItem + foilCostPerItem + postProcessCostPerItem;
    const suggestedPrice = totalCostPerItem * (1 + (Number(margin) || 0) / 100);
    const totalQuotePrice = suggestedPrice * printQuantity;

    // ---- QUOTE BUFFER ACTIONS ----
    const addToBuffer = () => {
        if (!productName.trim()) return toast.warning('Vui lòng nhập tên sản phẩm');
        const postProcessNames = postProcessData.selectedProcesses.map(p => p.name).join(', ');
        const specs = `Khổ in: ${printSheetW}x${printSheetH}cm. ${hasDieCut ? 'Bế.' : ''} ${hasUV ? 'UV.' : ''} ${hasFoil ? 'Ép kim.' : ''} ${postProcessNames ? `GC: ${postProcessNames}.` : ''}`.trim();
        const item = {
            id: Date.now(),
            productName,
            quantity: printQuantity,
            specs,
            unitPrice: Math.round(suggestedPrice),
            totalPrice: Math.round(totalQuotePrice),
            costBreakdown: { paperCost: Math.round(paperCostPerItem), printCost: Math.round(printCostPerItem), dieCost: Math.round(dieCostPerItem), uvCost: Math.round(uvCostPerItem), foilCost: Math.round(foilCostPerItem), postProcessCost: Math.round(postProcessCostPerItem), totalCost: Math.round(totalCostPerItem), margin: Number(margin) || 0 },
        };
        setQuoteItems(prev => [...prev, item]);
        toast.success(`Đã lưu hạng mục: ${productName}`);
    };

    const removeFromBuffer = (id) => setQuoteItems(prev => prev.filter(i => i.id !== id));
    const bufferGrandTotal = quoteItems.reduce((s, i) => s + i.totalPrice, 0);

    // ---- SAVE QUOTE TO DB ----
    const saveQuoteToDB = async () => {
        if (quoteItems.length === 0) return toast.warning('Cần ít nhất 1 hạng mục');
        if (!customerName.trim()) return toast.warning('Vui lòng nhập tên khách hàng');
        try {
            await axios.post('/api/admin-quotes', { customerName, items: quoteItems, grandTotal: bufferGrandTotal }, authConfig);
            toast.success('Đã lưu báo giá vào hệ thống!');
        } catch (e) { toast.error('Lỗi khi lưu báo giá'); }
    };

    // ---- WORD EXPORT (multi-item) ----
    const exportWord = async (itemsToExport = null, custName = null, total = null) => {
        const items = itemsToExport || quoteItems;
        const name = custName || customerName;
        const gt = total || bufferGrandTotal;
        if (items.length === 0) {
            // Fallback: export single current item
            const singleItem = [{ productName, quantity: printQuantity, specs: `Khổ in: ${printSheetW}x${printSheetH}cm`, unitPrice: Math.round(suggestedPrice), totalPrice: Math.round(totalQuotePrice) }];
            return exportWordDoc(singleItem, name, Math.round(totalQuotePrice));
        }
        return exportWordDoc(items, name, gt);
    };

    // ---- WORD EXPORT (multi-item) FIX ----
    // ---- WORD EXPORT (multi-item) CHUYÊN NGHIỆP ----
    // ---- WORD EXPORT (multi-item) CHUYÊN NGHIỆP ----
    // ---- WORD EXPORT (multi-item) CHUYÊN NGHIỆP ----
    // ---- WORD EXPORT (multi-item) CHUYÊN NGHIỆP ĐÃ FIX LỖI ẢNH ----
    // ---- WORD EXPORT (multi-item) CHUYÊN NGHIỆP BẢN HOÀN THIỆN ----
    // ---- WORD EXPORT (multi-item) CHUYÊN NGHIỆP FIX LỖI CORRUPT FILE ----
    const exportWordDoc = async (items, name, grandTotal) => {
        try {
            // Viền bảng báo giá chuẩn (size 6 = 0.75pt)
            const bdr = {
                top: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "000000" }
            };

            const colWidths = [5, 20, 35, 7, 10, 11, 12];

            // 1. Tải Phôi giấy
            let headerElement = null;
            try {
                const response = await fetch(`/aaa.jpg?t=${new Date().getTime()}`);
                const contentType = response.headers.get('content-type');
                if (response.ok && contentType && contentType.includes('image')) {
                    const imageBlob = await response.blob();
                    const arrayBuffer = await imageBlob.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);

                    headerElement = new Header({
                        children: [
                            new Paragraph({
                                children: [
                                    new ImageRun({
                                        data: uint8Array,
                                        transformation: { width: 794, height: 1123 }, // Kích thước A4
                                        floating: {
                                            horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 },
                                            verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 0 },
                                            wrap: { type: TextWrappingType.NONE },
                                            behindDocument: true,
                                        },
                                    }),
                                ],
                            })
                        ]
                    });
                }
            } catch (imgError) {
                console.warn("Lỗi tải hình ảnh phôi tiêu đề.", imgError);
            }

            // 2. Dòng Header của Bảng
            const headerRow = new TableRow({
                children: ['TT', 'Tên hàng hóa', 'Quy cách', 'Đvt', 'Số lượng', 'Đơn giá', 'Thành Tiền'].map((text, index) =>
                    new TableCell({
                        children: [
                            new Paragraph({
                                children: [new TextRun({ text: text, bold: true })],
                                alignment: AlignmentType.CENTER
                            })
                        ],
                        width: { size: colWidths[index], type: WidthType.PERCENTAGE },
                        verticalAlign: AlignmentType.CENTER,
                        margins: { top: 100, bottom: 100, left: 100, right: 100 }
                    })
                )
            });

            // 3. Các dòng Dữ liệu Sản phẩm
            const dataRows = items.map((item, i) =>
                new TableRow({
                    children: [
                        String(i + 1),
                        item.productName || '',
                        item.specs || '',
                        'SP',
                        item.quantity ? item.quantity.toLocaleString() : '',
                        `${(item.unitPrice || 0).toLocaleString()}đ`,
                        `${(item.totalPrice || 0).toLocaleString()}đ`
                    ].map((text, colIndex) =>
                        new TableCell({
                            children: [
                                new Paragraph({
                                    text: text,
                                    alignment: (colIndex === 1 || colIndex === 2) ? AlignmentType.LEFT : AlignmentType.CENTER
                                })
                            ],
                            width: { size: colWidths[colIndex], type: WidthType.PERCENTAGE },
                            verticalAlign: AlignmentType.CENTER,
                            margins: { top: 100, bottom: 100, left: 100, right: 100 }
                        })
                    )
                })
            );

            const today = new Date();
            const dateStr = `Huế, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

            // 4. Khởi tạo Document
            const doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: { top: 3000, right: 1134, bottom: 2000, left: 1134 },
                        },
                    },
                    headers: {
                        default: headerElement || new Header({ children: [] })
                    },
                    children: [
                        new Paragraph({
                            children: [new TextRun({ text: "BẢNG BÁO GIÁ", bold: true, size: 36, color: "A52A2A" })],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 0, after: 200 }
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({ text: "Kính gửi: ", bold: false }),
                                new TextRun({ text: `Khách hàng ${name || 'Quý Khách'}`, bold: true })
                            ],
                            spacing: { after: 100 }
                        }),
                        new Paragraph({
                            text: `Địa chỉ: (Chưa cập nhật)`,
                            spacing: { after: 200 }
                        }),

                        new Paragraph({
                            text: "Theo như yêu cầu của Quý cơ quan, Công ty TNHH In Quang Phát kính gửi Bảng báo giá về in ấn biểu mẫu như sau:",
                            spacing: { after: 200 }
                        }),

                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: bdr,
                            rows: [headerRow, ...dataRows]
                        }),

                        new Paragraph({
                            children: [new TextRun({ text: "Ghi chú:", bold: true })],
                            spacing: { before: 200, after: 50 }
                        }),
                        new Paragraph({ text: "  • Đơn giá trên chưa bao gồm thuế VAT", spacing: { after: 50 } }),
                        new Paragraph({ text: "  • Giao hàng tận nơi", spacing: { after: 400 } }),

                        // FIX LỖI Ở ĐÂY: Loại bỏ toàn bộ thuộc tính `size` ở BorderStyle.NONE
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: {
                                top: { style: BorderStyle.NONE },
                                bottom: { style: BorderStyle.NONE },
                                left: { style: BorderStyle.NONE },
                                right: { style: BorderStyle.NONE },
                                insideHorizontal: { style: BorderStyle.NONE },
                                insideVertical: { style: BorderStyle.NONE },
                            },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph("")] }),
                                        new TableCell({
                                            children: [
                                                new Paragraph({ text: dateStr, alignment: AlignmentType.CENTER }),
                                                new Paragraph({ children: [new TextRun({ text: "Người báo giá", bold: true })], alignment: AlignmentType.CENTER, spacing: { after: 1000 } }),
                                                new Paragraph({ children: [new TextRun({ text: "Trần Đình Tấn", bold: true })], alignment: AlignmentType.CENTER })
                                            ],
                                            width: { size: 45, type: WidthType.PERCENTAGE }
                                        }),
                                    ]
                                })
                            ]
                        })
                    ]
                }]
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `BaoGia_${name || 'InQuangPhat'}_${Date.now()}.docx`);
            toast.success('Đã xuất báo giá chuẩn Letterhead!');

        } catch (e) {
            console.error("LỖI XUẤT WORD:", e);
            toast.error('Lỗi khi xuất Word!');
        }
    };

    const exportAndSave = async () => {
        await saveQuoteToDB();
        await exportWord();
    };

    const deleteQuote = async (id) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa báo giá này?')) return;
        try { await axios.delete(`/api/admin-quotes/${id}`, authConfig); toast.success('Đã xóa'); fetchQuotes(); } catch (e) { toast.error('Lỗi xóa'); }
    };

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827] relative">
            {isSidebarOpen && <div className="fixed inset-0 bg-[#111827]/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>}
            <div className={`fixed inset-y-0 left-0 z-50 h-full transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0 lg:block`}>
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col w-full overflow-hidden">
                <AdminHeader title="Công Cụ Tính Giá In" />
                {/* HEADER WITH TABS */}
                <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 shrink-0 flex flex-col sm:flex-row justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden text-gray-500" onClick={() => setIsSidebarOpen(true)}>☰</button>
                        <h1 className="text-lg md:text-xl font-bold text-[#111827] whitespace-nowrap">Tính Giá & Báo Giá</h1>
                        <nav className="hidden sm:flex gap-6 text-sm font-medium ml-4">
                            {['Tính giá', 'Lịch sử báo giá'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap pb-3 -mb-3 transition-colors ${activeTab === tab ? 'text-[#006B4D] border-b-2 border-[#006B4D]' : 'text-[#6B7280] hover:text-[#111827]'}`}>
                                    {tab === 'Lịch sử báo giá' && <FaHistory className="inline mr-1.5 text-xs" />}{tab}
                                </button>
                            ))}
                            {/* Nút chuyển trang Quản lý giá GC */}
                            <button
                                onClick={() => navigate('/admin/finishing-prices')}
                                className="whitespace-nowrap pb-3 -mb-3 transition-colors text-[#6B7280] hover:text-[#111827] flex items-center gap-1.5"
                            >
                                <FaTags className="text-xs" /> Quản lý giá GC
                            </button>
                        </nav>
                    </div>
                </header>
                {/* Mobile tabs */}
                <div className="sm:hidden bg-white px-4 border-b border-gray-200 flex gap-4 text-sm font-medium overflow-x-auto">
                    {['Tính giá', 'Lịch sử báo giá'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-3 transition-colors ${activeTab === tab ? 'text-[#006B4D] border-b-2 border-[#006B4D]' : 'text-[#6B7280]'}`}>{tab}</button>
                    ))}
                    <button onClick={() => navigate('/admin/finishing-prices')} className="whitespace-nowrap py-3 text-[#6B7280] flex items-center gap-1">
                        <FaTags className="text-xs" /> Giá GC
                    </button>
                </div>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                    {/* ============================================================ */}
                    {/* TAB 1: TÍNH GIÁ */}
                    {/* ============================================================ */}
                    {activeTab === 'Tính giá' && (
                        <div className="max-w-[1600px] mx-auto space-y-6">
                            {/* TOP ROW: ORDER INFO */}
                            <Card title="1. Thông Tin Đơn Hàng" icon={<FaClipboardList />}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Inp label="Khách hàng" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Tên khách hàng" />
                                    <Inp label="Sản phẩm" value={productName} onChange={e => setProductName(e.target.value)} />
                                    <Inp label="Số lượng in (SP)" value={printQuantity} onChange={e => setPrintQuantity(Number(e.target.value) || 0)} type="number" />
                                </div>
                            </Card>

                            {/* ROW 2: QUY CÁCH + MÔ PHỎNG */}
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                                {/* QUY CÁCH */}
                                <div className="xl:col-span-7">
                                    <Card title="2. Quy Cách Cắt Giấy & In" icon={<FaLayerGroup />}>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Tờ Lớn */}
                                            <div className="space-y-4">
                                                <h4 className="font-bold text-sm text-[#006B4D] border-b pb-2 flex items-center justify-between">Tờ Giấy Lớn (Nhập)<span className="text-xs bg-[#E6F0ED] px-2 py-0.5 rounded text-[#006B4D]">Giá: {paperBigPrice.toLocaleString()}đ</span></h4>
                                                <div className="flex flex-col gap-2">
                                                    <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#006B4D] bg-white text-[#111827] font-bold cursor-pointer" value={selectedPaperApiId} onChange={e => { setSelectedPaperApiId(e.target.value); setSelectedPaperSizeValue(''); }}>
                                                        <option value="">-- Chọn giấy từ kho NCC --</option>
                                                        {paperPricesFromAPI.map(p => <option key={p._id} value={p._id}>{p.paperType} ({p.supplier})</option>)}
                                                    </select>
                                                    {selectedPaperApiId && (
                                                        <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#006B4D] bg-[#F9FAFB] text-[#111827] font-bold cursor-pointer" value={selectedPaperSizeValue} onChange={e => { const val = e.target.value; setSelectedPaperSizeValue(val); const paper = paperPricesFromAPI.find(p => p._id === selectedPaperApiId); if (paper) { const sizeObj = paper.sizes.find(s => s.dimensions === val); if (sizeObj) { setPaperBigPrice(Number(sizeObj.price) || 0); const dims = sizeObj.dimensions.toLowerCase().split('x'); if (dims.length === 2) { setPaperBigW(Number(dims[0].trim()) || 0); setPaperBigH(Number(dims[1].trim()) || 0); } } } }}>
                                                            <option value="">-- Chọn khổ & lấy giá --</option>
                                                            {paperPricesFromAPI.find(p => p._id === selectedPaperApiId)?.sizes.map((s, i) => <option key={i} value={s.dimensions}>{s.dimensions} - {Number(s.price).toLocaleString()}đ ({s.unit})</option>)}
                                                        </select>
                                                    )}
                                                </div>
                                                <Inp label="Giá 1 tờ lớn (VNĐ)" value={paperBigPrice} onChange={e => { setPaperBigPrice(Number(e.target.value) || 0); setSelectedPaperApiId(''); }} type="number" />
                                                <div className="flex gap-2">
                                                    <Inp label="Rộng (cm)" value={paperBigW} onChange={e => { setPaperBigW(Number(e.target.value) || 0); setSelectedPaperApiId(''); }} type="number" />
                                                    <div className="flex items-end pb-2 text-gray-400 font-black">X</div>
                                                    <Inp label="Dài (cm)" value={paperBigH} onChange={e => { setPaperBigH(Number(e.target.value) || 0); setSelectedPaperApiId(''); }} type="number" />
                                                </div>
                                            </div>
                                            {/* Khổ Cắt In */}
                                            <div className="space-y-4">
                                                <h4 className="font-bold text-sm text-[#006B4D] border-b pb-2">Khổ Cắt In (Lên máy)</h4>
                                                <div className="flex gap-2">
                                                    <Inp label="Rộng (cm)" value={printSheetW} onChange={e => setPrintSheetW(Number(e.target.value) || 0)} type="number" />
                                                    <div className="flex items-end pb-2 text-gray-400 font-black">X</div>
                                                    <Inp label="Dài (cm)" value={printSheetH} onChange={e => setPrintSheetH(Number(e.target.value) || 0)} type="number" />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Auto cut toggle */}
                                        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" id="autoCut" className="w-4 h-4 text-[#006B4D] rounded" checked={autoCut} onChange={e => setAutoCut(e.target.checked)} />
                                                <label htmlFor="autoCut" className="text-sm font-bold text-gray-600">Máy Tự Chia Khổ</label>
                                            </div>
                                            <div className="w-px h-6 bg-gray-300 hidden md:block"></div>
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-500 uppercase">Cắt tờ lớn:</span>
                                                    <input type="number" value={sheetsPerBigPaper} disabled={autoCut} onChange={e => setSheetsPerBigPaper(Number(e.target.value) || 0)} className={`w-16 border rounded px-2 py-1 text-center font-bold ${autoCut ? 'bg-gray-200 text-gray-500' : 'border-[#006B4D] text-[#006B4D]'}`} />
                                                    <span className="text-xs text-gray-500">Khổ/tờ</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-500 uppercase">Xếp bài:</span>
                                                    <input type="number" value={itemsPerSheet} disabled={autoCut} onChange={e => setItemsPerSheet(Number(e.target.value) || 0)} className={`w-16 border rounded px-2 py-1 text-center font-bold ${autoCut ? 'bg-gray-200 text-gray-500' : 'border-[#006B4D] text-[#006B4D]'}`} />
                                                    <span className="text-xs text-gray-500">SP/in</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card title="3. Gia Công Sau In" icon={<FaPrint />}>
                                        {/* Kẽm */}
                                        <div className="mb-6">
                                            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30">
                                                <h4 className="text-xs font-black uppercase text-blue-600 tracking-wider mb-3 flex items-center gap-1"><FaPrint /> Công in máy</h4>
                                                <Inp label="Số lượng Kẽm (Tối đa 4)" value={numPlates} onChange={e => { let v = Number(e.target.value) || 0; if (v > 4) v = 4; if (v < 0) v = 0; setNumPlates(v); }} type="number" suffix="kẽm" />
                                                <p className="text-[10px] text-gray-500 mt-2">* Mặc định 375k/kẽm bao công in.</p>
                                            </div>
                                        </div>

                                        {/* Separator */}
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Chọn các công đoạn gia công</span>
                                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                                        </div>

                                        {/* PostProcessSelector Component (includes lamination) */}
                                        <PostProcessSelector
                                            onChange={handlePostProcessChange}
                                            printQuantity={printQuantity}
                                            productArea={flatSize.w * flatSize.h}
                                        />
                                    </Card>
                                </div> {/* --- END OF LEFT COLUMN --- */}

                                {/* MÔ PHỎNG BÌNH TRANG */}
                                <div className="xl:col-span-5 h-full">
                                    <div className="h-full flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-[#E6F0ED] text-[#006B4D] flex items-center justify-center font-bold text-sm"><FaBox /></div>
                                            <h3 className="font-extrabold text-[#111827] text-lg">Mô Phỏng Bình Trang</h3>
                                        </div>
                                        <div className="space-y-4 flex-1 flex flex-col">
                                            <div className="flex gap-2 items-end">
                                                <div className="relative flex-1">
                                                    <select value={boxType} onChange={e => setBoxType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#006B4D] bg-white text-[#111827] font-bold cursor-pointer appearance-none pr-8">
                                                        {BOX_TYPES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                    </select>
                                                    <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
                                                </div>
                                            </div>
                                            <div className={`grid ${boxType === 'custom' ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                                                <Inp label={boxType === 'custom' ? "Dài (cm)" : "Dài L (cm)"} value={boxL} onChange={e => setBoxL(e.target.value)} type="number" />
                                                <Inp label={boxType === 'custom' ? "Rộng (cm)" : "Rộng W (cm)"} value={boxW} onChange={e => setBoxW(e.target.value)} type="number" />
                                                {boxType !== 'custom' && (
                                                    <Inp label="Cao H (cm)" value={boxH} onChange={e => setBoxH(e.target.value)} type="number" />
                                                )}
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <input type="checkbox" id="cheatGripper" checked={allowCheatGripper} onChange={e => setAllowCheatGripper(e.target.checked)} className="text-[#006B4D] cursor-pointer" />
                                                <label htmlFor="cheatGripper" className="text-xs font-bold text-gray-500 cursor-pointer">Bỏ qua 1cm Nhíp kẽm (Ăn gian)</label>
                                            </div>
                                            {/* Bleed & Gap inputs */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Bleed (mỗi bên, cm)</label>
                                                    <input type="number" step="0.1" min="0" value={bleed} onChange={e => setBleed(Math.max(0, Number(e.target.value) || 0))} className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm font-bold text-red-600 bg-red-50/30 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400" placeholder="0" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Gap (khoảng cách, cm)</label>
                                                    <input type="number" step="0.1" min="0" value={gap} onChange={e => setGap(Math.max(0, Number(e.target.value) || 0))} className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm font-bold text-blue-600 bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400" placeholder="0" />
                                                </div>
                                            </div>
                                            {flatSize.w > 0 && (
                                                <div className="text-xs text-center p-2 bg-[#E6F0ED] rounded-lg font-bold text-[#006B4D]">
                                                    Khổ trải: {flatSize.w.toFixed(1)} × {flatSize.h.toFixed(1)} cm
                                                    {bleed > 0 && <span className="text-red-500 ml-2">(+bleed: {(flatSize.w + 2*bleed).toFixed(1)} × {(flatSize.h + 2*bleed).toFixed(1)})</span>}
                                                </div>
                                            )}
                                            <div className="border border-gray-100 rounded-xl p-3 bg-[#FAFBFC] flex-1 min-h-[400px]">
                                                <ImpositionPreview printSheetW={printSheetW} printSheetH={printSheetH} flatW={flatSize.w} flatH={flatSize.h} allowCheatGripper={allowCheatGripper} bleed={bleed} gap={gap} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> {/* --- END OF GRID ROW 2 --- */}

                            {/* ROW 4: COST ENGINE */}
                            <Card title="4. Phân Tích & Chốt Giá" icon={<FaCalculator />}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                    {/* LEFT: Cost Breakdown */}
                                    <div className="bg-[#FAFBFC] rounded-2xl p-6 border border-gray-100 h-full flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Cơ cấu chi phí / 1 Sản phẩm</h4>
                                            <div className="space-y-3 text-sm mb-6">
                                                {[
                                                    ['Phí Kẽm & In', printCostPerItem, '#111827'],
                                                    ['Vật tư Giấy', paperCostPerItem, '#2563EB'],
                                                    ['Gia công sau in', postProcessCostPerItem, '#059669'],
                                                ].map(([label, cost, color]) => (
                                                    <div key={label} className="flex justify-between items-center py-2 border-b border-dashed border-gray-200/50 hover:bg-white rounded px-2 transition">
                                                        <span className="text-gray-600 font-medium tracking-wide text-xs">{label}</span>
                                                        <span className="font-extrabold" style={{ color }}>{Math.round(cost).toLocaleString()} đ</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-[#111827] text-white p-4 rounded-xl shadow-inner relative overflow-hidden flex items-center justify-between mt-auto">
                                            <div className="absolute top-1/2 -translate-y-1/2 right-2 w-16 h-16 opacity-10"><FaMoneyBillWave size={64} /></div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-bold mb-1">Tổng Vốn Sản Xuất / SP</p>
                                                <h3 className="text-2xl font-black text-[#00E096]">{Math.round(totalCostPerItem).toLocaleString()} <span className="text-sm font-bold opacity-80">đ</span></h3>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT: Margin & Quote Actions */}
                                    <div className="h-full flex flex-col justify-between space-y-6">
                                        <div className="bg-[#FAFBFC] rounded-2xl p-6 border border-gray-100">
                                            {/* MARGIN */}
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
                                                    <h4 className="text-xs font-bold text-[#006B4D] uppercase tracking-widest flex items-center gap-1"><FaPercentage /> Biên Lợi Nhuận Kỳ Vọng</h4>
                                                    <input type="number" value={margin} onChange={e => { const v = e.target.value; if (v === '') { setMargin(''); return; } let n = Number(v); if (n < 0) n = 0; setMargin(n); }} className="w-16 border rounded px-2 py-1 text-center font-bold text-[#006B4D] bg-[#E6F0ED] outline-none" />
                                                </div>
                                                <div className="flex gap-2">
                                                    {[10, 15, 20, 25, 30].map(m => <button key={m} type="button" onClick={() => setMargin(m)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${margin === m ? 'bg-[#006B4D] text-white border-[#006B4D]' : 'bg-white text-gray-500 hover:border-[#006B4D] hover:text-[#006B4D] border-gray-200'}`}>{m}%</button>)}
                                                </div>
                                            </div>
                                            {/* SUGGESTED QUOTE */}
                                            <div className="bg-gradient-to-r from-[#006B4D]/10 to-transparent p-4 rounded-xl border border-[#006B4D]/20">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#006B4D]">Giá Chào Khách / SP</span>
                                                    <span className="text-2xl font-black text-[#006B4D]">{Math.round(suggestedPrice).toLocaleString()} đ</span>
                                                </div>
                                                <div className="flex justify-between items-end border-t border-[#006B4D]/10 pt-3 mt-1">
                                                    <span className="text-xs font-bold text-gray-600">Dự kiến Thành Tiền (<span className="text-[#006B4D]">{printQuantity.toLocaleString()} SP</span>)</span>
                                                    <span className="text-xl font-black text-[#111827]">{Math.round(totalQuotePrice).toLocaleString()} đ</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="space-y-3 mt-auto">
                                            <button onClick={addToBuffer} type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 transition transform active:scale-[0.98] shadow-lg shadow-blue-600/30 text-base tracking-wide">
                                                <FaSave size={18} /> GHI LẠI HẠNG MỤC NÀY VÀO BÁO GIÁ
                                            </button>
                                            <button onClick={() => exportWord()} type="button" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition text-sm">
                                                <FaFileWord size={16} /> Bỏ qua lưu tạm, Xuất Word nhanh 1 mục
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* QUOTE BUFFER - full width */}
                            {quoteItems.length > 0 && (
                                <div className="w-full">
                                    <Card title={`Bộ Nhớ Tạm — ${quoteItems.length} hạng mục`} icon={<FaClipboardList />}>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm">
                                                <thead><tr className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                                                    <th className="py-3 px-4 text-left">STT</th><th className="py-3 px-4 text-left">Sản phẩm</th><th className="py-3 px-4 text-left">Quy cách</th><th className="py-3 px-4 text-right">SL</th><th className="py-3 px-4 text-right">Đơn giá</th><th className="py-3 px-4 text-right">Thành tiền</th><th className="py-3 px-4 text-center w-16"></th>
                                                </tr></thead>
                                                <tbody>
                                                    {quoteItems.map((item, i) => (
                                                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                            <td className="py-3 px-4 font-bold text-[#006B4D]">{i + 1}</td>
                                                            <td className="py-3 px-4 font-bold">{item.productName}</td>
                                                            <td className="py-3 px-4 text-gray-500 text-xs">{item.specs}</td>
                                                            <td className="py-3 px-4 text-right">{item.quantity.toLocaleString()}</td>
                                                            <td className="py-3 px-4 text-right font-bold">{item.unitPrice.toLocaleString()} đ</td>
                                                            <td className="py-3 px-4 text-right font-extrabold text-[#006B4D]">{item.totalPrice.toLocaleString()} đ</td>
                                                            <td className="py-3 px-4 text-center"><button onClick={() => removeFromBuffer(item.id)} className="text-gray-300 hover:text-red-500 transition"><FaTrash /></button></td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-[#E6F0ED]">
                                                        <td colSpan="5" className="py-4 px-4 text-right font-black uppercase text-[#006B4D]">Tổng cộng báo giá:</td>
                                                        <td className="py-4 px-4 text-right font-black text-xl text-[#006B4D]">{bufferGrandTotal.toLocaleString()} đ</td>
                                                        <td></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-4 flex justify-end gap-3">
                                            <button onClick={exportAndSave} type="button" className="bg-[#006B4D] hover:bg-[#005a3f] text-white py-3 px-8 rounded-xl font-black flex items-center gap-2 transition transform active:scale-95 shadow-lg shadow-[#006B4D]/30">
                                                <FaFileWord size={20} /> XUẤT BÁO GIÁ & LƯU
                                            </button>
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ============================================================ */}
                    {/* TAB 2: LỊCH SỬ BÁO GIÁ */}
                    {/* ============================================================ */}
                    {activeTab === 'Lịch sử báo giá' && (
                        <div className="max-w-7xl mx-auto animate-fade-in-down">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-2xl shadow-sm"><FaHistory /></div>
                                <div><h2 className="text-2xl font-extrabold text-[#111827]">Lịch sử Báo giá</h2><p className="text-[#6B7280] text-sm mt-1">Tất cả báo giá đã tạo và lưu vào hệ thống</p></div>
                            </div>

                            {savedQuotes.length === 0 ? (
                                <div className="text-center py-16 text-[#6B7280] bg-white rounded-2xl border border-gray-200 shadow-sm">Chưa có báo giá nào được lưu.</div>
                            ) : (
                                <div className="space-y-4">
                                    {savedQuotes.map(q => (
                                        <div key={q._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                            <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-xs font-black text-[#006B4D] bg-[#E6F0ED] px-3 py-1 rounded-lg">{q.quoteCode}</span>
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${q.status === 'draft' ? 'bg-gray-100 text-gray-500' : q.status === 'sent' ? 'bg-blue-100 text-blue-600' : q.status === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{q.status}</span>
                                                    </div>
                                                    <h3 className="font-bold text-lg text-[#111827]">{q.customerName}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">{q.items?.length || 0} hạng mục • {new Date(q.createdAt).toLocaleDateString('vi-VN')} {new Date(q.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-black text-[#006B4D]">{(q.grandTotal || 0).toLocaleString()} đ</span>
                                                    <button onClick={() => setViewingQuote(viewingQuote?._id === q._id ? null : q)} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"><FaEye /> Xem</button>
                                                    <button onClick={() => exportWord(q.items, q.customerName, q.grandTotal)} className="text-sm font-bold text-[#006B4D] hover:underline flex items-center gap-1"><FaFileWord /> Word</button>
                                                    <button onClick={() => deleteQuote(q._id)} className="text-sm font-bold text-red-500 hover:underline"><FaTrash /></button>
                                                </div>
                                            </div>
                                            {viewingQuote?._id === q._id && (
                                                <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                                                    <table className="min-w-full text-sm">
                                                        <thead><tr className="text-xs uppercase text-gray-500 font-bold"><th className="py-2 px-3 text-left">STT</th><th className="py-2 px-3 text-left">SP</th><th className="py-2 px-3 text-left">Quy cách</th><th className="py-2 px-3 text-right">SL</th><th className="py-2 px-3 text-right">Đơn giá</th><th className="py-2 px-3 text-right">Thành tiền</th></tr></thead>
                                                        <tbody>{q.items?.map((item, i) => (
                                                            <tr key={i} className="border-b border-gray-100"><td className="py-2 px-3 font-bold text-[#006B4D]">{i + 1}</td><td className="py-2 px-3 font-bold">{item.productName}</td><td className="py-2 px-3 text-gray-500 text-xs">{item.specs}</td><td className="py-2 px-3 text-right">{(item.quantity || 0).toLocaleString()}</td><td className="py-2 px-3 text-right font-bold">{(item.unitPrice || 0).toLocaleString()} đ</td><td className="py-2 px-3 text-right font-extrabold text-[#006B4D]">{(item.totalPrice || 0).toLocaleString()} đ</td></tr>
                                                        ))}</tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default PrintPriceCalcScreen;