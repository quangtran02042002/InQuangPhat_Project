import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import QuotationForm from './quotation/QuotationForm';
import QuotationList from './quotation/QuotationList';
import { FaClipboardList, FaArrowLeft } from 'react-icons/fa';

const QuotationScreen = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showList, setShowList] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleEdit = (quotation) => {
    setEditData(quotation);
    setShowList(false);
  };

  const handleSaved = () => {
    setEditData(null);
    setShowList(true);
  };

  const handleCancelEdit = () => {
    setEditData(null);
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827] relative">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 h-full transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <AdminHeader title="Bảng Báo Giá" onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Sub-header with list toggle button */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {showList && (
              <button onClick={() => setShowList(false)}
                className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-[#006B4D] transition">
                <FaArrowLeft className="text-xs" /> Tạo mới
              </button>
            )}
            <span className="text-sm font-bold text-gray-400">
              {showList ? 'Danh sách báo giá đã lưu' : (editData ? `Đang sửa: ${editData.quotationCode}` : 'Tạo bảng báo giá mới')}
            </span>
          </div>

          <button onClick={() => { setShowList(!showList); setEditData(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95 ${
              showList
                ? 'bg-[#006B4D] text-white hover:bg-[#00543c] shadow-lg shadow-[#006B4D]/20'
                : 'bg-[#E6F0ED] text-[#006B4D] hover:bg-[#006B4D] hover:text-white border border-[#006B4D]/20'
            }`}>
            <FaClipboardList className="text-xs" />
            {showList ? 'Tạo Báo Giá Mới' : 'Danh Sách Báo Giá'}
          </button>
        </div>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {showList ? (
            <QuotationList onEdit={handleEdit} />
          ) : (
            <QuotationForm editData={editData} onSaved={handleSaved} onCancel={editData ? handleCancelEdit : null} />
          )}
        </main>
      </div>
    </div>
  );
};

export default QuotationScreen;
