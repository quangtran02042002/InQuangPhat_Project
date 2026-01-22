import React, { useState } from 'react';
import { FaTimes, FaPhone, FaEnvelope, FaBox, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const QuoteDetailModal = ({ isOpen, onClose, quote, onUpdateStatus }) => {
  if (!isOpen || !quote) return null;

  // Render màu sắc dựa theo trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-green-100 text-green-800 border-green-200';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Done': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
     switch (status) {
      case 'New': return 'Mới (Chưa gọi)';
      case 'Contacted': return 'Đang xử lý (Đã gọi)';
      case 'Done': return 'Đã hoàn thành';
      default: return status;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-blue-900 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center">
             <FaBox className="mr-2" /> Chi tiết yêu cầu #{quote._id.slice(-6).toUpperCase()}
          </h3>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition">
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* BODY (Scroll nếu dài) */}
        <div className="p-6 overflow-y-auto">
          
          {/* Thông tin khách hàng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Thông tin khách hàng</h4>
                <div className="font-bold text-lg text-gray-800 mb-1">{quote.name}</div>
                <div className="flex items-center text-blue-600 font-medium mb-1">
                    <FaPhone className="mr-2" /> <a href={`tel:${quote.phone}`} className="hover:underline">{quote.phone}</a>
                </div>
                {quote.email && (
                    <div className="flex items-center text-gray-500 text-sm">
                        <FaEnvelope className="mr-2" /> {quote.email}
                    </div>
                )}
             </div>

             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Sản phẩm quan tâm</h4>
                <div className="font-bold text-gray-800 mb-1">{quote.productName || 'Chung chung'}</div>
                <div className="text-sm text-gray-600">Số lượng: <span className="font-bold">{quote.quantity || 'Chưa rõ'}</span></div>
             </div>
          </div>

          {/* Nội dung ghi chú */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Quy cách / Ghi chú của khách:</h4>
            <div className="bg-blue-50 p-4 rounded-xl text-gray-700 border border-blue-100 whitespace-pre-wrap leading-relaxed">
                {quote.message || "Không có ghi chú thêm."}
            </div>
          </div>

          {/* Trạng thái hiện tại */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
             <span className="font-bold text-gray-600">Trạng thái hiện tại:</span>
             <span className={`px-4 py-1 rounded-full text-xs font-bold border ${getStatusColor(quote.status)}`}>
                {getStatusText(quote.status)}
             </span>
          </div>

        </div>

        {/* FOOTER - ACTION BUTTONS */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
            <button 
                onClick={() => onUpdateStatus(quote._id, 'New')}
                className={`px-4 py-2 rounded font-medium transition ${quote.status === 'New' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                disabled={quote.status === 'New'}
            >
                Đánh dấu Mới
            </button>

            <button 
                onClick={() => onUpdateStatus(quote._id, 'Contacted')}
                className={`px-4 py-2 rounded font-medium transition ${quote.status === 'Contacted' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm'}`}
                disabled={quote.status === 'Contacted'}
            >
                Đánh dấu Đang xử lý
            </button>

            <button 
                onClick={() => onUpdateStatus(quote._id, 'Done')}
                className={`px-4 py-2 rounded font-bold transition flex items-center justify-center ${quote.status === 'Done' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-md'}`}
                disabled={quote.status === 'Done'}
            >
                <FaCheckCircle className="mr-2" /> Đánh dấu Hoàn thành
            </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetailModal;