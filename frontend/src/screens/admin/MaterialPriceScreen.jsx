import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaLayerGroup, FaChevronDown, FaFileExport, FaBars, FaTruck } from 'react-icons/fa';
import * as XLSX from 'xlsx-js-style';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import ConfirmModal from '../../components/ConfirmModal';

const MaterialPriceScreen = () => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const authConfig = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

    const [materialPrices, setMaterialPrices] = useState([]);
    const [suppliersList, setSuppliersList] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Tất cả');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        category: '',
        name: '',
        unit: 'đ/cái',
        price: '',
        supplier: '',
        note: ''
    });

    const categoryOptions = [
        'Màn / Lưới In', 'Bìa Carton / Bìa Cứng', 'Keo / Băng keo', 'Phụ kiện đóng gói (Nút, Chỉ, Khâu)', 'Vật liệu khác'
    ];

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }
        fetchAllData();
    }, [navigate]);

    const fetchAllData = async () => {
        try {
            const [materialsRes, suppliersRes] = await Promise.all([
                axios.get('/api/material-prices', authConfig),
                axios.get('/api/v1/suppliers', authConfig)
            ]);
            setMaterialPrices(materialsRes.data);
            setSuppliersList(suppliersRes.data.suppliers || suppliersRes.data || []);
        } catch (error) {
            toast.error("Lỗi kết nối API.");
        }
    };

    useEffect(() => {
        let result = materialPrices;
        if (selectedCategoryFilter !== 'Tất cả') result = result.filter(p => p.category === selectedCategoryFilter);
        if (searchTerm) {
            const lowerCaseTerm = searchTerm.toLowerCase();
            result = result.filter(mat =>
                mat.name.toLowerCase().includes(lowerCaseTerm) ||
                mat.category.toLowerCase().includes(lowerCaseTerm) ||
                (mat.supplier && mat.supplier.toLowerCase().includes(lowerCaseTerm)) ||
                (mat.note && mat.note.toLowerCase().includes(lowerCaseTerm))
            );
        }
        setFilteredMaterials(result);
    }, [searchTerm, selectedCategoryFilter, materialPrices]);

    // ==========================================
    // TÍNH NĂNG XUẤT FILE EXCEL CHUYÊN NGHIỆP CÓ STYLE
    // ==========================================
    const exportToExcel = () => {
        if (filteredMaterials.length === 0) return toast.warning("Không có dữ liệu để xuất!");

        // 1. Chuẩn bị Dữ liệu và Tiêu đề
        const reportTitle = "BẢNG BÁO GIÁ VẬT LIỆU & PHỤ KIỆN GIA CÔNG";
        const tableHeaders = ["STT", "Nhóm Vật Liệu", "Tên Vật Liệu", "Nhà Cung Cấp", "Đơn Vị Tính", "Đơn Giá", "Ghi Chú"];

        const tableData = filteredMaterials.map((mat, index) => ([
            index + 1,
            mat.category,
            mat.name,
            mat.supplier || "-",
            mat.unit,
            mat.price,
            mat.note || ""
        ]));

        // 2. Tạo cấu trúc mảng 2 chiều (AOA - Array of Arrays) cho Excel
        const today = new Date();
        const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

        const finalData = [
            ["CÔNG TY TNHH IN QUANG PHÁT"],                                    // Dòng 1
            ["Hotline: 0935.110.639 - Email: quang02042002@gmail.com"],        // Dòng 2
            [""],                                                              // Dòng 3 (Trống)
            [reportTitle],                                                     // Dòng 4 (Tiêu đề báo cáo)
            [`Ngày xuất báo cáo: ${dateStr}`],                                 // Dòng 5 (Ngày)
            [""],                                                              // Dòng 6 (Trống)
            tableHeaders,                                                      // Dòng 7 (Headers của bảng)
            ...tableData                                                       // Dòng 8 trở đi (Data)
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(finalData);

        // 3. Khai báo Merge Cells (Trộn ô phần Header)
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
                    // Căn giữa cột STT (0) và Đơn vị tính (4)
                    if (C === 0 || C === 4) worksheet[cellRef].s = cellStyleCenter;
                    // Căn phải cột Đơn giá (5)
                    else if (C === 5) worksheet[cellRef].s = cellStyleRight;
                    // Còn lại căn trái
                    else worksheet[cellRef].s = cellStyleLeft;
                }
            }
        }

        // Cài đặt độ rộng cột
        worksheet['!cols'] = [{ wch: 6 }, { wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];

        // 6. Đóng gói và Lưu file
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "VatLieuPhuKien");

        const safeDateStr = dateStr.replace(/\//g, '_');
        const fileName = `BaoGiaVatLieu_${safeDateStr}.xlsx`;

        // Sử dụng XLSX.writeFile gọn gàng hơn thay vì tạo Blob thủ công
        XLSX.writeFile(workbook, fileName);

        toast.success(`Đã xuất file Excel thành công!`);
    };

    const openModal = (mat = null) => {
        if (mat) {
            setEditId(mat._id);
            setFormData({
                category: mat.category,
                name: mat.name,
                unit: mat.unit,
                price: mat.price,
                supplier: mat.supplier || '',
                note: mat.note || ''
            });
        } else {
            setEditId(null);
            setFormData({
                category: categoryOptions[0],
                name: '',
                unit: 'đ/cái',
                price: '',
                supplier: suppliersList.length > 0 ? suppliersList[0].name : '',
                note: ''
            });
        }
        setIsModalOpen(true);
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) return toast.warning("Vui lòng nhập tên vật liệu");
        if (formData.price === '' || formData.price < 0) return toast.warning("Vui lòng nhập giá hợp lệ");

        try {
            if (editId) {
                await axios.put(`/api/material-prices/${editId}`, formData, authConfig);
                toast.success('Cập nhật thành công');
            } else {
                await axios.post('/api/material-prices', formData, authConfig);
                toast.success('Đã thêm vật liệu mới');
            }
            setIsModalOpen(false);
            fetchAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi lưu dữ liệu');
        }
    };

    const deleteHandler = async () => {
        try {
            await axios.delete(`/api/material-prices/${deleteId}`, authConfig);
            setMaterialPrices(materialPrices.filter(x => x._id !== deleteId));
            setIsDeleteModalOpen(false);
            toast.success('Đã xóa thành công');
        } catch (error) { toast.error('Lỗi khi xóa'); }
    };

    // Nhóm data để hiển thị theo danh mục
    const groupedMaterials = filteredMaterials.reduce((acc, obj) => {
        const key = obj.category;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});

    return (
        <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827]">
            <div className="h-full flex-shrink-0 z-10 hidden lg:block"><Sidebar /></div>

            <div className="flex-1 flex flex-col w-full overflow-hidden">
                <AdminHeader title="Bảng Giá Vật Tư THEO KHỔ" />
                <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 shrink-0 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden text-gray-500"><FaBars size={20} /></button>
                        <h1 className="text-lg md:text-xl font-bold text-[#111827]">Quản lý Giá Vật Liệu</h1>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                        <button onClick={exportToExcel} className="hidden md:flex items-center gap-2 bg-gray-100 text-[#6B7280] hover:text-[#111827] px-4 py-2 rounded-full text-sm font-bold transition">
                            <FaFileExport /> Xuất file Excel
                        </button>
                        <button onClick={() => openModal()} className="flex items-center gap-2 bg-[#006B4D] text-white px-4 md:px-5 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-[#00543c] transition">
                            <FaPlus className="md:hidden" /> <span className="hidden md:inline">Thêm vật liệu</span>
                        </button>
                    </div>
                </header>

                <div className="sm:hidden bg-white px-4 py-3 border-b border-gray-200 flex justify-end">
                    <button onClick={exportToExcel} className="text-[#006B4D] p-2 bg-[#E6F0ED] rounded-full shrink-0">
                        <FaFileExport size={16} />
                    </button>
                </div>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 text-xl shadow-sm shrink-0"><FaLayerGroup /></div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Vật liệu & Phụ kiện gia công</h2>
                                <p className="text-[#6B7280] text-sm mt-1">Theo dõi giá màn lưới, bìa cứng, nút, khâu, keo dán...</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-10 bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                            <div>
                                <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">Nhóm vật liệu</label>
                                <div className="relative">
                                    <select value={selectedCategoryFilter} onChange={(e) => setSelectedCategoryFilter(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-[#111827] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#006B4D] font-medium appearance-none">
                                        <option value="Tất cả">Tất cả Nhóm</option>
                                        {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">Tìm kiếm nhanh</label>
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#006B4D] transition-colors">
                                    <FaSearch className="text-gray-400 mr-3" />
                                    <input type="text" placeholder="Tên vật liệu, NCC..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent border-none text-sm outline-none font-medium text-[#111827]" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {Object.keys(groupedMaterials).length === 0 ? (
                                <div className="text-center py-16 text-[#6B7280] bg-white rounded-2xl border border-gray-200 text-sm shadow-sm">Không tìm thấy dữ liệu.</div>
                            ) : (
                                Object.keys(groupedMaterials).map((category, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                                            <h3 className="font-extrabold text-[#111827] text-lg">{category}</h3>
                                            <span className="bg-[#E6F0ED] text-[#006B4D] text-xs font-bold px-2 py-1 rounded">{groupedMaterials[category].length}</span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-white text-[#6B7280] text-[10px] uppercase font-bold border-b border-gray-100">
                                                        <th className="py-3 px-6 w-1/3">Tên vật liệu</th>
                                                        <th className="py-3 px-6">Nhà Cung Cấp</th>
                                                        <th className="py-3 px-6 text-right">Đơn giá nhập</th>
                                                        <th className="py-3 px-6">Ghi chú</th>
                                                        <th className="py-3 px-6 text-center w-24">Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-[#111827] text-sm">
                                                    {groupedMaterials[category].map((mat, mIdx) => (
                                                        <tr key={mat._id} className={`hover:bg-gray-50 transition-colors ${mIdx !== groupedMaterials[category].length - 1 ? 'border-b border-gray-50' : ''}`}>
                                                            <td className="py-4 px-6 font-extrabold">{mat.name}</td>
                                                            <td className="py-4 px-6 text-gray-600 font-medium">
                                                                {mat.supplier ? <div className="flex items-center"><FaTruck className="mr-1.5 text-gray-400" /> {mat.supplier}</div> : '-'}
                                                            </td>
                                                            <td className="py-4 px-6 text-right">
                                                                <div className="text-lg font-extrabold text-[#006B4D]">{mat.price.toLocaleString()}đ</div>
                                                                <div className="text-xs text-gray-500 font-bold">{mat.unit}</div>
                                                            </td>
                                                            <td className="py-4 px-6 text-gray-500 max-w-[150px] truncate" title={mat.note}>{mat.note || '-'}</td>
                                                            <td className="py-4 px-6 text-center">
                                                                <div className="flex justify-center items-center gap-3">
                                                                    <button onClick={() => openModal(mat)} className="text-gray-400 hover:text-[#006B4D] transition"><FaEdit /></button>
                                                                    <button onClick={() => { setDeleteId(mat._id); setIsDeleteModalOpen(true) }} className="text-gray-400 hover:text-red-500 transition"><FaTrash /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-[#111827]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col animate-fade-in-down overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-[#F9FAFB]">
                            <h2 className="font-extrabold text-[#111827] text-lg">
                                {editId ? 'Cập nhật giá vật liệu' : 'Thêm báo giá vật liệu'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 bg-white p-2 rounded-full transition"><FaTimes size={14} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <form id="matForm" onSubmit={submitHandler} className="space-y-5">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-[#6B7280] mb-2">Nhóm vật liệu <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#006B4D] outline-none text-[#111827] appearance-none cursor-pointer bg-white">
                                                {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#006B4D]" />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-[#6B7280] mb-2">Tên vật liệu (VD: Keo 3M xịt) <span className="text-red-500">*</span></label>
                                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-[#006B4D] focus:border-[#006B4D] outline-none text-[#111827] font-bold" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-[#6B7280] mb-2">Giá nhập <span className="text-red-500">*</span></label>
                                        <input type="number" min="0" required value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#006B4D] outline-none text-[#006B4D] font-extrabold" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-[#6B7280] mb-2">Đơn vị tính <span className="text-red-500">*</span></label>
                                        <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#006B4D] outline-none bg-white">
                                            <option value="đ/cái">đ/cái</option>
                                            <option value="đ/cuộn">đ/cuộn</option>
                                            <option value="đ/bao">đ/bao</option>
                                            <option value="đ/kg">đ/kg</option>
                                            <option value="đ/lon">đ/lon</option>
                                            <option value="đ/m">đ/m</option>
                                            <option value="đ/m2">đ/m2</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-[#6B7280] mb-2">Nhà cung cấp (Tùy chọn)</label>
                                        <div className="relative">
                                            <select value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#006B4D] outline-none text-[#111827] appearance-none cursor-pointer bg-white">
                                                <option value="">-- Bỏ trống nếu mua lẻ --</option>
                                                {suppliersList.map(sup => (
                                                    <option key={sup._id} value={sup.name}>{sup.name}</option>
                                                ))}
                                            </select>
                                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-[#6B7280] mb-2">Ghi chú thêm</label>
                                        <textarea value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#006B4D] outline-none text-[#111827]" rows="2" placeholder="Ghi chú (không bắt buộc)..."></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm text-[#6B7280] font-bold hover:bg-gray-200 rounded-xl transition">Hủy bỏ</button>
                            <button type="submit" form="matForm" className="px-6 py-2 text-sm bg-[#006B4D] text-white font-bold rounded-xl shadow-md hover:bg-[#00543c] transition">Lưu bảng giá</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={deleteHandler} title="Xóa dữ liệu" message="Bạn chắc chắn muốn xóa vật liệu này không?" />
        </div>
    );
};

export default MaterialPriceScreen;
