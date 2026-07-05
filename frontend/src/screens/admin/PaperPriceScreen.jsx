import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaWallet, FaChevronDown, FaBell, FaFileExport, FaBars, FaExpandArrowsAlt, FaWeightHanging, FaCut, FaTruck } from 'react-icons/fa';
import * as XLSX from 'xlsx-js-style'; // IMPORT THƯ VIỆN XUẤT EXCEL CÓ STYLE
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import ConfirmModal from '../../components/ConfirmModal';

const PaperPriceScreen = () => {
    const navigate = useNavigate();

    // === LẤY TOKEN ĐỂ BẢO MẬT API ===
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const authConfig = {
        headers: { Authorization: `Bearer ${userInfo?.token}` }
    };

    // === STATE DỮ LIỆU TỪ DATABASE ===
    const [paperPrices, setPaperPrices] = useState([]);
    const [paperSizes, setPaperSizes] = useState([]);
    const [paperWeights, setPaperWeights] = useState([]);
    const [surcharges, setSurcharges] = useState([]);
    const [suppliersList, setSuppliersList] = useState([]);
    const [filteredPapers, setFilteredPapers] = useState([]);

    // === STATE BỘ LỌC ===
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplierFilter, setSelectedSupplierFilter] = useState('Tất cả');
    const [selectedMaterial, setSelectedMaterial] = useState('Tất cả');
    const [selectedWeight, setSelectedWeight] = useState('Tất cả');
    const [activeTab, setActiveTab] = useState('Giá giấy gốc');

    // === STATE MODAL GIÁ GIẤY ===
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editId, setEditId] = useState(null);

    const [paperNameInput, setPaperNameInput] = useState('');
    const [paperWeightSelect, setPaperWeightSelect] = useState('');
    const [supplier, setSupplier] = useState('');
    const [sizes, setSizes] = useState([{ dimensions: '', price: '', unit: 'đ/ram' }]);

    // === STATE MODAL CẤU HÌNH ===
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [configForm, setConfigForm] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // ==========================================
    // FETCH TẤT CẢ DỮ LIỆU TỪ API CHUẨN
    // ==========================================
    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }
        fetchAllData();
    }, [navigate]);

    const fetchAllData = async () => {
        try {
            const [papersRes, sizesRes, weightsRes, surchargesRes, suppliersRes] = await Promise.all([
                axios.get('/api/paper-prices', authConfig),
                axios.get('/api/config/paper-sizes', authConfig),
                axios.get('/api/config/paper-weights', authConfig),
                axios.get('/api/config/surcharges', authConfig),
                axios.get('/api/v1/suppliers', authConfig)
            ]);
            setPaperPrices(papersRes.data);
            setPaperSizes(sizesRes.data);
            setPaperWeights(weightsRes.data);
            setSurcharges(surchargesRes.data);
            setSuppliersList(suppliersRes.data.suppliers || suppliersRes.data || []);
        } catch (error) {
            toast.error("Lỗi kết nối API. Vui lòng kiểm tra lại Server.");
        }
    };

    // ==========================================
    // LOGIC LỌC DỮ LIỆU TAB 1
    // ==========================================
    useEffect(() => {
        let result = paperPrices;
        if (selectedSupplierFilter !== 'Tất cả') result = result.filter(p => p.supplier === selectedSupplierFilter);
        if (selectedMaterial !== 'Tất cả') result = result.filter(p => p.paperType.toLowerCase().startsWith(selectedMaterial.toLowerCase()));
        if (selectedWeight !== 'Tất cả') result = result.filter(p => p.paperType.toLowerCase().includes(selectedWeight.toLowerCase()));
        if (searchTerm) {
            const lowerCaseTerm = searchTerm.toLowerCase();
            result = result.filter(paper =>
                paper.paperType.toLowerCase().includes(lowerCaseTerm) ||
                paper.sizes.some(size => size.dimensions.toLowerCase().includes(lowerCaseTerm))
            );
        }
        setFilteredPapers(result);
    }, [searchTerm, selectedSupplierFilter, selectedMaterial, selectedWeight, paperPrices]);

    const uniqueMaterials = [...new Set(paperPrices.map(p => {
        let name = p.paperType;
        for (let w of paperWeights) {
            if (name.endsWith(w.weight)) {
                name = name.substring(0, name.length - w.weight.length).trim();
                break;
            }
        }
        return name;
    }))];
    const uniqueWeights = paperWeights.map(w => w.weight);
    const uniqueSuppliersInPrices = [...new Set(paperPrices.map(p => p.supplier).filter(Boolean))];

    // ==========================================
    // TÍNH NĂNG XUẤT FILE EXCEL (CÓ TRANG TRÍ MÀU SẮC & KẺ BẢNG)
    // ==========================================
    // ==========================================
    // TÍNH NĂNG XUẤT FILE EXCEL CHUYÊN NGHIỆP CÓ STYLE
    // ==========================================
    const exportToExcel = () => {
        let tableHeaders = [];
        let tableData = [];
        let fileName = "";
        let sheetName = "Data";
        let columnWidths = [];
        let reportTitle = "";

        // 1. Chuẩn bị Dữ liệu và Tiêu đề dựa trên Tab đang mở
        if (activeTab === 'Giá giấy gốc') {
            if (filteredPapers.length === 0) return toast.warning("Không có dữ liệu để xuất!");
            reportTitle = "BẢNG GIÁ GIẤY NGUYÊN LIỆU NHẬP";
            tableHeaders = ["STT", "Nhà Cung Cấp", "Tên Giấy & Định Lượng", "Khổ Giấy", "Đơn Giá", "Đơn Vị Tính"];
            let stt = 1;
            filteredPapers.forEach((paper) => {
                paper.sizes.forEach((size) => {
                    tableData.push([
                        stt++,
                        paper.supplier || "Chưa xác định",
                        paper.paperType,
                        size.dimensions,
                        size.price,
                        size.unit
                    ]);
                });
            });
            fileName = "BaoGiaGiay";
            sheetName = "GiaGiay";
            columnWidths = [{ wch: 6 }, { wch: 25 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
        }
        else if (activeTab === 'Khổ giấy') {
            if (paperSizes.length === 0) return toast.warning("Không có dữ liệu để xuất!");
            reportTitle = "DANH MỤC KHỔ GIẤY QUY CHUẨN";
            tableHeaders = ["STT", "Kích Thước Khổ", "Mô Tả"];
            tableData = paperSizes.map((item, idx) => ([idx + 1, item.name, item.description || '']));
            fileName = "DanhSachKhoGiay"; sheetName = "KhoGiay";
            columnWidths = [{ wch: 6 }, { wch: 25 }, { wch: 50 }];
        }
        else if (activeTab === 'Định lượng') {
            if (paperWeights.length === 0) return toast.warning("Không có dữ liệu để xuất!");
            reportTitle = "DANH MỤC ĐỊNH LƯỢNG GIẤY (GSM)";
            tableHeaders = ["STT", "Định Lượng (GSM)", "Mô Tả"];
            tableData = paperWeights.map((item, idx) => ([idx + 1, item.weight, item.description || '']));
            fileName = "DanhSachDinhLuong"; sheetName = "DinhLuong";
            columnWidths = [{ wch: 6 }, { wch: 20 }, { wch: 50 }];
        }
        else if (activeTab === 'Phụ phí') {
            if (surcharges.length === 0) return toast.warning("Không có dữ liệu để xuất!");
            reportTitle = "BẢNG GIÁ DỊCH VỤ GIA CÔNG & PHỤ PHÍ";
            tableHeaders = ["STT", "Tên Dịch Vụ Gia Công", "Đơn Vị Tính", "Đơn Giá", "Thành Tiền Tối Thiểu"];
            tableData = surcharges.map((item, idx) => ([idx + 1, item.name, item.unit, item.price, item.minPrice]));
            fileName = "BangGiaPhuPhi"; sheetName = "PhuPhi";
            columnWidths = [{ wch: 6 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 25 }];
        }

        // 2. Tạo cấu trúc mảng 2 chiều (AOA - Array of Arrays) cho Excel
        const today = new Date();
        const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

        const finalData = [
            ["CÔNG TY TNHH IN QUANG PHÁT"],                                    // Dòng 1
            ["Hotline: 0903597686 ( Tấn ), 0935110639 ( Quang ) - Email: inquangphat@gmail.com"],        // Dòng 2
            [""],                                                              // Dòng 3 (Trống)
            [reportTitle],                                                     // Dòng 4 (Tiêu đề báo cáo)
            [`Ngày xuất báo cáo: ${dateStr}`],                                 // Dòng 5 (Ngày)
            [""],                                                              // Dòng 6 (Trống)
            tableHeaders,                                                      // Dòng 7 (Headers của bảng)
            ...tableData                                                       // Dòng 8 trở đi (Data)
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(finalData);

        // 3. Khai báo Merge Cells (Trộn ô)
        const totalCols = tableHeaders.length;
        worksheet['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }, // Trộn dòng Công ty
            { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } }, // Trộn dòng Liên hệ
            { s: { r: 3, c: 0 }, e: { r: 3, c: totalCols - 1 } }, // Trộn dòng Tiêu đề lớn
            { s: { r: 4, c: 0 }, e: { r: 4, c: totalCols - 1 } }  // Trộn dòng Ngày tháng
        ];

        // 4. Khai báo bộ Style
        const borderAll = {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
        };

        const companyStyle = { font: { bold: true, sz: 14, color: { rgb: "006B4D" } }, alignment: { horizontal: "left" } };
        const subInfoStyle = { font: { italic: true, sz: 11, color: { rgb: "555555" } }, alignment: { horizontal: "left" } };
        const titleStyle = { font: { bold: true, sz: 16, color: { rgb: "111827" } }, alignment: { horizontal: "center", vertical: "center" } };
        const dateStyle = { font: { italic: true, sz: 11, color: { rgb: "555555" } }, alignment: { horizontal: "center" } };

        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "006B4D" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: borderAll
        };

        const cellStyleCenter = { alignment: { horizontal: "center", vertical: "center" }, border: borderAll };
        const cellStyleLeft = { alignment: { horizontal: "left", vertical: "center" }, border: borderAll };
        const cellStyleRight = { alignment: { horizontal: "right", vertical: "center" }, border: borderAll };

        // 5. Quét qua toàn bộ Sheet để gán Style
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = { c: C, r: R };
                const cellRef = XLSX.utils.encode_cell(cellAddress);

                if (!worksheet[cellRef]) continue;

                if (R === 0) worksheet[cellRef].s = companyStyle;
                else if (R === 1) worksheet[cellRef].s = subInfoStyle;
                else if (R === 3) worksheet[cellRef].s = titleStyle;
                else if (R === 4) worksheet[cellRef].s = dateStyle;
                else if (R === 6) worksheet[cellRef].s = headerStyle;
                else if (R > 6) {
                    // Căn giữa cột STT, Căn phải cột Giá tiền, còn lại căn trái
                    if (C === 0) worksheet[cellRef].s = cellStyleCenter;
                    else if (typeof worksheet[cellRef].v === 'number') worksheet[cellRef].s = cellStyleRight;
                    else worksheet[cellRef].s = cellStyleLeft;
                }
            }
        }

        // Cài đặt độ rộng cột
        worksheet['!cols'] = columnWidths;

        // 6. Đóng gói và Lưu file
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        const safeDateStr = dateStr.replace(/\//g, '_');
        XLSX.writeFile(workbook, `${fileName}_${safeDateStr}.xlsx`);

        toast.success(`Đã xuất file Excel bảng "${activeTab}" thành công!`);
    };

    // ==========================================
    // XỬ LÝ FORM TAB 1 (GIÁ GIẤY GỐC)
    // ==========================================
    const handleSizeChange = (index, field, value) => {
        const newSizes = [...sizes];
        newSizes[index][field] = value;
        setSizes(newSizes);
    };

    const addSizeRow = () => {
        const defaultDim = paperSizes.length > 0 ? paperSizes[0].name : '';
        setSizes([...sizes, { dimensions: defaultDim, price: '', unit: 'đ/ram' }]);
    };
    const removeSizeRow = (index) => setSizes(sizes.filter((_, i) => i !== index));

    const openModal = (paper = null) => {
        if (paper) {
            setEditId(paper._id);
            let foundWeight = '';
            let foundName = paper.paperType;
            for (let w of paperWeights) {
                if (paper.paperType.endsWith(w.weight)) {
                    foundWeight = w.weight;
                    foundName = paper.paperType.substring(0, paper.paperType.length - w.weight.length).trim();
                    break;
                }
            }
            setPaperNameInput(foundName);
            setPaperWeightSelect(foundWeight);
            setSupplier(paper.supplier || '');
            setSizes(paper.sizes);
        } else {
            setEditId(null);
            setPaperNameInput('');
            setPaperWeightSelect('');
            setSupplier(suppliersList.length > 0 ? suppliersList[0].name : '');
            const defaultDim = paperSizes.length > 0 ? paperSizes[0].name : '';
            setSizes([{ dimensions: defaultDim, price: '', unit: 'đ/ram' }]);
        }
        setIsModalOpen(true);
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        if (!paperNameInput.trim()) return toast.warning("Vui lòng nhập tên giấy");
        if (!supplier) return toast.warning("Vui lòng chọn Nhà cung cấp");

        for (let s of sizes) {
            if (!s.dimensions) return toast.warning("Vui lòng chọn kích thước khổ giấy");
            if (s.price === '' || s.price < 0) return toast.warning("Vui lòng nhập giá hợp lệ");
        }

        try {
            const finalPaperType = `${paperNameInput.trim()} ${paperWeightSelect}`.trim().replace(/\s+/g, ' ');

            const isDuplicate = paperPrices.some(p =>
                p.paperType.toLowerCase() === finalPaperType.toLowerCase() &&
                p.supplier === supplier &&
                p._id !== editId
            );

            if (isDuplicate) {
                return toast.error(`Giấy "${finalPaperType}" của NCC "${supplier}" đã tồn tại! Vui lòng sửa thay vì tạo mới.`);
            }

            const payload = { paperType: finalPaperType, supplier, sizes };

            if (editId) {
                await axios.put(`/api/paper-prices/${editId}`, payload, authConfig);
                toast.success('Cập nhật thành công');
            } else {
                await axios.post('/api/paper-prices', payload, authConfig);
                toast.success('Đã thêm chất liệu mới');
            }
            setIsModalOpen(false);
            fetchAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi lưu dữ liệu');
        }
    };

    const deleteHandler = async () => {
        try {
            await axios.delete(`/api/paper-prices/${deleteId}`, authConfig);
            setPaperPrices(paperPrices.filter(x => x._id !== deleteId));
            setIsDeleteModalOpen(false);
            toast.success('Đã xóa thành công');
        } catch (error) { toast.error('Lỗi khi xóa'); }
    };

    // ==========================================
    // XỬ LÝ FORM TAB CẤU HÌNH
    // ==========================================
    const openConfigModal = () => {
        if (activeTab === 'Khổ giấy') setConfigForm({ name: '', description: '' });
        else if (activeTab === 'Định lượng') setConfigForm({ weight: '', description: '' });
        else if (activeTab === 'Phụ phí') setConfigForm({ name: '', unit: 'đ/m2', price: 0, minPrice: 0 });
        setIsConfigModalOpen(true);
    };

    const submitConfigHandler = async (e) => {
        e.preventDefault();
        try {
            let endpoint = '';
            if (activeTab === 'Khổ giấy') endpoint = '/api/config/paper-sizes';
            else if (activeTab === 'Định lượng') endpoint = '/api/config/paper-weights';
            else if (activeTab === 'Phụ phí') endpoint = '/api/config/surcharges';

            await axios.post(endpoint, configForm, authConfig);
            toast.success(`Đã thêm ${activeTab.toLowerCase()} mới`);
            setIsConfigModalOpen(false);
            fetchAllData();
        } catch (error) { toast.error('Lỗi khi thêm dữ liệu'); }
    };

    const deleteConfigHandler = async (id, type) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục này?`)) {
            try {
                let endpoint = '';
                if (type === 'Khổ giấy') endpoint = `/api/config/paper-sizes/${id}`;
                else if (type === 'Định lượng') endpoint = `/api/config/paper-weights/${id}`;
                else if (type === 'Phụ phí') endpoint = `/api/config/surcharges/${id}`;

                await axios.delete(endpoint, authConfig);
                toast.success('Đã xóa thành công');
                fetchAllData();
            } catch (error) { toast.error('Lỗi khi xóa'); }
        }
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
                <AdminHeader title="Bảng Giá Giấy (Gốc)" />

                {/* ================= HEADER ================= */}
                <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 shrink-0 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden text-gray-500" onClick={() => setIsSidebarOpen(true)}><FaBars size={20} /></button>
                        <h1 className="text-lg md:text-xl font-bold text-[#111827] whitespace-nowrap">Quản lý Bảng giá</h1>

                        <nav className="hidden sm:flex gap-6 text-sm font-medium overflow-x-auto pb-1 -mb-1 ml-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {['Giá giấy gốc', 'Khổ giấy', 'Định lượng', 'Phụ phí'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`whitespace-nowrap pb-3 -mb-3 transition-colors ${activeTab === tab ? 'text-[#006B4D] border-b-2 border-[#006B4D]' : 'text-[#6B7280] hover:text-[#111827]'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                        {/* NÚT XUẤT FILE EXCEL */}
                        <button onClick={exportToExcel} className="hidden md:flex items-center gap-2 bg-gray-100 text-[#6B7280] hover:text-[#111827] px-4 py-2 rounded-full text-sm font-bold transition">
                            <FaFileExport /> <span className="hidden lg:inline">Xuất file Excel</span>
                        </button>
                        <button
                            onClick={() => activeTab === 'Giá giấy gốc' ? openModal() : openConfigModal()}
                            className="flex items-center gap-2 bg-[#006B4D] text-white px-4 md:px-5 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-[#00543c] transition"
                        >
                            <FaPlus className="md:hidden" /> <span className="hidden md:inline">Thêm mới</span>
                        </button>
                    </div>
                </header>

                <div className="sm:hidden bg-white px-4 border-b border-gray-200 flex items-center justify-between gap-2 text-sm font-medium">
                    <div className="flex gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-1">
                        {['Giá giấy gốc', 'Khổ giấy', 'Định lượng', 'Phụ phí'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-3 transition-colors ${activeTab === tab ? 'text-[#006B4D] border-b-2 border-[#006B4D]' : 'text-[#6B7280]'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <button onClick={exportToExcel} className="text-[#006B4D] p-2 bg-[#E6F0ED] rounded-full shrink-0">
                        <FaFileExport size={16} />
                    </button>
                </div>

                {/* ================= MAIN CONTENT ================= */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">

                        {/* TAB 1: GIÁ GIẤY GỐC */}
                        {activeTab === 'Giá giấy gốc' && (
                            <div className="animate-fade-in-down">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-xl md:text-2xl shadow-sm shrink-0"><FaWallet /></div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Giá giấy gốc</h2>
                                        <p className="text-[#6B7280] text-xs md:text-sm mt-0.5 md:mt-1">Theo dõi giá nhập giấy từ các Nhà cung cấp</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
                                    <div>
                                        <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Nhà cung cấp</label>
                                        <div className="relative">
                                            <select value={selectedSupplierFilter} onChange={(e) => setSelectedSupplierFilter(e.target.value)} className="w-full bg-white border border-gray-200 text-[#111827] rounded-xl px-4 py-3 text-sm appearance-none outline-none focus:border-[#006B4D] font-medium shadow-sm cursor-pointer">
                                                <option value="Tất cả">Tất cả NCC</option>
                                                {uniqueSuppliersInPrices.map(sup => <option key={sup} value={sup}>{sup}</option>)}
                                            </select>
                                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Loại giấy</label>
                                        <div className="relative">
                                            <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)} className="w-full bg-white border border-gray-200 text-[#111827] rounded-xl px-4 py-3 text-sm appearance-none outline-none focus:border-[#006B4D] font-medium shadow-sm cursor-pointer">
                                                <option value="Tất cả">Tất cả loại giấy</option>
                                                {uniqueMaterials.map(mat => <option key={mat} value={mat}>{mat}</option>)}
                                            </select>
                                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Định lượng</label>
                                        <div className="relative">
                                            <select value={selectedWeight} onChange={(e) => setSelectedWeight(e.target.value)} className="w-full bg-white border border-gray-200 text-[#111827] rounded-xl px-4 py-3 text-sm appearance-none outline-none focus:border-[#006B4D] font-medium shadow-sm cursor-pointer">
                                                <option value="Tất cả">Tất cả định lượng</option>
                                                {uniqueWeights.map(weight => <option key={weight} value={weight}>{weight}</option>)}
                                            </select>
                                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] md:text-xs font-bold text-[#6B7280] uppercase mb-2">Tìm kiếm nhanh</label>
                                        <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-[#006B4D] transition-colors">
                                            <FaSearch className="text-gray-400 mr-3 shrink-0" />
                                            <input type="text" placeholder="Khổ, Tên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent border-none text-[#111827] text-sm outline-none font-medium placeholder-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    {filteredPapers.length === 0 ? (
                                        <div className="text-center py-16 text-[#6B7280] bg-white rounded-2xl border border-gray-200 shadow-sm text-sm">Không tìm thấy dữ liệu.</div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-8">
                                            {filteredPapers.map((paper) => (
                                                <div key={paper._id} className="flex flex-col">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <div className="flex flex-col">
                                                            <h3 className="text-lg md:text-xl font-bold text-[#111827] flex items-center gap-2 md:gap-3">
                                                                <span className="w-1.5 h-5 md:h-6 bg-[#006B4D] rounded-full inline-block"></span>
                                                                {paper.paperType}
                                                            </h3>
                                                            <span className="text-xs font-medium text-gray-500 ml-4 md:ml-5 mt-1 flex items-center gap-1"><FaTruck className="text-gray-400" /> NCC: {paper.supplier}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 md:gap-4 self-start mt-1">
                                                            <button onClick={() => openModal(paper)} className="text-xs md:text-sm font-bold text-[#006B4D] hover:underline">Sửa</button>
                                                            <button onClick={() => { setDeleteId(paper._id); setIsDeleteModalOpen(true) }} className="text-xs md:text-sm font-bold text-red-500 hover:underline">Xóa</button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                                        {paper.sizes.map((size, idx) => (
                                                            <div key={idx} className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#006B4D]/30 transition-all">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className="text-[9px] md:text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">Kích thước giấy</span>
                                                                    <span className="text-[9px] md:text-[10px] text-[#006B4D] bg-[#E6F0ED] px-2 py-0.5 rounded font-extrabold uppercase">Đơn giá</span>
                                                                </div>
                                                                <div className="text-xl md:text-2xl font-extrabold text-[#111827] mb-3 md:mb-4">{size.dimensions}</div>
                                                                <div className="text-[9px] md:text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-0.5">Giá nhập</div>
                                                                <div className="text-2xl md:text-3xl font-extrabold text-[#006B4D] flex items-baseline">
                                                                    {size.price.toLocaleString()} <span className="text-xs md:text-sm font-bold text-gray-500 underline ml-1 mb-1">{size.unit}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 2: KHỔ GIẤY */}
                        {activeTab === 'Khổ giấy' && (
                            <div className="animate-fade-in-down">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-xl md:text-2xl shadow-sm shrink-0"><FaExpandArrowsAlt /></div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Danh mục Khổ giấy</h2>
                                        <p className="text-[#6B7280] text-xs md:text-sm mt-0.5 md:mt-1">Kích thước giấy nguyên bản từ Nhà cung cấp</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {paperSizes.length === 0 ? (
                                        <div className="col-span-full text-center py-10 text-gray-400">Chưa có dữ liệu Khổ giấy</div>
                                    ) : paperSizes.map((item) => (
                                        <div key={item._id} className="relative group bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:border-blue-300 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-2xl font-extrabold text-blue-900">{item.name}</h3>
                                                <button onClick={() => deleteConfigHandler(item._id, 'Khổ giấy')} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition"><FaTrash /></button>
                                            </div>
                                            <p className="text-sm text-gray-500">{item.description || 'Chưa có mô tả'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 3: ĐỊNH LƯỢNG */}
                        {activeTab === 'Định lượng' && (
                            <div className="animate-fade-in-down">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 text-xl md:text-2xl shadow-sm shrink-0"><FaWeightHanging /></div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Danh mục Định lượng</h2>
                                        <p className="text-[#6B7280] text-xs md:text-sm mt-0.5 md:mt-1">Quản lý độ dày và thuộc tính vật lý của giấy (GSM)</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {paperWeights.length === 0 ? (
                                        <div className="col-span-full text-center py-10 text-gray-400">Chưa có dữ liệu Định lượng</div>
                                    ) : paperWeights.map((item) => (
                                        <div key={item._id} className="relative group bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-orange-300 transition-colors">
                                            <div className="text-3xl font-extrabold text-orange-600 mb-2">{item.weight}</div>
                                            <p className="text-sm text-gray-500 line-clamp-2">{item.description || '...'}</p>
                                            <button onClick={() => deleteConfigHandler(item._id, 'Định lượng')} className="absolute top-4 right-4 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition"><FaTrash /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 4: PHỤ PHÍ */}
                        {activeTab === 'Phụ phí' && (
                            <div className="animate-fade-in-down">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 text-xl md:text-2xl shadow-sm shrink-0"><FaCut /></div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Phụ phí & Gia công</h2>
                                        <p className="text-[#6B7280] text-xs md:text-sm mt-0.5 md:mt-1">Cấu hình giá bế, cán màng, ép kim, dán hộp...</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 text-[#6B7280] text-xs uppercase font-bold border-b border-gray-200">
                                                    <th className="py-4 px-6">Tên dịch vụ gia công</th>
                                                    <th className="py-4 px-6 text-center">Đơn vị tính</th>
                                                    <th className="py-4 px-6 text-right">Đơn giá</th>
                                                    <th className="py-4 px-6 text-right">Thành tiền tối thiểu</th>
                                                    <th className="py-4 px-6 text-center w-16">Xóa</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-[#111827] text-sm">
                                                {surcharges.length === 0 ? (
                                                    <tr><td colSpan="5" className="text-center py-10 text-gray-400">Chưa có dữ liệu Phụ phí</td></tr>
                                                ) : surcharges.map((item, idx) => (
                                                    <tr key={item._id} className={`hover:bg-purple-50/30 transition-colors ${idx !== surcharges.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                                        <td className="py-4 px-6 font-bold">{item.name}</td>
                                                        <td className="py-4 px-6 text-center font-medium text-gray-500">{item.unit}</td>
                                                        <td className="py-4 px-6 text-right font-extrabold text-purple-600">{item.price.toLocaleString()}đ</td>
                                                        <td className="py-4 px-6 text-right text-gray-600">{item.minPrice.toLocaleString()}đ</td>
                                                        <td className="py-4 px-6 text-center">
                                                            <button onClick={() => deleteConfigHandler(item._id, 'Phụ phí')} className="text-gray-300 hover:text-red-500 transition"><FaTrash /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>

            {/* ============================================================== */}
            {/* MODAL 1: THÊM SỬA GIÁ GIẤY GỐC */}
            {/* ============================================================== */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-[#111827]/60 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up sm:animate-fade-in-down overflow-hidden">
                        <div className="px-6 py-4 md:px-8 md:py-5 border-b border-gray-100 flex justify-between items-center bg-[#F9FAFB]">
                            <h2 className="font-extrabold text-[#111827] text-lg md:text-xl">
                                {editId ? 'Cập nhật giá nhập giấy' : 'Thêm báo giá giấy từ NCC'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 bg-white p-2 rounded-full shadow-sm transition"><FaTimes size={16} /></button>
                        </div>

                        <div className="p-4 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                            <form id="paperForm" onSubmit={submitHandler} className="space-y-6">

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 bg-[#E6F0ED]/40 p-4 md:p-6 rounded-2xl border border-[#006B4D]/10">
                                    <div className="sm:col-span-3 lg:col-span-1">
                                        <label className="block text-[10px] md:text-sm font-bold text-[#006B4D] uppercase mb-2">Nhà cung cấp <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <select required value={supplier} onChange={e => setSupplier(e.target.value)} className="w-full border border-gray-200 p-3 text-sm md:text-base rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-bold text-[#111827] appearance-none cursor-pointer bg-white shadow-sm">
                                                <option value="" disabled>-- Chọn NCC --</option>
                                                {suppliersList.map(sup => (
                                                    <option key={sup._id} value={sup.name}>{sup.name}</option>
                                                ))}
                                            </select>
                                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#006B4D] pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-1">
                                        <label className="block text-[10px] md:text-sm font-bold text-[#6B7280] uppercase mb-2">Tên giấy <span className="text-red-500">*</span></label>
                                        <input type="text" required value={paperNameInput} onChange={e => setPaperNameInput(e.target.value)} className="w-full border border-gray-200 p-3 text-sm md:text-base rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-medium text-[#111827] shadow-sm" placeholder="VD: Couche, Decal..." />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="block text-[10px] md:text-sm font-bold text-[#6B7280] uppercase mb-2">Định lượng (Tùy chọn)</label>
                                        <div className="relative">
                                            <select value={paperWeightSelect} onChange={e => setPaperWeightSelect(e.target.value)} className="w-full border border-gray-200 p-3 text-sm md:text-base rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none font-medium text-[#111827] appearance-none cursor-pointer bg-white shadow-sm">
                                                <option value="">-- Không định lượng --</option>
                                                {paperWeights.map(w => <option key={w._id} value={w.weight}>{w.weight}</option>)}
                                            </select>
                                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-2xl p-4 md:p-6 bg-[#F9FAFB]">
                                    <div className="flex justify-between items-center mb-4 md:mb-6">
                                        <label className="font-bold text-[#111827] text-base md:text-lg">Kích thước giấy (Khổ) & Giá nhập</label>
                                        <button type="button" onClick={addSizeRow} className="text-xs md:text-sm bg-white border border-[#006B4D] text-[#006B4D] font-bold px-3 md:px-4 py-2 rounded-lg hover:bg-[#E6F0ED] transition flex items-center">
                                            <FaPlus className="mr-1" /> Thêm khổ
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {sizes.map((size, index) => (
                                            <div key={index} className="grid grid-cols-2 sm:flex sm:flex-wrap md:flex-nowrap items-center gap-3 md:gap-4 bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm relative">
                                                <button type="button" onClick={() => removeSizeRow(index)} disabled={sizes.length === 1} className="absolute right-2 top-2 sm:static sm:right-auto sm:top-auto text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition disabled:opacity-30"><FaTrash /></button>

                                                <div className="col-span-2 sm:col-span-1 sm:flex-1">
                                                    <span className="text-[9px] md:text-[10px] uppercase font-bold text-[#6B7280] ml-1 mb-1 block">Khổ giấy</span>
                                                    <select required value={size.dimensions} onChange={e => handleSizeChange(index, 'dimensions', e.target.value)} className="w-full border-b-2 border-gray-200 px-1 md:px-2 py-1 md:py-1.5 text-sm md:text-base outline-none focus:border-[#006B4D] font-bold text-[#111827] cursor-pointer bg-transparent appearance-none">
                                                        <option value="" disabled>Chọn khổ</option>
                                                        {paperSizes.map(ps => <option key={ps._id} value={ps.name}>{ps.name}</option>)}
                                                    </select>
                                                </div>

                                                <div className="sm:flex-1">
                                                    <span className="text-[9px] md:text-[10px] uppercase font-bold text-[#6B7280] ml-1 mb-1 block">Đơn giá</span>
                                                    <input type="number" required min="0" value={size.price} onChange={e => handleSizeChange(index, 'price', e.target.value)} className="w-full border-b-2 border-gray-200 px-1 md:px-2 py-1 md:py-1.5 text-sm md:text-base outline-none focus:border-[#006B4D] font-extrabold text-[#006B4D]" placeholder="VD: 1940" />
                                                </div>
                                                <div className="sm:w-20 md:w-28">
                                                    <span className="text-[9px] md:text-[10px] uppercase font-bold text-[#6B7280] ml-1 mb-1 block">Đơn vị</span>
                                                    <select value={size.unit} onChange={e => handleSizeChange(index, 'unit', e.target.value)} className="w-full border-b-2 border-gray-200 px-1 py-1.5 text-xs md:text-sm outline-none focus:border-[#006B4D] font-medium text-[#111827] bg-transparent cursor-pointer">
                                                        <option value="đ/ram">đ/ram</option>
                                                        <option value="đ/tờ">đ/tờ</option>
                                                        <option value="đ/kg">đ/kg</option>
                                                        <option value="đ/cuộn">đ/cuộn</option>
                                                        <option value="đ/m2">đ/m2</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="px-6 py-4 md:px-8 md:py-5 border-t border-gray-100 bg-white flex justify-end gap-3 md:gap-4 rounded-b-none sm:rounded-b-2xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 md:px-6 md:py-2.5 text-sm md:text-base text-[#6B7280] font-bold hover:bg-gray-100 rounded-xl transition">Hủy bỏ</button>
                            <button type="submit" form="paperForm" className="px-6 py-2 md:px-8 md:py-2.5 text-sm md:text-base bg-[#006B4D] text-white font-bold rounded-xl shadow-md hover:bg-[#00543c] transition">Lưu bảng giá</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL 2: THÊM CẤU HÌNH */}
            {/* ============================================================== */}
            {isConfigModalOpen && (
                <div className="fixed inset-0 bg-[#111827]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col animate-fade-in-down overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-[#F9FAFB]">
                            <h2 className="font-extrabold text-[#111827] text-lg">
                                Thêm mới {activeTab}
                            </h2>
                            <button onClick={() => setIsConfigModalOpen(false)} className="text-gray-400 hover:text-red-500 bg-white p-2 rounded-full shadow-sm transition"><FaTimes size={14} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <form id="configForm" onSubmit={submitConfigHandler} className="space-y-5">

                                {activeTab === 'Khổ giấy' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-[#6B7280] mb-2">Kích thước giấy (VD: 65x86 cm) <span className="text-red-500">*</span></label>
                                            <input type="text" required value={configForm.name || ''} onChange={e => setConfigForm({ ...configForm, name: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none text-[#111827]" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#6B7280] mb-2">Mô tả thêm</label>
                                            <textarea value={configForm.description || ''} onChange={e => setConfigForm({ ...configForm, description: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none text-[#111827]" rows="3"></textarea>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'Định lượng' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-[#6B7280] mb-2">Định lượng (VD: 300gsm) <span className="text-red-500">*</span></label>
                                            <input type="text" required value={configForm.weight || ''} onChange={e => setConfigForm({ ...configForm, weight: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none text-[#111827]" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#6B7280] mb-2">Mô tả (Sử dụng cho loại ấn phẩm nào?)</label>
                                            <textarea value={configForm.description || ''} onChange={e => setConfigForm({ ...configForm, description: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none text-[#111827]" rows="3"></textarea>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'Phụ phí' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-[#6B7280] mb-2">Tên dịch vụ gia công <span className="text-red-500">*</span></label>
                                            <input type="text" required value={configForm.name || ''} onChange={e => setConfigForm({ ...configForm, name: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none text-[#111827]" placeholder="VD: Bế đứt nửa..." />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-bold text-[#6B7280] mb-2">Đơn giá <span className="text-red-500">*</span></label>
                                                <input type="number" min="0" required value={configForm.price || ''} onChange={e => setConfigForm({ ...configForm, price: Number(e.target.value) })} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none text-purple-600 font-bold" />
                                            </div>
                                            <div className="sm:w-32">
                                                <label className="block text-sm font-bold text-[#6B7280] mb-2">Đơn vị <span className="text-red-500">*</span></label>
                                                <select value={configForm.unit || 'đ/m2'} onChange={e => setConfigForm({ ...configForm, unit: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none bg-white">
                                                    <option value="đ/m2">đ/m2</option>
                                                    <option value="đ/nhịp">đ/nhịp</option>
                                                    <option value="đ/tờ">đ/tờ</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#6B7280] mb-2">Giá tối thiểu <span className="text-red-500">*</span></label>
                                            <input type="number" min="0" required value={configForm.minPrice || 0} onChange={e => setConfigForm({ ...configForm, minPrice: Number(e.target.value) })} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:border-[#006B4D] outline-none text-[#111827]" placeholder="VD: 100000" />
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-none sm:rounded-b-2xl">
                            <button onClick={() => setIsConfigModalOpen(false)} className="px-5 py-2 text-[#6B7280] font-bold hover:bg-gray-200 rounded-xl transition">Hủy</button>
                            <button type="submit" form="configForm" className="px-6 py-2 bg-[#006B4D] text-white font-bold rounded-xl shadow-md hover:bg-[#00543c] transition">Lưu cấu hình</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={deleteHandler} title="Xóa dữ liệu" message="Bạn chắc chắn muốn xóa nhóm dữ liệu này?" />
        </div>
    );
};

export default PaperPriceScreen;