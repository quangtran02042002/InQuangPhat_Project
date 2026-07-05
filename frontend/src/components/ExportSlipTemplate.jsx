import React, { useRef } from 'react';
import { FaPrint, FaTimes } from 'react-icons/fa';
import { createPortal } from 'react-dom';

const COMPANY = {
  name: 'CÔNG TY TNHH IN QUANG PHÁT',
  address: 'Số 5. đường số 4, cụm CN An Hoà, phường Hương An, Huế',
  phone: 'Hotline: 0903597686 ( Tấn ), 0935110639 ( Quang )',
  email: 'Email: inquangphat@gmail.com',
};

const ExportSlipTemplate = ({ transaction, onClose }) => {
  const printRef = useRef();

  if (!transaction) return null;

  const totalQty = transaction.items.reduce((sum, it) => sum + Number(it.quantity), 0);
  const slipDate = new Date(transaction.date || transaction.createdAt);

  const handlePrint = () => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * { visibility: hidden !important; }
        #export-slip-print, #export-slip-print * { visibility: visible !important; }
        #export-slip-print { position: fixed; left: 0; top: 0; width: 100%; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.head.removeChild(style), 1000);
  };

  const slipContent = (
    <div
      id="export-slip-print"
      ref={printRef}
      className="bg-white text-black font-sans p-8 min-h-[297mm] max-w-[210mm] mx-auto text-[13px] leading-relaxed"
    >
      {/* ===== HEADER ===== */}
      <div className="flex items-start justify-between mb-4 border-b-2 border-black pb-3">
        {/* Cột trái: Công ty */}
        <div className="w-1/3">
          <div className="font-black text-base uppercase">{COMPANY.name}</div>
          <div className="text-xs mt-1 text-gray-700">{COMPANY.address}</div>
          <div className="text-xs text-gray-700">{COMPANY.phone}</div>
          <div className="text-xs text-gray-700">{COMPANY.email}</div>
        </div>

        {/* Giữa: Tiêu đề */}
        <div className="flex-1 text-center px-2">
          <div className="text-xl font-black uppercase tracking-wide">
            {transaction.type === 'export' ? 'PHIẾU XUẤT KHO' : 'PHIẾU NHẬP KHO'}
          </div>
          <div className="text-sm font-bold uppercase text-gray-600 mt-0.5">
            Bán Thành Phẩm – Hàng Vải In
          </div>
        </div>

        {/* Cột phải: Mã phiếu & Ngày */}
        <div className="w-1/3 text-right">
          <div className="text-xs text-gray-500">Số phiếu (Mã GD):</div>
          <div className="font-black text-sm uppercase tracking-wider">#{transaction._id?.slice(-8).toUpperCase()}</div>
          <div className="text-xs text-gray-500 mt-2">Ngày xuất kho:</div>
          <div className="font-bold">
            Ngày {slipDate.getDate()} tháng {slipDate.getMonth() + 1} năm {slipDate.getFullYear()}
          </div>
        </div>
      </div>

      {/* ===== THÔNG TIN GIAO DỊCH ===== */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 mb-5 text-sm">
        <div className="col-span-2 font-bold">I. THÔNG TIN GIAO NHẬN</div>

        {/* Nhà may */}
        <div className="flex gap-2">
          <span className="font-bold whitespace-nowrap">Đơn vị giao/nhận hàng (Nhà may):</span>
          <span className="border-b border-black flex-1 min-w-[120px]">{transaction.factoryName}</span>
        </div>

        {/* Khách hàng đặt hàng */}
        <div className="flex gap-2">
          <span className="font-bold whitespace-nowrap">Khách hàng đặt order:</span>
          <span className="border-b border-black flex-1 min-w-[120px]">{transaction.orderCustomer || '.....................'}</span>
        </div>

        {/* Địa chỉ */}
        <div className="flex gap-2">
          <span className="font-bold whitespace-nowrap">Địa chỉ giao hàng:</span>
          <span className="border-b border-black flex-1 min-w-[120px]">{transaction.deliveryAddress || '.....................'}</span>
        </div>

        {/* Lý do */}
        <div className="flex gap-2">
          <span className="font-bold whitespace-nowrap">Lý do xuất kho:</span>
          <span className="border-b border-black flex-1 min-w-[120px]">{transaction.reason || '.....................'}</span>
        </div>
      </div>

      {/* ===== BẢNG HÀNG HÓA ===== */}
      <div className="mb-6">
        <div className="font-bold mb-2 text-sm">II. DANH SÁCH HÀNG HÓA XUẤT KHO</div>
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black px-2 py-1.5 w-8 text-center">STT</th>
              <th className="border border-black px-2 py-1.5 text-center w-24">Mã hàng (PO)</th>
              <th className="border border-black px-2 py-1.5 text-center">Tên BTP / Loại vải</th>
              <th className="border border-black px-2 py-1.5 text-center w-20">Màu sắc</th>
              <th className="border border-black px-2 py-1.5 text-center w-12">ĐVT</th>
              <th className="border border-black px-2 py-1.5 text-center w-16">Số lượng</th>
              <th className="border border-black px-2 py-1.5 text-center">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {transaction.items.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-black px-2 py-1.5 text-center">{idx + 1}</td>
                <td className="border border-black px-2 py-1.5 text-center font-bold uppercase">{item.itemCode}</td>
                <td className="border border-black px-2 py-1.5">{item.itemName}</td>
                <td className="border border-black px-2 py-1.5 text-center">{item.color}</td>
                <td className="border border-black px-2 py-1.5 text-center">{item.unit}</td>
                <td className="border border-black px-2 py-1.5 text-center font-bold">{item.quantity.toLocaleString()}</td>
                <td className="border border-black px-2 py-1.5 text-gray-600">{item.note}</td>
              </tr>
            ))}
            {/* Dòng trống nếu ít hàng */}
            {Array.from({ length: Math.max(0, 5 - transaction.items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="h-7">
                <td className="border border-black px-2"></td>
                <td className="border border-black px-2"></td>
                <td className="border border-black px-2"></td>
                <td className="border border-black px-2"></td>
                <td className="border border-black px-2"></td>
                <td className="border border-black px-2"></td>
                <td className="border border-black px-2"></td>
              </tr>
            ))}
            {/* Tổng cộng */}
            <tr className="bg-gray-200 font-black">
              <td colSpan={5} className="border border-black px-2 py-2 text-right pr-4">TỔNG CỘNG</td>
              <td className="border border-black px-2 py-2 text-center text-base">{totalQty.toLocaleString()}</td>
              <td className="border border-black px-2 py-2"></td>
            </tr>
          </tbody>
        </table>
        <div className="text-xs text-gray-600 mt-1 italic">
          Tổng số dòng hàng: {transaction.items.length} – Tổng số lượng: <strong>{totalQty.toLocaleString()}</strong> ({transaction.items.map(i => i.unit).slice(0, 1)[0] || 'Cái'})
        </div>
      </div>

      {/* ===== KHU VỰC CHỮ KÝ ===== */}
      <div className="mt-10">
        <div className="grid grid-cols-4 gap-4 text-center text-sm">
          {['Người lập phiếu', 'Người giao hàng', 'Người nhận', 'Thủ kho'].map((title) => (
            <div key={title} className="flex flex-col items-center">
              <div className="font-bold">{title}</div>
              <div className="text-xs text-gray-500 italic mb-12">(Ký, ghi rõ họ tên)</div>
              <div className="w-32 border-b border-black"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer giấy */}
      <div className="mt-8 pt-3 border-t border-gray-300 text-center text-[10px] text-gray-400 print:text-gray-500">
        Phiếu được lập bởi hệ thống quản lý kho – {COMPANY.name} – Tel: {COMPANY.phone}
      </div>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-4 backdrop-blur-sm print:bg-transparent print:block print:py-0">
      {/* Thanh công cụ - ẩn khi in */}
      <div className="print:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white px-6 py-3 flex justify-between items-center z-10 shadow-xl">
        <div className="flex items-center gap-3">
          <FaPrint className="text-green-400" />
          <span className="font-bold text-sm">Xem trước Phiếu Xuất Kho</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition"
          >
            <FaPrint size={13} /> In phiếu
          </button>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-red-400 transition p-1"
          >
            <FaTimes size={18} />
          </button>
        </div>
      </div>

      {/* Nội dung phiếu */}
      <div className="mt-12 print:mt-0 shadow-2xl print:shadow-none">
        {slipContent}
      </div>
    </div>,
    document.body
  );
};

export default ExportSlipTemplate;
