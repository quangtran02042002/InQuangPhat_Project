import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  // Nếu isOpen = false thì không vẽ gì ra màn hình cả (ẩn đi)
  if (!isOpen) return null;

  return (
    // 1. LỚP PHỦ MỜ (OVERLAY) - Che toàn màn hình
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      
      {/* 2. HỘP NỘI DUNG (CONTENT BOX) */}
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all scale-100 mx-4">
        
        {/* Icon cảnh báo */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <FaExclamationTriangle className="text-red-600 text-xl" />
        </div>

        {/* Tiêu đề & Nội dung */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
        </div>

        {/* Các nút bấm */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium transition focus:outline-none"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg text-white bg-red-600 hover:bg-red-700 font-bold shadow-lg shadow-red-200 transition focus:outline-none"
          >
            Đồng ý xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;