import React from 'react';
import { FaTrashAlt, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận xóa',
  message = 'Bạn có chắc chắn muốn xóa mục này không? Hành động này không thể hoàn tác.',
  itemName,
  confirmText = 'Đồng ý xóa',
  cancelText = 'Hủy bỏ',
  isDanger = true,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-5 sm:p-6 w-full max-w-sm sm:max-w-md transform transition-all border border-gray-100 text-center relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng góc trên */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition active:scale-95"
          title="Đóng"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Icon cảnh báo cao cấp */}
        <div
          className={`flex items-center justify-center w-14 h-14 mx-auto rounded-2xl mb-4 shadow-sm ${
            isDanger
              ? 'bg-red-50 text-red-500 ring-8 ring-red-50/60'
              : 'bg-amber-50 text-amber-500 ring-8 ring-amber-50/60'
          }`}
        >
          {isDanger ? <FaTrashAlt className="text-2xl" /> : <FaExclamationTriangle className="text-2xl" />}
        </div>

        {/* Tiêu đề & Nội dung */}
        <h3 className="text-base sm:text-lg font-black text-[#111827] mb-1.5">{title}</h3>

        {itemName && (
          <div className="bg-slate-50 border border-gray-100 rounded-xl px-3 py-2 my-2 text-xs font-bold text-gray-700 truncate max-w-full">
            "{itemName}"
          </div>
        )}

        <p className="text-xs text-gray-500 mb-6 leading-relaxed px-2">
          {message}
        </p>

        {/* Nút bấm */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition active:scale-95"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white transition active:scale-95 shadow-md ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                : 'bg-[#006B4D] hover:bg-[#00543c] shadow-emerald-200'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;